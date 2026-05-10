# CYBER-AI-SYSTEM — Auto-ML Adaptatif pour la Cybersécurité

[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-cyan)](https://reactjs.org)
[![Docker](https://img.shields.io/badge/Docker-ready-blue)](https://docker.com)
[![Tests](https://img.shields.io/badge/Tests-15%2F15%20passed-brightgreen)]()
[![Précision](https://img.shields.io/badge/Précision-99.98%25-brightgreen)]()

> Système Auto-ML adaptatif pour la détection d'intrusions réseau en temps réel.  
> Sélection dynamique de modèles via un bandit ε-greedy, détection de dérive ADWIN,  
> optimisation Optuna, API FastAPI, dashboard React et conteneurisation Docker.

---

## Table des Matières

- [Présentation](#présentation)
- [Architecture](#architecture)
- [Dataset](#dataset)
- [Technologies](#technologies)
- [Installation](#installation)
- [Lancement](#lancement)
- [Résultats](#résultats)
- [Tests](#tests)
- [Docker](#docker)


---

## Présentation

CYBER-AI-SYSTEM est un système Auto-ML *always-on* qui :

- **Apprend en ligne** sur un flux de données réseau (UNSW-NB15)
- **Sélectionne automatiquement** le meilleur algorithme via un bandit ε-greedy
- **Détecte les dérives** de données avec ADWIN et s'adapte sans intervention humaine
- **Optimise** les hyperparamètres via Optuna (recherche bayésienne)
- **Expose** ses prédictions via une API REST FastAPI
- **Visualise** les métriques en temps réel avec un dashboard React
- **Déploie** via Docker en une seule commande

---

## Architecture

```
CYBER-AI-SYSTEM/
│
├── src/
│   ├── bandit/
│   │   ├── bandit.py            # Bandit ε-greedy + 3 modèles
│   │   └── drift_detection.py   # Détecteur de dérive ADWIN
│   ├── data/
│   │   └── simulate_drift.py    # Chargement + simulation de dérive
│   ├── models/
│   │   └── optuna_tuning.py     # Optimisation bayésienne
│   ├── evaluation/
│   │   └── test_bandit.py       # 15 tests unitaires
│   ├── api/
│   │   └── main.py              # API FastAPI (4 endpoints)
│   └── main.py                  # Pipeline principal
│
├── dashboard/
│   └── frontend/                # Dashboard React + Recharts
│
├── notebooks/
│   ├── EDA_UNSW_NB15.ipynb      # Analyse exploratoire
│   ├── 02_bandit_results.ipynb  # Résultats bandit + ADWIN
│   └── 03_optuna_results.ipynb  # Résultats Optuna
│
├── data/
│   └── unsw-nb15/               # Dataset UNSW-NB15
│
├── Dockerfile
├── requirements.txt
└── README.md
```

---

##  Dataset

**UNSW-NB15** — Dataset de référence pour la détection d'intrusions réseau.

| Caractéristique | Valeur |
|----------------|--------|
| Exemples totaux | 82 332 |
| Features | 42 |
| Classe 0 (Normal) | 37 000 (44.9%) |
| Classe 1 (Attaque) | 45 332 (55.1%) |
| Valeurs manquantes | 0 |

 Téléchargement : [Kaggle UNSW-NB15](https://www.kaggle.com/datasets/dhoogla/unswnb15)

Placer le fichier dans : `data/unsw-nb15/UNSW_NB15_training-set.csv`

---

##  Technologies

| Composant | Technologie |
|-----------|-------------|
| Online Learning | `river` 0.21 |
| Détection dérive | `ADWIN` (river) |
| Optimisation | `Optuna` 3.5 |
| API REST | `FastAPI` 0.109 |
| Dashboard | `React 18` + `Recharts` |
| Conteneurisation | `Docker` |
| Tests | `pytest` 9.0 |
| Data | `pandas`, `numpy` |

---

##  Installation

### Prérequis
- Python 3.11+
- Node.js 18+
- Docker Desktop (optionnel)

### 1. Cloner le repo
```bash
git clone https://github.com/ton-username/cyber-ai-system.git
cd cyber-ai-system
```

### 2. Créer l'environnement virtuel
```bash
python -m venv myenv
# Windows
myenv\Scripts\activate
# Linux/Mac
source myenv/bin/activate
```

### 3. Installer les dépendances Python
```bash
pip install -r requirements.txt
```

### 4. Installer les dépendances React
```bash
cd dashboard/frontend
npm install
cd ../..
```

---

##  Lancement

### Option 1 — Lancement local (recommandé)

**Terminal 1 — Lancer l'API :**
```bash
python src/api/main.py
```
→ API disponible sur `http://localhost:8000`  
→ Documentation : `http://localhost:8000/docs`

**Terminal 2 — Lancer le dashboard :**
```bash
cd dashboard/frontend
npm run dev
```
→ Dashboard disponible sur `http://localhost:5173`

### Option 2 — Lancer via Docker
```bash
docker build -t cyber-ai-system .
docker run -p 8000:8000 cyber-ai-system
```

### Option 3 — Pipeline complet (sans API)
```bash
python src/main.py
```

---

##  Résultats

| Métrique | Valeur |
|---------|--------|
| Précision finale | **99.98%** |
| Modèle le plus performant | KNN-ADWIN (100%) |
| Dérives détectées | 6 |
| Délai de détection dérive | **16 étapes** |
| Meilleure précision Optuna | **100%** |
| Trials Optuna | 30 |

### Meilleurs hyperparamètres (Optuna)

| Paramètre | Valeur |
|-----------|--------|
| epsilon (bandit) | 0.087 |
| max_depth (HoeffdingTree) | 18 |
| n_neighbors (KNN) | 7 |
| delta (ADWIN) | 0.003 |

---

##  Tests

```bash
python -m pytest src/evaluation/test_bandit.py -v --tb=no
```

```
✅ test_bandit_initialisation          PASSED
✅ test_trois_modeles_present           PASSED
✅ test_choisir_modele_retourne_...     PASSED
✅ test_epsilon_zero_choisit_...        PASSED
✅ test_predict_and_learn_incremente    PASSED
✅ test_reset_remet_scores_a_zero       PASSED
✅ test_historique_log_changements      PASSED
✅ test_tous_modeles_apprennent         PASSED
✅ test_initialisation_detecteur        PASSED
✅ test_update_ajoute_precision         PASSED
✅ test_adwin_detecte_derive_simulee    PASSED
✅ test_reset_declenche_apres_derive    PASSED
✅ test_precisions_entre_0_et_1        PASSED
✅ test_pipeline_complet_tourne         PASSED
✅ test_csv_sauvegarde_correctement     PASSED

15 passed in 13.04s 
```

---

## 🐳 Docker

```bash
# Build
docker build -t cyber-ai-system .

# Run
docker run -p 8000:8000 cyber-ai-system

# Vérification
curl http://localhost:8000/status
```

---

## 📡 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/status` | Statut de l'API |
| GET | `/metrics` | Métriques temps réel |
| POST | `/predict` | Prédiction sur données réseau |
| POST | `/reset` | Reset du bandit |

---



**Encadrante :** Pr. TABBAA Hiba  
**École :** EMSI Marrakech — 4ème année AIDATA  
**Année :** 2025-2026

---

## 📄 Licence

Projet académique — EMSI Marrakech 2026