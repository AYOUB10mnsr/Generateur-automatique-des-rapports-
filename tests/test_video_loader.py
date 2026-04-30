from src.ingestion.video_loader import VideoLoader

# chemin vers une vidéo test
chemin_video = "data/raw/video/test_video.mp4"

try:
    chargeur = VideoLoader(chemin_video)

    # test validation
    chargeur.valider_video()
    print("Validation vidéo : OK")

    # test chargement
    video = chargeur.charger_video()
    print("Chargement vidéo : OK")

    # test métadonnées
    metadata = chargeur.obtenir_metadonnees()
    print("Métadonnées vidéo :")
    print(metadata)

except Exception as e:
    print("Erreur pendant le test :", e)