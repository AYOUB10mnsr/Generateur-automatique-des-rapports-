from __future__ import annotations

from ai_provider import AIProviderManager
from fastapi import APIRouter

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/health")
async def ai_health() -> dict[str, str | bool]:
    manager = AIProviderManager()
    return manager.health()

