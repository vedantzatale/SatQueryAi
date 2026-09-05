from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel

ProviderStatusValue = Literal["healthy", "unavailable_no_credentials", "unavailable_error"]


class ProviderStatus(BaseModel):
    provider: str
    status: ProviderStatusValue
    message: str | None = None


class SceneCandidate(BaseModel):
    provider: str
    scene_id: str
    product_id: str | None = None
    acquisition_time: datetime | None = None
    cloud_percentage: float | None = None
    bbox: tuple[float, float, float, float] | None = None
    crs: str | None = None
    resolution: float | None = None
    modality: str
    sensor: str | None = None
    demo_mode: bool = False

    # populated by SceneRanker
    coverage_score: float = 0.0
    temporal_score: float = 0.0
    quality_score: float = 0.0
    cloud_score: float = 0.0
    modality_score: float = 0.0
    resolution_score: float = 0.0
    crs_compat_score: float = 0.0
    sensor_compat_score: float = 0.0
    provider_availability_score: float = 0.0

    @property
    def total_score(self) -> float:
        return (
            self.coverage_score
            + self.temporal_score
            + self.quality_score
            + self.cloud_score
            + self.modality_score
            + self.resolution_score
            + self.crs_compat_score
            + self.sensor_compat_score
            + self.provider_availability_score
        )


class DownloadResult(BaseModel):
    success: bool
    local_path: str | None = None
    error: str | None = None
