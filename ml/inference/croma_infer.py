"""Real CROMA (base) inference — produces optical, SAR, and joint
representations. Loads ml/inference/vendor/croma/architecture.py (adapted
from antofuller/CROMA, MIT) plus the released `croma-base` checkpoint
(a single `model.safetensors`, Hugging Face PyTorchModelHubMixin format).

CROMA-base was pretrained on 120x120px crops with exactly 12 Sentinel-2
optical bands and 2 Sentinel-1 SAR (VV/VH) bands — inputs with fewer bands
cannot be projected onto the pretrained patch-embedding weights, so callers
must validate band counts before calling `predict`.
"""
from __future__ import annotations

import os
import sys
import threading

import cv2
import numpy as np
import torch

_VENDOR_DIR = os.path.join(os.path.dirname(__file__), "vendor", "croma")

_IMAGE_RESOLUTION = 120
_S2_CHANNELS = 12
_S1_CHANNELS = 2

_lock = threading.Lock()
_cache: dict[str, "CromaInference"] = {}


def get_croma(checkpoint_path: str) -> "CromaInference":
    with _lock:
        inst = _cache.get(checkpoint_path)
        if inst is None:
            inst = CromaInference(checkpoint_path)
            inst.load()
            _cache[checkpoint_path] = inst
        return inst


class CromaInference:
    def __init__(self, checkpoint_path: str, device: str = "cpu"):
        self.checkpoint_path = checkpoint_path
        self.device = torch.device(device)
        self._model = None

    def load(self) -> None:
        if _VENDOR_DIR not in sys.path:
            sys.path.insert(0, _VENDOR_DIR)
        from architecture import PretrainedCROMA  # noqa: E402  (vendored path)

        if not os.path.exists(self.checkpoint_path):
            raise FileNotFoundError(f"CROMA checkpoint not found: {self.checkpoint_path}")

        model = PretrainedCROMA(
            pretrained_path=self.checkpoint_path,
            size="base",
            modality="both",
            image_resolution=_IMAGE_RESOLUTION,
        )
        model.to(self.device)
        model.eval()
        self._model = model

    @staticmethod
    def _resize_stack(bands: np.ndarray) -> np.ndarray:
        resized = [
            cv2.resize(np.nan_to_num(b.astype(np.float32)), (_IMAGE_RESOLUTION, _IMAGE_RESOLUTION), interpolation=cv2.INTER_LINEAR)
            for b in bands
        ]
        return np.stack(resized, axis=0)

    @torch.no_grad()
    def predict(self, optical_array: np.ndarray, sar_array: np.ndarray) -> dict:
        """optical_array: (>=12, H, W); sar_array: (>=2, H, W). Both are
        expected in linear reflectance / backscatter units, not uint8."""
        if self._model is None:
            raise RuntimeError("CromaInference.load() must be called before predict()")

        optical_bands = optical_array if optical_array.ndim == 3 else optical_array[np.newaxis, ...]
        sar_bands = sar_array if sar_array.ndim == 3 else sar_array[np.newaxis, ...]

        optical_stack = self._resize_stack(optical_bands[:_S2_CHANNELS])
        sar_stack = self._resize_stack(sar_bands[:_S1_CHANNELS])

        # Per-scene standardization (CROMA's own preprocessing normalizes per
        # band using dataset-wide statistics we don't have; per-scene z-score
        # is the documented fallback for out-of-distribution inference).
        def _zscore(x: np.ndarray) -> np.ndarray:
            mean = x.mean(axis=(1, 2), keepdims=True)
            std = x.std(axis=(1, 2), keepdims=True) + 1e-6
            return (x - mean) / std

        optical_tensor = torch.from_numpy(_zscore(optical_stack)).float().unsqueeze(0).to(self.device)
        sar_tensor = torch.from_numpy(_zscore(sar_stack)).float().unsqueeze(0).to(self.device)

        out = self._model(SAR_images=sar_tensor, optical_images=optical_tensor)

        joint_gap = out["joint_GAP"].squeeze(0).cpu().numpy()
        optical_gap = out["optical_GAP"].squeeze(0).cpu().numpy()
        sar_gap = out["SAR_GAP"].squeeze(0).cpu().numpy()

        agreement_score = float(
            torch.nn.functional.cosine_similarity(
                out["optical_GAP"], out["SAR_GAP"], dim=-1
            ).item()
        )

        return {
            "representation": joint_gap.tolist(),
            "optical_representation": optical_gap.tolist(),
            "sar_representation": sar_gap.tolist(),
            "agreement_score": agreement_score,
        }
