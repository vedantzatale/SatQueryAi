"""Real GIS area calculation from a change mask + pixel resolution. Never
computes square meters from arbitrary, non-georeferenced pixel dimensions
-- when resolution is unknown, callers must surface the spec's exact
caveat message instead of a number.
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np


@dataclass
class AreaResult:
    available: bool
    changed_pixel_count: int = 0
    total_pixel_count: int = 0
    area_m2: float | None = None
    area_percentage: float | None = None
    caveat: str | None = None


NO_GEOREFERENCE_CAVEAT = (
    "Change detected, but physical area cannot be reliably calculated because "
    "geographic resolution information is unavailable."
)


def calculate_change_area(
    mask: np.ndarray, resolution_x: float | None, resolution_y: float | None
) -> AreaResult:
    changed = int(np.count_nonzero(mask))
    total = int(mask.size) if mask.size else 0
    percentage = (changed / total * 100.0) if total else 0.0

    if not resolution_x or not resolution_y:
        return AreaResult(
            available=False,
            changed_pixel_count=changed,
            total_pixel_count=total,
            area_percentage=round(percentage, 3),
            caveat=NO_GEOREFERENCE_CAVEAT,
        )

    pixel_area_m2 = float(resolution_x) * float(resolution_y)
    area_m2 = changed * pixel_area_m2
    return AreaResult(
        available=True,
        changed_pixel_count=changed,
        total_pixel_count=total,
        area_m2=round(area_m2, 2),
        area_percentage=round(percentage, 3),
    )
