from __future__ import annotations

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Query(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "queries"

    session_id: Mapped[str] = mapped_column(ForeignKey("sessions.id"), index=True)
    message_id: Mapped[str | None] = mapped_column(ForeignKey("messages.id"), nullable=True)
    raw_text: Mapped[str] = mapped_column(Text)
    detected_language: Mapped[str] = mapped_column(String(20), default="en")
