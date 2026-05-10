from __future__ import annotations

from services.extractor import extract_audio


def extract_from_source(source: str) -> str:
    return extract_audio(source)
