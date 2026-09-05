"""Prithvi adapter — real target: Prithvi-EO-2.0 pretrained, used to
produce multispectral representations/embeddings when a task explicitly
needs one. Not used for ordinary RGB VQA and not chained into change
detection (ChangeFormer runs independently — see change_adapter.py).

Activated by setting PRITHVI_MODEL_PATH; until then, this computes a real
per-band statistical summary (mean/std/min/max) of the actual input array
as a stand-in "representation vector" and reports demo_mode=True.
"""
from __future__ import annotations

from typing import Any

import numpy as np

from app.core.config import get_settings
from app.model_adapters.base import AdapterOutput, BaseModelAdapter, ModelHealth


class PrithviAdapter(BaseModelAdapter):
    model_id = "prithvi_eo"
    model_name = "Prithvi-EO-2.0"
    capability = ["multispectral_representation"]
    supported_modalities = ["multispectral"]
    supported_tasks = ["representation"]
    required_inputs = ["image_array"]
    output_schema = {"representation": "list[float]", "band_stats": "dict"}

    def __init__(self) -> None:
        super().__init__()
        self.version = "2.0-pretrained-mock"
        settings = get_settings()
        self._model_path = settings.prithvi_model_path

    @property
    def is_mock(self) -> bool:
        return not self._model_path

    def health_check(self) -> str:
        return ModelHealth.HEALTHY if self.is_mock else ModelHealth.UNAVAILABLE

    def validate_input(self, **kwargs: Any) -> list[str]:
        errors = []
        image_array = kwargs.get("image_array")
        if image_array is None:
            errors.append("A multispectral image is required.")
        elif getattr(image_array, "ndim", 2) < 3 or image_array.shape[0] < 3:
            errors.append(
                "This task benefits from a multispectral image (3+ bands); "
                "the provided image has too few bands for a meaningful representation."
            )
        return errors

    def predict(self, **kwargs: Any) -> AdapterOutput:
        image_array: np.ndarray = kwargs["image_array"]
        if not self._model_path:
            return self._predict_mock(image_array)
        raise NotImplementedError(
            "Real Prithvi-EO-2.0 inference is not wired up yet. "
            "Set PRITHVI_MODEL_PATH only once ml/inference support lands."
        )

    def _predict_mock(self, image_array: np.ndarray) -> AdapterOutput:
        bands = image_array if image_array.ndim == 3 else image_array[np.newaxis, ...]
        band_stats = []
        for i, band in enumerate(bands):
            finite = band[np.isfinite(band)]
            band_stats.append(
                {
                    "band_index": i,
                    "mean": float(np.mean(finite)) if finite.size else 0.0,
                    "std": float(np.std(finite)) if finite.size else 0.0,
                    "min": float(np.min(finite)) if finite.size else 0.0,
                    "max": float(np.max(finite)) if finite.size else 0.0,
                }
            )
        representation = [s["mean"] for s in band_stats] + [s["std"] for s in band_stats]
        return AdapterOutput(
            representation=representation,
            band_stats=band_stats,
            score=0.5,
            demo_mode=True,
            basis="per-band statistical summary of the actual input array (not a learned embedding)",
        )
