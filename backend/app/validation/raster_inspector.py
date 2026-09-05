"""Real, non-fabricated raster inspection using rasterio/GDAL for
GeoTIFF/TIFF, and Pillow for PNG/JPEG (explicitly non-georeferenced unless
metadata is separately supplied -- never assumed).
"""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image as PILImage
from rasterio.errors import RasterioIOError

GEOTIFF_EXTENSIONS = {".tif", ".tiff"}
CONVENIENCE_EXTENSIONS = {".png", ".jpg", ".jpeg"}
ALLOWED_EXTENSIONS = GEOTIFF_EXTENSIONS | CONVENIENCE_EXTENSIONS


@dataclass
class RasterInspection:
    readable: bool
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    width: int | None = None
    height: int | None = None
    band_count: int | None = None
    band_descriptions: list[str] | None = None
    crs: str | None = None
    bounds_geojson: dict | None = None
    resolution_x: float | None = None
    resolution_y: float | None = None
    spatial_reference_available: bool = False
    nan_or_inf_fraction: float | None = None
    array: np.ndarray | None = None  # bands-first, as read by rasterio


def _bounds_to_geojson(bounds, crs) -> dict:
    minx, miny, maxx, maxy = bounds.left, bounds.bottom, bounds.right, bounds.top
    return {
        "type": "Polygon",
        "coordinates": [[[minx, miny], [maxx, miny], [maxx, maxy], [minx, maxy], [minx, miny]]],
        "crs": str(crs) if crs else None,
    }


def inspect_geotiff(path: Path) -> RasterInspection:
    errors: list[str] = []
    warnings: list[str] = []
    try:
        with rasterio.open(path) as ds:
            array = ds.read(out_dtype="float64")
            band_count = ds.count
            width, height = ds.width, ds.height

            finite_mask = np.isfinite(array)
            total = array.size
            bad = total - int(np.count_nonzero(finite_mask))
            nan_inf_fraction = bad / total if total else 0.0
            if nan_inf_fraction > 0.5:
                warnings.append(
                    f"{nan_inf_fraction * 100:.1f}% of pixel values are NaN/Infinite; "
                    "results derived from this image may be unreliable."
                )

            crs = ds.crs
            spatial_reference_available = crs is not None
            bounds_geojson = None
            resolution_x = resolution_y = None
            if spatial_reference_available:
                bounds_geojson = _bounds_to_geojson(ds.bounds, crs)
                resolution_x = abs(ds.transform.a)
                resolution_y = abs(ds.transform.e)
            else:
                warnings.append(
                    "This GeoTIFF has no coordinate reference system (CRS). "
                    "Location information is missing from this image."
                )

            band_descriptions = list(ds.descriptions) if ds.descriptions else None

            if width < 8 or height < 8:
                errors.append("Image dimensions are too small to analyze reliably.")

            return RasterInspection(
                readable=True,
                errors=errors,
                warnings=warnings,
                width=width,
                height=height,
                band_count=band_count,
                band_descriptions=band_descriptions,
                crs=str(crs) if crs else None,
                bounds_geojson=bounds_geojson,
                resolution_x=resolution_x,
                resolution_y=resolution_y,
                spatial_reference_available=spatial_reference_available,
                nan_or_inf_fraction=nan_inf_fraction,
                array=array,
            )
    except RasterioIOError as exc:
        return RasterioInspectionFailure(str(exc))
    except Exception as exc:  # noqa: BLE001 - surface any unreadable file as a validation error
        return RasterioInspectionFailure(str(exc))


def RasterioInspectionFailure(message: str) -> RasterInspection:
    return RasterInspection(readable=False, errors=[f"Could not read this file as a GeoTIFF: {message}"])


def inspect_convenience_image(path: Path) -> RasterInspection:
    """PNG/JPEG -- explicitly non-georeferenced unless metadata is supplied
    separately. We never invent a CRS, acquisition date, or GSD for these."""
    try:
        with PILImage.open(path) as img:
            img.load()
            width, height = img.size
            mode = img.mode
            array = np.asarray(img).astype("float64")

        band_count = 1 if array.ndim == 2 else array.shape[2]
        # rasterio arrays are bands-first; normalize PIL's HWC to that layout
        if array.ndim == 3:
            array = np.transpose(array, (2, 0, 1))
        else:
            array = array[np.newaxis, ...]

        warnings = [
            "This image has no embedded geographic reference (CRS, acquisition date, "
            "or ground sampling distance). It is treated as non-georeferenced imagery."
        ]
        errors: list[str] = []
        if width < 8 or height < 8:
            errors.append("Image dimensions are too small to analyze reliably.")

        return RasterInspection(
            readable=True,
            errors=errors,
            warnings=warnings,
            width=width,
            height=height,
            band_count=band_count,
            band_descriptions=None,
            crs=None,
            bounds_geojson=None,
            resolution_x=None,
            resolution_y=None,
            spatial_reference_available=False,
            nan_or_inf_fraction=0.0,
            array=array,
        )
    except Exception as exc:  # noqa: BLE001
        return RasterInspection(readable=False, errors=[f"Could not read this image file: {exc}"])


def inspect(path: Path) -> RasterInspection:
    suffix = path.suffix.lower()
    if suffix in GEOTIFF_EXTENSIONS:
        return inspect_geotiff(path)
    if suffix in CONVENIENCE_EXTENSIONS:
        return inspect_convenience_image(path)
    return RasterInspection(readable=False, errors=[f"Unsupported file extension '{suffix}'."])
