"""Records real evaluation runs (produced by ml/evaluation/evaluate_*.py
against actual predictions and ground truth) so they're queryable
alongside the rest of the system's audit trail. This endpoint never
computes or fabricates a metric itself -- it only persists a result the
caller already computed.
"""
from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.evaluation_run import EvaluationRun
from app.schemas.evaluation import EvaluationResult

router = APIRouter(prefix="/evaluation-runs", tags=["evaluation"])


class EvaluationRunResponse(EvaluationResult):
    id: str
    created_at: datetime


@router.post("", response_model=EvaluationRunResponse)
def record_evaluation_run(body: EvaluationResult, db: Session = Depends(get_db)) -> EvaluationRunResponse:
    run = EvaluationRun(
        dataset=body.dataset,
        task=body.task,
        metrics_json={
            **body.metrics,
            "model_id": body.model_id,
            "model_version": body.model_version,
            "sample_count": body.sample_count,
        },
    )
    db.add(run)
    db.commit()
    return EvaluationRunResponse(
        id=run.id,
        created_at=run.created_at,
        dataset=body.dataset,
        task=body.task,
        metrics=body.metrics,
        model_id=body.model_id,
        model_version=body.model_version,
        sample_count=body.sample_count,
    )


@router.get("", response_model=list[EvaluationRunResponse])
def list_evaluation_runs(db: Session = Depends(get_db)) -> list[EvaluationRunResponse]:
    runs = db.query(EvaluationRun).order_by(EvaluationRun.created_at.desc()).all()
    results = []
    for run in runs:
        metrics_json = dict(run.metrics_json)
        model_id = metrics_json.pop("model_id", "unknown")
        model_version = metrics_json.pop("model_version", "unknown")
        sample_count = metrics_json.pop("sample_count", 0)
        results.append(
            EvaluationRunResponse(
                id=run.id,
                created_at=run.created_at,
                dataset=run.dataset,
                task=run.task,
                metrics=metrics_json,
                model_id=model_id,
                model_version=model_version,
                sample_count=sample_count,
            )
        )
    return results
