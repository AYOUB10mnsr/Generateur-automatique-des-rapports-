from __future__ import annotations

from pathlib import Path
from typing import Any, Callable

from app.database.models import Report, Segment
from app.services.export_service import build_pdf
from app.services.rag_service import get_rag_service
from app.services.extractor_service import extract_from_source
from app.services.transcription_service import transcribe
from app.utils.audio import ensure_dir
from app.utils.language import (
    normalize_detected_language,
    normalize_requested_language,
    resolve_report_language,
)
from database.db import SessionLocal
from services.reporter import summarize_text_with_provider
from services.speaker import process_speakers
from sqlalchemy.orm import Session


def run_processing_pipeline(
    source: str,
    requested_language: str,
    outputs_dir: Path,
    progress_hook: Callable[[str], None] | None = None,
) -> dict[str, Any]:
    if not source or not source.strip():
        raise ValueError("`source` must be a non-empty string.")

    print(f"[PIPELINE] Starting run for source: {source}")
    audio_path = extract_from_source(source)
    print(f"[PIPELINE] Audio ready: {audio_path}")

    if progress_hook:
        progress_hook("transcription")
    transcription = transcribe(audio_path)
    detected_language = normalize_detected_language(transcription.get("language", ""))
    requested_language = normalize_requested_language(requested_language)
    report_language = resolve_report_language(requested_language, detected_language)

    print(f"[LANG] Detected language: {detected_language}")
    print(f"[LANG] Requested language: {requested_language}")
    print(f"[LANG] Final report language: {report_language}")

    if progress_hook:
        progress_hook("diarization")
    speaker_segments = process_speakers(audio_path)
    if progress_hook:
        progress_hook("speaker_identification")
    merged_segments = _merge_speakers_with_transcript(transcription.get("segments", []), speaker_segments)
    merged_text = _build_speaker_aware_text(merged_segments)

    if progress_hook:
        progress_hook("summary_generation")
    print("[REPORT] Generating multilingual summary...")
    summary_result = summarize_text_with_provider(merged_text or transcription.get("text", ""), report_language=report_language)
    summary = summary_result.summary

    speakers = _unique_speakers(merged_segments)
    ensure_dir(outputs_dir)
    if progress_hook:
        progress_hook("pdf_export")
    pdf_path = build_pdf(
        summary=summary,
        filename=str((outputs_dir / "report.pdf").resolve()),
        speakers=speakers,
        report_language=report_language,
    )

    return {
        "audio_path": audio_path,
        "summary": summary,
        "segments": merged_segments,
        "pdf_path": pdf_path,
        "report_language": report_language,
        "transcription": merged_text or transcription.get("text", ""),
        "provider_used": summary_result.provider_used,
        "llm_generation_ms": summary_result.generation_ms,
    }


def save_report(db: Session, source: str, transcription: str, summary: str, report_language: str, segments: list[dict[str, Any]]) -> Report:
    report = Report(source=source, transcription=transcription, summary=summary, report_language=report_language)
    db.add(report)
    db.flush()

    for seg in segments or []:
        db.add(
            Segment(
                report_id=report.id,
                speaker_name=str(seg.get("speaker", "Unknown")),
                start=float(seg.get("start", 0.0)),
                end=float(seg.get("end", 0.0)),
                text=str(seg.get("text", "")),
            )
        )

    db.commit()
    db.refresh(report)
    return report


def list_reports(db: Session) -> list:
    return db.query(Report).order_by(Report.created_at.desc()).all()


def get_report(db: Session, report_id: int) -> Report | None:
    return db.query(Report).filter(Report.id == report_id).first()


def delete_report(db: Session, report_id: int) -> bool:
    report = get_report(db, report_id)
    if report is None:
        return False
    db.delete(report)
    db.commit()
    return True


def run_pipeline(
    report_id: int,
    file_path: str,
    requested_language: str,
    outputs_dir: Path,
    cleanup_local_file: bool = False,
) -> None:
    try:
        if not _set_report_state(report_id, "processing", "uploading", clear_error=True):
            print(f"[PIPELINE ERROR] report_id={report_id} not found")
            return

        print(f"[PIPELINE START] report_id={report_id}")

        def set_step(step: str) -> None:
            _set_report_state(report_id, "processing", step)
            print(f"[PIPELINE STEP] report_id={report_id} step={step}")

        result = run_processing_pipeline(file_path, requested_language, outputs_dir, progress_hook=set_step)

        _set_report_final_success(report_id, result)
        print(f"[PIPELINE SUCCESS] report_id={report_id}")
    except Exception as exc:  # noqa: BLE001
        _set_report_error(report_id, str(exc))
        print(f"[PIPELINE ERROR] report_id={report_id} error={exc}")
    finally:
        if cleanup_local_file:
            try:
                p = Path(file_path)
                if p.exists() and p.is_file():
                    p.unlink(missing_ok=True)
            except Exception:
                pass


def _set_report_state(report_id: int, status: str, step: str, clear_error: bool = False) -> bool:
    db = SessionLocal()
    try:
        report = db.query(Report).filter(Report.id == report_id).first()
        if report is None:
            return False
        report.status = status
        report.step = step
        if clear_error:
            report.error_message = None
        db.commit()
        db.refresh(report)
        print(f"[DB STATUS] report_id={report.id} status={report.status} step={report.step}")
        return True
    finally:
        db.close()


def _set_report_error(report_id: int, message: str) -> None:
    db = SessionLocal()
    try:
        report = db.query(Report).filter(Report.id == report_id).first()
        if report is None:
            return
        report.status = "error"
        report.step = "error"
        report.error_message = message
        db.commit()
        db.refresh(report)
        print(f"[DB STATUS] report_id={report.id} status={report.status} step={report.step}")
    finally:
        db.close()


def _set_report_final_success(report_id: int, result: dict[str, Any]) -> None:
    db = SessionLocal()
    try:
        report = db.query(Report).filter(Report.id == report_id).first()
        if report is None:
            return

        report.transcription = result["transcription"]
        report.summary = result["summary"]
        report.report_language = result["report_language"]
        report.pdf_path = result["pdf_path"]
        report.provider_used = result.get("provider_used")
        report.llm_generation_ms = result.get("llm_generation_ms")
        report.error_message = None

        db.query(Segment).filter(Segment.report_id == report.id).delete()
        for seg in result["segments"] or []:
            db.add(
                Segment(
                    report_id=report.id,
                    speaker_name=str(seg.get("speaker", "Unknown")),
                    start=float(seg.get("start", 0.0)),
                    end=float(seg.get("end", 0.0)),
                    text=str(seg.get("text", "")),
                )
            )

        report.status = "completed"
        report.step = "finished"
        db.commit()
        db.refresh(report)
        print(f"[DB STATUS] report_id={report.id} status={report.status} step={report.step}")

        try:
            rag_service = get_rag_service()
            rag_service.index_report(
                report_id=int(report.id),
                transcription=str(result.get("transcription", "")),
                summary=str(result.get("summary", "")),
                segments=list(result.get("segments", []) or []),
            )
        except Exception as exc:  # noqa: BLE001
            print(f"[RAG] Indexing failed for report_id={report.id}: {exc}")
    finally:
        db.close()


def _merge_speakers_with_transcript(transcript_segments: list[dict[str, Any]], speaker_segments: list[dict[str, Any]]) -> list[dict[str, Any]]:
    merged: list[dict[str, Any]] = []
    for seg in transcript_segments or []:
        start = float(seg.get("start", 0.0))
        end = float(seg.get("end", 0.0))
        text = str(seg.get("text", "")).strip()
        speaker = _best_speaker_for_interval(start, end, speaker_segments)
        merged.append({"start": start, "end": end, "speaker": speaker, "text": text})
    return merged


def _best_speaker_for_interval(start: float, end: float, speaker_segments: list[dict[str, Any]]) -> str:
    if end <= start:
        return "Unknown"
    best_name = "Unknown"
    best_overlap = 0.0
    for spk in speaker_segments or []:
        s_start = float(spk.get("start", 0.0))
        s_end = float(spk.get("end", 0.0))
        overlap = max(0.0, min(end, s_end) - max(start, s_start))
        if overlap > best_overlap:
            best_overlap = overlap
            best_name = str(spk.get("speaker", "Unknown"))
    return best_name


def _build_speaker_aware_text(segments: list[dict[str, Any]]) -> str:
    lines = []
    for seg in segments:
        speaker = str(seg.get("speaker", "Unknown"))
        text = str(seg.get("text", "")).strip()
        if text:
            lines.append(f"{speaker}: {text}")
    return "\n".join(lines)


def _unique_speakers(segments: list[dict[str, Any]]) -> list[str]:
    seen = set()
    names = []
    for seg in segments:
        name = str(seg.get("speaker", "Unknown")).strip() or "Unknown"
        if name not in seen:
            seen.add(name)
            names.append(name)
    return names
