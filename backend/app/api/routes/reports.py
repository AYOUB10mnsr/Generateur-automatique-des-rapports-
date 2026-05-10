from __future__ import annotations

from pathlib import Path

from app.core.config import settings
from app.database.db import get_db
from app.database.schemas import ReportDeleteOut, ReportListItem, ReportOut, ReportStatusResponse, SegmentOut
from app.services.export_service import build_pdf
from app.services.report_service import delete_report, get_report, list_reports
from fastapi import APIRouter, Depends, HTTPException
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("", response_model=list[ReportListItem])
async def get_reports(db: Session = Depends(get_db)) -> list[ReportListItem]:
    print("[API] GET /reports")
    rows = list_reports(db)
    return [
        ReportListItem(
            id=r.id,
            source=r.source,
            report_language=r.report_language,
            status=r.status,
            step=r.step,
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.get("/{report_id}", response_model=ReportOut)
async def get_report_by_id(report_id: int, db: Session = Depends(get_db)) -> ReportOut:
    print(f"[API] GET /reports/{report_id}")
    report = get_report(db, report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found.")

    segments = [
        SegmentOut(
            id=s.id,
            start=s.start,
            end=s.end,
            speaker_name=s.speaker_name,
            text=s.text,
        )
        for s in report.segments
    ]

    return ReportOut(
        id=report.id,
        source=report.source,
        summary=report.summary,
        transcription=report.transcription,
        report_language=report.report_language,
        status=report.status,
        step=report.step,
        error_message=report.error_message,
        pdf_path=report.pdf_path,
        created_at=report.created_at,
        segments=segments,
    )


@router.delete("/{report_id}", response_model=ReportDeleteOut)
async def delete_report_by_id(report_id: int, db: Session = Depends(get_db)) -> ReportDeleteOut:
    print(f"[API] DELETE /reports/{report_id}")
    deleted = delete_report(db, report_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Report not found.")
    return ReportDeleteOut(id=report_id, deleted=True)


@router.get("/{report_id}/pdf")
async def download_report_pdf(report_id: int, db: Session = Depends(get_db)) -> FileResponse:
    report = get_report(db, report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found.")
    if report.status != "completed":
        raise HTTPException(status_code=409, detail={"message": "Report still processing"})

    pdf_path = Path(settings.outputs_dir) / f"report_{report_id}.pdf"
    speakers = []
    for seg in report.segments:
        if seg.speaker_name not in speakers:
            speakers.append(seg.speaker_name)
    await run_in_threadpool(
        build_pdf,
        report.summary,
        str(pdf_path),
        speakers,
        report.report_language,
    )
    return FileResponse(
        path=str(pdf_path),
        filename=f"report-{report_id}.pdf",
        media_type="application/pdf",
    )


@router.get("/{report_id}/status", response_model=ReportStatusResponse)
async def get_report_status(report_id: int, db: Session = Depends(get_db)) -> ReportStatusResponse:
    report = get_report(db, report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found.")

    step_messages = {
        "uploading": "Server is preparing your uploaded file...",
        "transcription": "Server is transcribing your meeting...",
        "diarization": "Detecting speakers...",
        "speaker_identification": "Matching voices with registered speakers...",
        "summary_generation": "Generating AI meeting summary...",
        "pdf_export": "Creating PDF report...",
        "finished": "Report generation finished.",
        "error": "Pipeline failed.",
    }

    if report.status == "processing":
        return ReportStatusResponse(
            id=report.id,
            status="processing",
            step=report.step,
            message=step_messages.get(report.step, "Processing..."),
        )
    if report.status == "error":
        return ReportStatusResponse(
            id=report.id,
            status="error",
            step=report.step,
            message=report.error_message or "Unknown processing error",
        )

    segments = [
        SegmentOut(
            id=s.id,
            start=s.start,
            end=s.end,
            speaker_name=s.speaker_name,
            text=s.text,
        )
        for s in report.segments
    ]
    full_report = ReportOut(
        id=report.id,
        source=report.source,
        summary=report.summary,
        transcription=report.transcription,
        report_language=report.report_language,
        status=report.status,
        step=report.step,
        error_message=report.error_message,
        pdf_path=report.pdf_path,
        created_at=report.created_at,
        segments=segments,
    )
    return ReportStatusResponse(
        id=report.id,
        status="completed",
        step="finished",
        message=step_messages["finished"],
        report=full_report,
    )
