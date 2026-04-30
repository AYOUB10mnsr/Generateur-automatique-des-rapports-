from __future__ import annotations

from typing import Any

from database.db import SessionLocal, init_db
from database.models import Report, Segment
from services.exporter import export_pdf
from services.extractor import extract_audio
from services.reporter import summarize_text
from services.speaker import process_speakers
from sqlalchemy.orm import Session
from services.transcriber import transcribe_audio


def run_pipeline(source: str) -> dict[str, Any]:
    """
    End-to-end processing pipeline:
    1) accept source (YouTube URL or local file)
    2) extract audio
    3) transcribe
    4) identify speakers
    5) merge speaker labels with transcript segments
    6) generate summary
    7) export PDF
    8) save everything to database
    """
    if not source or not source.strip():
        raise ValueError("`source` must be a non-empty string.")

    source = source.strip()
    init_db()

    audio_path = extract_audio(source)
    transcription = transcribe_audio(audio_path)
    speaker_segments = process_speakers(audio_path)
    merged_segments = _merge_speakers_with_transcript(
        transcription.get("segments", []),
        speaker_segments,
    )

    merged_text = _build_speaker_aware_text(merged_segments)
    summary = summarize_text(merged_text or transcription.get("text", ""))

    speakers = _unique_speakers(merged_segments)
    pdf_path = export_pdf(summary=summary, filename="report.pdf", speakers=speakers)

    session = SessionLocal()
    try:
        saved_report = save_report(
            source=source,
            transcription=merged_text or transcription.get("text", ""),
            summary=summary,
            segments=merged_segments,
            db=session,
        )
        report_id = int(saved_report.id)
    finally:
        session.close()

    return {
        "report_id": report_id,
        "audio_path": audio_path,
        "pdf_path": pdf_path,
        "summary": summary,
        "segments": merged_segments,
    }


def _merge_speakers_with_transcript(
    transcript_segments: list[dict[str, Any]],
    speaker_segments: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Attach the best speaker label to each transcript segment by max overlap.
    """
    merged: list[dict[str, Any]] = []
    for seg in transcript_segments or []:
        start = float(seg.get("start", 0.0))
        end = float(seg.get("end", 0.0))
        text = str(seg.get("text", "")).strip()
        speaker = _best_speaker_for_interval(start, end, speaker_segments)
        merged.append({"start": start, "end": end, "speaker": speaker, "text": text})
    return merged


def _best_speaker_for_interval(
    start: float,
    end: float,
    speaker_segments: list[dict[str, Any]],
) -> str:
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
        if not text:
            continue
        lines.append(f"{speaker}: {text}")
    return "\n".join(lines)


def _unique_speakers(segments: list[dict[str, Any]]) -> list[str]:
    names = []
    seen = set()
    for seg in segments:
        name = str(seg.get("speaker", "Unknown")).strip() or "Unknown"
        if name not in seen:
            seen.add(name)
            names.append(name)
    return names


def save_report(
    source: str,
    transcription: str,
    summary: str,
    segments: list[dict[str, Any]],
    db: Session,
) -> Report:
    """
    Save a report and its transcript/summary plus all speaker segments.
    """
    if db is None:
        raise ValueError("`db` session is required.")

    try:
        report = Report(
            source=source,
            transcription=transcription,
            summary=summary,
        )
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
    except Exception:
        db.rollback()
        raise


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run meeting processing pipeline.")
    parser.add_argument("source", help="YouTube URL or local audio/video file path")
    args = parser.parse_args()

    result = run_pipeline(args.source)
    print(f"Report saved with id: {result['report_id']}")
    print(f"PDF: {result['pdf_path']}")
