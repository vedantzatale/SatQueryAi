from __future__ import annotations

import numpy as np

from app.services.area_calculation import NO_GEOREFERENCE_CAVEAT, calculate_change_area


def test_area_calculated_with_valid_resolution():
    mask = np.zeros((100, 100), dtype=np.uint8)
    mask[0:10, 0:10] = 255  # 100 changed pixels
    result = calculate_change_area(mask, resolution_x=10.0, resolution_y=10.0)
    assert result.available
    assert result.changed_pixel_count == 100
    assert result.area_m2 == 100 * 100.0  # 100 pixels * (10m x 10m)
    assert result.caveat is None


def test_area_unavailable_without_resolution():
    mask = np.zeros((100, 100), dtype=np.uint8)
    mask[0:10, 0:10] = 255
    result = calculate_change_area(mask, resolution_x=None, resolution_y=None)
    assert not result.available
    assert result.area_m2 is None
    assert result.caveat == NO_GEOREFERENCE_CAVEAT
    # percentage is still reported -- it doesn't need physical units
    assert result.area_percentage == 1.0
