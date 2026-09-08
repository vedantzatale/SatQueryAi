from __future__ import annotations

from app.model_adapters.agent_adapter import AgentAdapter
from app.satellite.geocoding import geocode_place_name
from app.schemas.location import LocationRequest


def test_geocode_place_name_resolves_a_real_known_city():
    """Live call against Nominatim (free, no API key) -- proves the geocoder
    actually resolves a real place to real coordinates, not just that the
    HTTP call doesn't crash."""
    result = geocode_place_name("Chennai, India")
    assert result is not None
    assert 12.5 < result.latitude < 13.5
    assert 79.5 < result.longitude < 80.5
    west, south, east, north = result.bbox
    assert west < result.longitude < east
    assert south < result.latitude < north


def test_geocode_place_name_returns_none_for_gibberish():
    """Never invents a location for an unresolvable name."""
    result = geocode_place_name("zzzqxnotarealplacename12345")
    assert result is None


def test_resolve_bbox_from_explicit_bbox_is_a_passthrough():
    loc = LocationRequest(bbox=(72.8, 19.0, 72.9, 19.1))
    assert loc.resolve_bbox() == (72.8, 19.0, 72.9, 19.1)


def test_resolve_bbox_from_point_expands_by_radius():
    loc = LocationRequest(latitude=19.076, longitude=72.877, radius_km=10)
    bbox = loc.resolve_bbox()
    assert bbox is not None
    minx, miny, maxx, maxy = bbox
    assert minx < 72.877 < maxx
    assert miny < 19.076 < maxy
    # ~10km at this latitude is roughly 0.09-0.18 degrees -- sanity-check
    # it's a small local box, not degenerate or absurdly large.
    assert 0.05 < (maxx - minx) < 0.5
    assert 0.05 < (maxy - miny) < 0.5


def test_resolve_bbox_from_point_uses_default_radius_when_unset():
    loc = LocationRequest(latitude=19.076, longitude=72.877)
    bbox = loc.resolve_bbox()
    assert bbox is not None
    minx, miny, maxx, maxy = bbox
    assert minx < 72.877 < maxx and miny < 19.076 < maxy


def test_resolve_bbox_geocodes_a_real_place_name():
    """End-to-end through the real geocoder -- a place_name-only location
    (the case the audit found had NO spatial filter at all) now resolves to
    a real, sensible bounding box."""
    loc = LocationRequest(place_name="Chennai, India")
    bbox = loc.resolve_bbox()
    assert bbox is not None
    minx, miny, maxx, maxy = bbox
    assert 79 < minx < maxx < 81
    assert 12 < miny < maxy < 14


def test_resolve_bbox_returns_none_for_unresolvable_place_name():
    loc = LocationRequest(place_name="zzzqxnotarealplacename12345")
    assert loc.resolve_bbox() is None


def test_mock_agent_extracts_bare_lat_lon_pair_from_query_text():
    location = AgentAdapter._extract_location("what is visible near 19.076, 72.877?")
    assert location == {"latitude": 19.076, "longitude": 72.877}


def test_mock_agent_still_extracts_place_names_when_no_coordinates_present():
    location = AgentAdapter._extract_location("show me the water bodies near Chennai")
    assert location == {"place_name": "Chennai"}


def test_mock_agent_does_not_misread_unrelated_numbers_as_coordinates():
    """Two area figures without a bare 'lat, lon' pair must never be
    misread as coordinates -- only an actual comma-separated pair matches."""
    location = AgentAdapter._extract_location("is 12.8 and 4.2 significant here")
    assert location is None or "latitude" not in location


def test_end_to_end_location_only_query_with_no_image_retrieves_and_answers(client):
    """The actual feature the user asked for: type a place name with NO
    image attached, and get back a real completed analysis -- exercising
    the full path (policy validator -> retrieval -> mock provider download
    -> ingestion -> real single-image execution) that the audit found had
    zero test coverage."""
    session_id = client.post("/api/v1/sessions", json={}).json()["id"]
    response = client.post(
        "/api/v1/query",
        json={"session_id": session_id, "text": "What is visible near Chennai?", "image_ids": []},
    )
    assert response.status_code == 200
    result = client.get(f"/api/v1/analysis/{response.json()['execution_id']}").json()
    assert result["status"] == "completed"
    assert result["data_provenance"]["provider"] == "mock_demo"
    assert result["answer"]


def test_bare_satellite_retrieval_request_no_longer_crashes(client):
    """Regression test for a real dead-end bug found during audit: a task
    classified as bare 'satellite_retrieval' (get me imagery, no question)
    used to always fail with "No execution path implemented for capability
    'satellite_search'" even after a successful retrieval."""
    session_id = client.post("/api/v1/sessions", json={}).json()["id"]
    response = client.post(
        "/api/v1/query",
        json={"session_id": session_id, "text": "Find satellite imagery of Chennai.", "image_ids": []},
    )
    assert response.status_code == 200
    result = client.get(f"/api/v1/analysis/{response.json()['execution_id']}").json()
    assert result["status"] == "completed"
    assert "retrieved imagery" in result["answer"].lower()
