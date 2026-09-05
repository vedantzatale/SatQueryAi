from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db

router = APIRouter(prefix="/system", tags=["system"])


@router.get("/health")
def health(db: Session = Depends(get_db)) -> dict:
    settings = get_settings()
    components: dict[str, str] = {}

    try:
        db.execute(text("SELECT 1"))
        components["database"] = "healthy"
    except Exception as exc:  # noqa: BLE001
        components["database"] = f"unavailable: {exc}"

    if settings.redis_url:
        try:
            import redis

            redis.from_url(settings.redis_url).ping()
            components["redis"] = "healthy"
        except Exception as exc:  # noqa: BLE001
            components["redis"] = f"unavailable: {exc}"
    else:
        components["redis"] = "not_configured (using inline task execution)"

    if settings.storage_backend == "minio":
        try:
            from app.storage.object_storage import get_storage_backend

            get_storage_backend()
            components["storage"] = "healthy (minio)"
        except Exception as exc:  # noqa: BLE001
            components["storage"] = f"unavailable: {exc}"
    else:
        components["storage"] = "healthy (local filesystem)"

    return {
        "status": "healthy" if all("unavailable" not in v for v in components.values()) else "degraded",
        "demo_mode": settings.demo_mode,
        "environment": settings.environment,
        "components": components,
    }
