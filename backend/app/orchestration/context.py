from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.image import Image, ImageMetadata
from app.schemas.validation import ValidationResult
from app.services.image_ingestion import image_to_validation_result
from app.storage.object_storage import get_storage_backend


@dataclass
class ImageContext:
    image: Image
    metadata: ImageMetadata | None
    local_path: str
    validation: ValidationResult
    # Populated only when this image came from satellite retrieval rather
    # than a direct user upload -- feeds DataProvenance honestly.
    source_provider: str | None = field(default=None)
    source_scene_id: str | None = field(default=None)
    source_acquisition_time: datetime | None = field(default=None)
    retrieved_at: datetime | None = field(default=None)


def load_image_context(db: Session, image_id: str) -> ImageContext:
    image = db.get(Image, image_id)
    if image is None:
        raise ValueError(f"Image '{image_id}' not found.")
    metadata = db.query(ImageMetadata).filter_by(image_id=image_id).first()
    storage = get_storage_backend()
    local_path = storage.get_local_path(image.storage_key)
    validation = image_to_validation_result(image, metadata)
    return ImageContext(image=image, metadata=metadata, local_path=local_path, validation=validation)
