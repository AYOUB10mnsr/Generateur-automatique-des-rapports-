from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field


class SegmentOut(BaseModel):
    id: int | None = None
    start: float
    end: float
    speaker_name: str
    text: str


class ReportOut(BaseModel):
    id: int
    source: str
    summary: str
    transcription: str
    report_language: str
    status: str
    step: str
    error_message: str | None = None
    pdf_path: str | None = None
    created_at: datetime
    segments: list[SegmentOut] = []


class ReportListItem(BaseModel):
    id: int
    source: str
    report_language: str
    status: str
    step: str
    created_at: datetime


class ReportDeleteOut(BaseModel):
    id: int
    deleted: bool = True


class ProcessResponse(BaseModel):
    report_id: int
    status: str
    step: str | None = None
    message: str | None = None


class ReportStatusResponse(BaseModel):
    id: int
    status: str
    step: str | None = None
    message: str | None = None
    report: ReportOut | None = None


class SpeakerOut(BaseModel):
    id: int
    name: str
    created_at: datetime


class SpeakerRegisterResponse(BaseModel):
    message: str
    speaker: SpeakerOut


class SettingsOut(BaseModel):
    default_report_language: str = Field(default="auto")
    speaker_match_threshold: float = Field(default=0.70)
    llm_model: str = Field(default="llama-3.3-70b-versatile")


class SettingsUpdate(BaseModel):
    default_report_language: str | None = None
    speaker_match_threshold: float | None = None
    llm_model: str | None = None


class ErrorResponse(BaseModel):
    detail: str


class AnalyticsOut(BaseModel):
    total_reports: int
    total_segments: int
    languages: dict[str, int]
    top_speakers: list[dict[str, int | str]]
