from __future__ import annotations

import numpy as np

from ml.evaluation.metrics import (
    bbox_iou,
    change_mask_metrics,
    exact_match_accuracy,
    mean_token_f1,
)


def test_exact_match_accuracy():
    assert exact_match_accuracy(["Water", "forest"], ["water", "Forest"]) == 1.0
    assert exact_match_accuracy(["water"], ["forest"]) == 0.0


def test_token_f1_partial_overlap():
    score = mean_token_f1(["a large water body"], ["a small water body"])
    assert 0.0 < score < 1.0


def test_bbox_iou_perfect_overlap():
    box = (0, 0, 10, 10)
    assert bbox_iou(box, box) == 1.0


def test_bbox_iou_no_overlap():
    assert bbox_iou((0, 0, 5, 5), (10, 10, 15, 15)) == 0.0


def test_change_mask_metrics_perfect_prediction():
    mask = np.zeros((10, 10), dtype=np.uint8)
    mask[2:5, 2:5] = 1
    metrics = change_mask_metrics(mask, mask)
    assert metrics["iou"] == 1.0
    assert metrics["f1"] == 1.0


def test_change_mask_metrics_no_overlap():
    pred = np.zeros((10, 10), dtype=np.uint8)
    pred[0:2, 0:2] = 1
    ref = np.zeros((10, 10), dtype=np.uint8)
    ref[8:10, 8:10] = 1
    metrics = change_mask_metrics(pred, ref)
    assert metrics["iou"] == 0.0
    assert metrics["precision"] == 0.0
    assert metrics["recall"] == 0.0
