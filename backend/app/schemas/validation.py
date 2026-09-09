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
    # Individual bands are legitimately unnamed for plenty of real rasters
    # (rasterio's own `ds.descriptions` gives one entry per band, None for
    # any band GDAL has no description for -- not an empty/absent list) --
    # first hit by a Sentinel Hub Process API GeoTIFF, whose bands are raw
    # evalscript outputs with no per-band names at all.
    band_descriptions: list[str | None] | None = None
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
