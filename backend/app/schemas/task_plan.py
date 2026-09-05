"""The only thing the agent's LLM (Qwen3, mocked for now) is allowed to
produce. It is never executed directly — everything downstream (Policy
Validator, Compatibility Matrix, Model Registry) treats this as untrusted
structured input to validate before anything runs."""
from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel

from app.schemas.location import LocationRequest

Modality = Literal["optical", "multispectral", "sar"]
Language = Literal["en", "hi", "hinglish"]
OutputType = Literal["text", "mask", "report", "geojson"]

TaskName = Literal[
    "vqa",
    "captioning",
    "grounding",
    "change_vqa",
    "change_detection",
    "optical_sar_analysis",
    "satellite_retrieval",
    "unsupported",
]


class TaskPlan(BaseModel):
    intent: str
    language: Language = "en"
    task: TaskName
    modalities: list[Modality] = []
    temporal: bool = False
    requires_two_images: bool = False
    requires_grounding: bool = False
    requires_quantification: bool = False
    location: LocationRequest | None = None
    date_range: tuple[date, date] | None = None
    output_type: list[OutputType] = ["text"]
    raw_query: str = ""
