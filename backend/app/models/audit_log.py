from __future__ import annotations

from sqlalchemy import JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class AuditLog(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "audit_logs"

    execution_id: Mapped[str | None] = mapped_column(
        ForeignKey("executions.id"), nullable=True, index=True
    )
    event_json: Mapped[dict] = mapped_column(JSON)
