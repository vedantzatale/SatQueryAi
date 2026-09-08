from __future__ import annotations

from pathlib import Path
from unittest.mock import patch

from app.orchestration.model_output_cache import get_cached_output, set_cached_output
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


def test_model_output_cache_roundtrip():
    checksum = ["chk-a"]
    assert get_cached_output("vqa", "internvl_rs", "1.0", checksum, "what is this?") is None

    set_cached_output("vqa", "internvl_rs", "1.0", checksum, {"answer": "a lake"}, "what is this?")
    assert get_cached_output("vqa", "internvl_rs", "1.0", checksum, "what is this?") == {"answer": "a lake"}


def test_model_output_cache_distinguishes_different_questions_on_same_image():
    """A different question about the same image must never reuse another
    question's cached answer -- only checksum+question together identify
    a cache entry for answer-style capabilities."""
    checksum = ["chk-b"]
    set_cached_output("vqa", "internvl_rs", "1.0", checksum, {"answer": "a lake"}, "where is the water?")
    assert get_cached_output("vqa", "internvl_rs", "1.0", checksum, "describe this image") is None


def test_model_output_cache_distinguishes_model_version():
    """Pointing *_MODEL_PATH at an upgraded/different checkpoint must miss
    old cache entries rather than serve a stale answer from a model that
    is no longer the one actually running."""
    checksum = ["chk-c"]
    set_cached_output("captioning", "internvl_rs", "1.0", checksum, {"answer": "old model"})
    assert get_cached_output("captioning", "internvl_rs", "2.0", checksum) is None


def test_end_to_end_change_detection_second_identical_query_hits_model_cache(client, demo_data_dir: Path):
    """Regression test for the feature the user actually asked for: asking
    about the same image(s) again must not re-run the model, only skip
    the (already-cached) preprocessing step. Verified live against real
    ChangeFormer inference during development (9.7s -> 1.4s on a cache
    hit, identical changed_fraction both times); this is the same check
    against the deterministic mock adapter so it runs in every test suite."""
    session = client.post("/api/v1/sessions", json={}).json()
    session_id = session["id"]

    with open(demo_data_dir / "temporal" / "before" / "sample_before.tif", "rb") as f:
        before_id = client.post(
            f"/api/v1/images/upload?session_id={session_id}",
            files={"file": ("sample_before.tif", f, "image/tiff")},
        ).json()["image_id"]
    with open(demo_data_dir / "temporal" / "after" / "sample_after.tif", "rb") as f:
        after_id = client.post(
            f"/api/v1/images/upload?session_id={session_id}",
            files={"file": ("sample_after.tif", f, "image/tiff")},
        ).json()["image_id"]

    def ask() -> dict:
        exec_id = client.post(
            "/api/v1/query",
            json={"session_id": session_id, "text": "What changed between these images?", "image_ids": [before_id, after_id]},
        ).json()["execution_id"]
        return client.get(f"/api/v1/analysis/{exec_id}/transparency").json()

    first = ask()
    first_running = next(s for s in first["processing_steps"] if s["step"] == "running")
    assert first_running["detail"]["cache"] == "miss"

    second = ask()
    second_running = next(s for s in second["processing_steps"] if s["step"] == "running")
    assert second_running["detail"]["cache"] == "hit"
    # Not just faster -- the same real result, reused.
    assert second_running["detail"]["changed_fraction"] == first_running["detail"]["changed_fraction"]
