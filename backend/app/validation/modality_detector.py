"""Explicit modality detection -- its own validation step, per the plan's
correction #6. Never guessed from filename. Inspects actual band count,
band descriptions/tags where present, and raster characteristics.

This is a coarse, honest heuristic (not a trained classifier): remote
sensing product metadata varies enormously across providers, so detection
falls back to "unknown" rather than guessing when evidence is weak --
an unknown modality is surfaced to the user, never silently assumed.
"""
from __future__ import annotations

import numpy as np

from app.validation.raster_inspector import RasterInspection

_SAR_HINTS = {"sar", "vv", "vh", "hh", "hv", "sentinel-1", "s1", "radar", "backscatter"}
_MULTISPECTRAL_HINTS = {"nir", "swir", "red edge", "band5", "band6", "band7", "band8"}


def detect_modality(inspection: RasterInspection) -> str:
    if not inspection.readable or inspection.array is None:
        return "unknown"

    descriptions = [d.lower() for d in (inspection.band_descriptions or []) if d]
    joined = " ".join(descriptions)

    if any(hint in joined for hint in _SAR_HINTS):
        return "sar"
    if any(hint in joined for hint in _MULTISPECTRAL_HINTS):
        return "multispectral"

    band_count = inspection.band_count or 0

    if band_count >= 4:
        return "multispectral"

    if band_count in (1, 2):
        # Single/dual-band GeoTIFFs are ambiguous between SAR and a single
        # grayscale optical band without metadata hints. Use a real (if
        # coarse) speckle-noise proxy: SAR backscatter has characteristically
        # high local variance relative to its mean compared to optical
        # panchromatic imagery.
        band = inspection.array[0]
        finite = band[np.isfinite(band)]
        if finite.size >= 100:
            mean = float(np.mean(finite))
            std = float(np.std(finite))
            coeff_of_variation = std / mean if mean else 0.0
            if coeff_of_variation > 0.8:
                return "sar"
        return "unknown"

    if band_count == 3:
        return "optical"

    return "unknown"
