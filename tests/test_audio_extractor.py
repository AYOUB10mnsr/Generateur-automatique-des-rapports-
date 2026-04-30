from src.ingestion.audio_extractor import AudioExtractor

video = "data/raw/video/test_video.mp4"

extractor = AudioExtractor(video)

audio = extractor.extraire_audio()

print("Audio extrait :", audio)