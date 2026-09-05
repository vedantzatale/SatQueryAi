from __future__ import annotations

from fastapi.testclient import TestClient


def test_record_and_list_evaluation_run(client: TestClient):
    body = {
        "dataset": "RSVQA",
        "task": "vqa",
        "metrics": {"exact_match_accuracy": 0.62, "mean_token_f1": 0.71},
        "model_id": "internvl_rs",
        "model_version": "0.1.0",
        "sample_count": 200,
    }
    create = client.post("/api/v1/evaluation-runs", json=body)
    assert create.status_code == 200
    created = create.json()
    assert created["metrics"]["exact_match_accuracy"] == 0.62
    assert created["sample_count"] == 200

    listing = client.get("/api/v1/evaluation-runs")
    assert listing.status_code == 200
    runs = listing.json()
    assert any(r["dataset"] == "RSVQA" and r["model_id"] == "internvl_rs" for r in runs)
