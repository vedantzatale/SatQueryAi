"""Task x Modality -> capability compatibility matrix (see plan §9).

The agent asks for a capability; this module is what decides which
capability a given (task, modalities) combination requires. The Model
Registry then resolves capability -> concrete adapter. Routing NEVER
hardcodes a model name here -- only capability strings that must exist as
`capability` entries in models.yaml.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class CapabilityResolution:
    supported: bool
    capability: str | None = None
    # set only for multispectral VQA/captioning: a representation step runs
    # first (Prithvi), then its output feeds the primary capability (RS-VLM).
    representation_capability: str | None = None
    unsupported_reason: str | None = None


def resolve_capability(task: str, modalities: list[str]) -> CapabilityResolution:
    mods = set(modalities)

    if task == "vqa":
        if "multispectral" in mods:
            return CapabilityResolution(
                supported=True, capability="vqa", representation_capability="multispectral_representation"
            )
        return CapabilityResolution(supported=True, capability="vqa")

    if task == "captioning":
        if "multispectral" in mods:
            return CapabilityResolution(
                supported=True,
                capability="captioning",
                representation_capability="multispectral_representation",
            )
        return CapabilityResolution(supported=True, capability="captioning")

    if task == "grounding":
        return CapabilityResolution(supported=True, capability="grounding")

    if task in ("change_vqa", "change_detection"):
        if "sar" in mods and len(mods) == 1:
            return CapabilityResolution(
                supported=False,
                unsupported_reason=(
                    "SAR-only bi-temporal change detection is not configured in this "
                    "deployment. Please provide optical or multispectral imagery for "
                    "change analysis, or check back once a SAR-compatible change model "
                    "is registered."
                ),
            )
        # optical and multispectral both route directly to ChangeFormer --
        # it is not chained through Prithvi in this prototype.
        return CapabilityResolution(supported=True, capability="change_detection")

    if task == "optical_sar_analysis":
        return CapabilityResolution(supported=True, capability="optical_sar_fusion")

    if task == "satellite_retrieval":
        return CapabilityResolution(supported=True, capability="satellite_search")

    return CapabilityResolution(
        supported=False,
        unsupported_reason=f"Task '{task}' is not supported by any registered capability.",
    )
