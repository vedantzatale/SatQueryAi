from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.chat_session import ChatSession
from app.models.evidence import Evidence
from app.models.execution import Execution, ExecutionStep
from app.models.image import Image, ImageMetadata
from app.models.message import Message
from app.models.query import Query
from app.models.report import Report
from app.models.task_plan import TaskPlanRecord

router = APIRouter(prefix="/sessions", tags=["sessions"])


class CreateSessionRequest(BaseModel):
    title: str | None = None
    language: str = "en"


class RenameSessionRequest(BaseModel):
    title: str


class SessionResponse(BaseModel):
    id: str
    title: str
    language: str
    created_at: str


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: str
    execution_id: str | None = None


class SessionDetailResponse(SessionResponse):
    messages: list[MessageResponse]


@router.post("", response_model=SessionResponse)
def create_session(body: CreateSessionRequest, db: Session = Depends(get_db)) -> SessionResponse:
    session = ChatSession(title=body.title or "New Analysis", language=body.language)
    db.add(session)
    db.commit()
    return SessionResponse(
        id=session.id, title=session.title, language=session.language, created_at=session.created_at.isoformat()
    )


@router.get("", response_model=list[SessionResponse])
def list_sessions(db: Session = Depends(get_db)) -> list[SessionResponse]:
    sessions = db.query(ChatSession).order_by(ChatSession.created_at.desc()).all()
    return [
        SessionResponse(id=s.id, title=s.title, language=s.language, created_at=s.created_at.isoformat())
        for s in sessions
    ]


@router.get("/{session_id}", response_model=SessionDetailResponse)
def get_session(session_id: str, db: Session = Depends(get_db)) -> SessionDetailResponse:
    session = db.get(ChatSession, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")
    messages = db.query(Message).filter_by(session_id=session_id).order_by(Message.created_at.asc()).all()
    return SessionDetailResponse(
        id=session.id,
        title=session.title,
        language=session.language,
        created_at=session.created_at.isoformat(),
        messages=[
            MessageResponse(
                id=m.id,
                role=m.role,
                content=m.content,
                created_at=m.created_at.isoformat(),
                execution_id=m.execution_id,
            )
            for m in messages
        ],
    )


@router.patch("/{session_id}", response_model=SessionResponse)
def rename_session(session_id: str, body: RenameSessionRequest, db: Session = Depends(get_db)) -> SessionResponse:
    session = db.get(ChatSession, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")
    title = body.title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Title cannot be empty.")
    session.title = title[:300]
    db.commit()
    return SessionResponse(
        id=session.id, title=session.title, language=session.language, created_at=session.created_at.isoformat()
    )


@router.delete("/{session_id}", status_code=204)
def delete_session(session_id: str, db: Session = Depends(get_db)) -> None:
    """Deletes a session and everything that belongs to it.

    This looks like a straight parent-to-children walk, but two of the FKs
    point the "wrong" way and form a cycle: messages.execution_id ->
    executions, while executions <- task_plans <- queries <- messages
    (via queries.message_id). SQLite never enforced these, so an incomplete
    version of this (message/query rows only) silently worked there; a real
    FK-enforcing database (Postgres/Neon) rejects it with a ForeignKeyViolation
    the moment a row is still referenced. Breaking the message->execution
    edge first (nulling it, since the message rows themselves are deleted
    later in this same request) turns the cycle into a strict order:
    execution children -> executions -> task_plans -> images -> queries ->
    messages -> the session itself.
    """
    session = db.get(ChatSession, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    query_ids = [row[0] for row in db.query(Query.id).filter_by(session_id=session_id).all()]
    task_plan_ids = (
        [row[0] for row in db.query(TaskPlanRecord.id).filter(TaskPlanRecord.query_id.in_(query_ids)).all()]
        if query_ids
        else []
    )
    execution_ids = (
        [row[0] for row in db.query(Execution.id).filter(Execution.task_plan_id.in_(task_plan_ids)).all()]
        if task_plan_ids
        else []
    )

    if execution_ids:
        db.query(Message).filter(Message.execution_id.in_(execution_ids)).update(
            {Message.execution_id: None}, synchronize_session=False
        )
        db.query(ExecutionStep).filter(ExecutionStep.execution_id.in_(execution_ids)).delete(synchronize_session=False)
        db.query(Evidence).filter(Evidence.execution_id.in_(execution_ids)).delete(synchronize_session=False)
        db.query(Report).filter(Report.execution_id.in_(execution_ids)).delete(synchronize_session=False)
        db.query(AuditLog).filter(AuditLog.execution_id.in_(execution_ids)).delete(synchronize_session=False)
        db.query(Execution).filter(Execution.id.in_(execution_ids)).delete(synchronize_session=False)

    if task_plan_ids:
        db.query(TaskPlanRecord).filter(TaskPlanRecord.id.in_(task_plan_ids)).delete(synchronize_session=False)

    image_ids = [row[0] for row in db.query(Image.id).filter_by(session_id=session_id).all()]
    if image_ids:
        db.query(ImageMetadata).filter(ImageMetadata.image_id.in_(image_ids)).delete(synchronize_session=False)
        db.query(Image).filter(Image.id.in_(image_ids)).delete(synchronize_session=False)

    db.query(Query).filter_by(session_id=session_id).delete(synchronize_session=False)
    db.query(Message).filter_by(session_id=session_id).delete(synchronize_session=False)
    db.delete(session)
    db.commit()
