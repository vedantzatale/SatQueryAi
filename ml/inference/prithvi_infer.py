"""Real Prithvi-EO-2.0-300M inference (representation/embedding only — this
project never uses Prithvi for pixel reconstruction). Loads the encoder
from ml/inference/vendor/prithvi/prithvi_mae.py (vendored from
ibm-nasa-geospatial/Prithvi-EO-2.0-300M, Apache-2.0) plus the released
`Prithvi_EO_V2_300M.pt` checkpoint.

Expects 6-band Sentinel-2-like input in band order [B02, B03, B04, B05,
B06, B07] (blue, green, red, red-edge x2, narrow NIR) — the exact bands
this checkpoint was pretrained on. Fewer bands cannot be normalized
correctly against the pretrained per-band statistics, so callers must
validate band count before calling `predict`.
"""
from __future__ import annotations

import os
import sys
import threading

import cv2
import numpy as np
import torch

_VENDOR_DIR = os.path.join(os.path.dirname(__file__), "vendor", "prithvi")

_IMG_SIZE = 224
_BANDS = ["B02", "B03", "B04", "B05", "B06", "B07"]
_MEAN = [1087.0, 1342.0, 1433.0, 2734.0, 1958.0, 1363.0]
_STD = [2248.0, 2179.0, 2178.0, 1850.0, 1242.0, 1049.0]

_lock = threading.Lock()
_cache: dict[str, "PrithviInference"] = {}


def get_prithvi(checkpoint_path: str) -> "PrithviInference":
    with _lock:
        inst = _cache.get(checkpoint_path)
        if inst is None:
            inst = PrithviInference(checkpoint_path)
            inst.load()
            _cache[checkpoint_path] = inst
        return inst


class PrithviInference:
    def __init__(self, checkpoint_path: str, device: str = "cpu"):
        self.checkpoint_path = checkpoint_path
        self.device = torch.device(device)
        self._model = None

    def load(self) -> None:
        if _VENDOR_DIR not in sys.path:
            sys.path.insert(0, _VENDOR_DIR)
        from prithvi_mae import PrithviMAE  # noqa: E402  (vendored path)

        # num_frames=4 matches the checkpoint's stored positional-embedding
        # shape (load_state_dict requires an exact shape match); a T=1 input
        # at inference is fine — PrithviViT.interpolate_pos_encoding resizes
        # the loaded pos_embed to whatever (T, H, W) is actually passed in.
        model = PrithviMAE(
            img_size=_IMG_SIZE,
            patch_size=(1, 16, 16),
            num_frames=4,
            in_chans=len(_BANDS),
            embed_dim=1024,
            depth=24,
            num_heads=16,
            decoder_embed_dim=512,
            decoder_depth=8,
            decoder_num_heads=16,
            mlp_ratio=4.0,
            coords_encoding=[],
            coords_scale_learn=False,
        )
        if not os.path.exists(self.checkpoint_path):
            raise FileNotFoundError(f"Prithvi checkpoint not found: {self.checkpoint_path}")
        state_dict = torch.load(self.checkpoint_path, map_location=self.device)
        if "model" in state_dict:
            state_dict = state_dict["model"]
        model.load_state_dict(state_dict, strict=False)
        model.to(self.device)
        model.eval()
        self._model = model

    @torch.no_grad()
    def predict(self, image_array: np.ndarray) -> dict:
        """image_array: (bands>=6, H, W) real-valued array (reflectance/DN, not uint8).
        Returns {"representation": list[float] (1024-dim mean-pooled embedding),
                 "band_stats": [...]} — band_stats mirrors the pre-existing mock schema.
        """
        if self._model is None:
            raise RuntimeError("PrithviInference.load() must be called before predict()")

        bands = image_array if image_array.ndim == 3 else image_array[np.newaxis, ...]
        selected = bands[: len(_BANDS)].astype(np.float32)

        band_stats = []
        normalized_bands = []
        for i, band in enumerate(selected):
            finite = band[np.isfinite(band)]
            band_stats.append({
                "band_index": i,
                "mean": float(np.mean(finite)) if finite.size else 0.0,
                "std": float(np.std(finite)) if finite.size else 0.0,
                "min": float(np.min(finite)) if finite.size else 0.0,
                "max": float(np.max(finite)) if finite.size else 0.0,
            })
            resized = cv2.resize(np.nan_to_num(band), (_IMG_SIZE, _IMG_SIZE), interpolation=cv2.INTER_LINEAR)
            norm = (resized - _MEAN[i]) / _STD[i]
            normalized_bands.append(norm)

        stacked = np.stack(normalized_bands, axis=0)  # (6, 224, 224)
        pixel_values = torch.from_numpy(stacked).float().unsqueeze(0).unsqueeze(2).to(self.device)  # (1,6,1,224,224)

        features = self._model.forward_features(pixel_values)
        last = features[-1]  # (1, 1+num_patches, 1024)
        patch_tokens = last[:, 1:, :]
        representation = patch_tokens.mean(dim=1).squeeze(0).cpu().numpy().tolist()

        return {"representation": representation, "band_stats": band_stats}
