from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

import numpy as np
from database.db import SessionLocal, init_db
from database.models import Speaker
from pyannote.audio import Pipeline
from resemblyzer import VoiceEncoder, preprocess_wav
from sqlalchemy.orm import Session
import os

token = os.getenv("HF_TOKEN")

def save_speaker_to_db(name: str, embedding: np.ndarray, db: Session) -> Speaker:
    """
    Insert or update a speaker embedding in the database.

    Embeddings are stored as raw bytes using `embedding.tobytes()`.
    """
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
    """
    Register a new speaker from an audio sample.

    Steps:
    1) load audio
    2) generate embedding with resemblyzer
    3) store embedding in database

    Duplicate speaker names are rejected.
    """
    if not name or not name.strip():
        raise ValueError("`name` must be a non-empty string.")

    speaker_name = name.strip()
    existing = db.query(Speaker).filter(Speaker.name == speaker_name).first()
    if existing is not None:
        raise ValueError(f"Speaker '{speaker_name}' already exists.")

    path = _validate_audio_path(audio_path)
    try:
        wav = preprocess_wav(str(path))
        encoder = VoiceEncoder()
        embedding = encoder.embed_utterance(wav)
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(f"Failed to generate embedding from '{path}': {exc}") from exc

    save_speaker_to_db(speaker_name, embedding, db)
    return f"Speaker '{speaker_name}' registered successfully."


def load_speakers_from_db(db: Session) -> dict[str, np.ndarray]:
    """
    Load all speaker embeddings from database into memory.

    Embeddings are reconstructed using `np.frombuffer(...)`.
    """
    speakers = db.query(Speaker).all()
    embeddings: dict[str, np.ndarray] = {}

    for speaker in speakers:
        if not speaker.embedding:
            continue

        emb = np.frombuffer(speaker.embedding, dtype=np.float32)
        emb = np.asarray(emb, dtype=np.float32).reshape(-1)
        if emb.size == 0:
            continue
        embeddings[speaker.name] = _normalize(emb)

    return embeddings

import os
os.environ["TORCHAUDIO_BACKEND"] = "soundfile"
import torch
import soundfile as sf
import numpy as np
from typing import Any
from pyannote.core import Annotation

def diarize_audio(audio_path: str) -> list[dict[str, Any]]:
    data, samplerate = sf.read(audio_path)
    if len(data.shape) > 1:
        data = data.mean(axis=1)
    waveform = torch.from_numpy(data).float().unsqueeze(0)
    
    pipeline = _load_diarization_pipeline()
    
    diarization = pipeline({"waveform": waveform, "sample_rate": samplerate})
    
    print(f"DEBUG: L'objet diarization est de type {type(diarization)}")

    # Résoudre la compatibilité pyannote >= 3.1 (retourne DiarizeOutput au lieu d'Annotation)
    if hasattr(diarization, 'itertracks'):
        annotation = diarization
    elif hasattr(diarization, 'annotation') and hasattr(diarization.annotation, 'itertracks'):
        annotation = diarization.annotation
    else:
        # Fallback : parcourir les attributs pour trouver l'Annotation
        annotation = next(
            (getattr(diarization, a) for a in dir(diarization)
             if isinstance(getattr(diarization, a, None), Annotation)),
            None
        )
        if annotation is None:
            raise AttributeError(
                f"Impossible de trouver une Annotation dans {type(diarization)}. "
                f"Attributs disponibles : {[a for a in dir(diarization) if not a.startswith('_')]}"
            )
    
    segments = []
    for turn, _, speaker in annotation.itertracks(yield_label=True):
        segments.append({
            "start": float(turn.start),
            "end": float(turn.end),
            "speaker": str(speaker),
        })
        
    return segments


def identify_speaker(embedding: np.ndarray, db: Session) -> str:
    """
    Compare one embedding against speakers stored in DB with cosine similarity.
    Returns best matching speaker name or "Unknown".
    """
    known_embeddings = load_speakers_from_db(db)
    if not known_embeddings:
        return "Unknown"

    threshold = float(os.getenv("SPEAKER_MATCH_THRESHOLD", "0.70"))
    emb = _normalize(np.asarray(embedding, dtype=np.float32).reshape(-1))

    best_name = "Unknown"
    best_score = -1.0
    for name, ref_emb in known_embeddings.items():
        score = _cosine_similarity(emb, ref_emb)
        if score > best_score:
            best_score = score
            best_name = name

    if best_score >= threshold:
        return best_name
    return "Unknown"


def process_speakers(audio_path: str) -> list[dict[str, Any]]:
    """
    End-to-end speaker processing:
    1) diarize audio
    2) split audio per diarization segment
    3) embed each segment with resemblyzer
    4) identify against speaker embeddings stored in SQLite DB

    Returns:
    [
      {"start": float, "end": float, "speaker": "Yahya"},
      ...
    ]
    """
    path = _validate_audio_path(audio_path)
    init_db()
    diarized_segments = diarize_audio(str(path))

    _ensure_command_available("ffmpeg", "ffmpeg is required to split audio segments.")
    encoder = VoiceEncoder()
    session = SessionLocal()

    identified: list[dict[str, Any]] = []
    try:
        for seg in diarized_segments:
            start = float(seg["start"])
            end = float(seg["end"])
            if end <= start:
                continue

            # Ignore very short segments that tend to produce unstable embeddings.
            if (end - start) < 0.35:
                identified.append({"start": start, "end": end, "speaker": "Unknown"})
                continue

            clip_path = _extract_segment_with_ffmpeg(path, start, end)
            try:
                wav = preprocess_wav(str(clip_path))
                emb = encoder.embed_utterance(wav)
                name = identify_speaker(emb, session)
            except Exception:  # noqa: BLE001
                name = "Unknown"
            finally:
                clip_path.unlink(missing_ok=True)

            identified.append({"start": start, "end": end, "speaker": name})
    finally:
        try:
            del wav
        except:
            pass
        
        

    import gc
    import time

    gc.collect()
    time.sleep(0.3)

    try:
        clip_path.unlink(missing_ok=True)
    except PermissionError:
        time.sleep(0.5)
        clip_path.unlink(missing_ok=True)


def _load_diarization_pipeline() -> Pipeline:
    token = os.getenv("HUGGINGFACE_TOKEN") # Utilisez la variable que vous avez définie
    
    # On force le nom du modèle ET la révision (branche 'main')
    return Pipeline.from_pretrained(
        "pyannote/speaker-diarization-3.1", 
        token,
        revision="main" 
    )


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
    a_n = _normalize(a)
    b_n = _normalize(b)
    return float(np.dot(a_n, b_n))


def _ensure_command_available(command: str, error_message: str) -> None:
    if shutil.which(command) is None:
        raise RuntimeError(error_message)
