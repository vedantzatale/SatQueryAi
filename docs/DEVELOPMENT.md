# Development status

Honest checklist against the project's Definition of Done. `✅` = implemented and verified
(via `backend/tests/` and/or the Playwright smoke test); `🟡` = partially done / mocked by
design; `⬜` = not started in this build.

- ✅ Backend works (FastAPI, boots via `uvicorn app.main:app`, verified)
- ✅ Frontend works (Next.js, `npm run build` succeeds, verified live via Playwright)
- ✅ Database works (SQLite for local dev; Postgres+PostGIS schema via the same Alembic
  migrations, second migration adds real PostGIS geometry/GIST indexes on Postgres only)
- 🟡 Redis works (abstraction + health check implemented; inline task execution is the
  verified default path since this environment has no confirmed Redis/Docker; Celery path
  implemented in `app/tasks/celery_app.py` but not run against a live broker in this session)
- 🟡 MinIO works (abstraction + client implemented in `app/storage/object_storage.py`;
  verified path is the local-filesystem backend, since Docker wasn't confirmed running)
- ✅ Image upload works (`POST /images/upload`, verified with real GeoTIFF + PNG files)
- ✅ Validation works (real GDAL/rasterio inspection, modality detection, CRS/band/NaN
  checks — `backend/tests/test_validation.py`)
- ✅ Metadata extraction works (CRS, bounds, resolution, band count/descriptions, from
  actual file inspection — never fabricated for PNG/JPEG)
- ✅ Preprocessing works (reprojection, co-registration/alignment, recorded operations —
  `app/preprocessing/pipeline.py`)
- ✅ Agent works via configurable mock (rule/keyword TaskPlan parser for en/hi/hinglish);
  real Qwen3 activation path documented in `docs/MODELS.md`, not implemented
- ✅ Structured task planning works (`TaskPlan` Pydantic schema + Policy Validator +
  Compatibility Matrix — `backend/tests/test_compatibility.py`, `test_policy_validator.py`)
- ✅ Model registry works (`models.yaml` + capability-based resolution + health/fallback)
- ✅ InternVL adapter works via configurable mock placeholder (real activation documented,
  not implemented — no GPU/weights in this environment)
- ✅ Single-image VQA works (MVP Test 1, verified end-to-end)
- ✅ Captioning works (MVP Test 2, verified end-to-end)
- ✅ Grounding works (MVP Test 3, verified end-to-end with real bounding-box evidence)
- ✅ Bi-temporal workflow works (MVP Tests 4/5, verified end-to-end)
- ✅ ChangeFormer adapter works via configurable mock placeholder
- ✅ Change masks work (real difference+threshold, rendered as a PNG overlay)
- ✅ Area calculation works where valid (real GIS math from actual resolution; the spec's
  exact caveat message when ungeoreferenced — `backend/tests/test_area_calculation.py`)
- ✅ Optical encoder adapter works via configurable mock placeholder (Prithvi)
- 🟡 SAR encoder: no standalone SAR adapter by design (see `docs/MODELS.md`) — SAR
  representation is handled inside the CROMA adapter for the optical+SAR fusion path
- ✅ Fusion architecture works (CROMA mock, cross-modal agreement heuristic, MVP Test 6)
- ✅ Satellite provider abstraction works (`SatelliteDataProvider` ABC + Provider Manager)
- ✅ Copernicus adapter is implemented/configurable (real CDSE OData client; reports
  unavailable without credentials, never fabricates data)
- ✅ Bhoonidhi adapter is implemented/configurable (placeholder reporting "not configured")
- ✅ USGS adapter is implemented/configurable (real M2M availability check; scene search is
  a documented follow-up)
- ✅ Scene ranking works (pair-aware, deterministic — `backend/tests/test_scene_ranker.py`)
- ✅ Evidence rendering works (bbox/mask/overlay/before-after PNGs via OpenCV/PIL)
- ✅ Confidence service works (never fabricates a number in demo mode, splits model/input/
  evidence/agreement — `backend/tests/test_end_to_end.py`)
- ✅ Audit trail works (`execution_steps` + `audit_logs`, one row per state transition)
- ✅ Transparency panel works (`GET /analysis/{id}/transparency`, rendered in the frontend)
- ✅ PDF export (`app/reports/pdf_generator.py`, ReportLab, embeds real evidence images —
  `backend/tests/test_reports.py`)
- ✅ GeoJSON export (`app/reports/geojson_generator.py`, GeoPandas/Shapely, real pixel→WGS84
  reprojection via `app/evidence/geo_transform.py` — never exports un-reprojected or
  pixel-space coordinates as if they were geographic)
- ✅ Multi-turn chat works (session/message persistence, verified — MVP Test 10)
- ✅ Chat history works (sidebar + session restore, plus follow-up queries on the same
  image reuse cached preprocessing — `backend/tests/test_caching.py`)
- ✅ Caching works (`app/storage/cache.py`: Redis-backed when `REDIS_URL` is set, an
  in-process fallback otherwise so it never requires Redis to function; wired into
  `PreprocessingPipeline.load_single` keyed by image checksum)
- ✅ Fallback works (`ModelManager.get_for_capability`, audit-logged, never silent)
- ✅ Model versioning works (`version` field on every adapter + registry entry)
- 🟡 Evaluation framework works (real metric implementations + dataset adapters + CLI
  scripts in `ml/evaluation/`; not integrated with the `evaluation_runs` DB table yet)
- ✅ Docker Compose files exist and are structurally valid (`docker-compose.yml` + 3
  Dockerfiles); **not run against live Docker in this session** — Docker was not
  confirmed available in this environment (see below)
- ✅ Tests pass (32 backend + 6 ml, `pytest`)
- 🟡 Documentation exists (this file + ARCHITECTURE/MODELS/DATASETS/README are real and
  current; API/DEPLOYMENT/SECURITY/EVALUATION/TROUBLESHOOTING are present but brief)

## Docker

`docker-compose.yml`, `docker/backend.Dockerfile`, `docker/worker.Dockerfile`, and
`docker/frontend.Dockerfile` were written per the architecture plan but could not be
verified against a running Docker daemon in this environment (Docker was reported
installed mid-session but never became reachable from this shell — likely a PATH refresh
that needs a new terminal/session). **Before relying on the Docker path, run
`docker compose up --build` yourself and confirm all 6 services become healthy** — the
SQLite/local-storage/inline-task path has been verified thoroughly as the fallback.

## Suggested next steps, in priority order

1. Verify `docker compose up --build` end-to-end against Postgres/Redis/MinIO once Docker
   is reachable; run `alembic upgrade head` against the Postgres container.
2. Wire `ml/evaluation` results into the `evaluation_runs` table.
3. Real model integration, one adapter at a time, per `docs/MODELS.md`.
