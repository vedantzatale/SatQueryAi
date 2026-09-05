from __future__ import annotations

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ChatSession(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A conversation session. Table name kept as `sessions` per the spec's
    schema; class name avoids colliding with sqlalchemy.orm.Session."""

    __tablename__ = "sessions"

    user_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(300), default="New Analysis")
    language: Mapped[str] = mapped_column(String(20), default="en")
