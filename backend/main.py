from __future__ import annotations

from typing import Any

from database.db import SessionLocal, get_database_file_path, init_db
from database.models import Report, Segment
from services.exporter import export_pdf
from services.extractor import extract_audio
from services.language_utils import normalize_detected_language, normalize_requested_language, resolve_report_language
from services.reporter import summarize_text
from services.speaker import process_speakers
from sqlalchemy.orm import Session
from services.transcriber import transcribe_audio
from app.main import app as app


def run_pipeline(source: str, requested_language: str = "auto") -> dict[str, Any]:
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
    print(f"[PIPELINE] Starting run for source: {source}")
    print(f"[PIPELINE] SQLite DB path: {get_database_file_path()}")
    init_db()

    audio_path = extract_audio(source)
    print(f"[PIPELINE] Audio ready: {audio_path}")
    transcription = transcribe_audio(audio_path)
    print("[PIPELINE] Transcription complete.")
    detected_language = normalize_detected_language(transcription.get("language", ""))
    requested_language = normalize_requested_language(requested_language)
    final_report_language = resolve_report_language(requested_language, detected_language)
    print(f"[LANG] Detected language: {detected_language}")
    print(f"[LANG] Whisper detected language: {detected_language}")
    print(f"[LANG] Requested language: {requested_language}")
    print(f"[LANG] Final report language: {final_report_language}")
    speaker_segments = process_speakers(audio_path)
    print(f"[PIPELINE] Speaker identification complete. speaker_segments={len(speaker_segments)}")
    merged_segments = _merge_speakers_with_transcript(
        transcription.get("segments", []),
        speaker_segments,
    )
    print(f"[PIPELINE] Merged transcript segments: {len(merged_segments)}")

    merged_text = _build_speaker_aware_text(merged_segments)
    print("[REPORT] Generating multilingual summary...")
    summary = summarize_text(
        merged_text or transcription.get("text", ""),
        report_language=final_report_language,
    )
    print("[PIPELINE] Summary generation complete.")

    speakers = _unique_speakers(merged_segments)
    pdf_path = export_pdf(
        summary=summary,
        filename="report.pdf",
        speakers=speakers,
        report_language=final_report_language,
    )
    print(f"[PIPELINE] PDF exported: {pdf_path}")

    print("[DB] Creating SQLAlchemy session...")
    session = SessionLocal()
    try:
        saved_report = save_report(
            source=source,
            transcription=merged_text or transcription.get("text", ""),
            summary=summary,
            report_language=final_report_language,
            segments=merged_segments,
            db=session,
        )
        report_id = int(saved_report.id)
        print(f"[DB] Persistence successful. report_id={report_id}")
    except Exception as exc:
        print(f"[DB] Persistence failed in run_pipeline: {exc}")
        raise
    finally:
        print("[DB] Closing SQLAlchemy session.")
        session.close()

    return {
        "report_id": report_id,
        "audio_path": audio_path,
        "pdf_path": pdf_path,
        "summary": summary,
        "segments": merged_segments,
        "report_language": final_report_language,
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
    report_language: str,
    segments: list[dict[str, Any]],
    db: Session,
) -> Report:
    """
    Save a report and its transcript/summary plus all speaker segments.
    """
    if db is None:
        raise ValueError("`db` session is required.")

    try:
        print("[DB] Creating Report row...")
        report = Report(
            source=source,
            transcription=transcription,
            summary=summary,
            report_language=report_language,
        )
        db.add(report)
        db.flush()
        print(f"[DB] Report inserted with temporary id={report.id}")

        inserted_segments = 0
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
            inserted_segments += 1

        print(f"[DB] Segment rows prepared: {inserted_segments}")

        print("[DB] Committing transaction...")
        db.commit()
        db.refresh(report)
        print(f"[DB] Commit success for report_id={report.id}")
        return report
    except Exception as exc:
        print(f"[DB] Commit failed, rolling back. error={exc}")
        db.rollback()
        raise


def test_database_connection() -> bool:
    """
    Minimal standalone DB test:
    - create fake report
    - save it
    - query it back
    - print success/failure
    """
    print("[DB-TEST] Starting database connectivity test...")
    print(f"[DB-TEST] Using SQLite file: {get_database_file_path()}")
    init_db()

    db = SessionLocal()
    try:
        fake_source = "db_test_source"
        fake_transcription = "Speaker A: test transcription."
        fake_summary = "1. Context\nDB test run.\n\n2. Key points\n- Test insert.\n\n3. Decisions\nNone identified.\n\n4. Action items\nNone identified."
        fake_segments = [
            {"speaker": "Speaker A", "start": 0.0, "end": 1.5, "text": "test transcription"}
        ]

        saved = save_report(
            source=fake_source,
            transcription=fake_transcription,
            summary=fake_summary,
            report_language="en",
            segments=fake_segments,
            db=db,
        )

        fetched = db.query(Report).filter(Report.id == saved.id).first()
        if fetched is None:
            print("[DB-TEST] FAILURE: inserted report was not found.")
            return False

        seg_count = db.query(Segment).filter(Segment.report_id == saved.id).count()
        print(
            "[DB-TEST] SUCCESS: "
            f"report_id={saved.id}, source={fetched.source}, segments={seg_count}"
        )
        return True
    except Exception as exc:
        print(f"[DB-TEST] FAILURE: {exc}")
        return False
    finally:
        db.close()
        print("[DB-TEST] Session closed.")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run meeting processing pipeline.")
    parser.add_argument("source", nargs="?", help="YouTube URL or local audio/video file path")
    parser.add_argument(
        "--test-db",
        action="store_true",
        help="Run standalone database persistence test and exit.",
    )
    parser.add_argument(
        "--lang",
        choices=["auto", "fr", "en", "ar"],
        default="auto",
        help="Report language: auto (Whisper-detected), fr, en, or ar.",
    )
    args = parser.parse_args()

    if args.test_db:
        ok = test_database_connection()
        raise SystemExit(0 if ok else 1)

    if not args.source:
        parser.error("the following arguments are required: source (unless --test-db is used)")

    result = run_pipeline(args.source, requested_language=args.lang)
    print(f"Report saved with id: {result['report_id']}")
    print(f"PDF: {result['pdf_path']}")
