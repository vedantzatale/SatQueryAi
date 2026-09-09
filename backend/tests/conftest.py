"""Test configuration. Sets an isolated temp SQLite DB and local storage
root BEFORE any app module is imported, so tests never touch the dev
database or dev object storage.
"""
from __future__ import annotations

import os
import tempfile
from pathlib import Path

_TEST_DIR = Path(tempfile.mkdtemp(prefix="satquery_test_"))
os.environ["DATABASE_URL"] = f"sqlite:///{(_TEST_DIR / 'test.db').as_posix()}"
os.environ["LOCAL_STORAGE_ROOT"] = str(_TEST_DIR / "storage")
os.environ["DEMO_MODE"] = "true"
os.environ["TASK_BACKEND"] = "inline"
os.environ["STORAGE_BACKEND"] = "local"
# Cleared, not just left pointed at a developer's real Redis: the model
# output/raster caches are content-addressed by checksum+question, and the
# test suite's fixture images/questions are fixed strings, so a real Redis
# retains entries across runs (30-day TTL) and later runs silently see
# "already cached" instead of the fresh miss they assert on. get_cache_backend()
# falls back to a fresh in-memory cache per test process when this is unset.
os.environ["REDIS_URL"] = ""
# Cleared for the same reason: with real credentials configured, the
# location-retrieval tests silently switched from the deterministic mock
# provider to a live Copernicus search+download (confirmed working when
# this surfaced -- a real scene really was found and downloaded), which
# both burns real API quota on every test run and makes the "falls back to
# the mock provider" assertions depend on real-world data availability.
os.environ["COPERNICUS_CLIENT_ID"] = ""
os.environ["COPERNICUS_CLIENT_SECRET"] = ""

# Tests exercise the deterministic mock/heuristic adapters, never real
# weights, regardless of what a developer's local .env points *_MODEL_PATH
# at -- real inference is slow (real Qwen3 generation alone is ~1-2 minutes
# on CPU) and multi-GB, neither of which belongs in the automated suite.
for _model_path_var in (
    "AGENT_MODEL_PATH",
    "INTERNVL_MODEL_PATH",
    "PRITHVI_MODEL_PATH",
    "CHANGE_MODEL_PATH",
    "CROMA_MODEL_PATH",
    "SAR_MODEL_PATH",
    "TERRAMIND_MODEL_PATH",
):
    os.environ[_model_path_var] = ""

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from app.db.base import Base  # noqa: E402
from app.db.session import SessionLocal, engine  # noqa: E402
import app.models  # noqa: F401,E402


@pytest.fixture(scope="session", autouse=True)
def _create_tables():
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture()
def db() -> Session:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client() -> TestClient:
    from app.main import app

    return TestClient(app)


@pytest.fixture(scope="session")
def demo_data_dir() -> Path:
    repo_root = Path(__file__).resolve().parents[2]
    demo_dir = repo_root / "data" / "demo"
    if not (demo_dir / "metadata" / "manifest.json").exists():
        import subprocess
        import sys

        subprocess.run([sys.executable, str(repo_root / "scripts" / "generate_demo_data.py")], check=True)
    return demo_dir
