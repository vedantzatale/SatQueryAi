"""TaskQueue abstraction. `inline` runs the workflow synchronously in the
web process (no Redis/Celery required -- the default so the system runs
without Docker). `celery` enqueues a real background job. Selected via
TASK_BACKEND; API/route code never checks which one is active.
"""
from __future__ import annotations

from abc import ABC, abstractmethod

from sqlalchemy.orm import Session

from app.core.config import get_settings


class TaskQueue(ABC):
    @abstractmethod
    def enqueue_analysis(self, db: Session, session_id: str | None, query_text: str, image_ids: list[str]) -> str:
        """Returns an execution_id immediately."""


class InlineTaskQueue(TaskQueue):
    def enqueue_analysis(self, db: Session, session_id: str | None, query_text: str, image_ids: list[str]) -> str:
        from app.orchestration.engine import get_workflow_engine

        result = get_workflow_engine().run(db, session_id, query_text, image_ids)
        return result.execution_id


class CeleryTaskQueue(TaskQueue):
    def enqueue_analysis(self, db: Session, session_id: str | None, query_text: str, image_ids: list[str]) -> str:
        from app.orchestration.engine import get_workflow_engine
        from app.tasks.celery_app import run_analysis_task

        execution_id = get_workflow_engine().create_pending_execution(db)
        run_analysis_task.delay(execution_id, session_id, query_text, image_ids)
        return execution_id


_queue: TaskQueue | None = None


def get_task_queue() -> TaskQueue:
    global _queue
    if _queue is None:
        settings = get_settings()
        _queue = CeleryTaskQueue() if settings.task_backend == "celery" else InlineTaskQueue()
    return _queue
