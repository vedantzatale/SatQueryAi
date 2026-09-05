from __future__ import annotations

from typing import Literal

from pydantic import BaseModel

EvidenceType = Literal["original", "bounding_box", "polygon", "change_mask", "overlay", "before_after"]


class Evidence(BaseModel):
    type: EvidenceType
    storage_key: str | None = None
    coordinates: list | None = None  # pixel-space, for rendering only
    geo_geometry: dict | None = None  # GeoJSON geometry in EPSG:4326, only when georeferenced
    label: str | None = None
    score: float | None = None
    area_m2: float | None = None
    area_percentage: float | None = None
