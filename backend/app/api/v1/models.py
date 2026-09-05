from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.model_registry.registry import get_model_manager, load_registry

router = APIRouter(prefix="/models", tags=["models"])


@router.get("")
def list_models() -> dict:
    registry = load_registry()
    return {
        "models": [
            {
                "model_id": e.model_id,
                "capability": e.capability,
                "modalities": e.modalities,
                "version": e.version,
                "enabled": e.enabled,
                "resource_requirement": e.resource_requirement,
                "fallback": e.fallback,
            }
            for e in registry.all()
        ]
    }


@router.get("/{model_id}/health")
def model_health(model_id: str) -> dict:
    registry = load_registry()
    entry = registry.get(model_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Model not found in registry.")
    if not entry.enabled or not entry.adapter_class_path:
        return {"model_id": model_id, "status": "unavailable", "reason": "disabled or not implemented"}

    manager = get_model_manager()
    try:
        adapter = manager.get_model(model_id)
        return {
            "model_id": model_id,
            "status": adapter.health_check(),
            "is_mock": adapter.is_mock,
            "version": adapter.version,
        }
    except Exception as exc:  # noqa: BLE001
        return {"model_id": model_id, "status": "unavailable", "reason": str(exc)}
