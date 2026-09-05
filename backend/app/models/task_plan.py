from __future__ import annotations

from sqlalchemy import JSON, Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class TaskPlanRecord(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Persisted form of the agent's `TaskPlan` schema (see app/schemas/task_plan.py)."""

    __tablename__ = "task_plans"

    query_id: Mapped[str] = mapped_column(ForeignKey("queries.id"), index=True)
    intent: Mapped[str] = mapped_column(String(100))
    task: Mapped[str] = mapped_column(String(100))
    modalities: Mapped[list] = mapped_column(JSON, default=list)
    temporal: Mapped[bool] = mapped_column(Boolean, default=False)
    requires_two_images: Mapped[bool] = mapped_column(Boolean, default=False)
    requires_grounding: Mapped[bool] = mapped_column(Boolean, default=False)
    requires_quantification: Mapped[bool] = mapped_column(Boolean, default=False)
    location_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    date_range_json: Mapped[list | None] = mapped_column(JSON, nullable=True)
    output_type: Mapped[list] = mapped_column(JSON, default=list)
    raw_json: Mapped[dict] = mapped_column(JSON)
