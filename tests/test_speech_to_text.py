from pathlib import Path
from src.transcription.speech_to_text import SpeechToText


# chemin de l'audio
audio = "data/raw/audio/test_video.wav"

# charger le transcripteur
transcriber = SpeechToText(modele="tiny")

# transcription
texte = transcriber.transcrire(audio)

# créer le dossier si nécessaire
dossier_sortie = Path("data/processed/transcriptions")
dossier_sortie.mkdir(parents=True, exist_ok=True)

# nom du fichier texte basé sur l'audio
nom_fichier = Path(audio).stem + ".txt"
chemin_sortie = dossier_sortie / nom_fichier

# sauvegarde
with open(chemin_sortie, "w", encoding="utf-8") as f:
    f.write(texte)

print("Transcription sauvegardée dans :", chemin_sortie)