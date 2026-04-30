from __future__ import annotations

import os
from typing import Any

from openai import OpenAI


def summarize_text(text: str) -> str:
    """
    Generate a structured meeting summary from a transcript with speaker labels.

    Returns a markdown/plain-text report with exactly these sections:
    1. Context
    2. Key points
    3. Decisions
    4. Action items
    """
    if not text or not text.strip():
        raise ValueError("`text` must be a non-empty string.")

    client, model = _build_client()
    system_prompt = _build_system_prompt()
    user_prompt = _build_user_prompt(text)

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
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(f"LLM summarization request failed: {exc}") from exc

    content = _extract_text(response)
    if not content:
        raise RuntimeError("LLM returned an empty summary.")
    return content.strip()


def _build_client() -> tuple[OpenAI, str]:
    # OpenAI-compatible configuration (works for OpenAI and Groq-style endpoints).
    api_key = (
        os.getenv("LLM_API_KEY")
        or os.getenv("OPENAI_API_KEY")
        or os.getenv("GROQ_API_KEY")
    )
    if not api_key:
        raise RuntimeError(
            "Missing API key. Set one of: LLM_API_KEY, OPENAI_API_KEY, GROQ_API_KEY."
        )

    base_url = os.getenv("LLM_BASE_URL") or os.getenv("OPENAI_BASE_URL")
    model = os.getenv("LLM_MODEL", "gpt-4o-mini")

    kwargs: dict[str, Any] = {"api_key": api_key}
    if base_url:
        kwargs["base_url"] = base_url

    return OpenAI(**kwargs), model


def _build_system_prompt() -> str:
    return (
        "You are a senior meeting analyst and executive communications specialist. "
        "Your task is to transform noisy meeting transcripts into precise, decision-grade summaries.\n\n"
        "Requirements:\n"
        "- Produce exactly 4 sections in this exact order and numbering:\n"
        "  1. Context\n"
        "  2. Key points\n"
        "  3. Decisions\n"
        "  4. Action items\n"
        "- Use concise, factual, professional language.\n"
        "- Infer the meeting objective and scope when not explicit, but do not invent facts.\n"
        "- Resolve pronouns when possible using speaker cues.\n"
        "- Deduplicate repeated points.\n"
        "- Prioritize outcomes, tradeoffs, commitments, and risks.\n"
        "- For Decisions: include only explicit decisions or high-confidence implied decisions.\n"
        "- For Action items: use bullet points with owner + task + due date/status when present. "
        "If owner/date are missing, mark as 'Owner: Unspecified' and/or 'Due: Unspecified'.\n"
        "- If no reliable content for a section, write 'None identified.'\n"
        "- Do not output JSON. Do not include preamble or commentary outside the 4 sections."
    )


def _build_user_prompt(transcript: str) -> str:
    return (
        "Create a structured meeting summary from the following transcript.\n\n"
        "Output template (follow strictly):\n"
        "1. Context\n"
        "<2-5 sentences or concise bullets>\n\n"
        "2. Key points\n"
        "- ...\n"
        "- ...\n\n"
        "3. Decisions\n"
        "- ...\n"
        "- ...\n\n"
        "4. Action items\n"
        "- Owner: <name or Unspecified> | Task: <task> | Due: <date or Unspecified>\n\n"
        "Transcript:\n"
        f"{transcript.strip()}"
    )


def _extract_text(response: Any) -> str:
    try:
        return response.choices[0].message.content or ""
    except Exception:  # noqa: BLE001
        return ""
