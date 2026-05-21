from __future__ import annotations

from app.database.db import get_db
from app.database.schemas import (
    ConversationCreateIn,
    ConversationCreateOut,
    ConversationOut,
    MessageOut,
)
from app.services.conversation_service import (
    create_conversation,
    get_conversation,
    get_conversation_messages,
    list_report_conversations,
)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(tags=["conversations"])


@router.post("/conversations", response_model=ConversationCreateOut)
async def create_conversation_endpoint(payload: ConversationCreateIn, db: Session = Depends(get_db)) -> ConversationCreateOut:
    try:
        conversation = create_conversation(db, report_id=payload.report_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return ConversationCreateOut(conversation_id=conversation.id)


@router.get("/reports/{report_id}/conversations", response_model=list[ConversationOut])
async def list_report_conversations_endpoint(report_id: int, db: Session = Depends(get_db)) -> list[ConversationOut]:
    rows = list_report_conversations(db, report_id=report_id)
    return [
        ConversationOut(id=r.id, report_id=r.report_id, title=r.title, created_at=r.created_at)
        for r in rows
    ]


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageOut])
async def list_conversation_messages_endpoint(conversation_id: int, db: Session = Depends(get_db)) -> list[MessageOut]:
    conversation = get_conversation(db, conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    rows = get_conversation_messages(db, conversation_id=conversation_id)
    return [MessageOut(role=m.role, content=m.content) for m in rows]
