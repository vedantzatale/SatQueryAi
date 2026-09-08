"""Structured area-of-interest representation. Never a bare location string —
this is what feeds AOI generation for satellite search and GeoJSON export,
and is stored as real geometry once resolved."""
from __future__ import annotations

import math

from pydantic import BaseModel, model_validator

# Default AOI radius when a location is a bare point (lat/lon, or a geocoded
# place name with no bounding box of its own) and no explicit radius_km was
# given -- wide enough to reliably contain a Sentinel-1/2 scene footprint
# over the point without requesting a needlessly large area.
_DEFAULT_RADIUS_KM = 5.0
_KM_PER_DEGREE_LAT = 111.32


class LocationRequest(BaseModel):
    place_name: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    bbox: tuple[float, float, float, float] | None = None  # (minx, miny, maxx, maxy)
    polygon: dict | None = None  # GeoJSON geometry
    radius_km: float | None = None

    @model_validator(mode="after")
    def _at_least_one_locator(self) -> "LocationRequest":
        has_locator = any(
            [
                self.place_name,
                self.latitude is not None and self.longitude is not None,
                self.bbox is not None,
                self.polygon is not None,
            ]
        )
        if not has_locator:
            raise ValueError(
                "LocationRequest needs at least one of: place_name, lat/lon, bbox, polygon"
            )
        return self

    def to_geojson(self) -> dict | None:
        """Best-effort GeoJSON geometry for this location, for AOI generation
        and export. Returns None when only a place_name is known (needs
        geocoding, which happens upstream before this point in real deployments)."""
        if self.polygon is not None:
            return self.polygon
        if self.bbox is not None:
            minx, miny, maxx, maxy = self.bbox
            return {
                "type": "Polygon",
                "coordinates": [
                    [[minx, miny], [maxx, miny], [maxx, maxy], [minx, maxy], [minx, miny]]
                ],
            }
        if self.latitude is not None and self.longitude is not None:
            return {"type": "Point", "coordinates": [self.longitude, self.latitude]}
        return None

    def resolve_bbox(self) -> tuple[float, float, float, float] | None:
        """A real (minx, miny, maxx, maxy) bounding box for this location,
        resolving whichever locator was given -- geocoding a place_name via
        Nominatim, or expanding a bare point by radius_km (default 5km).
        This is what satellite search/download actually needs; to_geojson()
        deliberately does NOT geocode (it's used for lightweight display/
        export paths that shouldn't make a network call), so this is the
        one place that does. Returns None only when nothing resolves (e.g.
        an unrecognized place name) -- never a guessed area."""
        if self.bbox is not None:
            return self.bbox
        if self.polygon is not None:
            try:
                from shapely.geometry import shape

                return shape(self.polygon).bounds
            except Exception:  # noqa: BLE001
                return None

        lat, lon = self.latitude, self.longitude
        if lat is None or lon is None:
            if not self.place_name:
                return None
            from app.satellite.geocoding import geocode_place_name

            geocoded = geocode_place_name(self.place_name)
            if geocoded is None:
                return None
            if self.radius_km is None:
                # A geocoded place already carries its own real extent.
                return geocoded.bbox
            lat, lon = geocoded.latitude, geocoded.longitude

        radius_km = self.radius_km or _DEFAULT_RADIUS_KM
        dlat = radius_km / _KM_PER_DEGREE_LAT
        km_per_degree_lon = max(_KM_PER_DEGREE_LAT * math.cos(math.radians(lat)), 1e-6)
        dlon = radius_km / km_per_degree_lon
        return (lon - dlon, lat - dlat, lon + dlon, lat + dlat)
