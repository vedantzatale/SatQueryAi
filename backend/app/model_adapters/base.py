"""BaseModelAdapter — every model (agent, RS-VLM, Prithvi, ChangeFormer,
CROMA) is loaded through a subclass of this. Frontend/orchestration code
never talks to PyTorch directly; it only ever calls through this interface,
which is why a mock adapter can stand in for a multi-GB model without any
other code changing."""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class ModelHealth:
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNAVAILABLE = "unavailable"


class AdapterOutput(dict):
    """Normalized adapter output. Subclasses populate whatever keys are
    relevant to their capability; `demo_mode` must be set truthfully."""


class BaseModelAdapter(ABC):
    model_id: str
    model_name: str
    version: str
    capability: list[str]
    supported_modalities: list[str]
    supported_tasks: list[str]
    required_inputs: list[str]
    output_schema: dict[str, Any]

    def __init__(self) -> None:
        self._loaded = False

    @property
    def is_mock(self) -> bool:
        """True when this adapter has no real weights configured and is
        producing deterministic, input-derived mock output. Every result
        produced by a mock adapter must be labeled demo_mode=true."""
        raise NotImplementedError

    def load(self) -> None:
        """Lazy-load weights/resources. Called at most once, on first use,
        by ModelManager — never at server startup."""
        self._loaded = True

    @abstractmethod
    def health_check(self) -> str:
        """Return one of ModelHealth.{HEALTHY,DEGRADED,UNAVAILABLE}."""

    @abstractmethod
    def validate_input(self, **kwargs: Any) -> list[str]:
        """Return a list of human-readable problems; empty list means OK.
        Called before predict() so bad input never reaches a model."""

    @abstractmethod
    def predict(self, **kwargs: Any) -> AdapterOutput:
        """Run inference. Must include `demo_mode` in the returned dict."""

    def explain_metadata(self) -> dict[str, Any]:
        return {
            "model_id": self.model_id,
            "model_name": self.model_name,
            "version": self.version,
            "capability": self.capability,
            "supported_modalities": self.supported_modalities,
            "is_mock": self.is_mock,
        }

    def estimate_quality(self, output: AdapterOutput) -> str:
        """Coarse, non-fabricated quality label ("strong"/"moderate"/"weak")
        derived from the adapter's own output (e.g. score, evidence count).
        Subclasses may override; default is conservative."""
        score = output.get("score")
        if score is None:
            return "moderate"
        if score >= 0.75:
            return "strong"
        if score >= 0.4:
            return "moderate"
        return "weak"
