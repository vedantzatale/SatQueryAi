from __future__ import annotations

from pathlib import Path

SHOWCASE_IMAGES_DIR = Path(__file__).resolve().parents[1] / "app" / "data" / "showcase" / "images"


def _upload_showcase_image(client, session_id: str, filename: str) -> str:
    with open(SHOWCASE_IMAGES_DIR / filename, "rb") as f:
        upload = client.post(
            f"/api/v1/images/upload?session_id={session_id}",
            files={"file": (filename, f, "image/jpeg")},
        ).json()
    return upload["image_id"]


def test_exact_showcase_image_and_question_returns_curated_answer_without_a_model_call(client):
    """The core guarantee of the showcase feature: an exact (image, question)
    match must be served from the curated reference set, never from
    adapter.predict() -- proven here via model_provenance.source, not just
    "did it return something", since a mock adapter could also return SOME
    text and make this test pass for the wrong reason."""
    session_id = client.post("/api/v1/sessions", json={}).json()["id"]
    image_id = _upload_showcase_image(client, session_id, "vqa_water_urban.jpg")

    response = client.post(
        "/api/v1/query",
        json={
            "session_id": session_id,
            "text": "Are there large water bodies near the urban area?",
            "image_ids": [image_id],
        },
    )
    assert response.status_code == 200
    result = client.get(f"/api/v1/analysis/{response.json()['execution_id']}").json()

    assert result["model_provenance"]["source"] == "curated_reference"
    assert result["model_provenance"]["demo_mode"] is False
    assert "northeast" in result["answer"].lower()
    assert result["confidence"]["model_confidence"] == 0.94
    # The evidence overlay is rendered fresh from the real uploaded raster,
    # not swapped in from a stand-in picture -- an "original" entry plus the
    # curated bounding box are both present.
    evidence_types = [e["type"] for e in result["evidence"]]
    assert "original" in evidence_types
    assert "bounding_box" in evidence_types


def test_question_normalization_ignores_case_whitespace_and_trailing_punctuation(client):
    """A demo presenter retyping/pasting the question with different
    capitalization or an extra trailing '?' must still hit the curated
    answer -- but this must never be so loose that it conflates a genuinely
    different question (see the negative test below)."""
    session_id = client.post("/api/v1/sessions", json={}).json()["id"]
    image_id = _upload_showcase_image(client, session_id, "vqa_water_urban.jpg")

    response = client.post(
        "/api/v1/query",
        json={
            "session_id": session_id,
            "text": "  ARE THERE large water bodies near the urban area??  ",
            "image_ids": [image_id],
        },
    )
    result = client.get(f"/api/v1/analysis/{response.json()['execution_id']}").json()
    assert result["model_provenance"]["source"] == "curated_reference"


def test_same_showcase_image_with_a_different_question_runs_the_real_pipeline(client):
    """A showcase image is still a real, valid image -- any question NOT in
    its curated set must fall through to the actual model pipeline (the
    deterministic mock adapter in this test environment), never silently
    reuse a curated answer for the wrong question."""
    session_id = client.post("/api/v1/sessions", json={}).json()["id"]
    image_id = _upload_showcase_image(client, session_id, "vqa_water_urban.jpg")

    response = client.post(
        "/api/v1/query",
        json={
            "session_id": session_id,
            "text": "How many buildings are visible in this image?",
            "image_ids": [image_id],
        },
    )
    result = client.get(f"/api/v1/analysis/{response.json()['execution_id']}").json()
    assert result["model_provenance"]["source"] == "model"
    assert result["model_provenance"]["demo_mode"] is True  # the mock/heuristic adapter, in this test env


def test_showcase_question_on_a_non_showcase_image_runs_the_real_pipeline(client, demo_data_dir: Path):
    """Matching only on the question text, ignoring the image, would let an
    unrelated upload "borrow" a curated answer it was never verified
    against -- both the image AND the question must match."""
    session_id = client.post("/api/v1/sessions", json={}).json()["id"]
    with open(demo_data_dir / "single" / "optical" / "sample_optical.tif", "rb") as f:
        image_id = client.post(
            f"/api/v1/images/upload?session_id={session_id}",
            files={"file": ("sample_optical.tif", f, "image/tiff")},
        ).json()["image_id"]

    response = client.post(
        "/api/v1/query",
        json={
            "session_id": session_id,
            "text": "Are there large water bodies near the urban area?",
            "image_ids": [image_id],
        },
    )
    result = client.get(f"/api/v1/analysis/{response.json()['execution_id']}").json()
    assert result["model_provenance"]["source"] == "model"


def test_showcase_registry_checksums_match_their_actual_image_files():
    """The registry's checksums must be regenerated any time an image file
    under showcase/images/ changes -- this catches a stale/copy-paste-wrong
    checksum before it silently makes a curated entry unreachable."""
    import hashlib
    import json

    registry_path = SHOWCASE_IMAGES_DIR.parent / "showcase_qa.json"
    with open(registry_path, encoding="utf-8") as f:
        registry = json.load(f)

    assert len(registry["images"]) > 0
    for image in registry["images"]:
        actual = hashlib.sha256((SHOWCASE_IMAGES_DIR / image["filename"]).read_bytes()).hexdigest()
        assert actual == image["checksum"], f"{image['filename']} checksum is stale in showcase_qa.json"
