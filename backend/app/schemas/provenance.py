from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel


class DataProvenance(BaseModel):
    provider: str | None = None  # e.g. "copernicus" | "user_upload" | "mock_demo"
    scene_id: str | None = None
    acquisition_date: date | None = None
    sensor: str | None = None
    aoi: dict | None = None  # GeoJSON
    crs: str | None = None
    resolution: float | None = None
    processing_applied: list[str] = []
    retrieved_at: datetime | None = None


class ModelProvenance(BaseModel):
    model_id: str
    version: str
    capability: str
    configuration: dict = {}
    fallback_used: bool = False
    fallback_reason: str | None = None
    # True only for the mock/heuristic adapter path (no trained weights
    # available) -- an untrained stand-in whose output isn't calibrated.
    demo_mode: bool = False
    # "model" (default, unchanged for every existing caller) or
    # "curated_reference" -- a pre-verified answer served for a known
    # showcase image+question pair without running a model at all (see
    # app/orchestration/showcase.py). Distinct from demo_mode: this is not
    # an untrained heuristic, it's a human-checked correct answer, so it
    # deliberately does NOT set demo_mode=True and doesn't trigger the
    # frontend's "DEMO -- no trained model" warning badge.
    source: str = "model"
