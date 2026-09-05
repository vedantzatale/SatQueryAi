from __future__ import annotations

from pathlib import Path

from app.validation.service import get_validation_service


def test_geotiff_with_crs_detects_optical(demo_data_dir: Path):
    service = get_validation_service()
    result, _ = service.validate_file(
        demo_data_dir / "single" / "optical" / "sample_optical.tif", "sample_optical.tif"
    )
    assert result.valid
    assert result.detected_modality == "optical"
    assert result.spatial_reference_available is True
    assert result.metadata.crs == "EPSG:32643"
    assert result.metadata.band_count == 3


def test_geotiff_multispectral_band_count(demo_data_dir: Path):
    service = get_validation_service()
    result, _ = service.validate_file(
        demo_data_dir / "single" / "multispectral" / "sample_multispectral.tif", "sample_multispectral.tif"
    )
    assert result.valid
    assert result.detected_modality == "multispectral"
    assert result.metadata.band_count == 6


def test_geotiff_sar_detected_via_speckle_heuristic(demo_data_dir: Path):
    service = get_validation_service()
    result, _ = service.validate_file(demo_data_dir / "single" / "sar" / "sample_sar.tif", "sample_sar.tif")
    assert result.valid
    assert result.detected_modality == "sar"


def test_unsupported_extension_rejected(tmp_path: Path):
    bogus = tmp_path / "not_an_image.txt"
    bogus.write_text("hello")
    service = get_validation_service()
    result, _ = service.validate_file(bogus, "not_an_image.txt")
    assert not result.valid
    assert "Unsupported file type" in result.errors[0]


def test_png_is_non_georeferenced(tmp_path: Path):
    from PIL import Image as PILImage

    png_path = tmp_path / "photo.png"
    PILImage.new("RGB", (32, 32), color=(10, 20, 30)).save(png_path)

    service = get_validation_service()
    result, _ = service.validate_file(png_path, "photo.png")
    assert result.valid
    assert result.spatial_reference_available is False
    assert result.metadata.crs is None
    assert any("no embedded geographic reference" in w for w in result.warnings)
