from __future__ import annotations

from app.model_registry.compatibility import resolve_capability


def test_vqa_optical_resolves_directly():
    res = resolve_capability("vqa", ["optical"])
    assert res.supported
    assert res.capability == "vqa"
    assert res.representation_capability is None


def test_vqa_multispectral_uses_representation_step():
    res = resolve_capability("vqa", ["multispectral"])
    assert res.supported
    assert res.capability == "vqa"
    assert res.representation_capability == "multispectral_representation"


def test_change_multispectral_goes_directly_to_changeformer():
    """Correction from plan review: multispectral change is NOT chained
    through Prithvi -- it routes to change_detection directly."""
    res = resolve_capability("change_detection", ["multispectral"])
    assert res.supported
    assert res.capability == "change_detection"
    assert res.representation_capability is None


def test_change_sar_only_is_explicitly_unsupported():
    res = resolve_capability("change_detection", ["sar"])
    assert not res.supported
    assert "SAR-only" in res.unsupported_reason


def test_optical_sar_analysis_resolves_to_fusion_capability():
    res = resolve_capability("optical_sar_analysis", ["optical", "sar"])
    assert res.supported
    assert res.capability == "optical_sar_fusion"


def test_unknown_task_is_unsupported():
    res = resolve_capability("not_a_real_task", ["optical"])
    assert not res.supported
    assert res.unsupported_reason
