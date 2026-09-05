"""Converts pixel-space evidence (bounding boxes) into real geographic
GeoJSON geometry (EPSG:4326), using the source raster's actual affine
transform and CRS. Never labels a pixel-space box as geographic
coordinates -- if there's no georeference, this returns None and the
caller must say so rather than exporting a fabricated location.
"""
from __future__ import annotations

from typing import Any

import pyproj
import rasterio


def pixel_bbox_to_geojson(
    bbox: tuple[float, float, float, float], transform: Any, src_crs: str | None
) -> dict | None:
    if transform is None or src_crs is None:
        return None

    x1, y1, x2, y2 = bbox
    corners_px = [(x1, y1), (x2, y1), (x2, y2), (x1, y2), (x1, y1)]
    corners_geo = [rasterio.transform.xy(transform, py, px, offset="center") for px, py in corners_px]

    if str(src_crs).upper() not in ("EPSG:4326", "WGS84"):
        transformer = pyproj.Transformer.from_crs(src_crs, "EPSG:4326", always_xy=True)
        corners_geo = [transformer.transform(x, y) for x, y in corners_geo]

    return {"type": "Polygon", "coordinates": [[[float(x), float(y)] for x, y in corners_geo]]}


def reproject_geojson_to_wgs84(geometry: dict | None, src_crs: str | None) -> dict | None:
    """Reprojects a GeoJSON Polygon's coordinates from src_crs to EPSG:4326.
    Returns None (never the un-reprojected geometry) when src_crs is
    unknown -- callers must not export coordinates under the wrong CRS."""
    if geometry is None or src_crs is None:
        return None
    if str(src_crs).upper() in ("EPSG:4326", "WGS84"):
        return geometry

    transformer = pyproj.Transformer.from_crs(src_crs, "EPSG:4326", always_xy=True)
    coords = geometry.get("coordinates")
    if geometry.get("type") == "Polygon":
        new_coords = [[list(transformer.transform(x, y)) for x, y in ring] for ring in coords]
        return {"type": "Polygon", "coordinates": new_coords}
    return None

