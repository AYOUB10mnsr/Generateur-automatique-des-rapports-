from __future__ import annotations

from pathlib import Path

from app.database.db import get_db
from app.database.schemas import SpeakerOut, SpeakerRegisterResponse
from app.services.speaker_service import (
    add_sample_to_speaker,
    delete_speaker,
    list_speakers,
    register_speaker_from_upload,
    rename_speaker,
)
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter(prefix="/speakers", tags=["speakers"])


class SpeakerRenameIn(BaseModel):
    name: str


@router.get("", response_model=list[SpeakerOut])
async def get_speakers(db: Session = Depends(get_db)) -> list[SpeakerOut]:
    print("[API] GET /speakers")
    rows = list_speakers(db)
    return [SpeakerOut(id=s.id, name=s.name, created_at=s.created_at) for s in rows]


@router.post("/register", response_model=SpeakerRegisterResponse)
async def register_speaker(
    name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> SpeakerRegisterResponse:
    if not name.strip():
        raise HTTPException(status_code=400, detail="Speaker name cannot be empty.")

    suffix = Path(file.filename or "sample.wav").suffix or ".wav"
    content = await file.read()

    try:
        speaker = register_speaker_from_upload(db, name.strip(), content, suffix=suffix)
        print(f"[SPEAKER] Registered: {speaker.name}")
        return SpeakerRegisterResponse(
            message=f"Speaker '{speaker.name}' registered successfully.",
            speaker=SpeakerOut(id=speaker.id, name=speaker.name, created_at=speaker.created_at),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Failed to register speaker: {exc}") from exc


@router.delete("/{speaker_id}")
async def remove_speaker(speaker_id: int, db: Session = Depends(get_db)) -> dict[str, bool | int]:
    deleted = delete_speaker(db, speaker_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Speaker not found.")
    print(f"[SPEAKER] Deleted speaker_id={speaker_id}")
    return {"id": speaker_id, "deleted": True}


@router.patch("/{speaker_id}", response_model=SpeakerOut)
async def update_speaker_name(speaker_id: int, payload: SpeakerRenameIn, db: Session = Depends(get_db)) -> SpeakerOut:
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="Speaker name cannot be empty.")
    speaker = rename_speaker(db, speaker_id, payload.name)
    if speaker is None:
        raise HTTPException(status_code=404, detail="Speaker not found.")
    return SpeakerOut(id=speaker.id, name=speaker.name, created_at=speaker.created_at)


@router.post("/{speaker_id}/samples", response_model=SpeakerOut)
async def append_speaker_sample(
    speaker_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> SpeakerOut:
    suffix = Path(file.filename or "sample.wav").suffix or ".wav"
    content = await file.read()
    speaker = add_sample_to_speaker(db, speaker_id, content, suffix=suffix)
    if speaker is None:
        raise HTTPException(status_code=404, detail="Speaker not found.")
    return SpeakerOut(id=speaker.id, name=speaker.name, created_at=speaker.created_at)
