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

## What's fully done

See `docs/DEVELOPMENT.md` for the exhaustive checklist (✅/🟡/⬜ against the original spec).
Condensed version — all ✅ and verified via tests unless noted:

- **Backend**: FastAPI, all `/api/v1` endpoints from the spec, SQLAlchemy models + Alembic
  migrations (SQLite verified, Postgres+PostGIS migration written but not yet run — see
  Docker section above)
- **Agent**: mock Qwen3-style rule/keyword parser (en/hi/hinglish) producing a validated
  `TaskPlan`; the LLM output is never trusted/executed directly — a separate deterministic
  Policy Validator + capability-based Compatibility Matrix decides what's allowed to run
- **All 5 model adapters** (Agent, RS-VLM, Prithvi, ChangeFormer, CROMA): real interface,
  deterministic mocks that inspect real pixel data, swappable via `.env` model paths
- **Input validation**: real GDAL/rasterio inspection, modality detection (optical/
  multispectral/SAR), CRS/band/NaN checks, never assumes a TIFF is georeferenced
- **Preprocessing**: real reprojection/co-registration, every operation recorded for
  the transparency view
- **Satellite retrieval**: real Copernicus (CDSE) + USGS (M2M) availability checks,
  Bhoonidhi placeholder, pair-aware deterministic scene ranking, mock provider using a
  small synthetic demo dataset (`scripts/generate_demo_data.py`)
- **Evidence, confidence, audit, transparency**: all real, all wired end-to-end; confidence
  never fabricates a number in demo mode
- **PDF/GeoJSON export**: real ReportLab PDF with embedded evidence images; real
  pixel→WGS84 CRS reprojection for exported geometry (verified: exported coordinates land
  in the correct geographic range for the source UTM zone, not raw pixel/UTM values)
- **Multi-turn caching**: Redis-backed when configured, in-process fallback otherwise,
  proven via test to actually skip re-reading the raster on follow-up queries
- **Evaluation framework**: real metrics (exact-match, token-F1, bbox IoU, change-mask
  precision/recall/F1/IoU) in `ml/evaluation/`, isolated from the serving path, optionally
  posts results to `POST /api/v1/evaluation-runs`
- **Frontend**: Next.js three-column layout (sidebar / chat+upload / evidence+transparency),
  wired to the real API, verified live via Playwright (upload → ask → evidence → export,
  zero console errors)

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
