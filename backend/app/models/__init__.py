"""SQLAlchemy ORM models. Import all modules here so Alembic autogenerate
and Base.metadata.create_all() see every table."""
from app.models.audit_log import AuditLog
from app.models.chat_session import ChatSession
from app.models.evaluation_run import EvaluationRun
from app.models.evidence import Evidence
from app.models.execution import Execution, ExecutionStep
from app.models.image import Image, ImageMetadata
from app.models.message import Message
from app.models.model_registry import ModelRegistryEntry, ModelVersion
from app.models.query import Query
from app.models.report import Report
from app.models.satellite_scene import SatelliteScene
from app.models.task_plan import TaskPlanRecord
from app.models.user import User

__all__ = [
    "AuditLog",
    "ChatSession",
    "EvaluationRun",
    "Evidence",
    "Execution",
    "ExecutionStep",
    "Image",
    "ImageMetadata",
    "Message",
    "ModelRegistryEntry",
    "ModelVersion",
    "Query",
    "Report",
    "SatelliteScene",
    "TaskPlanRecord",
    "User",
]
