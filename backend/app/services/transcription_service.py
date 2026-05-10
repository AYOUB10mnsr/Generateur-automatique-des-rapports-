from __future__ import annotations

from typing import Any

from services.transcriber import transcribe_audio


def transcribe(audio_path: str) -> dict[str, Any]:
    return transcribe_audio(audio_path)
