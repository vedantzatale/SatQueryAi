"""Copernicus Data Space Ecosystem provider (Sentinel-1/Sentinel-2).
Real HTTP client against the CDSE OData catalogue for search, and the
Sentinel Hub Process API (same CDSE OAuth token) for download -- activated
only when COPERNICUS_CLIENT_ID/SECRET are configured. Never claims data
exists when credentials aren't set.

Download deliberately does NOT fetch the full satellite product (a
Sentinel-2 SAFE archive is hundreds of MB to a few GB and needs its own
band-stacking/reprojection step): the Process API renders an
analysis-ready GeoTIFF on demand, cropped to the AOI the user actually
asked about, in one HTTP call. Verified against the real documented
request shape at
https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/UserGuides/BeginnersGuide.html
"""
from __future__ import annotations

import json
import uuid
from datetime import date, datetime, timedelta

import httpx

from app.core.config import get_settings
from app.core.logging import get_logger
from app.schemas.location import LocationRequest
from app.schemas.satellite import DownloadResult, ProviderStatus, SceneCandidate
from app.satellite.providers.base import SatelliteDataProvider

logger = get_logger(__name__)

_CDSE_TOKEN_URL = (
    "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
)
_CDSE_CATALOGUE_URL = "https://catalogue.dataspace.copernicus.eu/odata/v1/Products"
_SENTINEL_HUB_PROCESS_URL = "https://sh.dataspace.copernicus.eu/process/v1"

# True-color (Sentinel-2 L2A) and dual-pol grayscale (Sentinel-1 GRD)
# evalscripts -- the Process API's own scripting language for turning raw
# bands into an output raster. Kept minimal and auditable rather than
# pulling in a third-party evalscript library.
_EVALSCRIPT_OPTICAL = """//VERSION=3
function setup() {
  return { input: ["B02", "B03", "B04"], output: { bands: 3, sampleType: "AUTO" } };
}
function evaluatePixel(sample) {
  return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
}"""

_EVALSCRIPT_SAR = """//VERSION=3
function setup() {
  return { input: ["VV", "VH"], output: { bands: 2, sampleType: "AUTO" } };
}
function evaluatePixel(sample) {
  return [2.5 * sample.VV, 2.5 * sample.VH];
}"""


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
        # resolve_bbox() (not to_geojson()) so a place_name is actually
        # geocoded here -- searching with no spatial filter at all used to
        # silently return globally-matching scenes for any place name.
        bbox = aoi.resolve_bbox()
        filter_parts = [
            f"Collection/Name eq '{collection}'",
            f"ContentDate/Start ge {date_range[0].isoformat()}T00:00:00Z",
            f"ContentDate/Start le {date_range[1].isoformat()}T23:59:59Z",
        ]
        if bbox:
            minx, miny, maxx, maxy = bbox
            wkt = (
                f"POLYGON(({minx} {miny}, {maxx} {miny}, {maxx} {maxy}, "
                f"{minx} {maxy}, {minx} {miny}))"
            )
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

    def download_scene(self, scene: SceneCandidate, destination_dir: str, aoi: LocationRequest) -> DownloadResult:
        """Renders an analysis-ready GeoTIFF via the Sentinel Hub Process
        API, cropped to `aoi` (the user's requested area), rather than
        downloading the full multi-GB satellite product and parsing its
        raw band files -- avoids needing a SAFE-archive parser entirely."""
        bbox = aoi.resolve_bbox()
        if bbox is None:
            return DownloadResult(success=False, error="Could not resolve a bounding box for this location.")

        is_sar = scene.modality == "sar"
        collection = "sentinel-1-grd" if is_sar else "sentinel-2-l2a"
        evalscript = _EVALSCRIPT_SAR if is_sar else _EVALSCRIPT_OPTICAL

        if scene.acquisition_time:
            acq = scene.acquisition_time
            time_from, time_to = acq - timedelta(hours=12), acq + timedelta(hours=12)
        else:
            time_from, time_to = datetime.now() - timedelta(days=90), datetime.now()

        request_body = {
            "input": {
                "bounds": {"bbox": list(bbox)},
                "data": [
                    {
                        "type": collection,
                        "dataFilter": {
                            "timeRange": {
                                "from": time_from.strftime("%Y-%m-%dT%H:%M:%SZ"),
                                "to": time_to.strftime("%Y-%m-%dT%H:%M:%SZ"),
                            },
                            "mosaickingOrder": "mostRecent",
                        },
                    }
                ],
            },
            "output": {
                "width": 512,
                "height": 512,
                "responses": [{"identifier": "default", "format": {"type": "image/tiff"}}],
            },
            "evalscript": evalscript,
        }

        logger.info("copernicus_download_started", scene_id=scene.scene_id, bbox=bbox)
        try:
            token = self._get_token()
            # An explicit per-phase Timeout, not the bare `timeout=60` shorthand:
            # verified directly against this exact endpoint+payload (a plain
            # httpx.post with timeout=60 hung indefinitely in-process with zero
            # error, while this exact Client/Timeout combination consistently
            # returns in ~2s) -- root cause not fully isolated, but this is the
            # proven-working shape, not a guess.
            with httpx.Client(timeout=httpx.Timeout(connect=10, read=45, write=10, pool=10)) as client:
                response = client.post(
                    _SENTINEL_HUB_PROCESS_URL,
                    content=json.dumps(request_body),
                    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                )
            response.raise_for_status()
            logger.info("copernicus_download_response", scene_id=scene.scene_id, status=response.status_code, bytes=len(response.content))
        except Exception as exc:  # noqa: BLE001
            logger.warning("copernicus_download_failed", scene_id=scene.scene_id, error=str(exc))
            return DownloadResult(success=False, error=f"Copernicus Process API request failed: {exc}")

        from pathlib import Path

        out_path = Path(destination_dir) / f"copernicus_{scene.scene_id.replace('/', '_')}_{uuid.uuid4().hex[:8]}.tif"
        out_path.write_bytes(response.content)
        return DownloadResult(success=True, local_path=str(out_path))

    @staticmethod
    def _geojson_to_wkt(geojson: dict) -> str | None:
        try:
            from shapely.geometry import shape

            return shape(geojson).wkt
        except Exception:  # noqa: BLE001
            return None
