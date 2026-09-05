from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.chat_session import ChatSession
from app.models.message import Message

router = APIRouter(prefix="/sessions", tags=["sessions"])


class CreateSessionRequest(BaseModel):
    title: str | None = None
    language: str = "en"


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
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Session not found.")
    messages = db.query(Message).filter_by(session_id=session_id).order_by(Message.created_at.asc()).all()
    return SessionDetailResponse(
        id=session.id,
        title=session.title,
        language=session.language,
        created_at=session.created_at.isoformat(),
        messages=[
            MessageResponse(id=m.id, role=m.role, content=m.content, created_at=m.created_at.isoformat())
            for m in messages
        ],
    )
