"""EvidenceRenderer -- turns model output into stored visual artifacts
(bounding boxes, masks, overlays, before/after composites) via OpenCV/PIL,
persisted through the storage abstraction (local filesystem or MinIO)."""
from __future__ import annotations

import io
import uuid

import cv2
import numpy as np
from PIL import Image as PILImage

from app.model_adapters.image_stats import to_uint8_bgr
from app.storage.object_storage import get_storage_backend


class EvidenceRenderer:
    def __init__(self) -> None:
        self._storage = get_storage_backend()

    def render_original(self, image_array: np.ndarray) -> str:
        bgr = to_uint8_bgr(image_array)
        return self._store_png(bgr, prefix="evidence_original")

    def render_bbox_overlay(self, image_array: np.ndarray, bbox: tuple[int, int, int, int], label: str) -> str:
        bgr = to_uint8_bgr(image_array).copy()
        x1, y1, x2, y2 = bbox
        cv2.rectangle(bgr, (x1, y1), (x2, y2), (0, 0, 255), 2)
        cv2.putText(bgr, label, (x1, max(0, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        return self._store_png(bgr, prefix="evidence_bbox")

    def render_change_overlay(self, before: np.ndarray, mask: np.ndarray) -> str:
        bgr = to_uint8_bgr(before).copy()
        overlay = bgr.copy()
        overlay[mask > 0] = (0, 0, 255)
        blended = cv2.addWeighted(bgr, 0.6, overlay, 0.4, 0)
        return self._store_png(blended, prefix="evidence_change")

    def render_mask(self, mask: np.ndarray) -> str:
        return self._store_png(mask, prefix="evidence_mask")

    def render_before_after(self, before: np.ndarray, after: np.ndarray) -> str:
        bgr_before = to_uint8_bgr(before)
        bgr_after = to_uint8_bgr(after)
        h = min(bgr_before.shape[0], bgr_after.shape[0])
        w1, w2 = bgr_before.shape[1], bgr_after.shape[1]
        combined = np.zeros((h, w1 + w2 + 10, 3), dtype=np.uint8)
        combined[:, :w1] = bgr_before[:h]
        combined[:, w1 + 10 :] = bgr_after[:h]
        return self._store_png(combined, prefix="evidence_before_after")

    def _store_png(self, bgr_or_gray: np.ndarray, prefix: str) -> str:
        if bgr_or_gray.ndim == 2:
            rgb = cv2.cvtColor(bgr_or_gray, cv2.COLOR_GRAY2RGB)
        else:
            rgb = cv2.cvtColor(bgr_or_gray, cv2.COLOR_BGR2RGB)
        buffer = io.BytesIO()
        PILImage.fromarray(rgb).save(buffer, format="PNG")
        key = f"evidence/{prefix}_{uuid.uuid4().hex}.png"
        self._storage.put_bytes(key, buffer.getvalue(), content_type="image/png")
        return key


_renderer = EvidenceRenderer()


def get_evidence_renderer() -> EvidenceRenderer:
    return _renderer
