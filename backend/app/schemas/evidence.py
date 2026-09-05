from __future__ import annotations

from typing import Literal

from pydantic import BaseModel

EvidenceType = Literal["bounding_box", "polygon", "change_mask", "overlay", "before_after"]


class Evidence(BaseModel):
    type: EvidenceType
    storage_key: str | None = None
    coordinates: list | None = None
    label: str | None = None
    score: float | None = None
    area_m2: float | None = None
    area_percentage: float | None = None
