"""Pair-compatibility checks for bi-temporal change and optical+SAR tasks.
These are the deterministic Policy Validator rules behind MVP Tests 8/9:
never silently proceed with mismatched or insufficient inputs.
"""
from __future__ import annotations

from dataclasses import dataclass

from app.schemas.validation import ValidationResult

MISSING_SECOND_IMAGE_MESSAGE = (
    "This analysis requires two images of the same area from different dates. "
    "Please upload a before and after image, or allow SatQuery AI to retrieve "
    "suitable scenes."
)


@dataclass
class PairCheckResult:
    compatible: bool
    message: str | None = None
    actions: list[str] = None  # type: ignore[assignment]

    def __post_init__(self) -> None:
        if self.actions is None:
            self.actions = []


def check_change_pair(results: list[ValidationResult]) -> PairCheckResult:
    if len(results) < 2:
        return PairCheckResult(
            compatible=False,
            message=MISSING_SECOND_IMAGE_MESSAGE,
            actions=["upload_second_image", "get_satellite_data"],
        )

    a, b = results[0], results[1]
    if a.detected_modality != b.detected_modality and {
        a.detected_modality,
        b.detected_modality,
    } != {"unknown"}:
        return PairCheckResult(
            compatible=False,
            message=(
                f"The two images appear to be different modalities ({a.detected_modality} "
                f"vs {b.detected_modality}). Change analysis requires two images of the "
                "same modality from different dates."
            ),
        )

    if a.spatial_reference_available and b.spatial_reference_available:
        if a.metadata.crs != b.metadata.crs:
            return PairCheckResult(
                compatible=True,
                message=(
                    "The two images use different coordinate reference systems; they will "
                    "be reprojected to a common CRS before comparison."
                ),
            )

    return PairCheckResult(compatible=True)


def check_optical_sar_pair(results: list[ValidationResult]) -> PairCheckResult:
    if len(results) < 2:
        return PairCheckResult(
            compatible=False,
            message="This workflow requires one optical/multispectral image and one SAR image.",
            actions=["upload_sar_image", "get_satellite_data"],
        )

    modalities = {r.detected_modality for r in results}
    has_optical_like = any(m in ("optical", "multispectral") for m in modalities)
    has_sar = "sar" in modalities

    if has_optical_like and has_sar:
        return PairCheckResult(compatible=True)

    detected_summary = ", ".join(r.detected_modality for r in results)
    return PairCheckResult(
        compatible=False,
        message=(
            f"I found two images, but detected their modalities as: {detected_summary}. "
            "This analysis requires one optical and one SAR image. Upload a SAR image "
            "or let SatQuery retrieve one."
        ),
        actions=["upload_sar_image", "get_satellite_data"],
    )
