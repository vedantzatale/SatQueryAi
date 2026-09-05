"""Declarative base + shared column helpers for all ORM models.

Geospatial columns (bounds/bbox) are stored as GeoJSON in a portable JSON
column so the schema works unmodified against SQLite (local dev) and
Postgres (production). Against Postgres+PostGIS, the initial Alembic
migration additionally creates real `geometry` columns + GIST spatial
indexes derived from that JSON, so production spatial queries use PostGIS
directly while the ORM stays database-agnostic.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def new_uuid() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class UUIDPrimaryKeyMixin:
    id: Mapped[str] = mapped_column(primary_key=True, default=new_uuid)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
