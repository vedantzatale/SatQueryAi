"""SatelliteDataProvider -- the interface every real or mock satellite
data source implements. The agent never calls a provider directly; only
the ProviderManager (provider_manager.py) does.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import date

from app.schemas.location import LocationRequest
from app.schemas.satellite import DownloadResult, ProviderStatus, SceneCandidate


class SatelliteDataProvider(ABC):
    provider_id: str

    @abstractmethod
    def check_availability(self) -> ProviderStatus: ...

    @abstractmethod
    def search_scenes(
        self, aoi: LocationRequest, date_range: tuple[date, date], modality: str
    ) -> list[SceneCandidate]: ...

    @abstractmethod
    def get_metadata(self, scene_id: str) -> SceneCandidate | None: ...

    @abstractmethod
    def download_scene(self, scene_id: str, destination_dir: str) -> DownloadResult: ...
