from __future__ import annotations

import os
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI

from services.language_utils import DEFAULT_REPORT_LANGUAGE
from services.prompt_builder import build_system_prompt, build_user_prompt

load_dotenv()


def summarize_text(text: str, report_language: str = DEFAULT_REPORT_LANGUAGE) -> str:
    if not text or not text.strip():
        raise ValueError("`text` must be a non-empty string.")

    client, model = _build_client()
    system_prompt = build_system_prompt(report_language)
    user_prompt = build_user_prompt(text, report_language)

    try:
        response = client.chat.completions.create(
            model=model,
            temperature=0.2,
            max_tokens=1200,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
    except Exception as exc:
        raise RuntimeError(f"LLM summarization request failed: {exc}") from exc

    content = _extract_text(response)
    if not content:
        raise RuntimeError("LLM returned an empty summary.")
    return content.strip()


def _build_client() -> tuple[OpenAI, str]:
    api_key = os.getenv("GROQ_API_KEY") or os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("LLM_BASE_URL") or "https://api.groq.com/openai/v1"
    model = os.getenv("LLM_MODEL") or "llama-3.3-70b-versatile"
    if not api_key:
        raise RuntimeError("Missing API key. Set GROQ_API_KEY in your .env file.")
    return OpenAI(api_key=api_key, base_url=base_url), model


def _extract_text(response: Any) -> str:
    try:
        return response.choices[0].message.content or ""
    except Exception:
        return ""
