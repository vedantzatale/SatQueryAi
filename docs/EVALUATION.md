# Evaluation

Evaluation is isolated from the production serving path (`ml/evaluation/`, never imported
by `backend/app/`) and never invents a benchmark score — every number comes from real
predictions compared against real ground truth.

| Task | Metrics | Script |
|---|---|---|
| VQA / captioning | Exact-match accuracy, mean token-F1 | `ml/evaluation/evaluate_vqa.py` |
| Grounding | Mean bounding-box IoU | `ml/evaluation/metrics.py::mean_bbox_iou` (no standalone CLI yet — see below) |
| Change detection | Precision, recall, F1, IoU (pixel-wise) | `ml/evaluation/evaluate_change.py` |

```bash
python -m ml.evaluation.evaluate_vqa --dataset rsvqa --root-dir data/eval/rsvqa \
  --predictions predictions.json --model-id internvl_rs --model-version 0.1.0
```

`predictions.json` maps a dataset sample index to the model's raw text prediction — this
script does not run inference itself; it only scores predictions you already generated
(keeping evaluation reproducible and separate from whichever model produced them).

```bash
python -m ml.evaluation.evaluate_change --predictions-dir out/masks --references-dir gt/masks
```

Matches predicted/reference change masks by filename and reports aggregated
precision/recall/F1/IoU across all matched pairs.

Pass `--api-url http://localhost:8000/api/v1` to either script to also record the result
into the backend's `evaluation_runs` table via `POST /api/v1/evaluation-runs`
(`ml/evaluation/reporting.py`) — this talks to the public API only, so `ml/` never imports
backend internals directly.

## What's not done

- No `evaluate_grounding.py` CLI yet (the metric function exists in `metrics.py`, wiring a
  script around it is a follow-up).
- No actual runs against VRSBench/RSVQA/CDVQA have been performed in this session (no real
  model weights, no downloaded datasets) — see `docs/DATASETS.md`. **Any benchmark numbers
  quoted for SatQuery AI outside of this repository's own test suite should be treated as
  unverified until a real evaluation run has actually been executed.**
