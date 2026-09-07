# SatQuery AI

> Ask your satellite data a question. SatQuery finds, understands, explains and proves the answer.

SatQuery AI is an agentic orchestrator for remote-sensing image analysis — natural-language
query in, evidence-grounded and confidence-scored answer out — built around a dynamic
agent/policy/registry pipeline rather than a fixed model pipeline or a chatbot with an
upload button. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full design.

## Current state of this build

This is a working prototype covering the full architecture skeleton, with **real weight
integration for 4 of 5 models** — Qwen3-4B (task planning), ChangeFormer (change
detection), Prithvi-EO-2.0 (multispectral representation), and CROMA (optical+SAR fusion)
all run genuine inference when their `.env` path is set, with a byte-identical mock
fallback when it isn't. InternVL3-1B (single-image VQA/captioning/grounding) remains on
its heuristic mock by choice. Everything else — input validation, GDAL/rasterio metadata
extraction, modality detection, preprocessing/alignment, task routing, policy enforcement,
GIS area calculation, evidence rendering, audit/transparency recording, multilingual UI
(English/Hindi/Hinglish), and chat session history (rename/delete included) — is real, no
mock involved. Every mock result is still labeled `demo_mode: true` and is swappable for a
real model purely via `.env` — see [docs/MODELS.md](docs/MODELS.md) for exactly where to
get each checkpoint (they are **not** committed to this repo — see below).

Working end-to-end (verified via the real HTTP API and a Playwright browser smoke test):
single-image VQA/captioning/grounding, bi-temporal change detection with real area
quantification, optical+SAR fusion, satellite retrieval (synthetic demo provider) feeding
into change analysis, multi-turn chat/session persistence, the "How Was This Analyzed?"
transparency view, and PDF/GeoJSON export (with real pixel-to-WGS84 CRS reprojection for
exported bounding boxes — never raw pixel or source-CRS coordinates mislabeled as
geographic). See `backend/tests/test_end_to_end.py` and `backend/tests/test_reports.py`
for the MVP acceptance tests this covers.

**Not yet implemented** (see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the full
checklist): InternVL3-1B real-weight integration, Kubernetes manifests, and an actual run
of the evaluation framework against VRSBench/RSVQA/CDVQA/ISRO-SAC (dataset adapters +
metrics exist in `ml/`, including a pluggable ISRO/SAC manifest schema, but none has real
benchmark data checked out in this environment to run against).

## Model weights are not in this repository

`models/weights/` and any `.pt`/`.safetensors`/`.zip` file are gitignored — cloning this
repo gets you all the code and none of the checkpoints (they're multi-GB; GitHub rejects
anything over 100MB per file regardless). Without them the app runs fully in demo mode —
every model-backed feature falls back to a labeled heuristic automatically. To reproduce
real inference, download the checkpoints yourself and point `.env` at them — see
[docs/MODELS.md](docs/MODELS.md) for exact sources and directory layout.

## Running locally (no Docker required)

```bash
# Backend
cd backend
python -m venv .venv
source .venv/Scripts/activate  # or .venv/bin/activate on Linux/macOS
pip install -e ".[dev]"
cp ../.env.example ../.env      # DEMO_MODE=true, SQLite + local storage by default
alembic upgrade head
python ../scripts/generate_demo_data.py
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000, click **+ New Analysis**, upload a file from `data/demo/`, and
ask a question.

## Running with Docker Compose (full stack: Postgres+PostGIS, Redis, MinIO)

```bash
docker compose up --build
```

This starts Postgres/Redis/MinIO plus the backend, Celery worker, and frontend containers,
wired together via `docker-compose.yml`. Run `alembic upgrade head` once against the
Postgres container to apply migrations (including the PostGIS geometry columns that are a
no-op on SQLite).

## Tests

```bash
cd backend && source .venv/Scripts/activate && python -m pytest tests/ -v
```

32 tests cover input validation, the capability compatibility matrix, the policy validator
(including MVP Tests 8 and 9 — never running ChangeFormer on one image, never silently
treating two optical images as optical+SAR), scene ranking, GIS area calculation, and full
end-to-end HTTP flows for every MVP acceptance test.

## Repository layout

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the annotated tree and diagrams.
Short version: `backend/app/` is organized by responsibility (`validation/`,
`preprocessing/`, `model_adapters/`, `model_registry/`, `agents/`, `orchestration/`,
`satellite/`, `evidence/`, `confidence/`, `audit/`, `storage/`, `api/`); `ml/` holds
training/evaluation scaffolding kept separate from the serving path; `frontend/` is a
Next.js App Router app; `data/demo/` holds procedurally-generated synthetic demo imagery
(never real satellite data) plus its manifest.

## Configuration

Every external dependency is optional and controlled via `.env` — see `.env.example` for
the full list (database, Redis, MinIO, satellite provider credentials, model weight paths,
`DEVICE`, `DEMO_MODE`). Nothing here requires a real credential or GPU to run.
