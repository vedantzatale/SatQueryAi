# Troubleshooting

**`alembic` can't find `app` module / `ModuleNotFoundError: app`**
Run alembic commands from inside `backend/` with the venv activated — `alembic.ini` has
`prepend_sys_path = .` which resolves relative to the current working directory.

**Mock satellite provider returns "Demo dataset manifest not found"**
Run `python scripts/generate_demo_data.py` from the repo root first. It writes
`data/demo/metadata/manifest.json` plus the synthetic GeoTIFFs the mock provider serves.

**Satellite retrieval says "No compatible before/after scene pair could be found"**
This is the pair-aware `SceneRanker` correctly refusing to fabricate a match — it only
pairs scenes whose acquisition dates fall within its temporal tolerance (200 days by
default, `app/satellite/scene_ranker.py::_temporal_fit`) of the requested before/after
dates. With the synthetic demo dataset, this means very specific date ranges (see the
generated `manifest.json` for the actual synthetic acquisition dates) succeed; arbitrary
date ranges may legitimately find nothing, which is correct behavior, not a bug.

**Change analysis returns "Change detected, but physical area cannot be reliably
calculated..."**
This is expected and correct when the uploaded/retrieved images have no CRS (e.g. plain
PNG/JPEG, or a GeoTIFF without embedded georeferencing) — the system will never compute a
square-meter area from ungeoreferenced pixels. Upload a georeferenced GeoTIFF if you need
physical area.

**Frontend shows nothing after upload / query hangs**
Check `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.local` points at the running backend,
and that CORS_ALLOWED_ORIGINS in the backend's `.env` includes the frontend's origin
(default `http://localhost:3000`).

**`pip install -e ".[dev]"` fails building `rasterio`/`geopandas`/`GDAL` on Windows**
This build session installed cleanly via prebuilt wheels on Python 3.11–3.13 without any
system GDAL install. If it fails on your machine, pin to the exact versions in
`backend/pyproject.toml` (wheel availability varies by Python version) or install GDAL via
conda-forge / OSGeo4W first.

**Docker: `docker` not recognized in the shell**
Seen during this build — Docker Desktop had just been installed and the shell's PATH
hadn't refreshed. Open a new terminal (or reboot the PATH-dependent shell) and retry
`docker --version` before assuming Docker isn't installed.
