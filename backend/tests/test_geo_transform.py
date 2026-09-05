from __future__ import annotations

from rasterio.transform import from_origin

from app.evidence.geo_transform import pixel_bbox_to_geojson, reproject_geojson_to_wgs84


def test_pixel_bbox_to_geojson_in_utm_reprojects_to_wgs84():
    # 10m/pixel raster near a real UTM 43N origin (used by the demo dataset)
    transform = from_origin(500000.0, 2200000.0, 10.0, 10.0)
    geometry = pixel_bbox_to_geojson((10, 10, 20, 20), transform, "EPSG:32643")

    assert geometry is not None
    assert geometry["type"] == "Polygon"
    lons = [c[0] for c in geometry["coordinates"][0]]
    lats = [c[1] for c in geometry["coordinates"][0]]
    # UTM zone 43N covers roughly 72-78 deg E; sanity-check the reprojection
    # landed in a plausible longitude/latitude range, not raw UTM meters.
    assert all(70 < lon < 80 for lon in lons)
    assert all(15 < lat < 25 for lat in lats)


def test_pixel_bbox_to_geojson_without_crs_returns_none():
    transform = from_origin(0, 0, 1, 1)
    assert pixel_bbox_to_geojson((0, 0, 10, 10), transform, None) is None


def test_reproject_geojson_passthrough_when_already_wgs84():
    geometry = {"type": "Polygon", "coordinates": [[[10.0, 20.0], [11.0, 20.0], [11.0, 21.0], [10.0, 21.0], [10.0, 20.0]]]}
    assert reproject_geojson_to_wgs84(geometry, "EPSG:4326") == geometry


def test_reproject_geojson_none_without_crs():
    geometry = {"type": "Polygon", "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]}
    assert reproject_geojson_to_wgs84(geometry, None) is None
