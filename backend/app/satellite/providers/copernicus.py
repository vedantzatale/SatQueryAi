"""Copernicus Data Space Ecosystem provider (Sentinel-1/Sentinel-2).
Real HTTP client against the CDSE OData/STAC catalogue -- activated only
when COPERNICUS_CLIENT_ID/SECRET are configured. Never claims data exists
when credentials aren't set.
"""
from __future__ import annotations

from datetime import date

import httpx

from app.core.config import get_settings
from app.schemas.location import LocationRequest
from app.schemas.satellite import DownloadResult, ProviderStatus, SceneCandidate
from app.satellite.providers.base import SatelliteDataProvider

_CDSE_TOKEN_URL = (
    "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
)
_CDSE_CATALOGUE_URL = "https://catalogue.dataspace.copernicus.eu/odata/v1/Products"


class CopernicusProvider(SatelliteDataProvider):
    provider_id = "copernicus"

    def __init__(self) -> None:
        settings = get_settings()
        self._client_id = settings.copernicus_client_id
        self._client_secret = settings.copernicus_client_secret

    def check_availability(self) -> ProviderStatus:
        if not self._client_id or not self._client_secret:
            return ProviderStatus(
                provider=self.provider_id,
                status="unavailable_no_credentials",
                message="Copernicus access is not configured in this deployment.",
            )
        try:
            self._get_token()
            return ProviderStatus(provider=self.provider_id, status="healthy")
        except Exception as exc:  # noqa: BLE001
            return ProviderStatus(
                provider=self.provider_id, status="unavailable_error", message=str(exc)
            )

    def _get_token(self) -> str:
        response = httpx.post(
            _CDSE_TOKEN_URL,
            data={
                "client_id": self._client_id,
                "client_secret": self._client_secret,
                "grant_type": "client_credentials",
            },
            timeout=15,
        )
        response.raise_for_status()
        return response.json()["access_token"]

    def search_scenes(
        self, aoi: LocationRequest, date_range: tuple[date, date], modality: str
    ) -> list[SceneCandidate]:
        status = self.check_availability()
        if status.status != "healthy":
            return []

        collection = "SENTINEL-2" if modality in ("optical", "multispectral") else "SENTINEL-1"
        geojson = aoi.to_geojson()
        filter_parts = [
            f"Collection/Name eq '{collection}'",
            f"ContentDate/Start ge {date_range[0].isoformat()}T00:00:00Z",
            f"ContentDate/Start le {date_range[1].isoformat()}T23:59:59Z",
        ]
        if geojson:
            wkt = self._geojson_to_wkt(geojson)
            if wkt:
                filter_parts.append(f"OData.CSC.Intersects(area=geography'SRID=4326;{wkt}')")

        params = {"$filter": " and ".join(filter_parts), "$top": "20"}
        try:
            token = self._get_token()
            response = httpx.get(
                _CDSE_CATALOGUE_URL,
                params=params,
                headers={"Authorization": f"Bearer {token}"},
                timeout=20,
            )
            response.raise_for_status()
            items = response.json().get("value", [])
        except Exception:  # noqa: BLE001
            return []

        candidates = []
        for item in items:
            candidates.append(
                SceneCandidate(
                    provider=self.provider_id,
                    scene_id=item.get("Id", ""),
                    product_id=item.get("Name"),
                    acquisition_time=item.get("ContentDate", {}).get("Start"),
                    cloud_percentage=None,
                    bbox=None,
                    crs="EPSG:4326",
                    resolution=10.0 if collection == "SENTINEL-2" else None,
                    modality=modality,
                    sensor=collection,
                    demo_mode=False,
                )
            )
        return candidates

    def get_metadata(self, scene_id: str) -> SceneCandidate | None:
        return None

    def download_scene(self, scene_id: str, destination_dir: str) -> DownloadResult:
        return DownloadResult(
            success=False,
            error=(
                "Direct scene download from Copernicus Data Space is not implemented in this "
                "prototype. Configure a download worker before enabling real retrieval."
            ),
        )

    @staticmethod
    def _geojson_to_wkt(geojson: dict) -> str | None:
        try:
            from shapely.geometry import shape

            return shape(geojson).wkt
        except Exception:  # noqa: BLE001
            return None
