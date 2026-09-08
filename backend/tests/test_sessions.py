from __future__ import annotations

from pathlib import Path

from sqlalchemy.orm import Session

from app.models.evidence import Evidence
from app.models.execution import Execution, ExecutionStep
from app.models.image import Image
from app.models.message import Message
from app.models.query import Query
from app.models.task_plan import TaskPlanRecord


def test_submit_query_against_nonexistent_session_returns_404_not_500(client):
    """Regression test: the frontend's default sessionId placeholder
    ("session-new", before a real session is ever created) or a stale
    "temp-*" id used to be sent straight through to /api/v1/query as if it
    were real. SQLite silently accepted the resulting orphaned insert;
    Postgres/Neon correctly rejected it with an opaque 500 IntegrityError.
    The frontend no longer sends these (see ChatArea.tsx::ensureSession),
    but the endpoint itself must also fail clearly, not with a raw 500,
    for any other client that gets this wrong."""
    response = client.post(
        "/api/v1/query", json={"session_id": "session-new", "text": "hi", "image_ids": []}
    )
    assert response.status_code == 404
    assert "session-new" in response.json()["detail"]


def test_rename_and_delete_session(client):
    session_id = client.post("/api/v1/sessions", json={"title": "Original"}).json()["id"]

    renamed = client.patch(f"/api/v1/sessions/{session_id}", json={"title": "Renamed"})
    assert renamed.status_code == 200
    assert renamed.json()["title"] == "Renamed"

    deleted = client.delete(f"/api/v1/sessions/{session_id}")
    assert deleted.status_code == 204
    assert client.get(f"/api/v1/sessions/{session_id}").status_code == 404


def test_delete_session_with_full_analysis_history_cascades_correctly(client, demo_data_dir: Path, db: Session):
    """Regression test: deleting a session that has a real execution history
    (query -> task_plan -> execution -> execution_steps/evidence) 500'd with
    a ForeignKeyViolation the first time this ran against a real FK-enforcing
    database (Neon/Postgres) -- SQLite silently allowed the incomplete
    version of this delete to "succeed" while leaving orphaned rows behind,
    which is exactly how it shipped unnoticed. The engine now enables
    `PRAGMA foreign_keys=ON` for SQLite too (see app/db/session.py), so this
    test exercises the same ordering constraints without needing Postgres.
    """
    session_id = client.post("/api/v1/sessions", json={}).json()["id"]

    with open(demo_data_dir / "temporal" / "before" / "sample_before.tif", "rb") as f:
        before_id = client.post(
            f"/api/v1/images/upload?session_id={session_id}",
            files={"file": ("sample_before.tif", f, "image/tiff")},
        ).json()["image_id"]
    with open(demo_data_dir / "temporal" / "after" / "sample_after.tif", "rb") as f:
        after_id = client.post(
            f"/api/v1/images/upload?session_id={session_id}",
            files={"file": ("sample_after.tif", f, "image/tiff")},
        ).json()["image_id"]

    response = client.post(
        "/api/v1/query",
        json={"session_id": session_id, "text": "What changed?", "image_ids": [before_id, after_id]},
    )
    assert response.status_code == 200
    execution_id = response.json()["execution_id"]

    # Sanity check: the full chain this delete has to walk actually exists.
    assert db.query(Query).filter_by(session_id=session_id).count() > 0
    assert db.query(TaskPlanRecord).count() > 0
    assert db.query(Execution).filter_by(id=execution_id).count() == 1
    assert db.query(ExecutionStep).filter_by(execution_id=execution_id).count() > 0
    assert db.query(Image).filter_by(session_id=session_id).count() == 2

    deleted = client.delete(f"/api/v1/sessions/{session_id}")
    assert deleted.status_code == 204, deleted.text

    db.expire_all()
    assert db.query(Query).filter_by(session_id=session_id).count() == 0
    assert db.query(Execution).filter_by(id=execution_id).count() == 0
    assert db.query(ExecutionStep).filter_by(execution_id=execution_id).count() == 0
    assert db.query(Evidence).filter_by(execution_id=execution_id).count() == 0
    assert db.query(Image).filter_by(session_id=session_id).count() == 0
    assert db.query(Message).filter_by(session_id=session_id).count() == 0
    assert client.get(f"/api/v1/sessions/{session_id}").status_code == 404
