"""Place-name -> coordinates, via OpenStreetMap's Nominatim (nominatim.org).
Free, no API key -- the only cost is respecting its usage policy: a real
identifying User-Agent and no more than ~1 request/second. Never invents a
location; a name that doesn't resolve returns None rather than a guess.
"""
from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache

import httpx

from app.core.logging import get_logger

logger = get_logger(__name__)

_NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
_USER_AGENT = "SatQueryAI/1.0 (satellite imagery analysis; https://github.com/)"


@dataclass(frozen=True)
class GeocodeResult:
    latitude: float
    longitude: float
    bbox: tuple[float, float, float, float]  # (minx/west, miny/south, maxx/east, maxy/north)
    display_name: str


@lru_cache(maxsize=256)
def geocode_place_name(place_name: str) -> GeocodeResult | None:
    """Resolves a free-text place name to a point + bounding box. Cached
    in-process (place names repeat across a demo/session far more than they
    vary) so repeated queries about the same place don't re-hit Nominatim."""
    if not place_name or not place_name.strip():
        return None
    try:
        response = httpx.get(
            _NOMINATIM_URL,
            params={"q": place_name.strip(), "format": "json", "limit": 1, "addressdetails": 0},
            headers={"User-Agent": _USER_AGENT},
            timeout=10,
        )
        response.raise_for_status()
        results = response.json()
    except Exception as exc:  # noqa: BLE001
        logger.warning("geocoding_failed", place_name=place_name, error=str(exc))
        return None

    if not results:
        return None

    top = results[0]
    try:
        south, north, west, east = (float(v) for v in top["boundingbox"])
        return GeocodeResult(
            latitude=float(top["lat"]),
            longitude=float(top["lon"]),
            bbox=(west, south, east, north),
            display_name=top.get("display_name", place_name),
        )
    except (KeyError, ValueError) as exc:
        logger.warning("geocoding_response_malformed", place_name=place_name, error=str(exc))
        return None
