from __future__ import annotations

from fastapi.testclient import TestClient


def test_system_health(client: TestClient):
    response = client.get("/api/v1/system/health")
    assert response.status_code == 200
    body = response.json()
    assert body["demo_mode"] is True
    assert body["components"]["database"] == "healthy"


def test_models_registry_listing(client: TestClient):
    response = client.get("/api/v1/models")
    assert response.status_code == 200
    model_ids = {m["model_id"] for m in response.json()["models"]}
    assert {"qwen_agent", "internvl_rs", "prithvi", "changeformer", "croma"} <= model_ids
