from __future__ import annotations

from datetime import date

from sqlalchemy import JSON, Boolean, Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Image(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "images"

    session_id: Mapped[str | None] = mapped_column(
        ForeignKey("sessions.id"), nullable=True, index=True
    )
    storage_key: Mapped[str] = mapped_column(String(500))
    original_filename: Mapped[str] = mapped_column(String(300))
    modality: Mapped[str] = mapped_column(String(30), default="unknown")  # optical|multispectral|sar|unknown
    format: Mapped[str] = mapped_column(String(20))  # geotiff|tiff|png|jpeg
    checksum: Mapped[str] = mapped_column(String(64))
    size_bytes: Mapped[int] = mapped_column(Integer)


class ImageMetadata(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "image_metadata"

    image_id: Mapped[str] = mapped_column(ForeignKey("images.id"), unique=True, index=True)
    crs: Mapped[str | None] = mapped_column(String(50), nullable=True)
    bounds_geojson: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    resolution_x: Mapped[float | None] = mapped_column(Float, nullable=True)
    resolution_y: Mapped[float | None] = mapped_column(Float, nullable=True)
    band_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    band_descriptions: Mapped[list | None] = mapped_column(JSON, nullable=True)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    acquisition_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    sensor: Mapped[str | None] = mapped_column(String(100), nullable=True)
    spatial_reference_available: Mapped[bool] = mapped_column(Boolean, default=False)
