"""InputValidationService -- runs BEFORE any expensive model execution.
Real checks only: extension, readability, dimensions, band count, numeric
validity, CRS/spatial reference, modality. Never assumes a TIFF is
georeferenced; never fabricates satellite metadata for PNG/JPEG.
"""
from __future__ import annotations

import hashlib
from pathlib import Path

from app.core.config import get_settings
from app.schemas.validation import ImageValidationMetadata, ValidationResult
from app.validation.modality_detector import detect_modality
from app.validation.raster_inspector import ALLOWED_EXTENSIONS, RasterInspection, inspect


class InputValidationService:
    def validate_file(self, path: Path, original_filename: str) -> tuple[ValidationResult, RasterInspection]:
        settings = get_settings()
        errors: list[str] = []
        warnings: list[str] = []

        suffix = Path(original_filename).suffix.lower()
        if suffix not in ALLOWED_EXTENSIONS:
            return (
                ValidationResult(
                    valid=False,
                    errors=[
                        f"Unsupported file type '{suffix}'. Supported formats: "
                        "GeoTIFF/TIFF (.tif, .tiff) and, for non-georeferenced demos, PNG/JPEG."
                    ],
                ),
                RasterInspection(readable=False),
            )

        size_mb = path.stat().st_size / (1024 * 1024)
        if size_mb > settings.max_upload_size_mb:
            errors.append(
                f"File is {size_mb:.1f}MB, which exceeds the {settings.max_upload_size_mb}MB upload limit."
            )
            return ValidationResult(valid=False, errors=errors), RasterInspection(readable=False)

        inspection = inspect(path)
        if not inspection.readable:
            return ValidationResult(valid=False, errors=inspection.errors), inspection

        errors.extend(inspection.errors)
        warnings.extend(inspection.warnings)

        detected_modality = detect_modality(inspection)
        if detected_modality == "unknown":
            warnings.append(
                "The imaging modality (optical / multispectral / SAR) could not be "
                "confidently determined from this file's metadata."
            )

        metadata = ImageValidationMetadata(
            crs=inspection.crs,
            bounds_geojson=inspection.bounds_geojson,
            resolution_x=inspection.resolution_x,
            resolution_y=inspection.resolution_y,
            band_count=inspection.band_count,
            band_descriptions=inspection.band_descriptions,
            width=inspection.width,
            height=inspection.height,
        )

        result = ValidationResult(
            valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            metadata=metadata,
            detected_modality=detected_modality,
            spatial_reference_available=inspection.spatial_reference_available,
        )
        return result, inspection

    @staticmethod
    def compute_checksum(path: Path) -> str:
        digest = hashlib.sha256()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                digest.update(chunk)
        return digest.hexdigest()


_service = InputValidationService()


def get_validation_service() -> InputValidationService:
    return _service
