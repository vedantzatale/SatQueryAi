"""End-to-end tests through the real HTTP API against the mock model
adapters -- covering the MVP acceptance tests from the project spec.
"""
from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient


def _create_session(client: TestClient) -> str:
    response = client.post("/api/v1/sessions", json={"title": "test"})
    assert response.status_code == 200
    return response.json()["id"]


def _upload(client: TestClient, session_id: str, path: Path) -> str:
    with open(path, "rb") as f:
        response = client.post(
            f"/api/v1/images/upload?session_id={session_id}",
            files={"file": (path.name, f, "image/tiff")},
        )
    assert response.status_code == 200
    body = response.json()
    assert body["image_id"] is not None, body["validation"]
    return body["image_id"]


def _ask(client: TestClient, session_id: str, text: str, image_ids: list[str]) -> dict:
    response = client.post(
        "/api/v1/query", json={"session_id": session_id, "text": text, "image_ids": image_ids}
    )
    assert response.status_code == 200
    execution_id = response.json()["execution_id"]
    result = client.get(f"/api/v1/analysis/{execution_id}")
    assert result.status_code == 200
    return result.json()


def test_mvp_1_single_image_vqa(client: TestClient, demo_data_dir: Path):
    session_id = _create_session(client)
    image_id = _upload(client, session_id, demo_data_dir / "single" / "optical" / "sample_optical.tif")

    result = _ask(client, session_id, "What is visible in this image?", [image_id])
    assert result["status"] == "completed"
    assert result["task"] == "vqa"
    assert result["answer"]
    assert result["confidence"]["mode"] == "demo_heuristic"
    assert result["confidence"]["model_confidence"] is None  # never fabricated


def test_mvp_2_captioning(client: TestClient, demo_data_dir: Path):
    session_id = _create_session(client)
    image_id = _upload(client, session_id, demo_data_dir / "single" / "optical" / "sample_optical.tif")

    result = _ask(client, session_id, "Describe this image.", [image_id])
    assert result["status"] == "completed"
    assert result["task"] == "captioning"


def test_mvp_3_grounding_returns_evidence(client: TestClient, demo_data_dir: Path):
    session_id = _create_session(client)
    image_id = _upload(client, session_id, demo_data_dir / "single" / "optical" / "sample_optical.tif")

    result = _ask(client, session_id, "Where is the water?", [image_id])
    assert result["status"] == "completed"
    assert result["task"] == "grounding"
    evidence_types = [e["type"] for e in result["evidence"]]
    assert "original" in evidence_types
    assert "bounding_box" in evidence_types


def test_mvp_4_5_change_detection_with_quantification(client: TestClient, demo_data_dir: Path):
    session_id = _create_session(client)
    before_id = _upload(client, session_id, demo_data_dir / "temporal" / "before" / "sample_before.tif")
    after_id = _upload(client, session_id, demo_data_dir / "temporal" / "after" / "sample_after.tif")

    result = _ask(client, session_id, "Did built-up area increase?", [before_id, after_id])
    assert result["status"] == "completed"
    assert result["task"] == "change_vqa"
    change_evidence = next(e for e in result["evidence"] if e["type"] == "change_mask")
    assert change_evidence["area_m2"] is not None  # georeferenced -> real area computed
    assert change_evidence["area_m2"] > 0


def test_mvp_6_optical_sar_fusion(client: TestClient, demo_data_dir: Path):
    session_id = _create_session(client)
    optical_id = _upload(client, session_id, demo_data_dir / "fusion" / "optical" / "sample_fusion_optical.tif")
    sar_id = _upload(client, session_id, demo_data_dir / "fusion" / "sar" / "sample_fusion_sar.tif")

    result = _ask(
        client, session_id, "Use optical and SAR together to identify built-up regions.", [optical_id, sar_id]
    )
    assert result["status"] == "completed"
    assert result["task"] == "optical_sar_analysis"
    assert result["confidence"]["modality_agreement"] in ("agree", "disagree")


def test_mvp_8_single_image_change_requires_input_not_executed(client: TestClient, demo_data_dir: Path):
    session_id = _create_session(client)
    before_id = _upload(client, session_id, demo_data_dir / "temporal" / "before" / "sample_before.tif")

    result = _ask(client, session_id, "What changed between these two dates?", [before_id])
    assert result["status"] == "requires_user_input"
    assert "two images" in result["user_message"]
    assert result["model"] is None  # ChangeFormer must never have run


def test_mvp_9_optical_sar_task_with_two_optical_images_rejected(client: TestClient, demo_data_dir: Path):
    session_id = _create_session(client)
    img1 = _upload(client, session_id, demo_data_dir / "single" / "optical" / "sample_optical.tif")
    img2 = _upload(client, session_id, demo_data_dir / "fusion" / "optical" / "sample_fusion_optical.tif")

    result = _ask(
        client, session_id, "Use optical and SAR together to identify built-up regions.", [img1, img2]
    )
    assert result["status"] == "requires_user_input"
    assert "one optical and one SAR" in result["user_message"]


def test_mvp_10_multi_turn_session_history_persists(client: TestClient, demo_data_dir: Path):
    session_id = _create_session(client)
    image_id = _upload(client, session_id, demo_data_dir / "single" / "optical" / "sample_optical.tif")

    _ask(client, session_id, "What is visible?", [image_id])
    _ask(client, session_id, "Where is the water?", [image_id])

    detail = client.get(f"/api/v1/sessions/{session_id}").json()
    assert len(detail["messages"]) == 4  # 2 user + 2 assistant, same session/image, no re-upload
