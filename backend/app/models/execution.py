from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Execution(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "executions"

    task_plan_id: Mapped[str | None] = mapped_column(
        ForeignKey("task_plans.id"), nullable=True, index=True
    )
    status: Mapped[str] = mapped_column(String(30), default="queued", index=True)
    latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    result_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    data_provenance_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    model_provenance_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    error_message: Mapped[str | None] = mapped_column(String(1000), nullable=True)


class ExecutionStep(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "execution_steps"

    execution_id: Mapped[str] = mapped_column(ForeignKey("executions.id"), index=True)
    step_name: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(30))
    detail_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
