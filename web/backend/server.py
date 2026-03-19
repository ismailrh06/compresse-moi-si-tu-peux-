from __future__ import annotations

import base64
import json
import math
import sys
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
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
LEADERBOARD_FILE = BASE_DIR / "data" / "leaderboard.json"
LEADERBOARD_FILE.parent.mkdir(parents=True, exist_ok=True)

if not LEADERBOARD_FILE.exists():
    LEADERBOARD_FILE.write_text("[]", encoding="utf-8")


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


def _normalize_player_name(name: str) -> str:
    normalized = " ".join(name.strip().split())
    if not normalized:
        raise HTTPException(status_code=400, detail="Nom du joueur invalide.")
    return normalized[:60]


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


def _best_algorithm(results: list[dict]) -> str | None:
    valid_results = [result for result in results if result.get("integrity_ok")]
    if not valid_results:
        return None

    return min(
        valid_results,
        key=lambda result: (result["compressed_size"], result["processing_ms"]),
    )["algorithm"]


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
    _require_non_empty_file(data)

    filename = file.filename or "fichier"
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
        "content_type": file.content_type or "application/octet-stream",
        "original_size": len(data),
        "entropy": round(_entropy(data), 4),
        "algorithms": results,
        "best_algorithm": _best_algorithm(results),
        "all_integrity_ok": all(result.get("integrity_ok") for result in results),
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


@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """Page de connexion simple (statique pour le test)"""
    return templates.TemplateResponse("login.html", {"request": request})


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})
