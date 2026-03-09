from pathlib import Path
import cv2


class VideoLoader:
    """
    Classe responsable du chargement et de la validation
    des fichiers vidéo utilisés dans le pipeline de génération
    automatique de rapports.
    """

    # Formats vidéo supportés
    FORMATS_SUPPORTES = [".mp4", ".avi", ".mov", ".mkv"]

    def __init__(self, chemin_video: str):
        """
        Constructeur de la classe.

        Paramètres :
        chemin_video : chemin vers le fichier vidéo
        """
        self.chemin_video = Path(chemin_video)

    def valider_video(self):
        """
        Vérifie si la vidéo existe et si son format est supporté.
        """

        # Vérifier que le fichier existe
        if not self.chemin_video.exists():
            raise FileNotFoundError(
                f"Fichier vidéo introuvable : {self.chemin_video}"
            )

        # Vérifier que l'extension est valide
        if self.chemin_video.suffix.lower() not in self.FORMATS_SUPPORTES:
            raise ValueError(
                f"Format vidéo non supporté : {self.chemin_video.suffix}"
            )

        return True

    def charger_video(self):
        """
        Charge la vidéo en utilisant OpenCV.
        """

        # Vérification préalable
        self.valider_video()

        cap = cv2.VideoCapture(str(self.chemin_video))

        # Vérifier que la vidéo a été correctement ouverte
        if not cap.isOpened():
            raise RuntimeError("Impossible d'ouvrir la vidéo")

        return cap

    def obtenir_metadonnees(self):
        """
        Extrait les métadonnées importantes de la vidéo.
        """

        cap = self.charger_video()

        # Récupération des informations techniques
        fps = cap.get(cv2.CAP_PROP_FPS)
        nombre_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        largeur = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        hauteur = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        # Calcul de la durée de la vidéo
        duree = nombre_frames / fps if fps > 0 else 0

        metadonnees = {
            "nom_fichier": self.chemin_video.name,
            "chemin": str(self.chemin_video),
            "fps": fps,
            "nombre_frames": nombre_frames,
            "duree_secondes": duree,
            "resolution": f"{largeur}x{hauteur}",
        }

        # Libérer la vidéo
        cap.release()

        return metadonnees


# Exemple d'utilisation
if __name__ == "__main__":

    chargeur_video = VideoLoader("data/raw/video/reunion.mp4")

    try:
        metadonnees = chargeur_video.obtenir_metadonnees()

        print("Vidéo chargée avec succès")
        print(metadonnees)

    except Exception as erreur:
        print("Erreur :", erreur)