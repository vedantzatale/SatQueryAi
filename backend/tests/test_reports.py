from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient


def _create_session(client: TestClient) -> str:
    return client.post("/api/v1/sessions", json={"title": "report test"}).json()["id"]


def _upload(client: TestClient, session_id: str, path: Path) -> str:
    with open(path, "rb") as f:
        response = client.post(
            f"/api/v1/images/upload?session_id={session_id}", files={"file": (path.name, f, "image/tiff")}
        )
    return response.json()["image_id"]


def test_report_pdf_generated_for_completed_execution(client: TestClient, demo_data_dir: Path):
    session_id = _create_session(client)
    image_id = _upload(client, session_id, demo_data_dir / "single" / "optical" / "sample_optical.tif")

    submit = client.post(
        "/api/v1/query", json={"session_id": session_id, "text": "Where is the water?", "image_ids": [image_id]}
    )
    execution_id = submit.json()["execution_id"]

    response = client.get(f"/api/v1/analysis/{execution_id}/report")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content[:4] == b"%PDF"  # a real PDF, not a placeholder
    assert len(response.content) > 500


def test_geojson_includes_grounding_bbox_in_wgs84(client: TestClient, demo_data_dir: Path):
    session_id = _create_session(client)
    image_id = _upload(client, session_id, demo_data_dir / "single" / "optical" / "sample_optical.tif")

    submit = client.post(
        "/api/v1/query", json={"session_id": session_id, "text": "Where is the water?", "image_ids": [image_id]}
    )
    execution_id = submit.json()["execution_id"]

    response = client.get(f"/api/v1/analysis/{execution_id}/geojson")
    assert response.status_code == 200
    body = response.json()
    assert body["type"] == "FeatureCollection"
    assert len(body["features"]) >= 1
    kinds = [f["properties"]["kind"] for f in body["features"]]
    assert "bounding_box" in kinds
    geom = next(f["geometry"] for f in body["features"] if f["properties"]["kind"] == "bounding_box")
    lons = [c[0] for c in geom["coordinates"][0]]
    # sample_optical.tif sits in UTM 43N (~72-78E) -- confirms real reprojection, not raw pixel/UTM values
    assert all(70 < lon < 80 for lon in lons)


def test_report_requires_completed_execution(client: TestClient, demo_data_dir: Path):
    session_id = _create_session(client)
    before_id = _upload(client, session_id, demo_data_dir / "temporal" / "before" / "sample_before.tif")

    submit = client.post(
        "/api/v1/query",
        json={"session_id": session_id, "text": "What changed between these two dates?", "image_ids": [before_id]},
    )
    execution_id = submit.json()["execution_id"]  # this will be requires_user_input, not completed

    response = client.get(f"/api/v1/analysis/{execution_id}/report")
    assert response.status_code == 409
