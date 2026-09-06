"""Evaluate grounding (bounding-box) predictions against a dataset
adapter's ground truth. Isolated from the production serving path --
this never runs as part of a live request, and never invents a metric:
if a predictions file is missing, empty, or a referenced sample has no
ground-truth bbox, it fails loudly instead of reporting a score.

Usage:
    python -m ml.evaluation.evaluate_grounding \\
        --dataset vrsbench --root-dir data/eval/vrsbench \\
        --predictions predictions.json
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone

from ml.evaluation.metrics import mean_bbox_iou
from ml.evaluation.reporting import post_evaluation_result
from ml.training.train_internvl import _DATASET_ADAPTERS, load_dataset


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate grounding (bbox) predictions.")
    parser.add_argument("--dataset", required=True, choices=sorted(_DATASET_ADAPTERS.keys()))
    parser.add_argument("--root-dir", required=True)
    parser.add_argument(
        "--predictions", required=True, help="JSON: {question_index: [x1, y1, x2, y2]}"
    )
    parser.add_argument("--iou-threshold", type=float, default=0.5, help="Threshold for accuracy@IoU")
    parser.add_argument("--model-id", default="unknown")
    parser.add_argument("--model-version", default="unknown")
    parser.add_argument("--output", default=None, help="Where to write the EvaluationResult JSON")
    parser.add_argument(
        "--api-url", default=None, help="Backend API base URL (e.g. http://localhost:8000/api/v1) to record this run"
    )
    args = parser.parse_args()

    try:
        dataset = load_dataset({"adapter": args.dataset, "root_dir": args.root_dir})
    except FileNotFoundError as exc:
        print(f"Dataset not available: {exc}", file=sys.stderr)
        sys.exit(1)

    with open(args.predictions, encoding="utf-8") as f:
        predictions_by_index: dict[str, list[float]] = json.load(f)

    if not predictions_by_index:
        print("Predictions file is empty -- nothing to evaluate.", file=sys.stderr)
        sys.exit(1)

    predictions, references = [], []
    for index_str, prediction_box in predictions_by_index.items():
        sample = dataset[int(index_str)]
        if sample.bbox is None:
            print(
                f"Sample {index_str} has no ground-truth bbox -- refusing to score it as if it did.",
                file=sys.stderr,
            )
            sys.exit(1)
        predictions.append(tuple(prediction_box))
        references.append(sample.bbox)

    mean_iou = mean_bbox_iou(predictions, references)
    from ml.evaluation.metrics import bbox_iou

    per_sample_iou = [bbox_iou(p, r) for p, r in zip(predictions, references)]
    accuracy_at_threshold = sum(iou >= args.iou_threshold for iou in per_sample_iou) / len(per_sample_iou)

    metrics = {
        "mean_iou": mean_iou,
        f"accuracy@iou{args.iou_threshold}": accuracy_at_threshold,
    }

    result = {
        "dataset": dataset.dataset_name,
        "task": "grounding",
        "metrics": metrics,
        "model_id": args.model_id,
        "model_version": args.model_version,
        "sample_count": len(predictions),
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
    }

    print(json.dumps(result, indent=2))
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)
    if args.api_url:
        post_evaluation_result(args.api_url, result)


if __name__ == "__main__":
    main()
