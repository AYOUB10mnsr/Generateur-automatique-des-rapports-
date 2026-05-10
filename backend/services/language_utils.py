from __future__ import annotations

SUPPORTED_LANGUAGES = {"auto", "fr", "en", "ar"}
DEFAULT_REPORT_LANGUAGE = "en"


def normalize_requested_language(value: str | None) -> str:
    lang = (value or "auto").strip().lower()
    return lang if lang in SUPPORTED_LANGUAGES else "auto"


def normalize_detected_language(value: str | None) -> str:
    lang = (value or "").strip().lower()
    if not lang:
        return DEFAULT_REPORT_LANGUAGE
    if lang.startswith("fr"):
        return "fr"
    if lang.startswith("en"):
        return "en"
    if lang.startswith("ar"):
        return "ar"
    return DEFAULT_REPORT_LANGUAGE


def resolve_report_language(requested: str, detected: str) -> str:
    if requested == "auto":
        return normalize_detected_language(detected)
    if requested in {"fr", "en", "ar"}:
        return requested
    return DEFAULT_REPORT_LANGUAGE
