"""
Extracteur de texte à partir de fichiers PDF avec support multi-format.
Supporte PyPDF2 et pdfplumber pour une extraction robuste.
"""

from pathlib import Path
from typing import Optional, Tuple
import logging

try:
    from PyPDF2 import PdfReader
    PYPDF2_AVAILABLE = True
except ImportError:
    PYPDF2_AVAILABLE = False

try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False

logger = logging.getLogger(__name__)


def extract_text_from_pdf(
    pdf_path: str,
    use_pdfplumber: bool = True,
    preserve_layout: bool = False,
) -> str:
    """
    Extrait le texte brut d'un fichier PDF.

    Args:
        pdf_path (str): Chemin vers le fichier PDF.
        use_pdfplumber (bool): Utiliser pdfplumber si disponible (meilleure extraction).
        preserve_layout (bool): Préserver la mise en page du PDF.

    Returns:
        str: Texte extrait du PDF.

    Raises:
        FileNotFoundError: Si le fichier n'existe pas.
        ValueError: Si aucune librairie de PDF n'est disponible.
        Exception: En cas d'erreur lors de la lecture du PDF.
    """
    pdf_path = Path(pdf_path)

    if not pdf_path.exists():
        raise FileNotFoundError(f"Fichier introuvable : {pdf_path}")

    if not pdf_path.suffix.lower() == ".pdf":
        raise ValueError(f"Le fichier n'est pas un PDF : {pdf_path}")

    if use_pdfplumber and PDFPLUMBER_AVAILABLE:
        return _extract_with_pdfplumber(pdf_path, preserve_layout)
    elif PYPDF2_AVAILABLE:
        return _extract_with_pypdf2(pdf_path)
    else:
        raise ValueError(
            "Aucune librairie PDF disponible. "
            "Installez PyPDF2 ou pdfplumber : pip install PyPDF2 pdfplumber"
        )


def _extract_with_pdfplumber(pdf_path: Path, preserve_layout: bool = False) -> str:
    """
    Extraction avec pdfplumber (meilleure qualité).
    """
    try:
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                try:
                    page_text = page.extract_text(
                        layout=preserve_layout,
                        x_tolerance=3,
                        y_tolerance=3,
                    )
                    if page_text:
                        text += page_text + "\n"
                except Exception as e:
                    logger.warning(f"Erreur lors de la lecture page {page_num} : {e}")
                    continue

        return text.strip()
    except Exception as e:
        logger.error(f"Erreur avec pdfplumber : {e}")
        raise


def _extract_with_pypdf2(pdf_path: Path) -> str:
    """
    Extraction avec PyPDF2 (fallback).
    """
    try:
        text = ""
        with open(pdf_path, "rb") as f:
            reader = PdfReader(f)
            for page_num, page in enumerate(reader.pages, 1):
                try:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                except Exception as e:
                    logger.warning(f"Erreur lors de la lecture page {page_num} : {e}")
                    continue

        return text.strip()
    except Exception as e:
        logger.error(f"Erreur avec PyPDF2 : {e}")
        raise


def extract_pdf_info(pdf_path: str) -> Tuple[int, Optional[str]]:
    """
    Extrait les métadonnées du PDF.

    Args:
        pdf_path (str): Chemin vers le fichier PDF.

    Returns:
        Tuple[int, Optional[str]]: (nombre de pages, titre du PDF)
    """
    pdf_path = Path(pdf_path)

    if not pdf_path.exists():
        raise FileNotFoundError(f"Fichier introuvable : {pdf_path}")

    if PDFPLUMBER_AVAILABLE:
        try:
            with pdfplumber.open(pdf_path) as pdf:
                num_pages = len(pdf.pages)
                metadata = pdf.metadata
                title = metadata.get("Title") if metadata else None
                return num_pages, title
        except Exception as e:
            logger.warning(f"Erreur avec pdfplumber : {e}")

    if PYPDF2_AVAILABLE:
        try:
            with open(pdf_path, "rb") as f:
                reader = PdfReader(f)
                num_pages = len(reader.pages)
                metadata = reader.metadata
                title = metadata.get("/Title") if metadata else None
                return num_pages, title
        except Exception as e:
            logger.error(f"Erreur avec PyPDF2 : {e}")

    raise ValueError("Aucune librairie PDF disponible")


def save_text_to_file(text: str, output_path: str) -> None:
    """
    Sauvegarde le texte extrait dans un fichier.

    Args:
        text (str): Texte à sauvegarder.
        output_path (str): Chemin du fichier de sortie.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)

    logger.info(f"Texte sauvegardé dans : {output_path}")

