"""Evaluate VQA/captioning predictions against a dataset adapter's ground
truth. Isolated from the production serving path -- this never runs as
part of a live request, and never invents a metric: if a predictions
file is missing or empty, it exits with an error instead of reporting a
score.

Usage:
    python -m ml.evaluation.evaluate_vqa \\
        --dataset rsvqa --root-dir data/eval/rsvqa \\
        --predictions predictions.json
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone

from ml.evaluation.metrics import exact_match_accuracy, mean_token_f1
from ml.evaluation.reporting import post_evaluation_result
from ml.training.train_internvl import _DATASET_ADAPTERS, load_dataset


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate VQA/captioning predictions.")
    parser.add_argument("--dataset", required=True, choices=sorted(_DATASET_ADAPTERS.keys()))
    parser.add_argument("--root-dir", required=True)
    parser.add_argument("--predictions", required=True, help="JSON: {question_index: prediction_text}")
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
        predictions_by_index: dict[str, str] = json.load(f)

    if not predictions_by_index:
        print("Predictions file is empty -- nothing to evaluate.", file=sys.stderr)
        sys.exit(1)

    predictions, references = [], []
    for index_str, prediction in predictions_by_index.items():
        sample = dataset[int(index_str)]
        predictions.append(prediction)
        references.append(sample.answer)

    metrics = {
        "exact_match_accuracy": exact_match_accuracy(predictions, references),
        "mean_token_f1": mean_token_f1(predictions, references),
    }

    result = {
        "dataset": dataset.dataset_name,
        "task": "vqa",
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
