"""Real ChangeFormer (V6) inference. Loads the architecture from
ml/inference/vendor/changeformer (vendored from wgcban/ChangeFormer, MIT)
and a checkpoint produced by that repo's training script (a dict with a
`model_G_state_dict` key, e.g. `best_ckpt.pt` / `last_ckpt.pt`).
"""
from __future__ import annotations

import os
import sys
import threading

import cv2
import numpy as np
import torch
import torch.nn.functional as F

_VENDOR_DIR = os.path.join(os.path.dirname(__file__), "vendor", "changeformer")

_IMG_SIZE = 256
_NORM_MEAN = 0.5
_NORM_STD = 0.5

_lock = threading.Lock()
_cache: dict[str, "ChangeFormerInference"] = {}


def get_changeformer(checkpoint_path: str) -> "ChangeFormerInference":
    with _lock:
        inst = _cache.get(checkpoint_path)
        if inst is None:
            inst = ChangeFormerInference(checkpoint_path)
            inst.load()
            _cache[checkpoint_path] = inst
        return inst


class ChangeFormerInference:
    def __init__(self, checkpoint_path: str, embed_dim: int = 256, device: str = "cpu"):
        self.checkpoint_path = checkpoint_path
        self.embed_dim = embed_dim
        self.device = torch.device(device)
        self._net = None

    def load(self) -> None:
        if _VENDOR_DIR not in sys.path:
            sys.path.insert(0, _VENDOR_DIR)
        from models.ChangeFormer import ChangeFormerV6  # noqa: E402  (vendored path)

        net = ChangeFormerV6(embed_dim=self.embed_dim)
        if not os.path.exists(self.checkpoint_path):
            raise FileNotFoundError(f"ChangeFormer checkpoint not found: {self.checkpoint_path}")
        # weights_only=False: this checkpoint predates PyTorch's safe-unpickling
        # default and stores a plain dict with numpy scalars (best_val_acc,
        # best_epoch_id) alongside the state dict. Only ever point
        # CHANGE_MODEL_PATH at a checkpoint you trust (e.g. one you trained
        # yourself, or the official ChangeFormer release), never an untrusted one.
        checkpoint = torch.load(self.checkpoint_path, map_location=self.device, weights_only=False)
        state_dict = checkpoint["model_G_state_dict"] if "model_G_state_dict" in checkpoint else checkpoint
        net.load_state_dict(state_dict)
        net.to(self.device)
        net.eval()
        self._net = net

    def _preprocess(self, bgr: np.ndarray) -> torch.Tensor:
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
        resized = cv2.resize(rgb, (_IMG_SIZE, _IMG_SIZE), interpolation=cv2.INTER_LINEAR)
        tensor = torch.from_numpy(resized).float().permute(2, 0, 1) / 255.0
        tensor = (tensor - _NORM_MEAN) / _NORM_STD
        return tensor.unsqueeze(0)

    @torch.no_grad()
    def predict(self, before_bgr: np.ndarray, after_bgr: np.ndarray) -> tuple[np.ndarray, float]:
        """Returns (mask uint8 {0,255} at original `before_bgr` resolution, mean change confidence)."""
        if self._net is None:
            raise RuntimeError("ChangeFormerInference.load() must be called before predict()")

        orig_h, orig_w = before_bgr.shape[:2]
        img_a = self._preprocess(before_bgr).to(self.device)
        img_b = self._preprocess(after_bgr).to(self.device)

        logits = self._net(img_a, img_b)[-1]  # (1, 2, H, W)
        probs = F.softmax(logits, dim=1)
        changed_prob = probs[:, 1, :, :]  # (1, H, W)
        pred = torch.argmax(logits, dim=1)  # (1, H, W)

        mask_small = (pred[0].cpu().numpy() * 255).astype(np.uint8)
        mask = cv2.resize(mask_small, (orig_w, orig_h), interpolation=cv2.INTER_NEAREST)

        changed_pixels = pred[0] == 1
        if changed_pixels.any():
            confidence = float(changed_prob[0][changed_pixels].mean().item())
        else:
            confidence = float((1.0 - changed_prob[0]).mean().item())

        return mask, confidence
