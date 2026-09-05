"""Image ingestion -- shared by the upload API endpoint and the satellite
retrieval workflow (a downloaded scene goes through the exact same
validation + persistence path as a user upload). Validation always runs
BEFORE the file is treated as usable.
"""
from __future__ import annotations

import shutil
import tempfile
import uuid
from pathlib import Path

from sqlalchemy.orm import Session

from app.models.image import Image, ImageMetadata
from app.schemas.validation import ValidationResult
from app.storage.object_storage import get_storage_backend
from app.validation.service import get_validation_service

_ALLOWED_FILENAME_CHARS = set(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-"
)


def sanitize_filename(original_filename: str) -> str:
    """Never trust an uploaded filename. Strip any path component and any
    character outside a small safe set."""
    name = Path(original_filename).name
    cleaned = "".join(c if c in _ALLOWED_FILENAME_CHARS else "_" for c in name)
    return cleaned or "upload"


def ingest_file(
    db: Session, source_path: Path, original_filename: str, session_id: str | None
) -> tuple[Image | None, ValidationResult]:
    """Validates a file already on local disk (uploaded, or downloaded from
    a satellite provider) and, if valid, persists it into storage + DB.
    Returns (Image or None, ValidationResult) -- Image is None when
    validation failed, and the caller must surface `.errors` to the user
    without ever proceeding to model execution.
    """
    safe_name = sanitize_filename(original_filename)
    validator = get_validation_service()
    result, inspection = validator.validate_file(source_path, safe_name)

    if not result.valid:
        return None, result

    storage = get_storage_backend()
    checksum = validator.compute_checksum(source_path)
    image_id = str(uuid.uuid4())
    storage_key = f"images/{image_id}_{safe_name}"
    storage.put_bytes(storage_key, source_path.read_bytes())

    image = Image(
        id=image_id,
        session_id=session_id,
        storage_key=storage_key,
        original_filename=safe_name,
        modality=result.detected_modality,
        format=source_path.suffix.lower().lstrip("."),
        checksum=checksum,
        size_bytes=source_path.stat().st_size,
    )
    db.add(image)

    metadata = ImageMetadata(
        image_id=image_id,
        crs=result.metadata.crs,
        bounds_geojson=result.metadata.bounds_geojson,
        resolution_x=result.metadata.resolution_x,
        resolution_y=result.metadata.resolution_y,
        band_count=result.metadata.band_count,
        band_descriptions=result.metadata.band_descriptions,
        width=result.metadata.width,
        height=result.metadata.height,
        acquisition_date=result.metadata.acquisition_date,
        sensor=result.metadata.sensor,
        spatial_reference_available=result.spatial_reference_available,
    )
    db.add(metadata)
    db.commit()

    return image, result


def ingest_upload_bytes(
    db: Session, data: bytes, original_filename: str, session_id: str | None
) -> tuple[Image | None, ValidationResult]:
    safe_name = sanitize_filename(original_filename)
    suffix = Path(safe_name).suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(data)
        tmp_path = Path(tmp.name)
    try:
        return ingest_file(db, tmp_path, safe_name, session_id)
    finally:
        try:
            tmp_path.unlink(missing_ok=True)
        except OSError:
            pass


def image_to_validation_result(image: Image, metadata: ImageMetadata | None) -> ValidationResult:
    """Reconstructs a ValidationResult from what was actually stored at
    upload time -- used when re-validating a pair for a follow-up query
    without re-reading the file."""
    from app.schemas.validation import ImageValidationMetadata

    meta = ImageValidationMetadata(
        crs=metadata.crs if metadata else None,
        bounds_geojson=metadata.bounds_geojson if metadata else None,
        resolution_x=metadata.resolution_x if metadata else None,
        resolution_y=metadata.resolution_y if metadata else None,
        band_count=metadata.band_count if metadata else None,
        band_descriptions=metadata.band_descriptions if metadata else None,
        width=metadata.width if metadata else None,
        height=metadata.height if metadata else None,
        acquisition_date=metadata.acquisition_date if metadata else None,
        sensor=metadata.sensor if metadata else None,
    )
    return ValidationResult(
        valid=True,
        metadata=meta,
        detected_modality=image.modality,
        spatial_reference_available=metadata.spatial_reference_available if metadata else False,
    )
