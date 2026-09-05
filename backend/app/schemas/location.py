"""Structured area-of-interest representation. Never a bare location string —
this is what feeds AOI generation for satellite search and GeoJSON export,
and is stored as real geometry once resolved."""
from __future__ import annotations

from pydantic import BaseModel, model_validator


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
