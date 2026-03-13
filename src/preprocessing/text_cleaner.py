import re


class TextCleaner:
    """
    Classe responsable du nettoyage du texte transcrit.
    """

    def nettoyer(self, texte: str) -> str:
        """
        Nettoie la transcription brute.

        Paramètres
        ----------
        texte : str
            Texte issu de la transcription audio.

        Retour
        ------
        str
            Texte nettoyé.
        """

        # enlever les espaces multiples
        texte = re.sub(r"\s+", " ", texte)

        # enlever les caractères spéciaux inutiles
        texte = re.sub(r"[^\w\s\.,!?àâäéèêëîïôöùûüç'-]", "", texte)

        # enlever les répétitions typiques de speech-to-text
        texte = re.sub(r"\b(\w+)( \1\b)+", r"\1", texte)

        # supprimer les espaces au début et à la fin
        texte = texte.strip()

        return texte