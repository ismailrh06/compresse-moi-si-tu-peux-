from fastapi import FastAPI, Request, UploadFile, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

# Import de tes algorithmes existants
from src.algorithms import huffman

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


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """Page d'accueil"""
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/compress", response_class=HTMLResponse)
@app.post("/api/compress")
async def api_compress(
    file: UploadFile,
    algorithm: str = Form("huffman")
):
    data = await file.read()

    if algorithm == "huffman":
        compressed = huffman.compress(data)
    else:
        return {"error": "Algorithme inconnu"}

    return {
        "filename": file.filename,
        "original_size": len(data),
        "compressed_size": len(compressed),
        "ratio": (1 - len(compressed) / len(data)) if len(data) > 0 else 0,
        "algorithm": algorithm
    }

async def compress_file(
    request: Request,
    file: UploadFile,
    algorithm: str = Form("huffman")
):
    """Compression d’un fichier uploadé"""
    data = await file.read()

    if algorithm == "huffman":
        compressed = huffman.compress(data)
    elif algorithm == "lzw":
        pass
    else:
        return templates.TemplateResponse("index.html", {
            "request": request,
            "error": "Algorithme inconnu."
        })

    ratio = (1 - len(compressed) / len(data)) * 100 if len(data) > 0 else 0

    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "filename": file.filename,
        "original_size": len(data),
        "compressed_size": len(compressed),
        "ratio": f"{ratio:.2f}%",
        "algorithm": algorithm.upper(),
    })


@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """Page de connexion simple (statique pour le test)"""
    return templates.TemplateResponse("login.html", {"request": request})
