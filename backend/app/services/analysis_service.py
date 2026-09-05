"""Shared helper so both POST /query and POST /analysis trigger the exact
same pipeline -- no duplicated orchestration logic between the two
endpoints the spec calls for.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.message import Message
from app.tasks.queue import get_task_queue


def submit_analysis(
    db: Session, session_id: str | None, query_text: str, image_ids: list[str]
) -> str:
    if session_id:
        db.add(Message(session_id=session_id, role="user", content=query_text))
        db.commit()

    execution_id = get_task_queue().enqueue_analysis(db, session_id, query_text, image_ids)

    if session_id:
        from app.models.execution import Execution

        execution = db.get(Execution, execution_id)
        if execution and execution.result_json and execution.result_json.get("answer"):
            db.add(Message(session_id=session_id, role="assistant", content=execution.result_json["answer"]))
        elif execution and execution.status == "requires_user_input":
            db.add(
                Message(
                    session_id=session_id,
                    role="assistant",
                    content=(execution.result_json or {}).get("user_message", "Additional input is required."),
                )
            )
        db.commit()

    return execution_id
