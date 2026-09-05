from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.query import Query
from app.services.analysis_service import submit_analysis

router = APIRouter(prefix="/query", tags=["query"])


class SubmitQueryRequest(BaseModel):
    session_id: str
    text: str
    image_ids: list[str] = []


class SubmitQueryResponse(BaseModel):
    execution_id: str
    status: str


class QueryDetailResponse(BaseModel):
    id: str
    session_id: str
    raw_text: str
    detected_language: str


@router.post("", response_model=SubmitQueryResponse)
def submit_query(body: SubmitQueryRequest, db: Session = Depends(get_db)) -> SubmitQueryResponse:
    from app.models.execution import Execution

    execution_id = submit_analysis(db, body.session_id, body.text, body.image_ids)
    execution = db.get(Execution, execution_id)
    return SubmitQueryResponse(execution_id=execution_id, status=execution.status if execution else "queued")


@router.get("/{query_id}", response_model=QueryDetailResponse)
def get_query(query_id: str, db: Session = Depends(get_db)) -> QueryDetailResponse:
    query = db.get(Query, query_id)
    if query is None:
        raise HTTPException(status_code=404, detail="Query not found.")
    return QueryDetailResponse(
        id=query.id, session_id=query.session_id, raw_text=query.raw_text, detected_language=query.detected_language
    )
