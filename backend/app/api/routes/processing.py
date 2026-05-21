from __future__ import annotations

import tempfile
from pathlib import Path

from app.core.config import settings
from app.database.db import get_db
from app.database.schemas import ProcessResponse
from app.database.models import Report
from app.services.report_service import run_pipeline
from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

router = APIRouter(prefix="/process", tags=["processing"])


@router.post("/file", response_model=ProcessResponse)
async def process_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    lang: str = Form("auto"),
    db: Session = Depends(get_db),
) -> ProcessResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing uploaded file name.")

    suffix = Path(file.filename).suffix or ".wav"
    tmp_path = Path(tempfile.mkstemp(prefix="meeting_upload_", suffix=suffix)[1])

    try:
        content = await file.read()
        tmp_path.write_bytes(content)

        print(f"[API] /process/file queued file={file.filename} lang={lang}")
        report = Report(
            source=file.filename,
            summary="",
            transcription="",
            report_language=lang if lang else "auto",
            status="processing",
            step="uploading",
            provider_used=None,
            llm_generation_ms=None,
        )
        db.add(report)
        db.commit()
        db.refresh(report)

        background_tasks.add_task(
            run_pipeline,
            int(report.id),
            str(tmp_path),
            lang,
            settings.outputs_dir,
            True,
        )

        return ProcessResponse(
            report_id=int(report.id),
            status="processing",
            step="uploading",
            message="Upload received. Processing has started.",
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        print(f"[PIPELINE] /process/file failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}") from exc
    finally:
        pass


@router.post("/youtube", response_model=ProcessResponse)
async def process_youtube(
    background_tasks: BackgroundTasks,
    url: str = Form(...),
    lang: str = Form("auto"),
    db: Session = Depends(get_db),
) -> ProcessResponse:
    if not url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty.")

    try:
        print(f"[API] /process/youtube queued url={url} lang={lang}")
        report = Report(
            source=url.strip(),
            summary="",
            transcription="",
            report_language=lang if lang else "auto",
            status="processing",
            step="uploading",
            provider_used=None,
            llm_generation_ms=None,
        )
        db.add(report)
        db.commit()
        db.refresh(report)

        background_tasks.add_task(
            run_pipeline,
            int(report.id),
            url.strip(),
            lang,
            settings.outputs_dir,
            False,
        )

        return ProcessResponse(
            report_id=int(report.id),
            status="processing",
            step="uploading",
            message="Request accepted. Processing has started.",
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        print(f"[PIPELINE] /process/youtube failed: {exc}")
        raise HTTPException(status_code=500, detail=f"YouTube processing failed: {exc}") from exc
