from src.preprocessing.text_cleaner import TextCleaner


# chemin de la transcription
fichier = "data/processed/transcriptions/test_video.txt"

# lire le texte brut
with open(fichier, "r", encoding="utf-8") as f:
    texte = f.read()

cleaner = TextCleaner()

texte_nettoye = cleaner.nettoyer(texte)

print("\nTexte nettoyé :\n")
print(texte_nettoye[:500])