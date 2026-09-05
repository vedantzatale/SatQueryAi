"""ISRO/NRSC Bhoonidhi provider placeholder. Reports "not configured in
this deployment" unless BHOONIDHI_API_URL/API_KEY are set -- Bhoonidhi has
no public open API in the way Copernicus does, so this stays a documented
placeholder adapter until real access is arranged.
"""
from __future__ import annotations

from datetime import date

from app.core.config import get_settings
from app.schemas.location import LocationRequest
from app.schemas.satellite import DownloadResult, ProviderStatus, SceneCandidate
from app.satellite.providers.base import SatelliteDataProvider


class BhoonidhiProvider(SatelliteDataProvider):
    provider_id = "bhoonidhi"

    def __init__(self) -> None:
        settings = get_settings()
        self._api_url = settings.bhoonidhi_api_url
        self._api_key = settings.bhoonidhi_api_key

    def check_availability(self) -> ProviderStatus:
        if not self._api_url or not self._api_key:
            return ProviderStatus(
                provider=self.provider_id,
                status="unavailable_no_credentials",
                message="Bhoonidhi access is not configured in this deployment.",
            )
        return ProviderStatus(
            provider=self.provider_id,
            status="unavailable_error",
            message="Bhoonidhi API client is not implemented in this prototype yet.",
        )

    def search_scenes(
        self, aoi: LocationRequest, date_range: tuple[date, date], modality: str
    ) -> list[SceneCandidate]:
        return []

    def get_metadata(self, scene_id: str) -> SceneCandidate | None:
        return None

    def download_scene(self, scene_id: str, destination_dir: str) -> DownloadResult:
        return DownloadResult(success=False, error="Bhoonidhi is not configured in this deployment.")
