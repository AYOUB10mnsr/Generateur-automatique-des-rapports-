from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path
from urllib.parse import urlparse


def extract_audio(source: str) -> str:
    """
    Extract or resolve an audio file path from a source.

    - If `source` is a YouTube URL, downloads audio with yt-dlp and returns a .wav path.
    - If `source` is a local file path, validates it and returns the path directly.
    """
    if not source or not source.strip():
        raise ValueError("`source` must be a non-empty string.")

    source = source.strip()

    if _is_youtube_url(source):
        return _download_youtube_audio_as_wav(source)

    local_path = Path(source).expanduser().resolve()
    if not local_path.exists():
        raise FileNotFoundError(f"Local file not found: {local_path}")
    if not local_path.is_file():
        raise ValueError(f"Local path is not a file: {local_path}")
    return str(local_path)


def _is_youtube_url(value: str) -> bool:
    try:
        parsed = urlparse(value)
    except Exception:
        return False

    if parsed.scheme not in {"http", "https"}:
        return False

    host = (parsed.netloc or "").lower()
    return (
        host == "youtu.be"
        or host.endswith("youtube.com")
        or host.endswith("youtube-nocookie.com")
    )


def _download_youtube_audio_as_wav(url: str) -> str:
    _ensure_command_available("yt-dlp", "yt-dlp is required to download from YouTube.")

    output_dir = Path(tempfile.mkdtemp(prefix="extractor_audio_"))
    output_template = str(output_dir / "%(id)s.%(ext)s")

    cmd = [
        "yt-dlp",
        "--no-playlist",
        "--extract-audio",
        "--audio-format",
        "wav",
        "-o",
        output_template,
        url,
    ]

    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as exc:
        stderr = (exc.stderr or "").strip()
        stdout = (exc.stdout or "").strip()
        details = stderr or stdout or str(exc)
        raise RuntimeError(f"Failed to download YouTube audio: {details}") from exc

    wav_files = sorted(output_dir.glob("*.wav"))
    if wav_files:
        return str(wav_files[0].resolve())

    # Fallback: if yt-dlp produced another audio format, convert with ffmpeg.
    produced_files = [p for p in output_dir.iterdir() if p.is_file()]
    if not produced_files:
        raise RuntimeError("yt-dlp completed but produced no output files.")

    return _convert_to_wav_with_ffmpeg(produced_files[0])


def _convert_to_wav_with_ffmpeg(input_file: Path) -> str:
    _ensure_command_available("ffmpeg", "ffmpeg is required to convert audio to .wav.")

    output_file = input_file.with_suffix(".wav")
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(input_file),
        str(output_file),
    ]

    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as exc:
        stderr = (exc.stderr or "").strip()
        stdout = (exc.stdout or "").strip()
        details = stderr or stdout or str(exc)
        raise RuntimeError(f"Failed to convert audio with ffmpeg: {details}") from exc

    if not output_file.exists():
        raise RuntimeError(f"ffmpeg did not produce output file: {output_file}")

    return str(output_file.resolve())


def _ensure_command_available(command: str, error_message: str) -> None:
    if shutil.which(command) is None:
        raise RuntimeError(error_message)
