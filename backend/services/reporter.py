from __future__ import annotations

from dataclasses import dataclass

from ai_provider import AIProviderManager

from services.language_utils import DEFAULT_REPORT_LANGUAGE
from services.prompt_builder import build_system_prompt, build_user_prompt


@dataclass(frozen=True)
class SummaryResult:
    summary: str
    provider_used: str
    generation_ms: float


def summarize_text(text: str, report_language: str = DEFAULT_REPORT_LANGUAGE) -> str:
    return summarize_text_with_provider(text=text, report_language=report_language).summary


def summarize_text_with_provider(text: str, report_language: str = DEFAULT_REPORT_LANGUAGE) -> SummaryResult:
    if not text or not text.strip():
        raise ValueError("`text` must be a non-empty string.")

    manager = AIProviderManager()
    system_prompt = build_system_prompt(report_language)
    user_prompt = build_user_prompt(text, report_language)
    full_prompt = f"{system_prompt}\n\n{user_prompt}"

    try:
        result = manager.generate(full_prompt)
    except Exception as exc:
        raise RuntimeError(f"LLM summarization request failed: {exc}") from exc

    return SummaryResult(summary=result.text, provider_used=result.provider, generation_ms=result.latency_ms)
