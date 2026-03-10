# 🗜️ Compresse-moi si tu peux

> **Projet académique 2025** — Application interactive de **compression et décompression de fichiers**  
> Interface graphique moderne en **PySide6**, **API web avec FastAPI**, et base pour **CLI**.

---

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green?logo=fastapi)
![PySide6](https://img.shields.io/badge/PySide6-GUI-orange?logo=qt)
![License](https://img.shields.io/badge/License-MIT-lightgrey)
![Tests](https://img.shields.io/badge/tests-passing-success)

---

## 🎯 Objectif du projet

**Compresse-moi si tu peux** vise à illustrer les principes fondamentaux de la **compression de données** à travers une application interactive et pédagogique.  
Elle permet de :

- Importer un fichier (texte, image, audio, etc.)
- Appliquer différents **algorithmes de compression**
- Visualiser les **résultats et statistiques**
- Comparer les **performances** des méthodes

L’application combine une **interface graphique locale (PySide6)** et une **interface web (FastAPI)** pour une expérience complète.

---

## 🧠 Fonctionnalités principales

### 🎨 Interface graphique (PySide6)
- Navigation via une **barre latérale moderne**
- Pages interactives :
  - 🏠 **Accueil** — importation de fichiers  
  - 📚 **Théorie** — explications des algorithmes  
  - 🌲 **Huffman** — codage entropique optimal  
  - 🧵 **LZW** — compression par dictionnaire dynamique  
  - 📊 **Comparaison** — statistiques et visualisations  

### 🌐 Interface Web (FastAPI)
- Upload de fichiers via navigateur
- Sélection de l’algorithme (**Huffman** ou **LZW**)
- Calcul automatique du **taux de compression**
- Pages HTML dynamiques via **Jinja2Templates**
- Ressources statiques (CSS / JS) pour interface moderne


### ⚙️ Algorithmes de compression implémentés
| Algorithme | Description |
|-------------|--------------|
| **Huffman** | Basé sur les fréquences de symboles, crée un arbre de codes binaires optimaux |
| **LZW** | Compression par dictionnaire incrémental, utilisée dans GIF et TIFF |

### 📊 Analyse et visualisation
- Calcul du **ratio de compression**
- Comparaison des **tailles d’entrée/sortie**
- Génération de **graphes et statistiques**
- Export des résultats (CSV / PDF)

---


## 📂 Architecture du projet

Le projet est organisé de manière modulaire pour séparer les différentes responsabilités :

- **`main.py`** : point d’entrée principal du programme (interface graphique).  
- **`requirements.txt` / `pyproject.toml`** : fichiers de configuration pour la gestion des dépendances (pip ou Poetry).  
- **`data/`** : contient les fichiers de test ou exemples à compresser/décompresser.  
- **`src/compressemos/`** : cœur du projet contenant tout le code source.  
  - **`algorithms/`** : implémentations des algorithmes de compression  
    - `huffman.py` — algorithme de Huffman  
    - `lzw.py` — algorithme LZW  
  - **`cli/`** : gestion de la version en ligne de commande (`main.py`).  
  - **`core/`** : classes et fonctions utilitaires partagées entre les algorithmes  
    - `bitio.py`, `models.py`, `stats.py`, etc.  
  - **`gui/`** : interface graphique du projet (pages principales, comparaison, théorie, etc.).  
  - **`io/`** : gestion des fichiers d’entrée/sortie  
    - lecture (`reader.py`), écriture (`writer.py`), formats (`formats.py`).  
  - **`pipelines/`** : regroupe les processus de compression et de décompression complets.  
  - **`viz/`** : outils de visualisation et génération de graphiques (ex. `charts.py`).  
  - **`tools/`** : utilitaires supplémentaires comme `pdf_extractor.py`.  
- **`tests/`** : contient les tests unitaires pour chaque module (`test_huffman.py`, `test_lzw.py`, etc.).

Cette structure permet une séparation claire entre :
- les **algorithmes** de compression,  
- les **interfaces utilisateur** (CLI/GUI),  
- les **outils techniques** (I/O, visualisation, statistiques),  
- et les **tests** pour assurer la fiabilité du code.


## 🖥️ Aperçu de l’interface

### 🏠 Page d’accueil
- Permet d’importer un fichier depuis votre ordinateur.
- Copie le fichier dans le dossier `data/` du projet.
- Interface épurée et centrée.

### 📚 Page Théorie
- Présente les bases de la compression de données.
- Schémas explicatifs et définitions clés.

### 🌲 Huffman / 🧵 LZW
- Interface dédiée pour chaque algorithme.
- Visualisation des étapes (arbres, dictionnaires...).
- Calculs et temps d’exécution.

### 📊 Comparaison
- Compare plusieurs méthodes sur le même fichier.
- Affiche ratio, vitesse et gain de place.

---

## 💻 Installation

### 1️⃣ Cloner le dépôt
```bash
git clone https://gitlab.ulb.be/irha0001/grp-3.git
cd grp-3
```

### 2️⃣ Installer les dépendances

Avec pip :
```bash
pip install -r requirements.txt
```

ou avec Poetry :
```bash
poetry install
```

### 3️⃣ Lancer l’application

#### 🪟 Interface graphique
```bash
python main.py
```

#### 🌐 Interface web
```bash
uvicorn src.web.server:app --reload
```

Interface disponible sur : http://localhost:3000

#### 💻 Interface en ligne de commande (CLI)

> 🚧 **En développement** — la version CLI sera bientôt disponible.

Elle permettra de :
- lancer la compression et décompression directement depuis le terminal ;
- automatiser des tests sur plusieurs fichiers ;
- comparer les performances des algorithmes sans interface graphique.

Exemple d’exécution (bientôt disponible) :
```bash
python -m src.cli.main --algorithm huffman --input data/texte.txt --output data/out.huf

