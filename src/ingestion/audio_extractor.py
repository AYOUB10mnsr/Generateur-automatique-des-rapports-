from pathlib import Path
import subprocess


class AudioExtractor:
    """
    Classe responsable de l'extraction de la piste audio
    à partir d'une vidéo.
    """

    def __init__(self, chemin_video, dossier_sortie="data/raw/audio"):
        self.chemin_video = Path(chemin_video)
        self.dossier_sortie = Path(dossier_sortie)

    def extraire_audio(self):
        """
        Extrait l'audio de la vidéo et le sauvegarde en .wav
        """

        if not self.chemin_video.exists():
            raise FileNotFoundError("La vidéo n'existe pas")

        # créer le dossier audio si nécessaire
        self.dossier_sortie.mkdir(parents=True, exist_ok=True)

        nom_audio = self.chemin_video.stem + ".wav"
        chemin_audio = self.dossier_sortie / nom_audio

        commande = [
            "ffmpeg",
            "-i",
            str(self.chemin_video),
            "-q:a",
            "0",
            "-map",
            "a",
            str(chemin_audio)
        ]

        subprocess.run(commande, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        return chemin_audio