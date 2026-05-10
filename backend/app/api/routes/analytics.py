from __future__ import annotations

from collections import Counter

from app.database.db import get_db
from app.database.models import Report, Segment
from app.database.schemas import AnalyticsOut
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("", response_model=AnalyticsOut)
async def get_analytics(db: Session = Depends(get_db)) -> AnalyticsOut:
    reports = db.query(Report).all()
    segments = db.query(Segment).all()

    lang_counts = Counter((r.report_language or "en") for r in reports)
    speaker_counts = Counter((s.speaker_name or "Unknown") for s in segments)
    top_speakers = [{"name": name, "turns": turns} for name, turns in speaker_counts.most_common(10)]

    return AnalyticsOut(
        total_reports=len(reports),
        total_segments=len(segments),
        languages=dict(lang_counts),
        top_speakers=top_speakers,
    )
