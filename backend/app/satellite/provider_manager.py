"""ProviderManager -- the only thing that talks to satellite providers.
The agent asks it for scenes; it tries providers in configured priority
order, skipping any that report unavailable, and never claims data exists
when credentials aren't configured. Falls back to the mock/demo provider
only when every real provider is unavailable AND demo_mode is on.
"""
from __future__ import annotations

from datetime import date

from app.core.config import get_settings
from app.schemas.location import LocationRequest
from app.schemas.satellite import ProviderStatus, SceneCandidate
from app.satellite.providers.base import SatelliteDataProvider
from app.satellite.providers.bhoonidhi import BhoonidhiProvider
from app.satellite.providers.copernicus import CopernicusProvider
from app.satellite.providers.mock import MockSatelliteProvider
from app.satellite.providers.usgs import USGSProvider

_PROVIDER_CLASSES: dict[str, type[SatelliteDataProvider]] = {
    "copernicus": CopernicusProvider,
    "bhoonidhi": BhoonidhiProvider,
    "usgs": USGSProvider,
}


class ProviderManager:
    def __init__(self) -> None:
        settings = get_settings()
        self._priority = settings.satellite_provider_priority_list
        self._demo_mode = settings.demo_mode
        self._providers = {name: cls() for name, cls in _PROVIDER_CLASSES.items()}
        self._mock_provider = MockSatelliteProvider()

    def check_all(self) -> list[ProviderStatus]:
        return [self._providers[name].check_availability() for name in self._priority if name in self._providers]

    def search_scenes(
        self, aoi: LocationRequest, date_range: tuple[date, date], modality: str
    ) -> tuple[list[SceneCandidate], list[ProviderStatus], bool]:
        """Returns (candidates, provider_statuses_tried, used_demo_fallback)."""
        statuses: list[ProviderStatus] = []
        for name in self._priority:
            provider = self._providers.get(name)
            if provider is None:
                continue
            status = provider.check_availability()
            statuses.append(status)
            if status.status != "healthy":
                continue
            candidates = provider.search_scenes(aoi, date_range, modality)
            if candidates:
                return candidates, statuses, False

        if self._demo_mode:
            demo_status = self._mock_provider.check_availability()
            statuses.append(demo_status)
            if demo_status.status == "healthy":
                candidates = self._mock_provider.search_scenes(aoi, date_range, modality)
                return candidates, statuses, True

        return [], statuses, False

    def download_scene(self, provider_id: str, scene_id: str, destination_dir: str):
        provider = self._providers.get(provider_id) or (
            self._mock_provider if provider_id == self._mock_provider.provider_id else None
        )
        if provider is None:
            raise ValueError(f"Unknown provider '{provider_id}'.")
        return provider.download_scene(scene_id, destination_dir)


_manager = ProviderManager()


def get_provider_manager() -> ProviderManager:
    return _manager
