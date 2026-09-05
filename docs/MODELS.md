# Models

Every model is registered in `backend/app/model_registry/models.yaml` and implements
`BaseModelAdapter` (`backend/app/model_adapters/base.py`):
`model_id, model_name, version, capability, supported_modalities, supported_tasks,
required_inputs, output_schema, health_check(), validate_input(), predict(),
explain_metadata(), estimate_quality()`.

Routing is **capability-based**, never by hardcoded model name — see
`backend/app/model_registry/compatibility.py` for the Task × Modality → capability matrix.

| Adapter | Real target | Activate via | Mock behavior when unset |
|---|---|---|---|
| `qwen_agent` | Qwen3 (local LLM, size configurable via `AGENT_MODEL_NAME`) | `AGENT_MODEL_PATH` | Rule/keyword parser for en/hi/hinglish producing `TaskPlan` JSON |
| `internvl_rs` | InternVL3-1B, remote-sensing adapted via LoRA/QLoRA | `INTERNVL_MODEL_PATH` | HSV color-threshold heuristic on real pixels (water/vegetation/built-up), real contour-based bounding boxes for grounding |
| `prithvi` | Prithvi-EO-2.0, pretrained | `PRITHVI_MODEL_PATH` | Real per-band mean/std/min/max statistical summary |
| `changeformer` | ChangeFormer (or another approved pretrained change-detection model) | `CHANGE_MODEL_PATH` | Real grayscale absolute-difference + Otsu threshold on aligned images |
| `croma` | CROMA, pretrained optical+SAR multimodal representation | `CROMA_MODEL_PATH` | Real optical-brightness-fraction vs. SAR-backscatter-fraction cross-check |
| `terramind` | Advanced multimodal fallback | `TERRAMIND_ENABLED=true` + `TERRAMIND_MODEL_PATH` | Disabled by default (`enabled: false` in the registry) |

Every mock adapter's output includes `demo_mode: true` and a `basis` string describing
exactly what heuristic produced it. **No mock ever fabricates a confidence score, a
benchmark metric, or satellite metadata** — see `backend/app/confidence/service.py` and
`backend/app/schemas/confidence.py`.

## Why ChangeFormer is not chained through Prithvi

The spec's original v1 plan proposed feeding Prithvi's multispectral features into
ChangeFormer for multispectral change detection. This was deliberately reverted: that
integration is unvalidated, and ChangeFormer is a complete change-detection model on its
own. For this prototype, bi-temporal change (optical or multispectral) routes directly to
`change_detection`; Prithvi is a separate, optional representation path used only when a
task explicitly needs a multispectral embedding (see `docs/ARCHITECTURE.md`).

## Real-model integration path (not done in this build)

Because this environment has no confirmed GPU/disk budget for multi-GB weights, no real
model weights are downloaded. The path to activate a real model is, for each adapter:
set its `*_MODEL_PATH` env var, implement the `NotImplementedError` branch in that
adapter's `predict()` (the mock branch stays as a documented fallback for `health_check()`
failures), and add its LoRA/QLoRA training config under `ml/training/configs/` if
fine-tuning is required. No orchestration, registry, or API code needs to change.

## Training / evaluation (`ml/`)

Kept separate from the serving path per the spec (`ml/datasets`, `ml/training`,
`ml/evaluation`, `ml/inference`, `ml/adapters`). Dataset adapters
(`BigEarthNetAdapter`, `VRSBenchAdapter`, `RSVQAAdapter`, `CDVQAAdapter`) implement
`BaseDatasetAdapter` and convert source formats into a normalized internal format; no
dataset-specific assumptions belong in model code. Evaluation is isolated from production
inference and never invents a benchmark score — an `EvaluationResult` only exists if a
real evaluation run actually happened. **This scaffolding is a documented follow-up in
this build** — see `docs/DEVELOPMENT.md`.
