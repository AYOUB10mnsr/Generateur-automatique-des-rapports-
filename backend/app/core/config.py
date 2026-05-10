from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


load_dotenv()


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "AI Meeting Assistant API")
    app_version: str = os.getenv("APP_VERSION", "1.0.0")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    api_prefix: str = os.getenv("API_PREFIX", "")
    cors_origins: list[str] = tuple(
        x.strip() for x in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if x.strip()
    )
    backend_root: Path = Path(__file__).resolve().parents[2]
    outputs_dir: Path = Path(__file__).resolve().parents[2] / "app" / "outputs"
    temp_dir: Path = Path(__file__).resolve().parents[2] / "app" / "temp"


settings = Settings()
