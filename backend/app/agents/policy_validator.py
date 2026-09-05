"""Policy Validator -- deterministic, backend-enforced rules (NOT LLM
logic) that decide whether an approved TaskPlan may actually execute
against the inputs actually available. This is what implements MVP Tests
8 and 9: a single image never reaches ChangeFormer, and two optical
images never get silently treated as optical+SAR.
"""
from __future__ import annotations

from dataclasses import dataclass, field

from app.model_registry.compatibility import resolve_capability
from app.schemas.task_plan import TaskPlan
from app.schemas.validation import ValidationResult
from app.validation.pair_compatibility import (
    MISSING_SECOND_IMAGE_MESSAGE,
    check_change_pair,
    check_optical_sar_pair,
)

MISSING_IMAGE_MESSAGE = (
    "I can analyze that, but I need remote-sensing imagery first."
)
MISSING_SAR_PAIR_MESSAGE = (
    "This workflow requires one optical/multispectral image and one SAR image."
)


@dataclass
class PolicyDecision:
    approved: bool
    capability: str | None = None
    representation_capability: str | None = None
    message: str | None = None
    actions: list[str] = field(default_factory=list)
    needs_retrieval: bool = False


def validate_task(plan: TaskPlan, image_validations: list[ValidationResult]) -> PolicyDecision:
    resolution = resolve_capability(plan.task, plan.modalities)
    if not resolution.supported:
        return PolicyDecision(approved=False, message=resolution.unsupported_reason)

    if plan.task == "satellite_retrieval":
        if plan.location is None:
            return PolicyDecision(
                approved=False,
                message="I need a location (place name, coordinates, or map area) to search for satellite imagery.",
                actions=["select_from_map"],
            )
        return PolicyDecision(approved=True, capability=resolution.capability, needs_retrieval=True)

    two_image_task = plan.requires_two_images or plan.task in ("change_vqa", "change_detection")
    if two_image_task:
        if len(image_validations) < 2:
            if plan.location is not None and plan.date_range is not None:
                return PolicyDecision(approved=True, capability=resolution.capability, needs_retrieval=True)
            return PolicyDecision(
                approved=False,
                message=MISSING_SECOND_IMAGE_MESSAGE,
                actions=["upload_second_image", "get_satellite_data"],
            )
        pair = check_change_pair(image_validations)
        if not pair.compatible:
            return PolicyDecision(approved=False, message=pair.message, actions=pair.actions)
        return PolicyDecision(approved=True, capability=resolution.capability, message=pair.message)

    if plan.task == "optical_sar_analysis":
        if len(image_validations) < 2:
            if plan.location is not None:
                return PolicyDecision(approved=True, capability=resolution.capability, needs_retrieval=True)
            return PolicyDecision(
                approved=False,
                message=MISSING_SAR_PAIR_MESSAGE,
                actions=["upload_sar_image", "get_satellite_data"],
            )
        pair = check_optical_sar_pair(image_validations)
        if not pair.compatible:
            return PolicyDecision(approved=False, message=pair.message, actions=pair.actions)
        return PolicyDecision(approved=True, capability=resolution.capability)

    # Single-image tasks: vqa, captioning, grounding
    if len(image_validations) < 1:
        if plan.location is not None:
            return PolicyDecision(approved=True, capability=resolution.capability, needs_retrieval=True)
        return PolicyDecision(
            approved=False,
            message=MISSING_IMAGE_MESSAGE,
            actions=["upload_image", "select_from_map", "get_satellite_data"],
        )

    primary = image_validations[0]
    if not primary.valid:
        return PolicyDecision(approved=False, message="; ".join(primary.errors) or "The uploaded image failed validation.")

    if plan.requires_grounding and resolution.capability != "grounding":
        return PolicyDecision(approved=False, message="Grounding was requested but is not supported for this task.")

    return PolicyDecision(
        approved=True,
        capability=resolution.capability,
        representation_capability=resolution.representation_capability,
    )
