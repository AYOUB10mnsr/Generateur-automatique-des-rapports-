from __future__ import annotations

import tempfile
from pathlib import Path

from app.database.models import Speaker
from resemblyzer import VoiceEncoder, preprocess_wav
from services.speaker import register_speaker, save_speaker_to_db
from sqlalchemy.orm import Session


def list_speakers(db: Session) -> list[Speaker]:
    return db.query(Speaker).order_by(Speaker.created_at.desc()).all()


def register_speaker_from_upload(db: Session, name: str, content: bytes, suffix: str = ".wav") -> Speaker:
    tmp_path = Path(tempfile.mkstemp(prefix="spk_upload_", suffix=suffix)[1])
    try:
        tmp_path.write_bytes(content)
        register_speaker(name=name, audio_path=str(tmp_path), db=db)
        speaker = db.query(Speaker).filter(Speaker.name == name.strip()).first()
        if speaker is None:
            raise RuntimeError("Speaker registration completed but speaker was not found in DB.")
        return speaker
    finally:
        try:
            tmp_path.unlink(missing_ok=True)
        except Exception:
            pass


def delete_speaker(db: Session, speaker_id: int) -> bool:
    speaker = db.query(Speaker).filter(Speaker.id == speaker_id).first()
    if speaker is None:
        return False
    db.delete(speaker)
    db.commit()
    return True


def rename_speaker(db: Session, speaker_id: int, new_name: str) -> Speaker | None:
    speaker = db.query(Speaker).filter(Speaker.id == speaker_id).first()
    if speaker is None:
        return None
    speaker.name = new_name.strip()
    db.commit()
    db.refresh(speaker)
    return speaker


def add_sample_to_speaker(db: Session, speaker_id: int, content: bytes, suffix: str = ".wav") -> Speaker | None:
    speaker = db.query(Speaker).filter(Speaker.id == speaker_id).first()
    if speaker is None:
        return None

    tmp_path = Path(tempfile.mkstemp(prefix="spk_sample_", suffix=suffix)[1])
    try:
        tmp_path.write_bytes(content)
        wav = preprocess_wav(str(tmp_path))
        embedding = VoiceEncoder().embed_utterance(wav)
        save_speaker_to_db(speaker.name, embedding, db)
        db.refresh(speaker)
        return speaker
    finally:
        try:
            tmp_path.unlink(missing_ok=True)
        except Exception:
            pass
