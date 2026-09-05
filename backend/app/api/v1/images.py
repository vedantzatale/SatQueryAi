from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.models.image import Image, ImageMetadata
from app.schemas.validation import ValidationResult
from app.services.image_ingestion import ingest_upload_bytes

router = APIRouter(prefix="/images", tags=["images"])


class ImageUploadResponse(BaseModel):
    image_id: str | None
    validation: ValidationResult


class ImageDetailResponse(BaseModel):
    id: str
    modality: str
    format: str
    width: int | None
    height: int | None
    crs: str | None
    spatial_reference_available: bool
    acquisition_date: str | None


@router.post("/upload", response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...), session_id: str | None = None, db: Session = Depends(get_db)
) -> ImageUploadResponse:
    settings = get_settings()
    data = await file.read()
    if len(data) > settings.max_upload_size_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File exceeds the {settings.max_upload_size_mb}MB upload limit.")

    image, validation = ingest_upload_bytes(db, data, file.filename or "upload", session_id)
    return ImageUploadResponse(image_id=image.id if image else None, validation=validation)


@router.get("/{image_id}", response_model=ImageDetailResponse)
def get_image(image_id: str, db: Session = Depends(get_db)) -> ImageDetailResponse:
    image = db.get(Image, image_id)
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found.")
    metadata = db.query(ImageMetadata).filter_by(image_id=image_id).first()
    return ImageDetailResponse(
        id=image.id,
        modality=image.modality,
        format=image.format,
        width=metadata.width if metadata else None,
        height=metadata.height if metadata else None,
        crs=metadata.crs if metadata else None,
        spatial_reference_available=metadata.spatial_reference_available if metadata else False,
        acquisition_date=metadata.acquisition_date.isoformat() if metadata and metadata.acquisition_date else None,
    )
