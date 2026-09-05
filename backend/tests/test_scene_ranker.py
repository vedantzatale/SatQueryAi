from __future__ import annotations

from datetime import date, datetime, timezone

from app.satellite.scene_ranker import rank_pairs, rank_single
from app.schemas.satellite import SceneCandidate


def _scene(scene_id: str, acquisition: datetime, cloud: float = 5.0, crs: str = "EPSG:32643") -> SceneCandidate:
    return SceneCandidate(
        provider="mock_demo",
        scene_id=scene_id,
        acquisition_time=acquisition,
        cloud_percentage=cloud,
        crs=crs,
        resolution=10.0,
        modality="optical",
        sensor="synthetic_demo",
        demo_mode=True,
    )


def test_rank_single_never_just_returns_first_result():
    """A low-quality-but-first scene must not outrank a clearly better one."""
    poor = _scene("poor", datetime(2024, 6, 15, tzinfo=timezone.utc), cloud=90.0)
    good = _scene("good", datetime(2024, 6, 16, tzinfo=timezone.utc), cloud=2.0)
    ranked = rank_single([poor, good], target_modality="optical")
    assert ranked[0].scene_id == "good"


def test_rank_pairs_picks_temporally_compatible_pair_not_arbitrary_combo():
    before_candidates = [
        _scene("before_far", datetime(2020, 1, 1, tzinfo=timezone.utc)),
        _scene("before_near", datetime(2024, 1, 5, tzinfo=timezone.utc)),
    ]
    after_candidates = [
        _scene("after_far", datetime(2030, 1, 1, tzinfo=timezone.utc)),
        _scene("after_near", datetime(2024, 12, 20, tzinfo=timezone.utc)),
    ]
    pair = rank_pairs(
        before_candidates,
        after_candidates,
        before_target=date(2024, 1, 1),
        after_target=date(2024, 12, 31),
        target_modality="optical",
    )
    assert pair is not None
    before, after = pair
    assert before.scene_id == "before_near"
    assert after.scene_id == "after_near"


def test_rank_pairs_returns_none_when_nothing_is_temporally_compatible():
    before_candidates = [_scene("way_off", datetime(2000, 1, 1, tzinfo=timezone.utc))]
    after_candidates = [_scene("also_way_off", datetime(2000, 1, 1, tzinfo=timezone.utc))]
    pair = rank_pairs(
        before_candidates,
        after_candidates,
        before_target=date(2024, 1, 1),
        after_target=date(2024, 12, 31),
        target_modality="optical",
    )
    assert pair is None
