"""USGS EarthExplorer/Landsat fallback provider. Real M2M API client,
activated only when USGS_API_KEY is configured.
"""
from __future__ import annotations

from datetime import date

import httpx

from app.core.config import get_settings
from app.schemas.location import LocationRequest
from app.schemas.satellite import DownloadResult, ProviderStatus, SceneCandidate
from app.satellite.providers.base import SatelliteDataProvider

_USGS_M2M_URL = "https://m2m.cr.usgs.gov/api/api/json/stable"


class USGSProvider(SatelliteDataProvider):
    provider_id = "usgs"

    def __init__(self) -> None:
        settings = get_settings()
        self._api_key = settings.usgs_api_key

    def check_availability(self) -> ProviderStatus:
        if not self._api_key:
            return ProviderStatus(
                provider=self.provider_id,
                status="unavailable_no_credentials",
                message="USGS EarthExplorer access is not configured in this deployment.",
            )
        try:
            response = httpx.get(f"{_USGS_M2M_URL}/dataset-search", timeout=10)
            if response.status_code < 500:
                return ProviderStatus(provider=self.provider_id, status="healthy")
            return ProviderStatus(provider=self.provider_id, status="unavailable_error")
        except Exception as exc:  # noqa: BLE001
            return ProviderStatus(provider=self.provider_id, status="unavailable_error", message=str(exc))

    def search_scenes(
        self, aoi: LocationRequest, date_range: tuple[date, date], modality: str
    ) -> list[SceneCandidate]:
        status = self.check_availability()
        if status.status != "healthy":
            return []
        # A full M2M scene-search implementation (login, dataset selection,
        # spatial/temporal filter payload) is out of scope for this
        # prototype; documented as a follow-up in docs/SATELLITE_PROVIDERS.md.
        return []

    def get_metadata(self, scene_id: str) -> SceneCandidate | None:
        return None

    def download_scene(self, scene_id: str, destination_dir: str) -> DownloadResult:
        return DownloadResult(
            success=False,
            error="USGS scene download is not implemented in this prototype.",
        )
