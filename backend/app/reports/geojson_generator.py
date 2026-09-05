"""GeoJSON export via GeoPandas/Shapely. Only ever exports geometry that
was actually reprojected to EPSG:4326 from a real source CRS
(`app/evidence/geo_transform.py`) -- pixel-space coordinates never leak
into this output, and AOIs/regions with no georeference are simply
omitted rather than exported under a fabricated location.
"""
from __future__ import annotations

import json

import geopandas as gpd

from app.models.execution import Execution


def generate_analysis_geojson(execution: Execution) -> dict:
    result = execution.result_json or {}
    features: list[dict] = []

    aoi = (result.get("data_provenance") or {}).get("aoi")
    if aoi:
        features.append(
            {
                "type": "Feature",
                "geometry": aoi,
                "properties": {"kind": "aoi", "execution_id": execution.id},
            }
        )

    for evidence in result.get("evidence", []):
        geometry = evidence.get("geo_geometry")
        if not geometry:
            continue
        features.append(
            {
                "type": "Feature",
                "geometry": geometry,
                "properties": {
                    "kind": evidence.get("type"),
                    "label": evidence.get("label"),
                    "score": evidence.get("score"),
                    "area_m2": evidence.get("area_m2"),
                    "area_percentage": evidence.get("area_percentage"),
                },
            }
        )

    if not features:
        return {"type": "FeatureCollection", "features": [], "crs": None}

    gdf = gpd.GeoDataFrame.from_features(features, crs="EPSG:4326")
    return json.loads(gdf.to_json())
