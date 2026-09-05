"""ConfidenceService -- never fabricates a numeric confidence in
DEMO_MODE. Splits the report into model confidence, input quality,
evidence quality, and modality agreement so nothing is hidden behind one
opaque number (plan §10).
"""
from __future__ import annotations

from app.schemas.confidence import ConfidenceReport
from app.schemas.validation import ValidationResult


def _input_quality(validations: list[ValidationResult]) -> str:
    if any(not v.valid for v in validations):
        return "poor"
    if any(v.warnings for v in validations):
        return "fair"
    return "good"


def _evidence_quality(evidence_score: float | None, evidence_count: int) -> str:
    if evidence_count == 0:
        return "weak"
    if evidence_score is not None and evidence_score >= 0.6:
        return "strong"
    if evidence_score is not None and evidence_score >= 0.35:
        return "moderate"
    return "weak" if evidence_score is None else "moderate"


def build_confidence_report(
    *,
    is_mock: bool,
    validations: list[ValidationResult],
    evidence_score: float | None,
    evidence_count: int,
    modality_agreement: str = "not_applicable",
    calibrated_confidence: float | None = None,
) -> ConfidenceReport:
    input_quality = _input_quality(validations)
    evidence_quality = _evidence_quality(evidence_score, evidence_count)
    notes: list[str] = []

    if modality_agreement == "disagree":
        notes.append("Evidence disagreement detected — result should be reviewed.")

    if is_mock or calibrated_confidence is None:
        mode = "demo_heuristic"
        model_confidence = None
        # Overall level derived only from input/evidence quality, never a
        # fabricated model score.
        if input_quality == "poor" or evidence_quality == "weak":
            overall_level = "low"
        elif input_quality == "good" and evidence_quality == "strong" and modality_agreement != "disagree":
            overall_level = "medium"
        else:
            overall_level = "low" if modality_agreement == "disagree" else "medium"
        notes.insert(0, "Confidence unavailable in demo mode (mock model — not calibrated).")
    else:
        mode = "calibrated"
        model_confidence = calibrated_confidence
        if modality_agreement == "disagree":
            overall_level = "low"
        elif model_confidence >= 0.75 and input_quality == "good":
            overall_level = "high"
        elif model_confidence >= 0.5:
            overall_level = "medium"
        else:
            overall_level = "low"

    return ConfidenceReport(
        mode=mode,
        overall_level=overall_level,
        model_confidence=model_confidence,
        input_quality=input_quality,
        evidence_quality=evidence_quality,
        modality_agreement=modality_agreement,
        notes=notes,
    )
