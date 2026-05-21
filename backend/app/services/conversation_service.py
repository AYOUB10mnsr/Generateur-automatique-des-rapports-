from __future__ import annotations

from sqlalchemy.orm import Session

from app.database.models import Conversation, Message, Report


def create_conversation(db: Session, report_id: int, title: str | None = None) -> Conversation:
    report = db.query(Report).filter(Report.id == report_id).first()
    if report is None:
        raise ValueError("Report not found.")
    conversation = Conversation(report_id=report_id, title=title)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def list_report_conversations(db: Session, report_id: int) -> list[Conversation]:
    return (
        db.query(Conversation)
        .filter(Conversation.report_id == report_id)
        .order_by(Conversation.created_at.desc(), Conversation.id.desc())
        .all()
    )


def get_conversation_messages(db: Session, conversation_id: int) -> list[Message]:
    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc(), Message.id.asc())
        .all()
    )


def add_message(db: Session, conversation_id: int, role: str, content: str) -> Message:
    msg = Message(conversation_id=conversation_id, role=role, content=content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def get_conversation(db: Session, conversation_id: int) -> Conversation | None:
    return db.query(Conversation).filter(Conversation.id == conversation_id).first()
