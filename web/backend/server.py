from __future__ import annotations

import base64
import json
import math
import mimetypes
import os
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request as UrlRequest, urlopen
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from time import perf_counter

from fastapi import FastAPI, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

# Import de tes algorithmes existants
from src.algorithms.huffman.compress import huffman_compress
from src.algorithms.huffman.decompress import huffman_decompress
from src.algorithms.lzw.decoder import decoder as lzw_decompress
from src.algorithms.lzw.encoder import encoder as lzw_compress

app = FastAPI(title="Compressemos Web")

# Middleware CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # accepte toutes origines (pour dev)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Définition des chemins
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
LEADERBOARD_FILE = BASE_DIR / "data" / "leaderboard.json"
USERS_FILE = BASE_DIR / "data" / "users.json"
SERVER_COMPARE_INPUT_DIR = PROJECT_ROOT / "data" / "input" / "fichiers_optionnelles"
LEADERBOARD_FILE.parent.mkdir(parents=True, exist_ok=True)
SERVER_COMPARE_INPUT_DIR.mkdir(parents=True, exist_ok=True)


def _load_local_env(env_path: Path) -> None:
    if not env_path.exists():
        return

    try:
        for raw_line in env_path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()

            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")

            if key:
                os.environ.setdefault(key, value)
    except OSError:
        pass


_load_local_env(BASE_DIR / ".env")

if not LEADERBOARD_FILE.exists():
    LEADERBOARD_FILE.write_text("[]", encoding="utf-8")

if not USERS_FILE.exists():
    USERS_FILE.write_text("[]", encoding="utf-8")


ALGORITHMS = {
    "huffman": {
        "label": "Huffman",
        "compress": huffman_compress,
        "decompress": huffman_decompress,
        "extension": ".huf",
    },
    "lzw": {
        "label": "LZW",
        "compress": lzw_compress,
        "decompress": lzw_decompress,
        "extension": ".lzw",
    },
}


class LeaderboardSubmission(BaseModel):
    player_name: str = Field(min_length=1, max_length=60)
    score: int = Field(ge=0)
    steps: int = Field(ge=0)
    errors: int = Field(ge=0)
    elapsed_seconds: int = Field(ge=0)
    difficulty: str = Field(min_length=1, max_length=20)
    accuracy: int = Field(ge=0, le=100)


class ChatMessage(BaseModel):
    role: str = Field(min_length=1, max_length=20)
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1)


class AuthPayload(BaseModel):
    full_name: str = Field(min_length=1, max_length=80)
    password: str = Field(default="", max_length=120)


class CompareStoredPayload(BaseModel):
    file_path: str = Field(min_length=1, max_length=500)


AI_ASSISTANT_PROMPT = (
    "Tu es Compressemos Assistant, un coach pédagogique sur la compression de données.\\n"
    "Objectif: aider un public curieux à comprendre Huffman, LZW, l'entropie, les ratios et les compromis.\\n"
    "Règles de réponse:\\n"
    "- Réponds en français clair, structuré, concis et concret.\\n"
    "- Utilise des puces quand utile.\\n"
    "- Si la question est vague, pose 1 à 2 questions de clarification maximum.\\n"
    "- Donne des exemples simples (texte, motifs répétés, fichiers aléatoires).\\n"
    "- N'invente pas de mesures exactes sans données.\\n"
    "- Reste centré sur la compression, l'usage de l'app et l'interprétation des résultats."
)

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_BASE_URL = os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta").rstrip("/")


def _normalize_gemini_model(model_name: str) -> str:
    model = (model_name or "").strip()
    if model.startswith("models/"):
        model = model[len("models/"):]
    return model or "gemini-1.5-flash"


def _normalize_player_name(name: str) -> str:
    normalized = " ".join(name.strip().split())
    if not normalized:
        raise HTTPException(status_code=400, detail="Nom du joueur invalide.")
    return normalized[:60]


def _normalize_full_name(name: str) -> str:
    normalized = " ".join(name.strip().split())
    if not normalized:
        raise HTTPException(status_code=400, detail="Le nom complet est requis.")
    if len(normalized) > 80:
        normalized = normalized[:80]
    return normalized


def _load_users() -> list[dict]:
    try:
        raw = USERS_FILE.read_text(encoding="utf-8")
        data = json.loads(raw or "[]")
    except (OSError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=500, detail=f"Impossible de lire les comptes: {exc}") from exc

    return data if isinstance(data, list) else []


def _save_users(users: list[dict]) -> None:
    try:
        USERS_FILE.write_text(
            json.dumps(users, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    except OSError as exc:
        raise HTTPException(status_code=500, detail=f"Impossible d'enregistrer les comptes: {exc}") from exc


def _load_leaderboard_entries() -> list[dict]:
    try:
        raw = LEADERBOARD_FILE.read_text(encoding="utf-8")
        data = json.loads(raw or "[]")
    except (OSError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=500, detail=f"Impossible de lire le classement: {exc}") from exc

    return data if isinstance(data, list) else []


def _save_leaderboard_entries(entries: list[dict]) -> None:
    try:
        LEADERBOARD_FILE.write_text(
            json.dumps(entries, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    except OSError as exc:
        raise HTTPException(status_code=500, detail=f"Impossible d'enregistrer le classement: {exc}") from exc


def _leaderboard_sort_key(entry: dict) -> tuple:
    return (
        -int(entry.get("score", 0)),
        int(entry.get("errors", 0)),
        int(entry.get("elapsed_seconds", 0)),
        str(entry.get("player_name", "")).lower(),
        str(entry.get("created_at", "")),
    )


def _ranked_best_entries(entries: list[dict], limit: int | None = None) -> list[dict]:
    best_by_player: dict[str, dict] = {}

    for entry in entries:
        player_name = _normalize_player_name(str(entry.get("player_name", "")))
        candidate = {**entry, "player_name": player_name}
        current = best_by_player.get(player_name.lower())

        if current is None or _leaderboard_sort_key(candidate) < _leaderboard_sort_key(current):
            best_by_player[player_name.lower()] = candidate

    ranked = sorted(best_by_player.values(), key=_leaderboard_sort_key)

    if limit is not None:
        ranked = ranked[:limit]

    return [
        {
            "rank": index,
            **entry,
        }
        for index, entry in enumerate(ranked, start=1)
    ]


def _require_non_empty_file(data: bytes) -> None:
    if not data:
        raise HTTPException(status_code=400, detail="Le fichier est vide.")


def _entropy(data: bytes) -> float:
    if not data:
        return 0.0

    counts = Counter(data)
    total = len(data)
    return -sum((count / total) * math.log2(count / total) for count in counts.values())


def _compression_ratio(original_size: int, compressed_size: int) -> float:
    return (compressed_size / original_size) if original_size else 0.0


def _space_saving(original_size: int, compressed_size: int) -> float:
    return (1 - (compressed_size / original_size)) if original_size else 0.0


def _resolve_server_compare_file(file_path: str) -> Path:
    normalized = file_path.strip().replace("\\", "/")
    if not normalized:
        raise HTTPException(status_code=400, detail="Chemin de fichier invalide.")

    base = SERVER_COMPARE_INPUT_DIR.resolve()
    candidate = (base / normalized).resolve()

    try:
        candidate.relative_to(base)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Chemin de fichier non autorisé.") from exc

    if not candidate.exists() or not candidate.is_file():
        raise HTTPException(status_code=404, detail="Fichier introuvable sur le serveur.")

    return candidate


def _list_server_compare_files() -> list[dict]:
    files: list[dict] = []
    base = SERVER_COMPARE_INPUT_DIR.resolve()

    for path in base.rglob("*"):
        if not path.is_file():
            continue

        relative = path.resolve().relative_to(base).as_posix()
        stat = path.stat()
        files.append(
            {
                "path": relative,
                "name": path.name,
                "size": stat.st_size,
                "modified_at": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
            }
        )

    files.sort(key=lambda item: item["path"].lower())
    return files


def _serialize_compression_result(data: bytes, filename: str, algorithm_key: str) -> dict:
    algorithm = ALGORITHMS[algorithm_key]
    start = perf_counter()
    compressed = algorithm["compress"](data)
    processing_ms = round((perf_counter() - start) * 1000, 3)
    restored = algorithm["decompress"](compressed)
    original_size = len(data)
    compressed_size = len(compressed)

    return {
        "algorithm": algorithm_key,
        "label": algorithm["label"],
        "filename": filename,
        "output_filename": f"{Path(filename or 'fichier').stem}{algorithm['extension']}",
        "original_size": original_size,
        "compressed_size": compressed_size,
        "compression_ratio": _compression_ratio(original_size, compressed_size),
        "space_saving": _space_saving(original_size, compressed_size),
        "processing_ms": processing_ms,
        "integrity_ok": restored == data,
        "compressed_base64": base64.b64encode(compressed).decode("utf-8"),
        "mime_type": "application/octet-stream",
    }


def _build_compare_response(data: bytes, filename: str, content_type: str) -> dict:
    _require_non_empty_file(data)

    results = []
    for algorithm_key in ALGORITHMS:
        try:
            results.append(_serialize_compression_result(data, filename, algorithm_key))
        except Exception as exc:
            results.append(
                {
                    "algorithm": algorithm_key,
                    "label": ALGORITHMS[algorithm_key]["label"],
                    "filename": filename,
                    "output_filename": None,
                    "original_size": len(data),
                    "compressed_size": None,
                    "compression_ratio": None,
                    "space_saving": None,
                    "processing_ms": None,
                    "integrity_ok": False,
                    "compressed_base64": None,
                    "mime_type": None,
                    "error": str(exc),
                }
            )

    return {
        "filename": filename,
        "content_type": content_type or "application/octet-stream",
        "original_size": len(data),
        "entropy": round(_entropy(data), 4),
        "algorithms": results,
        "best_algorithm": _best_algorithm(results),
        "all_integrity_ok": all(result.get("integrity_ok") for result in results),
    }


def _best_algorithm(results: list[dict]) -> str | None:
    valid_results = [result for result in results if result.get("integrity_ok")]
    if not valid_results:
        return None

    return min(
        valid_results,
        key=lambda result: (result["compressed_size"], result["processing_ms"]),
    )["algorithm"]


def _build_compression_assistant_reply(messages: list[ChatMessage]) -> str:
    last_user = ""
    for msg in reversed(messages):
        if msg.role.lower() == "user" and msg.content.strip():
            last_user = msg.content.strip().lower()
            break

    if not last_user:
        return (
            "Je peux t'expliquer Huffman, LZW, l'entropie, le ratio de compression "
            "et comment interpréter les résultats dans l'application."
        )

    if any(keyword in last_user for keyword in ["bonjour", "salut", "hello", "bonsoir", "coucou"]):
        return (
            "Bonjour 👋 Je suis CompressBot.\n"
            "Je peux t'aider à comprendre :\n"
            "• ce qu'est la compression\n"
            "• la différence entre Huffman et LZW\n"
            "• l'entropie\n"
            "• les ratios et gains de place\n"
            "Pose-moi une question simple comme : 'C'est quoi la compression ?'"
        )

    if any(keyword in last_user for keyword in ["c'est quoi la compression", "compression", "compresser", "compresse"]):
        if all(keyword not in last_user for keyword in ["ratio", "huffman", "lzw", "entropie", "sans perte", "avec perte"]):
            return (
                "La compression consiste à réduire la taille d'un fichier pour qu'il occupe moins d'espace.\n\n"
                "Idée générale :\n"
                "• on représente l'information de manière plus efficace\n"
                "• on évite les répétitions inutiles\n"
                "• on stocke ou transmet le fichier plus facilement\n\n"
                "Il existe deux grandes familles :\n"
                "• compression sans perte : on retrouve exactement le fichier d'origine\n"
                "• compression avec perte : on perd une partie de l'information pour gagner plus de place\n\n"
                "Dans ton application, Huffman et LZW sont des méthodes de compression sans perte."
            )

    if any(keyword in last_user for keyword in ["sans perte", "avec perte", "lossless", "lossy"]):
        return (
            "Différence simple :\n"
            "• Sans perte : on récupère exactement le fichier d'origine après décompression\n"
            "• Avec perte : une partie de l'information est supprimée de façon contrôlée\n\n"
            "Exemples :\n"
            "• Huffman et LZW → sans perte\n"
            "• JPEG audio/vidéo compressés → souvent avec perte\n\n"
            "Pour des documents, textes ou données, on préfère souvent la compression sans perte."
        )

    if any(keyword in last_user for keyword in ["huffman", "arbre", "code binaire", "préfixe"]):
        return (
            "Huffman compresse en attribuant des codes plus courts aux symboles fréquents "
            "et des codes plus longs aux symboles rares.\n"
            "• Étape 1: calculer la fréquence des symboles\n"
            "• Étape 2: construire l'arbre binaire\n"
            "• Étape 3: générer des codes préfixes\n"
            "Résultat: très efficace sur des données avec répétitions."
        )

    if any(keyword in last_user for keyword in ["lzw", "dictionnaire", "motif"]):
        return (
            "LZW remplace des motifs répétés par des index de dictionnaire.\n"
            "• Le dictionnaire grandit pendant la lecture\n"
            "• Les séquences fréquentes deviennent des codes plus courts\n"
            "LZW est souvent performant sur des textes avec motifs répétitifs."
        )

    if any(keyword in last_user for keyword in ["entropie", "entropy"]):
        return (
            "L'entropie mesure l'information moyenne par symbole.\n"
            "Plus l'entropie est basse, plus la compression est généralement facile.\n"
            "En pratique: des données très aléatoires se compressent peu."
        )

    if any(keyword in last_user for keyword in ["ratio", "taux", "gain", "space saving"]):
        return (
            "Dans l'application:\n"
            "• compression_ratio = taille_compressée / taille_originale\n"
            "• ratio (gain) = 1 - compression_ratio\n"
            "Exemple: 0.40 de compression_ratio => 60% d'espace économisé."
        )

    if any(keyword in last_user for keyword in ["différence", "comparer", "huffman ou lzw"]):
        return (
            "Comparaison rapide:\n"
            "• Huffman: basé sur les fréquences des symboles\n"
            "• LZW: basé sur des séquences et dictionnaire\n"
            "Teste les deux sur ton fichier: l'app montre directement le meilleur."
        )

    if any(keyword in last_user for keyword in ["qui es-tu", "qui es tu", "tu es qui"]):
        return (
            "Je suis CompressBot, un assistant pédagogique spécialisé dans la compression de données.\n"
            "Je peux expliquer les concepts, comparer les algorithmes et t'aider à lire les résultats de l'application."
        )

    return (
        "Je peux t'aider sur la compression.\n"
        "Par exemple, tu peux me demander :\n"
        "• C'est quoi la compression ?\n"
        "• Comment fonctionne Huffman ?\n"
        "• À quoi sert LZW ?\n"
        "• Comment lire le ratio de compression ?"
    )


def _messages_to_gemini_payload(messages: list[ChatMessage]) -> list[dict]:
    normalized: list[tuple[str, str]] = []

    for message in messages:
        text = message.content.strip()
        if not text:
            continue

        role = "model" if message.role.lower() in {"assistant", "model", "bot"} else "user"
        normalized.append((role, text))

    # Gemini attend généralement un premier tour utilisateur.
    first_user_index = next((i for i, (role, _) in enumerate(normalized) if role == "user"), -1)
    if first_user_index == -1:
        normalized = [("user", "Bonjour")]
    else:
        normalized = normalized[first_user_index:]

    contents: list[dict] = []
    for role, text in normalized:
        if contents and contents[-1]["role"] == role:
            previous_text = contents[-1]["parts"][0]["text"]
            contents[-1]["parts"][0]["text"] = f"{previous_text}\n{text}"
            continue

        contents.append({"role": role, "parts": [{"text": text}]})

    return contents


def _build_gemini_reply(messages: list[ChatMessage]) -> str:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY manquante.")

    safe_model = quote(_normalize_gemini_model(GEMINI_MODEL), safe="")
    url = f"{GEMINI_BASE_URL}/models/{safe_model}:generateContent?key={GEMINI_API_KEY}"

    contents = _messages_to_gemini_payload(messages)

    prompt_prefix = f"[INSTRUCTIONS]\n{AI_ASSISTANT_PROMPT}\n[/INSTRUCTIONS]"
    if not contents:
        contents = [{"role": "user", "parts": [{"text": prompt_prefix}]}]
    elif contents[0].get("role") == "user":
        first_text = contents[0]["parts"][0].get("text", "")
        contents[0]["parts"][0]["text"] = f"{prompt_prefix}\n\n{first_text}".strip()
    else:
        contents.insert(0, {"role": "user", "parts": [{"text": prompt_prefix}]})

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 700,
        },
    }

    request = UrlRequest(
        url=url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=25) as response:
            raw = response.read().decode("utf-8")
    except HTTPError as exc:
        detail = ""
        try:
            detail = exc.read().decode("utf-8")
        except Exception:
            detail = ""
        suffix = f" - {detail}" if detail else ""
        raise RuntimeError(f"Gemini indisponible: HTTP {exc.code} {exc.reason}{suffix}") from exc
    except (URLError, TimeoutError) as exc:
        raise RuntimeError(f"Gemini indisponible: {exc}") from exc

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise RuntimeError("Réponse Gemini invalide.") from exc

    candidates = data.get("candidates") or []
    if not candidates:
        raise RuntimeError("Aucune réponse candidate reçue.")

    parts = candidates[0].get("content", {}).get("parts", [])
    text = "\n".join(part.get("text", "").strip() for part in parts if part.get("text"))

    if not text:
        raise RuntimeError("Réponse Gemini vide.")

    return text


def _build_ai_reply(messages: list[ChatMessage]) -> str:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY manquante. Configure la clé dans web/backend/.env.")

    return _build_gemini_reply(messages)


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """Page d'accueil"""
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/compress")
@app.post("/api/compress")
async def api_compress(
    file: UploadFile,
    algorithm: str = Form("huffman")
):
    algo = algorithm.lower().strip()
    if algo not in ALGORITHMS:
        raise HTTPException(status_code=400, detail="Algorithme inconnu")

    data = await file.read()
    _require_non_empty_file(data)

    try:
        result = _serialize_compression_result(data, file.filename or "fichier", algo)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Échec de compression {algo}: {exc}") from exc

    return {
        "filename": result["filename"],
        "output_filename": result["output_filename"],
        "original_size": result["original_size"],
        "compressed_size": result["compressed_size"],
        "ratio": result["space_saving"],
        "compression_ratio": result["compression_ratio"],
        "processing_ms": result["processing_ms"],
        "integrity_ok": result["integrity_ok"],
        "algorithm": result["algorithm"],
        "label": result["label"],
        "compressed_base64": result["compressed_base64"],
        "mime_type": result["mime_type"],
    }


@app.post("/compare")
@app.post("/api/compare")
async def api_compare(file: UploadFile):
    data = await file.read()
    filename = file.filename or "fichier"
    return _build_compare_response(data, filename, file.content_type or "application/octet-stream")


@app.get("/compare/files")
@app.get("/api/compare/files")
async def api_compare_files():
    return {
        "base_dir": str(SERVER_COMPARE_INPUT_DIR),
        "files": _list_server_compare_files(),
    }


@app.post("/compare/stored")
@app.post("/api/compare/stored")
async def api_compare_stored(payload: CompareStoredPayload):
    server_file = _resolve_server_compare_file(payload.file_path)

    try:
        data = server_file.read_bytes()
    except OSError as exc:
        raise HTTPException(status_code=500, detail=f"Impossible de lire le fichier serveur: {exc}") from exc

    content_type = mimetypes.guess_type(server_file.name)[0] or "application/octet-stream"
    return _build_compare_response(data, server_file.name, content_type)


@app.post("/auth/signup")
@app.post("/api/auth/signup")
async def api_signup(payload: AuthPayload):
    full_name = _normalize_full_name(payload.full_name)
    password = payload.password or ""
    users = _load_users()

    existing = next(
        (u for u in users if str(u.get("full_name", "")).strip().lower() == full_name.lower()),
        None,
    )

    if existing is not None:
        raise HTTPException(status_code=409, detail="Ce nom est déjà utilisé. Connecte-toi.")

    users.append(
        {
            "full_name": full_name,
            "password": password,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    )
    _save_users(users)

    return {
        "message": "Compte créé avec succès.",
        "full_name": full_name,
    }


@app.post("/auth/login")
@app.post("/api/auth/login")
async def api_login(payload: AuthPayload):
    full_name = _normalize_full_name(payload.full_name)
    password = payload.password or ""
    users = _load_users()

    account = next(
        (u for u in users if str(u.get("full_name", "")).strip().lower() == full_name.lower()),
        None,
    )

    if account is None:
        raise HTTPException(status_code=404, detail="Compte introuvable. Crée un compte d'abord.")

    stored_password = str(account.get("password", ""))
    if stored_password != password:
        raise HTTPException(status_code=401, detail="Mot de passe incorrect.")

    return {
        "message": "Connexion réussie.",
        "full_name": str(account.get("full_name", full_name)),
    }


@app.get("/api/leaderboard")
async def api_leaderboard(limit: int = 20):
    safe_limit = max(1, min(limit, 100))
    entries = _load_leaderboard_entries()
    ranked_entries = _ranked_best_entries(entries, limit=safe_limit)

    return {
        "entries": ranked_entries,
        "total_players": len(_ranked_best_entries(entries)),
        "total_submissions": len(entries),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/api/leaderboard/submit")
async def api_submit_leaderboard(payload: LeaderboardSubmission):
    entries = _load_leaderboard_entries()
    normalized_name = _normalize_player_name(payload.player_name)

    entry = {
        "player_name": normalized_name,
        "score": payload.score,
        "steps": payload.steps,
        "errors": payload.errors,
        "elapsed_seconds": payload.elapsed_seconds,
        "difficulty": payload.difficulty.strip().lower(),
        "accuracy": payload.accuracy,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    entries.append(entry)
    _save_leaderboard_entries(entries)

    return {
        "message": "Score enregistré avec succès.",
        "entry": entry,
        "leaderboard": _ranked_best_entries(entries, limit=10),
    }


@app.post("/api/chat")
async def api_chat(payload: ChatRequest):
    try:
        reply = _build_ai_reply(payload.messages)
        return {"reply": reply}
    except RuntimeError as exc:
        print(f"[AI] Gemini error: {exc}")
        raise HTTPException(
            status_code=503,
            detail="Assistant IA temporairement indisponible. Réessayez dans quelques instants.",
        ) from exc


@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """Page de connexion simple (statique pour le test)"""
    return templates.TemplateResponse("login.html", {"request": request})


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})
