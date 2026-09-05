from __future__ import annotations

from sqlalchemy import JSON, Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ModelRegistryEntry(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Mirrors an entry from model_registry/models.yaml into the DB for
    auditability/history; the YAML file remains the source of truth at
    runtime (see app/model_registry/registry.py)."""

    __tablename__ = "model_registry"

    model_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    capability: Mapped[list] = mapped_column(JSON, default=list)
    modalities: Mapped[list] = mapped_column(JSON, default=list)
    version: Mapped[str] = mapped_column(String(50))
    endpoint: Mapped[str | None] = mapped_column(String(300), nullable=True)
    fallback_model_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)


class ModelVersion(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "model_versions"

    model_id: Mapped[str] = mapped_column(ForeignKey("model_registry.model_id"), index=True)
    version: Mapped[str] = mapped_column(String(50))
    trained_on: Mapped[str | None] = mapped_column(String(300), nullable=True)
