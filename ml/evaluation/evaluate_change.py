"""Evaluate change-detection masks (IoU / F1 / precision / recall) against
ground-truth masks. Isolated from the production serving path. Predicted
and reference masks are matched by filename.

Usage:
    python -m ml.evaluation.evaluate_change \\
        --predictions-dir predicted_masks/ --references-dir ground_truth_masks/
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image

from ml.evaluation.metrics import change_mask_metrics


def _load_mask(path: Path) -> np.ndarray:
    with Image.open(path) as img:
        return (np.asarray(img.convert("L")) > 127).astype(np.uint8)


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate change-detection masks.")
    parser.add_argument("--predictions-dir", required=True)
    parser.add_argument("--references-dir", required=True)
    parser.add_argument("--model-id", default="unknown")
    parser.add_argument("--model-version", default="unknown")
    parser.add_argument("--output", default=None)
    args = parser.parse_args()

    predictions_dir = Path(args.predictions_dir)
    references_dir = Path(args.references_dir)
    if not predictions_dir.exists() or not references_dir.exists():
        print("predictions-dir and references-dir must both exist.", file=sys.stderr)
        sys.exit(1)

    prediction_files = sorted(predictions_dir.glob("*.png"))
    if not prediction_files:
        print(f"No .png masks found in {predictions_dir}.", file=sys.stderr)
        sys.exit(1)

    per_file_metrics = []
    for pred_path in prediction_files:
        ref_path = references_dir / pred_path.name
        if not ref_path.exists():
            print(f"Skipping {pred_path.name}: no matching reference mask.", file=sys.stderr)
            continue
        pred_mask = _load_mask(pred_path)
        ref_mask = _load_mask(ref_path)
        if pred_mask.shape != ref_mask.shape:
            print(f"Skipping {pred_path.name}: shape mismatch.", file=sys.stderr)
            continue
        per_file_metrics.append(change_mask_metrics(pred_mask, ref_mask))

    if not per_file_metrics:
        print("No comparable mask pairs found -- nothing to evaluate.", file=sys.stderr)
        sys.exit(1)

    aggregated = {
        key: float(np.mean([m[key] for m in per_file_metrics])) for key in per_file_metrics[0]
    }

    result = {
        "dataset": "custom_change_masks",
        "task": "change_detection",
        "metrics": aggregated,
        "model_id": args.model_id,
        "model_version": args.model_version,
        "sample_count": len(per_file_metrics),
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
    }

    print(json.dumps(result, indent=2))
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)


if __name__ == "__main__":
    main()
