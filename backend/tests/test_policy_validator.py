from __future__ import annotations

from app.agents.policy_validator import validate_task
from app.schemas.location import LocationRequest
from app.schemas.task_plan import TaskPlan
from app.schemas.validation import ImageValidationMetadata, ValidationResult


def _valid_result(modality: str) -> ValidationResult:
    return ValidationResult(
        valid=True,
        detected_modality=modality,
        spatial_reference_available=True,
        metadata=ImageValidationMetadata(crs="EPSG:32643", resolution_x=10.0, resolution_y=10.0),
    )


def test_change_with_single_image_requires_second_image_mvp_test_8():
    plan = TaskPlan(intent="change_analysis", task="change_vqa", modalities=["optical"])
    decision = validate_task(plan, [_valid_result("optical")])
    assert not decision.approved
    assert "two images" in decision.message
    assert "upload_second_image" in decision.actions


def test_optical_sar_with_two_optical_images_rejected_mvp_test_9():
    plan = TaskPlan(intent="cross_modal_analysis", task="optical_sar_analysis", modalities=["optical", "sar"])
    decision = validate_task(plan, [_valid_result("optical"), _valid_result("optical")])
    assert not decision.approved
    assert "one optical and one SAR" in decision.message


def test_optical_sar_with_correct_pair_approved():
    plan = TaskPlan(intent="cross_modal_analysis", task="optical_sar_analysis", modalities=["optical", "sar"])
    decision = validate_task(plan, [_valid_result("optical"), _valid_result("sar")])
    assert decision.approved
    assert decision.capability == "optical_sar_fusion"


def test_vqa_with_no_image_and_no_location_requires_input():
    plan = TaskPlan(intent="visual_question_answering", task="vqa", modalities=["optical"])
    decision = validate_task(plan, [])
    assert not decision.approved
    assert "upload_image" in decision.actions


def test_vqa_with_no_image_but_location_triggers_retrieval():
    plan = TaskPlan(
        intent="visual_question_answering",
        task="vqa",
        modalities=["optical"],
        location=LocationRequest(place_name="Pune"),
    )
    decision = validate_task(plan, [])
    assert decision.approved
    assert decision.needs_retrieval


def test_change_with_two_images_different_modality_rejected():
    plan = TaskPlan(intent="change_analysis", task="change_vqa", modalities=["optical"])
    decision = validate_task(plan, [_valid_result("optical"), _valid_result("sar")])
    assert not decision.approved
    assert "different modalities" in decision.message
