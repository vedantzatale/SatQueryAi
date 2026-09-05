from __future__ import annotations

from pydantic import BaseModel


class EvaluationResult(BaseModel):
    """Never fabricate a benchmark score. Populated only from an actual
    evaluation run against real predictions and ground truth."""

    dataset: str
    task: str
    metrics: dict[str, float]
    model_id: str
    model_version: str
    sample_count: int
