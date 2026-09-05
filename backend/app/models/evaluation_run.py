from __future__ import annotations

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class EvaluationRun(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "evaluation_runs"

    dataset: Mapped[str] = mapped_column(String(100))
    task: Mapped[str] = mapped_column(String(50))
    metrics_json: Mapped[dict] = mapped_column(JSON)
    model_version_id: Mapped[str | None] = mapped_column(
        ForeignKey("model_versions.id"), nullable=True
    )
