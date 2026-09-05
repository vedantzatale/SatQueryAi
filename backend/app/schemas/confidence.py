"""ConfidenceReport is intentionally split into distinct fields (model
confidence vs. input quality vs. evidence quality vs. modality agreement)
rather than one opaque number, and DEMO_MODE never fabricates a numeric
confidence — model_confidence stays None until a real calibrated model
with calibration data is wired in."""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel

ConfidenceMode = Literal["calibrated", "demo_heuristic"]
Level = Literal["high", "medium", "low", "unavailable"]
Quality = Literal["good", "fair", "poor", "strong", "moderate", "weak"]
Agreement = Literal["agree", "disagree", "not_applicable"]


class ConfidenceReport(BaseModel):
    mode: ConfidenceMode
    overall_level: Level
    model_confidence: float | None = None  # only ever set in "calibrated" mode
    input_quality: Literal["good", "fair", "poor"]
    evidence_quality: Literal["strong", "moderate", "weak"]
    modality_agreement: Agreement = "not_applicable"
    notes: list[str] = []
