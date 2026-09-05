"""AgentController -- Query Understanding step of the execution state
machine. Wraps the Qwen3 agent adapter (mock today) and turns its raw
output into a validated `TaskPlan`. If the adapter's output doesn't parse,
the request is rejected here, before anything downstream runs.
"""
from __future__ import annotations

from datetime import date

from pydantic import ValidationError

from app.model_registry.registry import get_model_manager
from app.schemas.location import LocationRequest
from app.schemas.task_plan import TaskPlan


class TaskUnderstandingError(Exception):
    pass


class AgentController:
    def __init__(self) -> None:
        self._manager = get_model_manager()

    def understand_query(self, query_text: str, image_count: int = 0) -> TaskPlan:
        adapter = self._manager.get_model("qwen_agent")

        errors = adapter.validate_input(query_text=query_text)
        if errors:
            raise TaskUnderstandingError(errors[0])

        output = adapter.predict(query_text=query_text, image_count=image_count)
        raw = output.get("raw_task_plan")
        if not raw:
            raise TaskUnderstandingError("The agent did not produce a task plan for this query.")

        location = None
        if raw.get("location"):
            try:
                location = LocationRequest(**raw["location"])
            except ValidationError:
                location = None

        date_range = None
        if raw.get("date_range"):
            try:
                d1, d2 = raw["date_range"]
                date_range = (date.fromisoformat(d1), date.fromisoformat(d2))
            except (ValueError, TypeError):
                date_range = None

        try:
            return TaskPlan(
                intent=raw["intent"],
                language=raw.get("language", "en"),
                task=raw["task"],
                modalities=raw.get("modalities", []),
                temporal=raw.get("temporal", False),
                requires_two_images=raw.get("requires_two_images", False),
                requires_grounding=raw.get("requires_grounding", False),
                requires_quantification=raw.get("requires_quantification", False),
                location=location,
                date_range=date_range,
                output_type=raw.get("output_type", ["text"]),
                raw_query=raw.get("raw_query", query_text),
            )
        except (ValidationError, KeyError) as exc:
            raise TaskUnderstandingError(
                "The agent produced a task plan that failed validation and cannot be executed."
            ) from exc


_controller = AgentController()


def get_agent_controller() -> AgentController:
    return _controller
