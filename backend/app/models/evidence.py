from __future__ import annotations

from sqlalchemy import JSON, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Evidence(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "evidence"

    execution_id: Mapped[str] = mapped_column(ForeignKey("executions.id"), index=True)
    type: Mapped[str] = mapped_column(String(30))  # bounding_box|polygon|change_mask|overlay
    storage_key: Mapped[str | None] = mapped_column(String(500), nullable=True)
    coordinates_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    label: Mapped[str | None] = mapped_column(String(200), nullable=True)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    area_m2: Mapped[float | None] = mapped_column(Float, nullable=True)
    area_percentage: Mapped[float | None] = mapped_column(Float, nullable=True)
