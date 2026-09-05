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
