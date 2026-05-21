from __future__ import annotations

from fastapi import APIRouter

from app.api.routes import ai, analytics, conversations, processing, rag, reports, settings, speakers

router = APIRouter()
router.include_router(processing.router)
router.include_router(reports.router)
router.include_router(speakers.router)
router.include_router(settings.router)
router.include_router(analytics.router)
router.include_router(ai.router)
router.include_router(rag.router)
router.include_router(conversations.router)
