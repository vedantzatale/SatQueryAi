from __future__ import annotations

from datetime import date

from fastapi import APIRouter
from pydantic import BaseModel

from app.schemas.location import LocationRequest
from app.satellite.provider_manager import get_provider_manager
from app.satellite.scene_ranker import rank_single

router = APIRouter(prefix="/satellite", tags=["satellite"])


class SearchRequest(BaseModel):
    location: LocationRequest
    date_from: date
    date_to: date
    modality: str = "optical"


class RetrieveRequest(BaseModel):
    provider: str
    scene_id: str


@router.post("/search")
def search_scenes(body: SearchRequest) -> dict:
    manager = get_provider_manager()
    candidates, statuses, used_demo = manager.search_scenes(
        body.location, (body.date_from, body.date_to), body.modality
    )
    ranked = rank_single(candidates, body.modality)
    return {
        "scenes": [c.model_dump(mode="json") for c in ranked],
        "provider_statuses": [s.model_dump() for s in statuses],
        "used_demo_fallback": used_demo,
    }


@router.post("/retrieve")
def retrieve_scene(body: RetrieveRequest) -> dict:
    manager = get_provider_manager()
    result = manager.download_scene(body.provider, body.scene_id, destination_dir=".")
    return result.model_dump()


@router.get("/providers/status")
def provider_status() -> dict:
    manager = get_provider_manager()
    return {"providers": [s.model_dump() for s in manager.check_all()]}
