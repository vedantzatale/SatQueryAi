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
    demo_mode: bool = False
