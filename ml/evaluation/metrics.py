"""Real metric implementations only. No function here ever returns a
fabricated or placeholder score -- every metric is computed from actual
predictions and ground truth passed in by the caller.
"""
from __future__ import annotations

import numpy as np


def exact_match_accuracy(predictions: list[str], references: list[str]) -> float:
    if len(predictions) != len(references):
        raise ValueError("predictions and references must be the same length.")
    if not predictions:
        raise ValueError("Cannot compute accuracy over zero samples.")
    normalized_preds = [p.strip().lower() for p in predictions]
    normalized_refs = [r.strip().lower() for r in references]
    matches = sum(p == r for p, r in zip(normalized_preds, normalized_refs))
    return matches / len(predictions)


def token_f1(prediction: str, reference: str) -> float:
    """Token-overlap F1, the standard VQA free-form-answer metric."""
    pred_tokens = prediction.strip().lower().split()
    ref_tokens = reference.strip().lower().split()
    if not pred_tokens and not ref_tokens:
        return 1.0
    if not pred_tokens or not ref_tokens:
        return 0.0

    common = 0
    ref_counts: dict[str, int] = {}
    for t in ref_tokens:
        ref_counts[t] = ref_counts.get(t, 0) + 1
    for t in pred_tokens:
        if ref_counts.get(t, 0) > 0:
            common += 1
            ref_counts[t] -= 1

    if common == 0:
        return 0.0
    precision = common / len(pred_tokens)
    recall = common / len(ref_tokens)
    return 2 * precision * recall / (precision + recall)


def mean_token_f1(predictions: list[str], references: list[str]) -> float:
    if len(predictions) != len(references):
        raise ValueError("predictions and references must be the same length.")
    if not predictions:
        raise ValueError("Cannot compute F1 over zero samples.")
    return float(np.mean([token_f1(p, r) for p, r in zip(predictions, references)]))


def bbox_iou(box_a: tuple[float, float, float, float], box_b: tuple[float, float, float, float]) -> float:
    ax1, ay1, ax2, ay2 = box_a
    bx1, by1, bx2, by2 = box_b

    inter_x1, inter_y1 = max(ax1, bx1), max(ay1, by1)
    inter_x2, inter_y2 = min(ax2, bx2), min(ay2, by2)
    inter_area = max(0.0, inter_x2 - inter_x1) * max(0.0, inter_y2 - inter_y1)

    area_a = max(0.0, ax2 - ax1) * max(0.0, ay2 - ay1)
    area_b = max(0.0, bx2 - bx1) * max(0.0, by2 - by1)
    union = area_a + area_b - inter_area
    if union <= 0:
        return 0.0
    return inter_area / union


def mean_bbox_iou(
    predictions: list[tuple[float, float, float, float]],
    references: list[tuple[float, float, float, float]],
) -> float:
    if len(predictions) != len(references):
        raise ValueError("predictions and references must be the same length.")
    if not predictions:
        raise ValueError("Cannot compute IoU over zero samples.")
    return float(np.mean([bbox_iou(p, r) for p, r in zip(predictions, references)]))


def change_mask_metrics(prediction_mask: np.ndarray, reference_mask: np.ndarray) -> dict[str, float]:
    """Pixel-wise precision/recall/F1/IoU for a binary change mask against
    a ground-truth mask. Both masks must be the same shape."""
    if prediction_mask.shape != reference_mask.shape:
        raise ValueError("prediction_mask and reference_mask must have the same shape.")

    pred = prediction_mask.astype(bool)
    ref = reference_mask.astype(bool)

    tp = int(np.count_nonzero(pred & ref))
    fp = int(np.count_nonzero(pred & ~ref))
    fn = int(np.count_nonzero(~pred & ref))

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
    union = tp + fp + fn
    iou = tp / union if union > 0 else 0.0

    return {"precision": precision, "recall": recall, "f1": f1, "iou": iou}
