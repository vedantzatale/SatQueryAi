from __future__ import annotations

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Report(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "reports"

    execution_id: Mapped[str] = mapped_column(ForeignKey("executions.id"), index=True)
    type: Mapped[str] = mapped_column(String(20))  # pdf|geojson
    storage_key: Mapped[str] = mapped_column(String(500))
