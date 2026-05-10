from __future__ import annotations

import gc
import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Any

import numpy as np
import soundfile as sf
import torch
from database.db import SessionLocal, init_db
from database.models import Speaker
from pyannote.audio import Pipeline
from pyannote.core import Annotation
from resemblyzer import VoiceEncoder, preprocess_wav
from sqlalchemy.orm import Session

os.environ["TORCHAUDIO_BACKEND"] = "soundfile"

_VOICE_ENCODER: VoiceEncoder | None = None


def _get_voice_encoder() -> VoiceEncoder:
    global _VOICE_ENCODER
    if _VOICE_ENCODER is None:
        _VOICE_ENCODER = VoiceEncoder()
        print("[SPEAKER] Loaded voice encoder model")
    return _VOICE_ENCODER


def save_speaker_to_db(name: str, embedding: np.ndarray, db: Session) -> Speaker:
    if not name or not name.strip():
        raise ValueError("`name` must be a non-empty string.")

    emb = np.asarray(embedding, dtype=np.float32).reshape(-1)
    if emb.size == 0:
        raise ValueError("`embedding` cannot be empty.")

    speaker_name = name.strip()
    speaker = db.query(Speaker).filter(Speaker.name == speaker_name).first()
    payload = emb.tobytes()

    if speaker is None:
        speaker = Speaker(name=speaker_name, embedding=payload)
        db.add(speaker)
    else:
        speaker.embedding = payload

    db.commit()
    db.refresh(speaker)
    return speaker


def register_speaker(name: str, audio_path: str, db: Session) -> str:
    if not name or not name.strip():
        raise ValueError("`name` must be a non-empty string.")
    if db is None:
        raise ValueError("`db` session is required.")

    speaker_name = name.strip()
    existing = db.query(Speaker).filter(Speaker.name == speaker_name).first()
    if existing is not None:
        msg = f"Speaker '{speaker_name}' already exists."
        print(f"[SPEAKER] Registration blocked: {msg}")
        raise ValueError(msg)

    path = _validate_audio_path(audio_path)
    print(f"[SPEAKER] Loading audio for '{speaker_name}': {path}")
    try:
        wav = preprocess_wav(str(path))
        print(f"[SPEAKER] Generating embedding for '{speaker_name}'...")
        embedding = _get_voice_encoder().embed_utterance(wav)
    except Exception as exc:  # noqa: BLE001
        print(f"[SPEAKER] Failed while generating embedding for '{speaker_name}': {exc}")
        raise RuntimeError(f"Failed to generate embedding from '{path}': {exc}") from exc

    emb = np.asarray(embedding, dtype=np.float32).reshape(-1)
    payload = emb.tobytes()
    if not payload:
        raise RuntimeError("Generated embedding is empty; cannot register speaker.")

    print(f"[SPEAKER] Saving speaker '{speaker_name}' to database...")
    try:
        db.add(Speaker(name=speaker_name, embedding=payload))
        db.commit()
    except Exception as exc:  # noqa: BLE001
        db.rollback()
        print(f"[SPEAKER] Failed to save speaker '{speaker_name}': {exc}")
        raise RuntimeError(f"Failed to save speaker '{speaker_name}': {exc}") from exc

    print(f"[SPEAKER] Registration success: name={speaker_name}")
    return f"Speaker '{speaker_name}' registered successfully."


def register_default_speakers(db: Session) -> list[str]:
    if db is None:
        raise ValueError("`db` session is required.")

    base_samples = Path(__file__).resolve().parents[1] / "samples"
    if not base_samples.exists() or not base_samples.is_dir():
        raise FileNotFoundError(f"Samples directory not found: {base_samples}")

    sample_files = sorted([p for p in base_samples.iterdir() if p.is_file()])
    if not sample_files:
        print(f"[SPEAKER] No sample files found in: {base_samples}")
        return []

    grouped_embeddings: dict[str, list[np.ndarray]] = {}
    results: list[str] = []

    for audio_file in sample_files:
        if audio_file.suffix.lower() != ".wav":
            print(f"[SPEAKER] Skipping invalid file type: {audio_file.name}")
            continue

        speaker_name = _extract_speaker_name_from_filename(audio_file.name)
        if not speaker_name:
            print(f"[SPEAKER] Skipping invalid sample filename: {audio_file.name}")
            continue

        print(f"[SPEAKER] Registering {speaker_name} from {audio_file.name}")
        try:
            wav = preprocess_wav(str(audio_file.resolve()))
            embedding = _get_voice_encoder().embed_utterance(wav)
            emb = np.asarray(embedding, dtype=np.float32).reshape(-1)
            if emb.size == 0:
                print(f"[SPEAKER] Skipping empty embedding from {audio_file.name}")
                continue
            grouped_embeddings.setdefault(speaker_name, []).append(emb)
            print("[SPEAKER] Embedding generated")
        except Exception as exc:  # noqa: BLE001
            msg = f"Failed '{speaker_name}' from {audio_file.name}: {exc}"
            print(f"[SPEAKER] {msg}")
            results.append(msg)

    for speaker_name, emb_list in grouped_embeddings.items():
        try:
            avg_embedding = np.mean(np.stack(emb_list, axis=0), axis=0).astype(np.float32)
            existing = db.query(Speaker).filter(Speaker.name == speaker_name).first()

            if existing and existing.embedding:
                old_emb = np.frombuffer(existing.embedding, dtype=np.float32)
                if old_emb.size == avg_embedding.size:
                    avg_embedding = ((old_emb + avg_embedding) / 2.0).astype(np.float32)

            payload = avg_embedding.tobytes()
            if existing is None:
                db.add(Speaker(name=speaker_name, embedding=payload))
            else:
                existing.embedding = payload

            db.commit()
            msg = f"Speaker '{speaker_name}' saved ({len(emb_list)} samples)."
            print(f"[SPEAKER] {msg}")
            results.append(msg)
        except Exception as exc:  # noqa: BLE001
            db.rollback()
            msg = f"Failed to save '{speaker_name}': {exc}"
            print(f"[SPEAKER] {msg}")
            results.append(msg)

    return results


def list_registered_speakers(db: Session) -> list[dict[str, Any]]:
    if db is None:
        raise ValueError("`db` session is required.")

    speakers = db.query(Speaker).order_by(Speaker.id.asc()).all()
    output: list[dict[str, Any]] = []

    print("[SPEAKER] Registered speakers:")
    if not speakers:
        print("[SPEAKER] (none)")
        return output

    for speaker in speakers:
        embedding_size = len(speaker.embedding or b"")
        created_at = speaker.created_at.isoformat() if speaker.created_at else "N/A"
        row = {
            "id": speaker.id,
            "name": speaker.name,
            "embedding_size": embedding_size,
            "created_at": created_at,
        }
        output.append(row)
        print(
            f"[SPEAKER] id={row['id']} | name={row['name']} | "
            f"embedding_size={row['embedding_size']} | created_at={row['created_at']}"
        )

    return output


def _extract_speaker_name_from_filename(filename: str) -> str | None:
    if not filename or "." not in filename:
        return None

    stem = Path(filename).stem.strip()
    if not stem:
        return None

    prefix = stem.split("_", 1)[0].strip()
    if not prefix or not prefix.replace("-", "").replace(" ", "").isalnum():
        return None

    return prefix.capitalize()


def load_speakers_from_db(db: Session) -> dict[str, np.ndarray]:
    speakers = db.query(Speaker).all()
    embeddings: dict[str, np.ndarray] = {}

    for speaker in speakers:
        if not speaker.embedding:
            continue
        emb = np.frombuffer(speaker.embedding, dtype=np.float32).reshape(-1)
        if emb.size == 0:
            continue
        embeddings[speaker.name] = _normalize(emb)

    return embeddings


def diarize_audio(audio_path: str) -> list[dict[str, Any]]:
    data, samplerate = sf.read(audio_path)
    if len(data.shape) > 1:
        data = data.mean(axis=1)
    waveform = torch.from_numpy(data).float().unsqueeze(0)

    diarization = _load_diarization_pipeline()({"waveform": waveform, "sample_rate": samplerate})

    if hasattr(diarization, "itertracks"):
        annotation = diarization
    elif hasattr(diarization, "annotation") and hasattr(diarization.annotation, "itertracks"):
        annotation = diarization.annotation
    else:
        annotation = next(
            (
                getattr(diarization, attr)
                for attr in dir(diarization)
                if isinstance(getattr(diarization, attr, None), Annotation)
            ),
            None,
        )
        if annotation is None:
            raise AttributeError(f"Could not find annotation object in {type(diarization)}")

    segments: list[dict[str, Any]] = []
    for turn, _, speaker in annotation.itertracks(yield_label=True):
        segments.append({"start": float(turn.start), "end": float(turn.end), "speaker": str(speaker)})
    return segments


def identify_speaker(
    embedding: np.ndarray,
    known_embeddings: dict[str, np.ndarray],
    threshold: float | None = None,
) -> tuple[str, float, dict[str, float]]:
    if not known_embeddings:
        return "Unknown", -1.0, {}

    threshold_value = float(threshold) if threshold is not None else float(os.getenv("SPEAKER_MATCH_THRESHOLD", "0.70"))
    emb = _normalize(np.asarray(embedding, dtype=np.float32).reshape(-1))

    best_name = "Unknown"
    best_score = -1.0
    scores: dict[str, float] = {}

    for name, ref_emb in known_embeddings.items():
        score = _cosine_similarity(emb, ref_emb)
        scores[name] = score
        if score > best_score:
            best_score = score
            best_name = name

    if best_score >= threshold_value:
        return best_name, best_score, scores
    return "Unknown", best_score, scores


def process_speakers(audio_path: str) -> list[dict[str, Any]]:
    path = _validate_audio_path(audio_path)
    init_db()
    diarized_segments = diarize_audio(str(path))
    _ensure_command_available("ffmpeg", "ffmpeg est requis pour decouper les segments audio.")

    encoder = _get_voice_encoder()
    threshold = float(os.getenv("SPEAKER_MATCH_THRESHOLD", "0.70"))
    session = SessionLocal()

    identified: list[dict[str, Any]] = []
    try:
        known_embeddings = load_speakers_from_db(session)
        print(f"[SPEAKER] Loaded {len(known_embeddings)} enrolled speaker(s) from DB.")

        for seg in diarized_segments:
            start = float(seg["start"])
            end = float(seg["end"])

            if end <= start:
                continue
            if (end - start) < 0.35:
                identified.append({"start": start, "end": end, "speaker": "Unknown"})
                continue

            clip_path = _extract_segment_with_ffmpeg(path, start, end)
            name = "Unknown"
            try:
                wav = preprocess_wav(str(clip_path))
                emb = encoder.embed_utterance(wav)
                name, best_score, scores = identify_speaker(emb, known_embeddings=known_embeddings, threshold=threshold)

                scores_text = ", ".join(f"{spk}={score:.4f}" for spk, score in sorted(scores.items())) if scores else "(no enrolled speakers)"
                print(f"[SPEAKER] Segment {start:.2f}-{end:.2f}s scores: {scores_text}")
                print(
                    f"[SPEAKER] Segment {start:.2f}-{end:.2f}s selected='{name}' "
                    f"(best={best_score:.4f}, threshold={threshold:.2f})"
                )
                del wav
            except Exception as exc:  # noqa: BLE001
                print(f"[SPEAKER] Error identifying segment {start:.2f}-{end:.2f}s: {exc}")
                name = "Unknown"
            finally:
                gc.collect()
                try:
                    if clip_path.exists():
                        clip_path.unlink(missing_ok=True)
                except PermissionError:
                    time.sleep(0.2)
                    try:
                        clip_path.unlink(missing_ok=True)
                    except Exception:
                        pass

            identified.append({"start": start, "end": end, "speaker": name})
    finally:
        session.close()
        gc.collect()

    return identified


def _load_diarization_pipeline() -> Pipeline:
    token = os.getenv("HUGGINGFACE_TOKEN") or os.getenv("HF_TOKEN")
    if not token:
        raise RuntimeError("Missing HUGGINGFACE_TOKEN (or HF_TOKEN) for pyannote diarization.")
    return Pipeline.from_pretrained("pyannote/speaker-diarization-3.1", token=token)


def _extract_segment_with_ffmpeg(audio_path: Path, start: float, end: float) -> Path:
    duration = max(0.0, end - start)
    out_file = Path(tempfile.mkstemp(prefix="spk_seg_", suffix=".wav")[1])
    cmd = [
        "ffmpeg",
        "-y",
        "-ss",
        f"{start:.3f}",
        "-t",
        f"{duration:.3f}",
        "-i",
        str(audio_path),
        "-ac",
        "1",
        "-ar",
        "16000",
        str(out_file),
    ]
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as exc:
        stderr = (exc.stderr or "").strip()
        stdout = (exc.stdout or "").strip()
        details = stderr or stdout or str(exc)
        out_file.unlink(missing_ok=True)
        raise RuntimeError(f"ffmpeg segment extraction failed: {details}") from exc
    return out_file


def _validate_audio_path(audio_path: str) -> Path:
    if not audio_path or not audio_path.strip():
        raise ValueError("`audio_path` must be a non-empty string.")
    path = Path(audio_path).expanduser().resolve()
    if not path.exists():
        raise FileNotFoundError(f"Audio file not found: {path}")
    if not path.is_file():
        raise ValueError(f"Audio path is not a file: {path}")
    return path


def _normalize(vec: np.ndarray) -> np.ndarray:
    norm = float(np.linalg.norm(vec))
    if norm == 0.0:
        return vec
    return vec / norm


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    if a.shape != b.shape:
        return -1.0
    return float(np.dot(_normalize(a), _normalize(b)))


def _ensure_command_available(command: str, error_message: str) -> None:
    if shutil.which(command) is None:
        raise RuntimeError(error_message)
