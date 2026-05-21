from __future__ import annotations

import os
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any

from app.core.logging import get_logger
from dotenv import load_dotenv
from ollama import Client as OllamaClient
from openai import OpenAI

load_dotenv()

logger = get_logger(__name__)


@dataclass(frozen=True)
class ProviderResult:
    text: str
    provider: str
    latency_ms: float


class BaseProvider(ABC):
    name: str

    @abstractmethod
    def generate(self, prompt: str) -> ProviderResult:
        raise NotImplementedError

    @abstractmethod
    def health(self) -> bool:
        raise NotImplementedError


class GroqProvider(BaseProvider):
    name = "groq"

    def __init__(self) -> None:
        self.api_key = os.getenv("GROQ_API_KEY") or os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY")
        self.base_url = os.getenv("LLM_BASE_URL") or "https://api.groq.com/openai/v1"
        self.model = os.getenv("LLM_MODEL") or "llama-3.3-70b-versatile"
        self.timeout = float(os.getenv("GROQ_TIMEOUT_SECONDS", "30"))
        self.max_retries = int(os.getenv("GROQ_MAX_RETRIES", "1"))
        if not self.api_key:
            raise RuntimeError("Missing API key. Set GROQ_API_KEY in your .env file.")
        self.client = OpenAI(api_key=self.api_key, base_url=self.base_url, timeout=self.timeout)

    def generate(self, prompt: str) -> ProviderResult:
        if not prompt or not prompt.strip():
            raise ValueError("`prompt` must be a non-empty string.")

        last_error: Exception | None = None
        for attempt in range(1, self.max_retries + 2):
            started = time.perf_counter()
            try:
                logger.info("[AI] Using Groq provider... attempt=%s", attempt)
                response = self.client.chat.completions.create(
                    model=self.model,
                    temperature=0.2,
                    max_tokens=1200,
                    messages=[{"role": "user", "content": prompt}],
                    timeout=self.timeout,
                )
                text = _extract_openai_text(response).strip()
                if not text:
                    raise RuntimeError("Groq returned an empty summary.")
                latency_ms = (time.perf_counter() - started) * 1000
                return ProviderResult(text=text, provider=self.name, latency_ms=latency_ms)
            except Exception as exc:  # noqa: BLE001
                last_error = exc
                logger.error("[AI] Groq attempt failed: %s", exc)
                if attempt > self.max_retries:
                    break
        raise RuntimeError(f"Groq provider failed after retries: {last_error}") from last_error

    def health(self) -> bool:
        try:
            self.client.models.list(timeout=self.timeout)
            return True
        except Exception as exc:  # noqa: BLE001
            logger.warning("[AI] Groq health check failed: %s", exc)
            return False


class OllamaProvider(BaseProvider):
    name = "ollama"

    def __init__(self) -> None:
        self.host = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")
        self.model = "phi3:mini"
        self.timeout = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "45"))
        self.client = OllamaClient(host=self.host, timeout=self.timeout)

    def generate(self, prompt: str) -> ProviderResult:
        if not prompt or not prompt.strip():
            raise ValueError("`prompt` must be a non-empty string.")
        started = time.perf_counter()
        try:
            logger.info("[AI] Using Ollama provider... host=%s model=%s", self.host, self.model)
            response = self.client.generate(model=self.model, prompt=prompt)
        except Exception as exc:  # noqa: BLE001
            raise RuntimeError(f"Ollama generation failed: {exc}") from exc

        text = str(response.get("response", "")).strip()
        if not text:
            raise RuntimeError("Ollama returned an empty summary.")
        latency_ms = (time.perf_counter() - started) * 1000
        return ProviderResult(text=text, provider=self.name, latency_ms=latency_ms)

    def health(self) -> bool:
        try:
            self.client.list()
            return True
        except Exception as exc:  # noqa: BLE001
            logger.warning("[AI] Ollama health check failed: %s", exc)
            return False


class AIProviderManager:
    def __init__(self, groq_provider: GroqProvider | None = None, ollama_provider: OllamaProvider | None = None) -> None:
        self.groq_provider = groq_provider or GroqProvider()
        self.ollama_provider = ollama_provider or OllamaProvider()

    def generate(self, prompt: str) -> ProviderResult:
        try:
            return self.groq_provider.generate(prompt)
        except Exception as groq_exc:  # noqa: BLE001
            logger.error("[AI] Groq failed, switching to Ollama... error=%s", groq_exc)
            result = self.ollama_provider.generate(prompt)
            logger.info("[AI] Ollama fallback success.")
            return result

    def health(self) -> dict[str, Any]:
        groq_ok = self.groq_provider.health()
        ollama_ok = self.ollama_provider.health()
        return {
            "groq": "online" if groq_ok else "offline",
            "ollama": "online" if ollama_ok else "offline",
            "fallback_ready": ollama_ok,
        }


def _extract_openai_text(response: Any) -> str:
    try:
        return response.choices[0].message.content or ""
    except Exception:
        return ""
