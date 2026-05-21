from __future__ import annotations

from app.database.db import get_db
from app.database.schemas import RAGQueryIn, RAGQueryOut
from app.services.conversation_service import add_message, get_conversation, get_conversation_messages
from app.services.rag_service import get_rag_service
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/rag", tags=["rag"])


@router.post("/query", response_model=RAGQueryOut)
async def rag_query(payload: RAGQueryIn, db: Session = Depends(get_db)) -> RAGQueryOut:
    print(
        f"[RAG API] /rag/query question='{payload.question}' top_k={payload.top_k} "
        f"report_id={payload.report_id} speaker={payload.speaker}"
    )
    try:
        conversation_history: list[dict[str, str]] = []
        if payload.conversation_id is not None:
            conversation = get_conversation(db, payload.conversation_id)
            if conversation is None:
                raise HTTPException(status_code=404, detail="Conversation not found.")
            existing = get_conversation_messages(db, payload.conversation_id)
            conversation_history = [{"role": m.role, "content": m.content} for m in existing[-5:]]
            add_message(db, payload.conversation_id, "user", payload.question)

        rag_service = get_rag_service()
        result = rag_service.query(
            question=payload.question,
            top_k=payload.top_k,
            report_id=payload.report_id,
            speaker=payload.speaker,
            conversation_history=conversation_history,
        )
        if payload.conversation_id is not None:
            add_message(db, payload.conversation_id, "assistant", result.answer)
    except Exception as exc:  # noqa: BLE001
        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"RAG service unavailable: {exc}") from exc
    print(f"[RAG API] answer_length={len(result.answer or '')}")
    return RAGQueryOut(answer=result.answer)


@router.get("/debug/{report_id}")
async def rag_debug(report_id: int, question: str | None = None, top_k: int = 8) -> dict:
    print(f"[RAG API] /rag/debug/{report_id} question='{question}' top_k={top_k}")
    try:
        rag_service = get_rag_service()
        return rag_service.get_debug_snapshot(report_id=report_id, question=question, top_k=top_k)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"RAG debug unavailable: {exc}") from exc
