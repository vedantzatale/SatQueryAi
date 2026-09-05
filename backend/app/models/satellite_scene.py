from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class SatelliteScene(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "satellite_scenes"

    provider: Mapped[str] = mapped_column(String(50), index=True)
    scene_id: Mapped[str] = mapped_column(String(200), index=True)
    product_id: Mapped[str | None] = mapped_column(String(200), nullable=True)
    acquisition_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )
    cloud_percentage: Mapped[float | None] = mapped_column(Float, nullable=True)
    bbox_geojson: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    crs: Mapped[str | None] = mapped_column(String(50), nullable=True)
    resolution: Mapped[float | None] = mapped_column(Float, nullable=True)
    modality: Mapped[str] = mapped_column(String(30))
    download_status: Mapped[str] = mapped_column(String(30), default="not_downloaded")
    local_image_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
