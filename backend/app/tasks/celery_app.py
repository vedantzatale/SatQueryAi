"""Celery application. Only imported/used when TASK_BACKEND=celery -- the
inline task queue (queue.py) needs no Redis/Celery at all, which is what
lets the whole system run without Docker.
"""
from __future__ import annotations

from celery import Celery

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "satquery",
    broker=settings.redis_url or "redis://localhost:6379/0",
    backend=settings.redis_url or "redis://localhost:6379/0",
)
celery_app.conf.update(task_serializer="json", accept_content=["json"], result_serializer="json")


@celery_app.task(name="app.tasks.run_analysis")
def run_analysis_task(execution_id: str, session_id: str | None, query_text: str, image_ids: list[str]) -> str:
    from app.db.session import SessionLocal
    from app.orchestration.engine import get_workflow_engine

    db = SessionLocal()
    try:
        result = get_workflow_engine().run(db, session_id, query_text, image_ids, execution_id=execution_id)
        return result.execution_id
    finally:
        db.close()
