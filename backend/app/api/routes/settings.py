from __future__ import annotations

import os

from app.database.schemas import SettingsOut, SettingsUpdate
from app.utils.language import normalize_requested_language
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/settings", tags=["settings"])


_RUNTIME_SETTINGS = {
    "default_report_language": os.getenv("DEFAULT_REPORT_LANGUAGE", "auto"),
    "speaker_match_threshold": float(os.getenv("SPEAKER_MATCH_THRESHOLD", "0.70")),
    "llm_model": os.getenv("LLM_MODEL", "llama-3.3-70b-versatile"),
}


@router.get("", response_model=SettingsOut)
async def get_settings() -> SettingsOut:
    return SettingsOut(**_RUNTIME_SETTINGS)


@router.put("", response_model=SettingsOut)
async def update_settings(payload: SettingsUpdate) -> SettingsOut:
    if payload.default_report_language is not None:
        _RUNTIME_SETTINGS["default_report_language"] = normalize_requested_language(payload.default_report_language)
    if payload.speaker_match_threshold is not None:
        if not 0 <= payload.speaker_match_threshold <= 1:
            raise HTTPException(status_code=400, detail="speaker_match_threshold must be between 0 and 1")
        _RUNTIME_SETTINGS["speaker_match_threshold"] = float(payload.speaker_match_threshold)
        os.environ["SPEAKER_MATCH_THRESHOLD"] = str(payload.speaker_match_threshold)
    if payload.llm_model is not None:
        _RUNTIME_SETTINGS["llm_model"] = payload.llm_model
        os.environ["LLM_MODEL"] = payload.llm_model

    return SettingsOut(**_RUNTIME_SETTINGS)
