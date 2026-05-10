from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import whisper


_ALLOWED_MODELS = {"base", "small"}
_DEFAULT_MODEL = "base"


def transcribe_audio(audio_path: str) -> dict[str, Any]:
    """
    Transcribe an audio file with a local Whisper model.

    Model selection:
    - Uses env var WHISPER_MODEL if set.
    - Allowed values: "base", "small".
    - Defaults to "base".
    """
    if not audio_path or not audio_path.strip():
        raise ValueError("`audio_path` must be a non-empty string.")

    path = Path(audio_path).expanduser().resolve()
    if not path.exists():
        raise FileNotFoundError(f"Audio file not found: {path}")
    if not path.is_file():
        raise ValueError(f"Audio path is not a file: {path}")

    model_name = os.getenv("WHISPER_MODEL", _DEFAULT_MODEL).strip().lower()
    if model_name not in _ALLOWED_MODELS:
        raise ValueError(
            f"Unsupported WHISPER_MODEL '{model_name}'. "
            f"Use one of: {sorted(_ALLOWED_MODELS)}."
        )

    try:
        model = whisper.load_model(model_name)
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(f"Failed to load Whisper model '{model_name}': {exc}") from exc

    try:
        result = model.transcribe(str(path))
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(f"Failed to transcribe audio '{path}': {exc}") from exc

    text = str(result.get("text", "")).strip()
    raw_segments = result.get("segments", []) or []

    segments: list[dict[str, Any]] = []
    for segment in raw_segments:
        if not isinstance(segment, dict):
            continue
        start = float(segment.get("start", 0.0))
        end = float(segment.get("end", 0.0))
        seg_text = str(segment.get("text", "")).strip()
        segments.append({"start": start, "end": end, "text": seg_text})

    language = str(result.get("language", "")).strip().lower()
    return {"text": text, "segments": segments, "language": language}
