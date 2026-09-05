from __future__ import annotations

from pathlib import Path
from unittest.mock import patch

from app.preprocessing.pipeline import PreprocessingPipeline


def test_load_single_reuses_cached_decode_without_rereading_file(demo_data_dir: Path):
    pipeline = PreprocessingPipeline()
    path = str(demo_data_dir / "single" / "optical" / "sample_optical.tif")

    first = pipeline.load_single(path, cache_key="test-checksum-abc")
    assert "reused cached decode" not in " ".join(first.operations)

    with patch("app.preprocessing.pipeline.read_array") as mocked_read:
        second = pipeline.load_single(path, cache_key="test-checksum-abc")
        mocked_read.assert_not_called()  # proves the file was NOT re-read

    assert "reused cached decode (same image, no re-read)" in second.operations
    assert (second.array == first.array).all()


def test_load_single_without_cache_key_always_reads(demo_data_dir: Path):
    pipeline = PreprocessingPipeline()
    path = str(demo_data_dir / "single" / "optical" / "sample_optical.tif")

    with patch("app.preprocessing.pipeline.read_array", wraps=__import__(
        "app.preprocessing.pipeline", fromlist=["read_array"]
    ).read_array) as mocked_read:
        pipeline.load_single(path)
        pipeline.load_single(path)
        assert mocked_read.call_count == 2  # no cache_key -> always a real read


def test_end_to_end_followup_query_reuses_cached_preprocessing(client, demo_data_dir: Path):
    """MVP Test 10: the same session/image_id across follow-up questions
    must not re-decode the raster from scratch every time."""
    session = client.post("/api/v1/sessions", json={}).json()
    session_id = session["id"]

    with open(demo_data_dir / "single" / "optical" / "sample_optical.tif", "rb") as f:
        upload = client.post(
            f"/api/v1/images/upload?session_id={session_id}",
            files={"file": ("sample_optical.tif", f, "image/tiff")},
        ).json()
    image_id = upload["image_id"]

    first = client.post(
        "/api/v1/query", json={"session_id": session_id, "text": "What is visible?", "image_ids": [image_id]}
    ).json()
    first_exec = client.get(f"/api/v1/analysis/{first['execution_id']}").json()
    assert "read raster" in " ".join(first_exec["data_provenance"]["processing_applied"])

    second = client.post(
        "/api/v1/query", json={"session_id": session_id, "text": "Where is the water?", "image_ids": [image_id]}
    ).json()
    second_exec = client.get(f"/api/v1/analysis/{second['execution_id']}").json()
    assert any(
        "reused cached decode" in op for op in second_exec["data_provenance"]["processing_applied"]
    )
