"""AuditTrailService -- every execution produces a full step-by-step
record, including data/model provenance, used both for the audit_logs
table and the "How Was This Analyzed?" transparency endpoint. Never
records hidden chain-of-thought -- only structured, safe metadata.
"""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.execution import ExecutionStep


class AuditTrailService:
    def __init__(self, db: Session) -> None:
        self._db = db

    def record_step(
        self,
        execution_id: str,
        step_name: str,
        status: str,
        detail: dict | None = None,
    ) -> None:
        now = datetime.now(timezone.utc)
        step = ExecutionStep(
            execution_id=execution_id,
            step_name=step_name,
            status=status,
            detail_json=detail or {},
            started_at=now,
            completed_at=now,
        )
        self._db.add(step)
        self._db.commit()

    def record_event(self, execution_id: str | None, event: dict) -> None:
        log = AuditLog(execution_id=execution_id, event_json=event)
        self._db.add(log)
        self._db.commit()

    def record_fallback(self, execution_id: str, reason: str) -> None:
        self.record_event(execution_id, {"type": "fallback", "message": reason})
