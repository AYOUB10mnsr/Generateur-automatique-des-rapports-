import whisper
from pathlib import Path


class SpeechToText:
    """
    Classe responsable de convertir un fichier audio
    en texte à l'aide du modèle Whisper.
    """

    def __init__(self, modele="tiny"):
        """
        Charger le modèle Whisper.

        modele possible :
        tiny, base, small, medium, large
        """
        self.modele = whisper.load_model(modele)

    def transcrire(self, chemin_audio):
        """
        Transcrire un fichier audio en texte.
        """

        chemin_audio = Path(chemin_audio)

        if not chemin_audio.exists():
            raise FileNotFoundError("Fichier audio introuvable")

        resultat = self.modele.transcribe(str(chemin_audio), verbose=True)

        texte = resultat["text"]

        return texte