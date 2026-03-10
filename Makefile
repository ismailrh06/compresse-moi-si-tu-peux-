# ===========================================
#                MAKEFILE
# ===========================================

# -------- Settings --------
PYTHON := python3
VENV := .venv
PIP := pip
PY := python3

SRC := src
TESTS := $(SRC)/tests

.PHONY: help install venv run cli gui web backend frontend dev test coverage clean clean-all


# -------- Directories --------
FRONTEND_DIR = web/frontend
BACKEND_DIR = web/backend
BACKEND_APP = server:app

# -------- Colors --------
GREEN := \033[1;32m
BLUE := \033[1;34m
YELLOW := \033[1;33m
RED := \033[1;31m
RESET := \033[0m

# -------------------------------------------
#                  HELP
# -------------------------------------------
help:
	@echo ""
	@echo "$(BLUE)Commandes disponibles :$(RESET)"
	@echo "  $(GREEN)make install$(RESET)        : Installer dépendances + outils dev"
	@echo "  $(GREEN)make run$(RESET)            : Lancer l'application principale"
	@echo "  $(GREEN)make cli$(RESET)            : Lancer la version CLI"
	@echo "  $(GREEN)make gui$(RESET)            : Lancer l'application graphique"
	@echo "  $(GREEN)make web$(RESET)            : Lancer backend FastAPI + frontend Next.js"
	@echo "  $(GREEN)make dev$(RESET)            : Lancer main.py en mode dev (CLI/GUI)"
	@echo "  $(GREEN)make test$(RESET)           : Exécuter les tests"
	@echo "  $(GREEN)make coverage$(RESET)       : Tests + couverture"
	@echo "  $(GREEN)make format$(RESET)         : Formatter le code (Black + Ruff)"
	@echo "  $(GREEN)make lint$(RESET)           : Vérifier la qualité du code"
	@echo "  $(GREEN)make typecheck$(RESET)      : Vérifier les types (Mypy)"
	@echo "  $(GREEN)make clean$(RESET)          : Nettoyage basique"
	@echo "  $(GREEN)make clean-all$(RESET)      : Nettoyage complet"
	@echo ""

# -------------------------------------------
#              INSTALLATION
# -------------------------------------------
venv:
	@echo "$(BLUE)[ VENV ] Création de l’environnement...$(RESET)"
	$(PYTHON) -m venv $(VENV)

install: venv
	@echo "$(BLUE)[ INSTALL ] Activation de l’environnement + installation...$(RESET)"
	. $(VENV)/bin/activate && \
	$(VENV)/bin/pip install -r requirements.txt && \
	$(VENV)/bin/pip install black ruff mypy pytest coverage
	@echo "$(GREEN)Installation terminée ✔$(RESET)"

### ------------------------------
###   COMMANDES BACKEND (FASTAPI)
### ------------------------------

backend:
	@echo "🚀 Lancement du backend FastAPI..."
	cd $(BACKEND_DIR) && $(PY) -m uvicorn $(BACKEND_APP) --reload --host 127.0.0.1 --port 8000


backend-prod:
	@echo "🚀 Lancement du backend (production)..."
	cd $(BACKEND_DIR) && $(PY) -m uvicorn $(BACKEND_APP) --host 0.0.0.0 --port 8000


### ------------------------------
###   COMMANDES FRONTEND (NEXT.JS)
### ------------------------------

frontend:
	@echo "✨ Lancement du frontend Next.js..."
	cd $(FRONTEND_DIR) && pnpm dev

frontend-network:
	@echo "✨ Lancement du frontend Next.js (LAN accessible)..."
	cd $(FRONTEND_DIR) && pnpm dev --turbo

# -------------------------------------------
#               RUN TARGETS
# -------------------------------------------
run:
	@echo "$(YELLOW)[ RUN ] Lancement de main.py$(RESET)"
	$(PY) main.py

cli:
	@echo "$(YELLOW)[ RUN ] CLI$(RESET)"
	$(PY) src/cli/main.py

gui:
	@echo "$(YELLOW)[ RUN ] GUI$(RESET)"
	$(PY) src/gui/main_window.py

web:
	@echo "🔥 Lancement du frontend + backend..."
	make --no-print-directory backend & \
	make --no-print-directory frontend

dev:
	@echo "$(YELLOW)[ DEV ] Mode développement (auto-reload si supporté)$(RESET)"
	$(PY) main.py --dev

# -------------------------------------------
#              QUALITY TOOLS
# -------------------------------------------
format:
	@echo "$(BLUE)[ FORMAT ] Black & Ruff fix$(RESET)"
	$(VENV)/bin/black src
	$(VENV)/bin/ruff check src --fix

lint:
	@echo "$(BLUE)[ LINT ] Ruff$(RESET)"
	$(VENV)/bin/ruff check src

typecheck:
	@echo "$(BLUE)[ TYPES ] Mypy$(RESET)"
	$(VENV)/bin/mypy src

# -------------------------------------------
#              TESTING
# -------------------------------------------
test:
	@echo "$(BLUE)[ TEST ] Exécution des tests $(RESET)"
	$(VENV)/bin/pytest -q

coverage:
	@echo "$(BLUE)[ TEST ] Couverture de tests $(RESET)"
	$(VENV)/bin/coverage run -m pytest
	$(VENV)/bin/coverage report -m
	$(VENV)/bin/coverage html
	@echo "$(GREEN)Rapport HTML généré dans coverage_html/ ✔$(RESET)"

# -------------------------------------------
#              CLEANING
# -------------------------------------------
clean:
	@echo "$(BLUE)[ CLEAN ] Suppression des fichiers temporaires$(RESET)"
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	@echo "$(GREEN)Nettoyage basique terminé ✔$(RESET)"

clean-all: clean
	@echo "$(RED)[ CLEAN ALL ] Suppression complète environnement + caches$(RESET)"
	rm -rf $(VENV)
	rm -rf .pytest_cache
	rm -rf coverage_html
	rm -rf build dist
	@echo "$(GREEN)Nettoyage complet ✔$(RESET)"
