from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel

from app.schemas.confidence import ConfidenceReport
from app.schemas.evidence import Evidence
from app.schemas.provenance import DataProvenance, ModelProvenance


class ExecutionStatus(str, Enum):
    QUEUED = "queued"
    BASIC_VALIDATION = "basic_validation"
    QUERY_UNDERSTANDING = "query_understanding"
    TASK_PLANNING = "task_planning"
    TASK_VALIDATION = "task_validation"
    DATA_RETRIEVAL = "data_retrieval"
    PREPROCESSING = "preprocessing"
    MODEL_SELECTION = "model_selection"
    RUNNING = "running"
    RESULT_INTEGRATION = "result_integration"
    EVIDENCE_GENERATION = "evidence_generation"
    CONFIDENCE_CALIBRATION = "confidence_calibration"
    COMPLETED = "completed"
    REQUIRES_USER_INPUT = "requires_user_input"
    FAILED = "failed"


class ExecutionStepRecord(BaseModel):
    step_name: str
    status: str
    detail: dict = {}
    started_at: datetime | None = None
    completed_at: datetime | None = None


class ExecutionResult(BaseModel):
    execution_id: str
    status: ExecutionStatus
    task: str | None = None
    model: str | None = None
    model_version: str | None = None
    answer: str | None = None
    evidence: list[Evidence] = []
    confidence: ConfidenceReport | None = None
    data_provenance: DataProvenance | None = None
    model_provenance: ModelProvenance | None = None
    warnings: list[str] = []
    user_message: str | None = None  # populated for REQUIRES_USER_INPUT / FAILED
    actions: list[str] = []  # e.g. ["upload_second_image", "get_satellite_data"]
    steps: list[ExecutionStepRecord] = []
    latency_ms: int | None = None
