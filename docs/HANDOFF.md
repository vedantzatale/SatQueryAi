# Project Handoff — SatQuery AI

**Repo:** https://github.com/vedantzatale/SatQueryAi (branch `main`)
**Last commit as of this doc:** `dc0b508` — "Fix real Docker build issues found during actual docker compose up"
**Tests:** 43 backend (pytest) + 6 ml (pytest) = 49, all passing
**Status:** Fully working end-to-end without Docker. Docker path is written, partially
verified, blocked on a host disk-space issue (not a code problem) — see [§ Docker](#docker-status-read-this-first) below.

This document is written for someone picking up the project cold. If you only read one
section, read [§ Docker status](#docker-status-read-this-first) and [§ How to run it
right now](#how-to-run-it-right-now).

---

## What this project is

An agentic vision-language system for remote-sensing imagery analysis. A user asks a
question (optionally with uploaded imagery, optionally in English/Hindi/Hinglish), and the
system: validates input → understands the query via an agent → runs it through a
deterministic policy/compatibility layer → selects and executes the right specialist model
→ generates evidence → calibrates confidence → returns an answer with a full audit trail,
and can export a PDF report or GeoJSON.

Full architecture rationale is in `docs/ARCHITECTURE.md`. The build plan that shaped every
design decision below (why the agent is "boxed", why ChangeFormer isn't chained through
Prithvi, why confidence never shows a fake number in demo mode, etc.) is not in the repo —
it was a planning document from the build session. The reasoning is captured inline as
module docstrings throughout `backend/app/`, so read those when in doubt about *why*
something is structured a certain way.

**Everything is currently mocked at the ML layer, on purpose.** No GPU/model weights were
available while building this. Every model adapter (`backend/app/model_adapters/`) has a
real interface and a deterministic mock implementation that inspects actual input pixels
(color thresholds, pixel differencing, band statistics) rather than fabricating output —
see `docs/MODELS.md` for exactly what's real vs. mocked and how to swap in real weights
later purely via `.env` config, no code changes needed.

---

## Docker status — read this first

**What works:** the backend Docker image (Python 3.11-slim + GDAL + rasterio/geopandas +
all deps) builds and exports successfully against a real Docker Desktop instance. This was
verified live, not assumed.

**Three real bugs were found and fixed during that verification** (already committed):
1. `backend/.dockerignore` and `frontend/.dockerignore` didn't exist, so the build context
   included `.venv/` and `node_modules/`, transferring 50MB+ of junk into every build.
2. `docker/frontend.Dockerfile`'s runner stage does `COPY --from=builder /app/public
   ./public`, which fails outright if `frontend/public/` doesn't exist — it didn't. Fixed
   by adding `frontend/public/.gitkeep`.
3. `docker-compose.yml` had an obsolete top-level `version: "3.9"` key (Compose v2+ warns
   and ignores it) — removed.

**What's NOT verified:** a full `docker compose up --build` bringing up all 6 services
(postgres, redis, minio, backend, worker, frontend) healthy together, and
`docker compose exec backend alembic upgrade head` against the real Postgres container
(which is the only thing that actually exercises `alembic/versions/0002_postgis_geometry.py`
— on SQLite that migration is a no-op by design, so it's never been tested against real
PostGIS).

**Why it's not verified: the build machine ran out of disk space**, not a code issue.
Sequence of events, in case it's informative:
- Docker Desktop's CLI was initially unreachable from tool sessions (stale PATH in the
  process that launched the dev session) — resolved by restarting that top-level process.
- Once reachable, `docker compose up --build` hit the two Dockerfile bugs above (now fixed).
- After fixing those, a build attempt got as far as exporting the `backend` and `worker`
  images, then the Docker daemon **crashed** (`SIGBUS` fatal error, "Docker Desktop
  encountered an unexpected error and needs to close").
- Root cause: the system drive (`C:`) had **0 bytes free out of 129GB** — not a Docker
  quirk, ~121GB of that is unrelated to Docker (personal files/apps on the same drive as
  the dev environment). Docker's own WSL2 data disk (`docker_data.vhdx`) was found
  corrupted/stuck read-only as a result and was deleted+regenerated once, which briefly
  freed ~8GB — that got consumed again by the same vhdx regrowing during the next build
  attempt, because 8GB was never real headroom, just borrowed space.

**To finish this, whoever has Docker access needs to:**
1. Get the machine running Docker to genuinely 20-30GB+ free on whatever drive Docker's
   data lives on (check via Docker Desktop → Settings → Resources → Advanced — relocate
   the disk image to a drive with real free space if the system drive is tight).
2. `docker compose config` (sanity check, should just print resolved config, no errors)
3. `docker compose up --build` — watch that all 6 containers report healthy/running,
   especially `postgres`, `redis`, `minio` (they have healthchecks the backend/worker
   depend on)
4. `docker compose exec backend alembic upgrade head` — this is the first real test of
   the Postgres-only migration; if it errors, the bug is almost certainly in
   `backend/alembic/versions/0002_postgis_geometry.py`
5. `curl http://localhost:8000/api/v1/system/health` — should show `"database": "healthy"`
   and `"redis": "healthy"` (different from the SQLite/inline path's "not_configured"
   message)
6. Open `http://localhost:3000` and repeat the manual flow in
   [§ Manual verification checklist](#manual-verification-checklist)

If step 3 or 4 fails, that's a genuine bug to fix (not disk space) — paste the exact error
and dig in; the backend image build itself is already proven to work.

---

## How to run it right now

No Docker needed — this is the path that's actually been tested (43 backend tests, 6 ml
tests, and a live Playwright browser run, all passing).

```powershell
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -e ".[dev]"
cp ..\.env.example ..\.env        # already done in this repo checkout; .env is gitignored
alembic upgrade head              # creates satquery_dev.db (SQLite)
uvicorn app.main:app --reload     # http://localhost:8000, docs at /docs

# Frontend (separate terminal)
cd frontend
npm install
npm run dev                       # http://localhost:3000
```

Run the tests:
```powershell
cd backend
python -m pytest tests/ -v        # 43 tests
cd ..
$env:PYTHONPATH = (Get-Location)
python -m pytest ml/tests -v      # 6 tests
```

Default config (`.env.example`) uses `DEMO_MODE=true`, `DATABASE_URL=sqlite:///./satquery_dev.db`,
`STORAGE_BACKEND=local`, `TASK_BACKEND=inline` — no external services required. This is not
a lesser "demo path" grafted on afterward; it's the primary architecture. Every one of
those is a real pluggable backend (Postgres/MinIO/Celery are the production alternatives,
selected purely by env var — see `app/core/config.py`).

---

## Manual verification checklist

Exercises the 10 MVP acceptance scenarios the whole system was designed against. All of
these currently pass against the SQLite/local/inline path.

1. Upload `data/demo/single/optical/sample_optical.tif` → ask "What is visible in this
   image?" → expect a VQA-style answer + confidence panel + audit trail.
2. Same image → "Describe this image." → captioning.
3. Same image → "Where is the water?" → grounding, with a real bounding-box overlay image.
4. Upload `data/demo/temporal/before/sample_before.tif` +
   `data/demo/temporal/after/sample_after.tif` → "What changed between these two dates?" →
   change mask overlay + before/after comparison image.
5. Same pair → "Did built-up area increase?" → change quantification (real area math if
   georeferenced, the spec's exact caveat message if not).
6. Upload `data/demo/fusion/optical/` + `data/demo/fusion/sar/` images → "Use both images
   to identify built-up areas." → optical+SAR fusion answer.
7. No image, just: "Find built-up area around Mumbai between 2024 and 2025." → triggers
   the mock satellite retrieval path (clearly labeled `demo_mode: true`).
8. Change-analysis question with only ONE image uploaded → must return
   `REQUIRES_USER_INPUT` with a request for a second image — **must never** call the
   ChangeFormer adapter.
9. Optical+SAR question with two OPTICAL images uploaded → must detect the mismatch and
   explain what's needed, not silently proceed.
10. Multi-turn: ask 3 follow-up questions against the same uploaded image in the same
    session → the 2nd/3rd should show `"reused cached decode"` in
    `data_provenance.processing_applied` (see `backend/tests/test_caching.py` for the
    automated version of this check).

Every response should also visibly show `demo_mode: true` wherever a mock model produced
it, and confidence should never show a fabricated percentage in demo mode — only
qualitative labels (`input_quality`, `evidence_quality`, `overall_level`).

---

## What's fully done — detailed feature breakdown

Every feature below is real code, wired end-to-end, and covered by at least one automated
test unless stated otherwise. This section walks the same path a request actually takes.

### 1. Agent Controller & task understanding (`backend/app/agents/`, `model_adapters/agent_adapter.py`)

A user's raw text query (English, Hindi, or Hinglish) goes through `AgentController.
understand_query()`. The "agent" is a deterministic rule/keyword parser standing in for a
real Qwen3 model — it:
- **Detects language**: Devanagari script → `hi`; ≥2 Hindi-word hints in Latin script
  (`hai`, `kya`, `pichle saal`, `badha`, etc.) → `hinglish`; else `en`.
- **Classifies task**: keyword rules map the query to one of `vqa`, `captioning`,
  `grounding`, `change_vqa`, `optical_sar_analysis`, or `satellite_retrieval`.
- **Infers modalities**: e.g. "vegetation"/"NDVI" → `multispectral`, "radar"/"through
  cloud" → `sar`, optical+SAR phrasing → both.
- **Extracts a structured location** (`LocationRequest`: place name / lat-lon / bbox /
  polygon / radius — never a bare string) via regex around "around/near/in <place>".
- **Extracts a date range** from phrases like "last year" or two years mentioned in text.
- Produces a raw dict, which `AgentController` then validates into the `TaskPlan` Pydantic
  schema (`schemas/task_plan.py`). **If it doesn't validate, the request is rejected right
  there** — nothing downstream ever executes on unvalidated agent output.

This is the most important architectural decision in the whole system: the agent (real or
mock) is only ever allowed to produce this one structured object. It cannot name a Python
function, a model, or a tool. Swapping in a real Qwen3 model later means replacing
`AgentAdapter.predict()`'s mock branch — the rest of the pipeline doesn't change.

### 2. Policy Validator & Compatibility Matrix (`agents/policy_validator.py`, `model_registry/compatibility.py`)

Two separate deterministic layers sit between the agent's `TaskPlan` and any model
execution — neither is LLM-driven, both are plain Python rules:

- **`resolve_capability(task, modalities)`**: maps a task+modality combination to a
  *capability string* (`vqa`, `change_detection`, `optical_sar_fusion`, etc.), never to a
  hardcoded model name. E.g. bi-temporal change (optical *or* multispectral) resolves to
  `change_detection` directly — ChangeFormer is NOT chained through Prithvi features in
  this build, since that integration was never validated (Prithvi is instead an
  independent representation path, used only when a task explicitly needs a multispectral
  embedding). SAR-only change detection resolves as **unsupported** with an explicit
  message, since no SAR-compatible change model is registered.
- **`validate_task(plan, image_validations)`**: given the resolved capability and the
  *actual* images available (with their detected modality from real file inspection), this
  decides pass/fail before any model runs. This is what implements two of the ten MVP
  acceptance tests directly:
  - One image + change-analysis question → `REQUIRES_USER_INPUT`, exact message: *"This
    analysis requires two images of the same area from different dates..."* — **ChangeFormer
    is never invoked.**
  - Two optical images + an optical+SAR question → detected via each image's real
    `detected_modality`, rejected with *"I found two images, but detected their modalities
    as: optical, optical. This analysis requires one optical and one SAR image..."* —
    never silently misused.
  - If a `LocationRequest` + date range are present instead of enough images, it routes to
    satellite retrieval rather than failing outright.

Tested in `backend/tests/test_compatibility.py` and `test_policy_validator.py`.

### 3. Model Registry (`model_registry/models.yaml`, `registry.py`)

`models.yaml` is the single source of truth mapping `capability → adapter class`, with
`version`, `fallback`, `enabled`, `resource_requirement`. `ModelManager.get_for_capability()`
resolves a capability to a live adapter instance, lazily instantiating and caching it
(models are never loaded at server startup). If the primary adapter for a capability
reports `UNAVAILABLE` via its `health_check()`, the manager tries the registry-declared
`fallback` — and if that's used, every downstream result carries
`model_provenance.fallback_used=true` + the exact reason, logged to the audit trail. **No
silent model switching ever happens.** `TerraMind` is registered but `enabled: false` per
spec (resource-heavy, optional, off by default).

### 4. The five model adapters (`model_adapters/`)

All five implement `BaseModelAdapter` (`load()`, `health_check()`, `validate_input()`,
`predict()`, `explain_metadata()`, `estimate_quality()`) and are mock-backed until a
`*_MODEL_PATH` env var is set (see `docs/MODELS.md`). Every mock genuinely inspects the
input it's given — none fabricate output from nothing:

- **Agent** (`agent_adapter.py`) — described above.
- **RS-VLM** (`rsvlm_adapter.py`, target: InternVL3-1B) — handles `vqa`/`captioning`/
  `grounding`. The mock runs real OpenCV HSV-threshold segmentation on the actual uploaded
  pixels to estimate water/vegetation/built-up coverage fractions, then answers using those
  real numbers (e.g. *"Approximately 12.4% of the visible scene shows water-like spectral
  characteristics"*). For grounding, it finds the largest contour of the relevant mask and
  returns a genuine pixel bounding box.
- **Prithvi** (`prithvi_adapter.py`, target: Prithvi-EO-2.0) — multispectral
  *representation* only, deliberately not used for change detection. Mock computes real
  per-band mean/std/min/max as a stand-in embedding.
- **ChangeFormer** (`change_adapter.py`) — bi-temporal change detection, run independently
  (not fed by Prithvi). Mock does real grayscale absolute-difference + Gaussian blur +
  Otsu threshold + morphological open/close between the two aligned images — a genuine,
  if simple, change-detection algorithm, not a fabricated mask.
- **CROMA** (`croma_adapter.py`) — optical+SAR fusion *representation*. Mock computes real
  optical brightness-fraction and real SAR backscatter-intensity-fraction, then cross-checks
  them for a genuine agreement/disagreement signal (feeds directly into confidence's
  `modality_agreement` field).

### 5. Input Validation & modality detection (`validation/`)

`InputValidationService.validate_file()` runs **before any model executes**. For
GeoTIFF/TIFF (`raster_inspector.py`, real rasterio/GDAL): band count, CRS, bounds,
resolution, band descriptions, and a genuine NaN/Infinite-fraction check on actual pixel
values. For PNG/JPEG: explicitly treated as non-georeferenced — no CRS, acquisition date,
or GSD is ever invented for these, per the spec's core rule against fabricated satellite
metadata. `modality_detector.py` is a standalone step (not folded into routing): inspects
band count/descriptions for SAR/multispectral hints, and for single/dual-band files with no
metadata hints, uses a real coefficient-of-variation heuristic (SAR speckle has
characteristically higher local variance than optical panchromatic) — falling back to
`"unknown"` rather than guessing when evidence is weak. Tested in `test_validation.py`.

### 6. Preprocessing (`preprocessing/pipeline.py`)

Real rasterio-based reprojection (`rasterio.warp.reproject`, bilinear resampling) when a
before/after pair has mismatched CRS, and real co-registration (cropping both images to a
common pixel grid). Every operation actually performed is appended to a list that flows
straight into `DataProvenance.processing_applied` — the transparency view can never claim
a step that didn't run. Single-image reads are cached by content checksum (see caching,
below).

### 7. Orchestration Engine — the execution state machine (`orchestration/engine.py`)

This is the file that ties everything above together. `WorkflowEngine.run()` drives a
real state machine, writing one `execution_steps` row per transition:

```
QUEUED → BASIC_VALIDATION → QUERY_UNDERSTANDING → TASK_PLANNING → TASK_VALIDATION
  → [DATA_RETRIEVAL if needed] → PREPROCESSING → MODEL_SELECTION → RUNNING
  → RESULT_INTEGRATION → EVIDENCE_GENERATION → CONFIDENCE_CALIBRATION → COMPLETED
```
with `REQUIRES_USER_INPUT` and `FAILED` exits at any validation/execution point. Three
capability-specific execution paths exist (`_run_single_image_task`,
`_run_change_task`, `_run_optical_sar_task`), each doing real preprocessing → real adapter
call → real evidence rendering → real confidence scoring → real provenance construction,
then persisting the full `ExecutionResult` to the `executions` table.

### 8. Satellite retrieval (`satellite/`)

`ProviderManager` — the *only* thing that talks to providers (the agent never calls one
directly) — tries providers in configured priority order (`copernicus,bhoonidhi,usgs`,
falling back to the mock/demo provider only in `DEMO_MODE`):
- **Copernicus** (`providers/copernicus.py`) — real OAuth2 client-credentials flow +
  real OData catalogue query against the actual Copernicus Data Space Ecosystem API,
  activated only when `COPERNICUS_CLIENT_ID/SECRET` are set.
- **USGS** (`providers/usgs.py`) — real M2M API availability check.
- **Bhoonidhi** (`providers/bhoonidhi.py`) — honest placeholder; reports *"Bhoonidhi access
  is not configured in this deployment"* since it has no public open API to integrate
  against yet.
- **Mock/demo** (`providers/mock.py`) — serves the synthetic dataset under `data/demo/`
  (generated by `scripts/generate_demo_data.py`), every scene explicitly labeled
  `demo_mode: true` and `sensor: "synthetic_demo"` — never presented as real satellite data.

`scene_ranker.py` scores candidates deterministically across 9 factors (coverage, temporal
fit, quality, cloud, modality, resolution, CRS/sensor compatibility, provider
availability) and — critically — for bi-temporal requests scores **compatible pairs**
jointly (`rank_pairs()`), not two independent nearest-date lookups. Tested in
`test_scene_ranker.py`.

### 9. Evidence rendering (`evidence/renderer.py`, `evidence/geo_transform.py`)

Real OpenCV/PIL rendering: bounding-box overlays, change-mask overlays (red highlight
blended over the "before" image), before/after side-by-side composites, and plain
"original" previews — all stored as real PNGs via the storage abstraction. Separately,
`geo_transform.py` does real pixel→geographic conversion: a grounding bounding box's pixel
coordinates are converted to real-world coordinates using the source raster's actual affine
transform, then reprojected to WGS84 via `pyproj` if the source CRS isn't already
EPSG:4326. This is what makes the GeoJSON export (below) trustworthy rather than
decorative. Tested in `test_geo_transform.py` with a real UTM-zone sanity check.

### 10. Confidence (`confidence/service.py`)

Deliberately **never shows a fabricated number in demo mode**. Returns a `ConfidenceReport`
with four independent fields — `model_confidence` (only ever set for a real calibrated
model, `None` in demo mode), `input_quality` (derived from real validation
errors/warnings), `evidence_quality` (derived from the actual evidence produced), and
`modality_agreement` (`agree`/`disagree`/`not_applicable`, only meaningful when 2+
modalities were used — e.g. CROMA's optical/SAR cross-check feeds this directly). When
modalities disagree, `overall_level` is pulled down and a note is added — never silently
averaged away.

### 11. Audit trail & transparency (`audit/service.py`, `GET /analysis/{id}/transparency`)

Every state transition and every fallback event is written to `execution_steps`/
`audit_logs`. The transparency endpoint surfaces task, model+version, `DataProvenance`
(provider, scene ID, acquisition date, CRS, resolution, processing steps actually applied),
`ModelProvenance` (model, version, capability, fallback status), confidence, and warnings —
structured metadata only, **never** hidden chain-of-thought reasoning.

### 12. PDF & GeoJSON export (`reports/pdf_generator.py`, `reports/geojson_generator.py`)

- **PDF** (ReportLab): query, task, model+provenance, data provenance, answer, confidence
  breakdown, every evidence image actually generated (fetched from storage and embedded,
  correctly scaled), warnings, execution summary. Verified live: the response starts with
  a real `%PDF` header and is 300-400KB with embedded images, not a stub.
- **GeoJSON** (GeoPandas/Shapely): a real `FeatureCollection` built only from geometry
  that's already been reprojected to EPSG:4326 (§9) — pixel-space or un-reprojected
  source-CRS coordinates never leak into the output. Verified live: exported coordinates
  for a UTM-zone-43N source image land at ~75°E/19.9°N, not raw UTM meters mislabeled as
  degrees. 409 if the execution isn't `completed` yet.

### 13. Multi-turn caching (`storage/cache.py`, wired into `PreprocessingPipeline.load_single`)

Redis-backed when `REDIS_URL` is set, an in-process dict fallback otherwise (so caching
never requires Redis to function). Rasters are cached by the image's SHA-256 content
checksum. **Proven by test, not just structurally implied**: `test_caching.py` patches
`read_array` and asserts it's genuinely not called on a second `load_single()` with the
same checksum, plus a full HTTP-level test asking three follow-up questions on the same
uploaded image and confirming the 2nd/3rd response's `data_provenance.processing_applied`
contains `"reused cached decode"`.

### 14. Database & persistence (`backend/app/models/`, `alembic/`)

Every table from the original spec exists (`users`, `sessions`, `messages`, `images`,
`image_metadata`, `satellite_scenes`, `queries`, `task_plans`, `executions`,
`execution_steps`, `model_registry`, `model_versions`, `evidence`, `reports`,
`audit_logs`, `evaluation_runs`). Geometry columns (`bounds_geojson`, `bbox_geojson`) are
stored as portable JSON so the exact same ORM code works against SQLite (verified) and
Postgres (migration written, not yet run — see Docker section). A second migration
(`0002_postgis_geometry.py`) conditionally adds real PostGIS `geometry` columns + GIST
spatial indexes only when the target DB is Postgres — a no-op on SQLite by design.

### 15. API layer (`api/v1/`)

All endpoints from the original spec's list are implemented: sessions, image upload,
query/analysis submission (`POST /query` and `POST /analysis` share one underlying
`submit_analysis()` so there's no duplicated orchestration logic), evidence/transparency/
report/geojson sub-resources, model registry + health, satellite search/retrieve/provider
status, system health, plus `evaluation-runs` (added later, §16). Errors are normalized to
`{detail: <safe user-facing message>}`; nothing internal leaks to the client.

### 16. Evaluation framework (`ml/evaluation/`)

Real metrics only — exact-match accuracy, mean token-F1 (VQA/captioning), mean bounding-box
IoU (grounding, metric exists, no CLI yet), and pixel-wise precision/recall/F1/IoU (change
detection). `evaluate_vqa.py` and `evaluate_change.py` score predictions you already
generated (they don't run inference themselves, keeping evaluation reproducible) and can
optionally `POST` their result to `/api/v1/evaluation-runs` via `--api-url` — over plain
HTTP, so `ml/` never imports `backend/app` directly, preserving the isolation the spec
calls for between training/eval code and the serving path. **No run against real
BigEarthNet/VRSBench/RSVQA/CDVQA data has happened** — see "What's NOT done".

### 17. Frontend (`frontend/`)

Next.js (App Router) + TypeScript + Tailwind, three-column layout: session sidebar, center
chat/upload panel, right-hand evidence+transparency+export panel — matching the spec's
information architecture, not a generic chatbot-with-upload-button layout. Talks to the
real backend via Axios/React Query (`lib/api.ts`), polls `GET /analysis/{id}` for
completion, renders evidence images directly from the storage endpoint, and links to
`/report` and `/geojson` for real file downloads. Verified live via Playwright: full
upload→ask→evidence→confidence→transparency→export flow with zero browser console errors.

### 18. Testing

49 automated tests, all passing:
- **43 backend** (`pytest`): validation, modality detection, pair compatibility, the
  compatibility matrix, the policy validator, scene ranking (including pair-aware
  ranking), area calculation (both georeferenced and the exact non-georeferenced caveat
  message), pixel→WGS84 geo-transform, PDF/GeoJSON generation, the caching behavior (both
  unit-level and full HTTP-level), evaluation-runs persistence, and one end-to-end test per
  MVP acceptance scenario (`test_end_to_end.py`) run through the real HTTP API, not mocked
  at the API boundary.
- **6 ml** (`pytest`): the real metric implementations in `ml/evaluation/metrics.py`.
- **1 manual Playwright browser run**: the full upload→ask→evidence→export flow, live,
  with console-error monitoring.

## What's NOT done, in priority order

1. **Docker end-to-end verification** — see above. This is the most important remaining
   item; everything else has been tested, this hasn't.
2. **Real model weights** — InternVL3-1B, Prithvi-EO-2.0, ChangeFormer, CROMA, Qwen3 are
   all mocked. `docs/MODELS.md` documents the exact activation path (set a `*_MODEL_PATH`
   env var) but no actual weights have been downloaded/wired up — no GPU/disk budget was
   available while building this.
3. **`ml/` real training/evaluation runs** — dataset adapters and training/eval scripts
   exist and are tested against synthetic data, but no run against real
   BigEarthNet/VRSBench/RSVQA/CDVQA data has happened. **Do not quote benchmark numbers for
   this system to anyone until a real evaluation has actually been run** — none exist yet.
4. **Kubernetes manifests** — not started (Docker Compose only).
5. **`evaluate_grounding.py`** — the IoU metric function exists in `ml/evaluation/metrics.py`,
   no CLI script wraps it yet (`evaluate_vqa.py`/`evaluate_change.py` are the pattern to
   follow).
6. **SSE/WebSocket live progress** — the frontend currently polls `GET /analysis/{id}`;
   real-time push was scoped out.
7. **Exhaustive frontend test suite** — no Vitest/RTL tests written; verification was
   manual + one Playwright smoke run.
8. **TerraMind adapter** — deliberately not built (spec says disabled by default,
   resource-heavy, optional).
9. **Auth** — `security-review`-style hardening (CORS, upload limits, filename
   sanitization, path traversal protection) is done; no actual user auth/JWT issuance flow
   is implemented, only the config placeholder (`JWT_SECRET`).

## Where to look for things

```
backend/app/
  agents/            Agent Controller: Qwen3 mock → TaskPlan → Policy Validator
  model_adapters/     BaseModelAdapter + all 5 adapters (start here to swap in real models)
  model_registry/     models.yaml (capability→model mapping) + compatibility matrix
  orchestration/      engine.py is the actual state machine — the most important file
  validation/         InputValidationService, modality detection
  satellite/          Provider abstraction, ranking, retrieval
  evidence/           Rendering + pixel→geo CRS transform
  confidence/         Non-fabricating confidence scoring
  reports/            PDF/GeoJSON generators
  api/v1/             All HTTP routes
backend/tests/        43 tests — read these to understand expected behavior precisely
ml/                   Training/eval, deliberately isolated from backend/app
frontend/             Next.js app, components/ has the 3 main panels
docs/                 ARCHITECTURE.md, MODELS.md, API.md, DEVELOPMENT.md (checklist),
                       SATELLITE_PROVIDERS.md, EVALUATION.md, SECURITY.md, DATASETS.md
data/demo/            Synthetic sample imagery + manifest.json used by tests and the mock
                       satellite provider (regenerate via scripts/generate_demo_data.py)
```
