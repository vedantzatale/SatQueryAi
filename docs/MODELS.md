# Models

Every model is registered in `backend/app/model_registry/models.yaml` and implements
`BaseModelAdapter` (`backend/app/model_adapters/base.py`):
`model_id, model_name, version, capability, supported_modalities, supported_tasks,
required_inputs, output_schema, health_check(), validate_input(), predict(),
explain_metadata(), estimate_quality()`.

Routing is **capability-based**, never by hardcoded model name — see
`backend/app/model_registry/compatibility.py` for the Task × Modality → capability matrix.

| Adapter | Real target | Activate via | Status in this repo | Mock behavior when unset |
|---|---|---|---|---|
| `qwen_agent` | Qwen3-4B (local LLM, size configurable via `AGENT_MODEL_NAME`) | `AGENT_MODEL_PATH` | **Wired, real inference implemented** (`ml/inference/qwen_agent_infer.py`) | Rule/keyword parser for en/hi/hinglish producing `TaskPlan` JSON |
| `internvl_rs` | InternVL3-1B, remote-sensing adapted via LoRA/QLoRA | `INTERNVL_MODEL_PATH` | Not wired — mock only, by choice | HSV color-threshold heuristic on real pixels (water/vegetation/built-up), real contour-based bounding boxes for grounding |
| `prithvi` | Prithvi-EO-2.0-300M, pretrained | `PRITHVI_MODEL_PATH` | **Wired, real inference implemented** (`ml/inference/prithvi_infer.py`) | Real per-band mean/std/min/max statistical summary |
| `changeformer` | ChangeFormer V6 (LEVIR-CD pretrained) | `CHANGE_MODEL_PATH` | **Wired, real inference implemented** (`ml/inference/changeformer_infer.py`) | Real grayscale absolute-difference + Otsu threshold on aligned images |
| `croma` | CROMA-base, pretrained optical+SAR multimodal representation | `CROMA_MODEL_PATH` | **Wired, real inference implemented** (`ml/inference/croma_infer.py`) | Real optical-brightness-fraction vs. SAR-backscatter-fraction cross-check |
| `terramind` | Advanced multimodal fallback | `TERRAMIND_ENABLED=true` + `TERRAMIND_MODEL_PATH` | Disabled by default (`enabled: false` in the registry) | — |

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

## Getting the real weights (not committed to this repo)

Checkpoints are gitignored (`models/weights/`, `*.pt`, `*.safetensors`, `*.zip`) — they are
multi-GB binary files with no place in git history, and GitHub outright rejects anything
over 100MB per file anyway. **Cloning this repo gets you all the code, none of the
weights.** Without them, every adapter above silently runs its mock/heuristic path — the
app is fully usable in demo mode with zero setup beyond `pip install` / `npm install`.

To reproduce real inference for the four wired models, download each checkpoint yourself
and point the matching `.env` variable at it:

| Model | Source | What to download |
|---|---|---|
| Qwen3-4B | https://huggingface.co/Qwen/Qwen3-4B | The full model repo (config, tokenizer, sharded `.safetensors`) into one folder |
| Prithvi-EO-2.0-300M | https://huggingface.co/ibm-nasa-geospatial/Prithvi-EO-2.0-300M | `Prithvi_EO_V2_300M.pt`, `config.json`, `prithvi_mae.py` |
| CROMA-base | https://huggingface.co/antofuller/CROMA_base *(or the original https://github.com/antofuller/CROMA release)* | `model.safetensors` + `config.json` |
| ChangeFormer | https://github.com/wgcban/ChangeFormer | A trained checkpoint (`best_ckpt.pt`) — either train your own on LEVIR-CD/DSIFN per that repo, or use a release you have rights to |

Place each under `models/weights/<name>/` (any layout works, since the path is whatever
you put in `.env`), then in `.env` set:

```
AGENT_MODEL_PATH=/absolute/path/to/models/weights/qwen3-4b
PRITHVI_MODEL_PATH=/absolute/path/to/models/weights/prithvi/Prithvi_EO_V2_300M.pt
CHANGE_MODEL_PATH=/absolute/path/to/models/weights/changeformer/.../best_ckpt.pt
CROMA_MODEL_PATH=/absolute/path/to/models/weights/croma/model.safetensors
```

Also install the `ml` extra (`torch`, `transformers`, `peft`, `timm`, `einops`,
`safetensors`, `accelerate`, `scipy` — see `backend/pyproject.toml`):

```
pip install -e ".[ml]"
```

Restart the backend. Each adapter's `health_check()` reports `is_mock: false` and a real
version string (e.g. `Prithvi-EO-2.0-300M`) once its weights are found on disk — see
`/api/v1/models/<id>/health` or the frontend's Model Registry page. Blank the env var and
restart to fall back to the mock again; nothing else in the app changes either way.

The architecture-defining code for ChangeFormer, Prithvi, and CROMA (small, MIT/Apache-2.0
licensed Python files — not weights) is vendored into `ml/inference/vendor/` and **is**
committed, since a checkpoint's state dict is useless without the class that defines the
network it belongs to. See `ml/inference/vendor/README.md` for provenance/licensing.
InternVL3-1B is not wired up (no adapter code targets it yet) — to add it, follow the same
pattern as the other four: a loader in `ml/inference/`, a call from
`rsvlm_adapter.py::predict()`, and `INTERNVL_MODEL_PATH` in `.env`.

## Training / evaluation (`ml/`)

Kept separate from the serving path per the spec (`ml/datasets`, `ml/training`,
`ml/evaluation`, `ml/inference`, `ml/adapters`). Dataset adapters
(`BigEarthNetAdapter`, `VRSBenchAdapter`, `RSVQAAdapter`, `CDVQAAdapter`) implement
`BaseDatasetAdapter` and convert source formats into a normalized internal format; no
dataset-specific assumptions belong in model code. Evaluation is isolated from production
inference and never invents a benchmark score — an `EvaluationResult` only exists if a
real evaluation run actually happened. **This scaffolding is a documented follow-up in
this build** — see `docs/DEVELOPMENT.md`.
