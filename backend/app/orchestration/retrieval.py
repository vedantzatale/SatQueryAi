"""Satellite retrieval workflow (plan §8/Slice 5): Agent -> Satellite
Retrieval Service (this module) -> Provider Manager -> search -> pair-aware
SceneRanker -> download -> re-validate (via the same ingestion path as a
user upload) -> preprocess. The agent never calls a provider directly --
only this module does, via ProviderManager.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from pathlib import Path

from sqlalchemy.orm import Session

from app.orchestration.context import ImageContext, load_image_context
from app.satellite.provider_manager import get_provider_manager
from app.satellite.scene_ranker import rank_pairs, rank_single
from app.schemas.satellite import SceneCandidate
from app.schemas.task_plan import TaskPlan
from app.services.image_ingestion import ingest_file


class RetrievalError(Exception):
    pass


def _download_and_ingest(db: Session, scene: SceneCandidate, session_id: str | None) -> ImageContext:
    pm = get_provider_manager()
    result = pm.download_scene(scene.provider, scene.scene_id, destination_dir=str(Path.cwd()))
    if not result.success or not result.local_path:
        raise RetrievalError(result.error or "Scene download failed.")

    source_path = Path(result.local_path)
    image, validation = ingest_file(db, source_path, source_path.name, session_id)
    if image is None:
        raise RetrievalError(
            "The retrieved scene failed validation after download: " + "; ".join(validation.errors)
        )
    ctx = load_image_context(db, image.id)
    ctx.source_provider = scene.provider
    ctx.source_scene_id = scene.scene_id
    ctx.source_acquisition_time = scene.acquisition_time
    ctx.retrieved_at = datetime.now(timezone.utc)
    return ctx


def retrieve_images_for_plan(db: Session, plan: TaskPlan, session_id: str | None) -> list[ImageContext]:
    if plan.location is None:
        raise RetrievalError("A location is required to retrieve satellite imagery.")

    pm = get_provider_manager()

    if plan.task in ("change_vqa", "change_detection"):
        before_target, after_target = plan.date_range or (
            date.today() - timedelta(days=365),
            date.today(),
        )
        modality = plan.modalities[0] if plan.modalities else "optical"

        before_candidates, statuses_b, _ = pm.search_scenes(
            plan.location, (before_target - timedelta(days=30), before_target + timedelta(days=30)), modality
        )
        after_candidates, statuses_a, _ = pm.search_scenes(
            plan.location, (after_target - timedelta(days=30), after_target + timedelta(days=30)), modality
        )
        pair = rank_pairs(before_candidates, after_candidates, before_target, after_target, modality)
        if pair is None:
            raise RetrievalError(
                "No compatible before/after scene pair could be found for this area and date range "
                "from any configured provider."
            )
        before_scene, after_scene = pair
        return [
            _download_and_ingest(db, before_scene, session_id),
            _download_and_ingest(db, after_scene, session_id),
        ]

    if plan.task == "optical_sar_analysis":
        date_range = plan.date_range or (date.today() - timedelta(days=90), date.today())
        optical_candidates, _, _ = pm.search_scenes(plan.location, date_range, "optical")
        sar_candidates, _, _ = pm.search_scenes(plan.location, date_range, "sar")
        optical_ranked = rank_single(optical_candidates, "optical")
        sar_ranked = rank_single(sar_candidates, "sar")
        if not optical_ranked or not sar_ranked:
            raise RetrievalError(
                "Could not find both a compatible optical and a compatible SAR scene for this "
                "area and date range."
            )
        return [
            _download_and_ingest(db, optical_ranked[0], session_id),
            _download_and_ingest(db, sar_ranked[0], session_id),
        ]

    date_range = plan.date_range or (date.today() - timedelta(days=90), date.today())
    modality = plan.modalities[0] if plan.modalities else "optical"
    candidates, _, _ = pm.search_scenes(plan.location, date_range, modality)
    ranked = rank_single(candidates, modality)
    if not ranked:
        raise RetrievalError("No suitable scene was found for this area, date range, and modality.")
    return [_download_and_ingest(db, ranked[0], session_id)]
