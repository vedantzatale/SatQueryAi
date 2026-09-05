from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel

DetectedModality = Literal["optical", "multispectral", "sar", "unknown"]


class ImageValidationMetadata(BaseModel):
    """Only what was actually inspected in the file. Never fabricated."""

    crs: str | None = None
    bounds_geojson: dict | None = None
    resolution_x: float | None = None
    resolution_y: float | None = None
    band_count: int | None = None
    band_descriptions: list[str] | None = None
    width: int | None = None
    height: int | None = None
    acquisition_date: date | None = None
    sensor: str | None = None


class ValidationResult(BaseModel):
    valid: bool
    errors: list[str] = []
    warnings: list[str] = []
    metadata: ImageValidationMetadata = ImageValidationMetadata()
    detected_modality: DetectedModality = "unknown"
    spatial_reference_available: bool = False
