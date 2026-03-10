import shutil
from pathlib import Path
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QLabel, QPushButton, QFileDialog, QButtonGroup,
    QHBoxLayout, QMessageBox, QFrame, QInputDialog, QGraphicsDropShadowEffect
)
from PySide6.QtGui import QFont, QColor, QPalette, QBrush
from PySide6.QtCore import Qt, QEvent, QPropertyAnimation, QParallelAnimationGroup
from src.algorithms.lzw.encoder import encoder as lzw_encoder
from src.algorithms.lzw.decoder import decoder as lzw_decoder
from src.algorithms.huffman.compress import huffman_compress
from src.algorithms.huffman.decompress import huffman_decompress
from src.utils.pdf_extractor import extract_text_from_pdf, save_text_to_file

class CompressPage(QWidget):
    def __init__(self, router):
        super().__init__()
        self.router = router
        self.selected_file = None
        self.selected_algorithm = "Huffman"

        self._setup_background()
        self._build_ui()

    # === Palette principale ===
    GREEN = "#FFFFFF"

    # ------------------------------------------------------------
    def _setup_background(self):
        pal = QPalette()
        pal.setBrush(QPalette.Window, QBrush(QColor("#0B0B0B")))
        self.setPalette(pal)
        self.setAutoFillBackground(True)

    # ------------------------------------------------------------
    def _build_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(40, 30, 40, 30)
        layout.setSpacing(0)
        layout.setAlignment(Qt.AlignCenter)

        card = QFrame()
        card.setObjectName("compressCard")
        card.setFixedWidth(800)
        card.setFixedHeight(550)
        card.setStyleSheet("""
            QFrame#compressCard {
                background-color: #1F1F1F;
                border: 1px solid #2B2B2B;
                border-radius: 22px;
            }
        """)
        card_layout = QVBoxLayout(card)
        card_layout.setContentsMargins(28, 28, 28, 28)
        card_layout.setSpacing(22)

        upload_frame = QFrame()
        upload_frame.setObjectName("uploadFrame")
        upload_frame.setStyleSheet("""
            QFrame {
                background-color: #262626;
                border: 1px solid #3A3A3A;
                border-radius: 18px;
            }
        """)
        self._upload_frame = upload_frame
        self._upload_shadow = QGraphicsDropShadowEffect(upload_frame)
        self._upload_shadow.setBlurRadius(18)
        self._upload_shadow.setOffset(0, 6)
        self._upload_shadow.setColor(QColor(0, 0, 0, 90))
        upload_frame.setGraphicsEffect(self._upload_shadow)
        self._upload_anim = None
        upload_layout = QVBoxLayout(upload_frame)
        upload_layout.setContentsMargins(12, 12, 12, 12)
        upload_layout.setSpacing(0)

        upload_btn = QPushButton("📄\nCliquez pour importer un fichier")
        upload_btn.setCursor(Qt.PointingHandCursor)
        upload_btn.clicked.connect(self._select_file)
        upload_btn.setFixedHeight(150)
        upload_btn.setStyleSheet("""
            QPushButton {
                background: transparent;
                border: none;
                color: #D1D5DB;
                font-size: 13px;
                font-weight: 500;
                padding: 26px 12px;
            }
            QPushButton:hover {
                color: #F9FAFB;
            }
        """)
        upload_btn.installEventFilter(self)
        self._upload_btn = upload_btn

        upload_layout.addWidget(upload_btn)

        self.file_label = QLabel("Aucun fichier sélectionné")
        self.file_label.setStyleSheet("color: #9CA3AF; font-size: 12px;")
        self.file_label.setAlignment(Qt.AlignCenter)

        card_layout.addWidget(upload_frame)
        card_layout.addWidget(self.file_label)

        algo_title = QLabel("Choisissez un algorithme :")
        algo_title.setStyleSheet("color: #D1D5DB; font-size: 12px; font-weight: 600;")
        card_layout.addWidget(algo_title)

        algo_row = QHBoxLayout()
        algo_row.setSpacing(16)

        self.algo_group = QButtonGroup(self)
        self.algo_group.setExclusive(True)

        self.huffman_btn = QPushButton("Huffman\nCompression optimale binaire.")
        self.lzw_btn = QPushButton("LZW\nCompression par dictionnaire.")
        for btn, algo in ((self.huffman_btn, "Huffman"), (self.lzw_btn, "LZW")):
            btn.setCheckable(True)
            btn.setCursor(Qt.PointingHandCursor)
            btn.setFixedHeight(100)
            btn.setStyleSheet("""
                QPushButton {
                    background-color: #2A2A2A;
                    border: 1px solid #3A3A3A;
                    border-radius: 14px;
                    color: #D1D5DB;
                    text-align: left;
                    padding: 12px 14px;
                    font-size: 12px;
                    font-weight: 600;
                }
                QPushButton:checked {
                    background-color: #FFFFFF;
                    color: #111827;
                    border: 1px solid #FFFFFF;
                }
            """)
            btn.clicked.connect(lambda _, a=algo: self._select_algorithm(a))
            self.algo_group.addButton(btn)
            algo_row.addWidget(btn)

        self.huffman_btn.setChecked(True)
        card_layout.addLayout(algo_row)

        btn_container = QHBoxLayout()
        btn_container.setSpacing(12)

        self.start_btn = QPushButton("Compresser")
        self.start_btn.setCursor(Qt.PointingHandCursor)
        self.start_btn.setFixedHeight(44)
        self.start_btn.clicked.connect(self._compress_file)
        self.start_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {self.GREEN};
                color: #111827;
                border: none;
                border-radius: 14px;
                font-weight: 700;
                font-size: 14px;
            }}
            QPushButton:hover {{ background-color: #F3F4F6; }}
            QPushButton:pressed {{ background-color: #E5E7EB; }}
        """)
        btn_container.addWidget(self.start_btn)

        self.decompress_btn = QPushButton("Décompresser")
        self.decompress_btn.setCursor(Qt.PointingHandCursor)
        self.decompress_btn.setFixedHeight(44)
        self.decompress_btn.clicked.connect(self._decompress_file)
        self.decompress_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {self.GREEN};
                color: #111827;
                border: none;
                border-radius: 14px;
                font-weight: 700;
                font-size: 14px;
            }}
            QPushButton:hover {{ background-color: #F3F4F6; }}
            QPushButton:pressed {{ background-color: #E5E7EB; }}
        """)
        btn_container.addWidget(self.decompress_btn)

        self.pdf_btn = QPushButton("📄 PDF → Texte")
        self.pdf_btn.setCursor(Qt.PointingHandCursor)
        self.pdf_btn.setFixedHeight(44)
        self.pdf_btn.clicked.connect(self._convert_pdf_to_text)
        self.pdf_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {self.GREEN};
                color: #111827;
                border: none;
                border-radius: 14px;
                font-weight: 700;
                font-size: 14px;
            }}
            QPushButton:hover {{ background-color: #F3F4F6; }}
            QPushButton:pressed {{ background-color: #E5E7EB; }}
        """)
        btn_container.addWidget(self.pdf_btn)

        card_layout.addLayout(btn_container)

        layout.addWidget(card)

    # ------------------------------------------------------------
    def eventFilter(self, watched, event):
        if watched is getattr(self, "_upload_btn", None):
            if event.type() == QEvent.Enter:
                self._animate_upload_frame(hovered=True)
            elif event.type() == QEvent.Leave:
                self._animate_upload_frame(hovered=False)
        return super().eventFilter(watched, event)

    def _animate_upload_frame(self, hovered: bool):
        if getattr(self, "_upload_anim", None):
            self._upload_anim.stop()

        a1 = QPropertyAnimation(self._upload_shadow, b"blurRadius")
        a1.setDuration(280)
        a1.setStartValue(self._upload_shadow.blurRadius())
        a1.setEndValue(36 if hovered else 18)

        a2 = QPropertyAnimation(self._upload_shadow, b"yOffset")
        a2.setDuration(280)
        a2.setStartValue(self._upload_shadow.yOffset())
        a2.setEndValue(14 if hovered else 6)

        self._upload_anim = QParallelAnimationGroup(self)
        self._upload_anim.addAnimation(a1)
        self._upload_anim.addAnimation(a2)
        self._upload_anim.start()

    # ------------------------------------------------------------
    def _select_file(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Choisir un fichier",
            "",
            "Tous les fichiers (*);;Fichiers texte (*.txt);;Fichiers PDF (*.pdf)",
        )
        if not file_path:
            return
        data_dir = Path("data/input")
        data_dir.mkdir(exist_ok=True)
        dest_path = data_dir / Path(file_path).name
        try:
            shutil.copy(file_path, dest_path)
            self.selected_file = dest_path
            self.file_label.setText(f"Fichier : {dest_path.name}")
        except Exception as e:
            QMessageBox.critical(self, "Erreur", f"Impossible de copier le fichier : {e}")

    def _select_algorithm(self, algo_name):
        self.selected_algorithm = algo_name

    def _compress_file(self):
        if not self.selected_file or not self.selected_algorithm:
            QMessageBox.warning(self, "Attention", "Sélectionnez un fichier .txt et un algorithme d'abord.")
            return

        if Path(self.selected_file).suffix.lower() != ".txt":
            QMessageBox.warning(self, "Attention", "Seuls les fichiers .txt peuvent être compressés.")
            return

        with open(self.selected_file, "rb") as f:
            data = f.read()
        if self.selected_algorithm == "LZW":
            import time
            start = time.perf_counter()
            compressed = lzw_encoder(data)
            elapsed = time.perf_counter() - start
            ext = ".lzw"
        elif self.selected_algorithm == "Huffman":
            import time
            start = time.perf_counter()
            compressed = huffman_compress(data)
            elapsed = time.perf_counter() - start
            ext = ".huf"
        else:
            QMessageBox.warning(self, "Erreur", "Algorithme inconnu.")
            return

        out_dir = Path("data/output")
        out_dir.mkdir(parents=True, exist_ok=True)

        out_path = out_dir / f"{self.selected_file.stem}{ext}"

        try:
            with out_path.open("wb") as f:
                f.write(compressed)

            # Stocker les infos pour la page comparaison
            if hasattr(self.router, "__dict__"):
                last = getattr(self.router, "last_compress", None)
                original = str(self.selected_file)
                if not isinstance(last, dict) or last.get("original") != original:
                    last = {
                        "original": original,
                        "outputs": {},
                        "times": {},
                        "sizes": {},
                    }
                algo_key = self.selected_algorithm
                last["outputs"][algo_key] = str(out_path)
                last["times"][algo_key] = round(elapsed, 6)
                last["sizes"][algo_key] = len(compressed)
                self.router.last_compress = last

                compare_page = self.router._pages.get("compare") if hasattr(self.router, "_pages") else None
                if compare_page and hasattr(compare_page, "generate_from_file"):
                    try:
                        compare_page.generate_from_file(use_last_only=True)
                    except Exception:
                        pass

            QMessageBox.information(
                self,
                "Compression terminée",
                f"Le fichier a été compressé avec {self.selected_algorithm}.\n\n"
                f"Sortie : {out_path}"
            )
        except Exception as e:
            QMessageBox.critical(self, "Erreur", f"Impossible d'écrire le fichier compressé : {e}")            

    def _decompress_file(self):
        if self.selected_algorithm == "Huffman":
            filter_text = "Fichiers Huffman (*.huf)"
        elif self.selected_algorithm == "LZW":
            filter_text = "Fichiers LZW (*.lzw)"
        else:
            filter_text = "Fichiers compressés (*.huf *.lzw)"

        file_path, _ = QFileDialog.getOpenFileName(
            self, "Choisir un fichier à décompresser", "", filter_text
        )
        if not file_path:
            return

        in_path = Path(file_path)
        with in_path.open("rb") as f:
            data = f.read()

        if in_path.suffix.lower() == ".lzw":
            decompressed = lzw_decoder(data)
            out_ext = ".bin"
        elif in_path.suffix.lower() == ".huf":
            decompressed = huffman_decompress(data)
            out_ext = ".bin"
        else:
            QMessageBox.warning(self, "Erreur", "Extension inconnue. Utilisez .huf ou .lzw.")
            return

        out_dir = Path("data/output")
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / f"{in_path.stem}_decompressed{out_ext}"

        try:
            with out_path.open("wb") as f:
                f.write(decompressed)

            QMessageBox.information(
                self,
                "Décompression terminée",
                f"Le fichier a été décompressé.\n\nSortie : {out_path}"
            )
        except Exception as e:
            QMessageBox.critical(self, "Erreur", f"Impossible d'écrire le fichier décompressé : {e}")

    # ------------------------------------------------------------
    def _convert_pdf_to_text(self):
        """Convertit un fichier PDF en texte"""
        if not self.selected_file or self.selected_file.suffix.lower() != ".pdf":
            QMessageBox.warning(self, "Attention", "Sélectionnez d'abord un fichier PDF pour la conversion.")
            return

        file_path = str(self.selected_file)
        if not file_path:
            return
        if Path(file_path).suffix.lower() != ".pdf":
            QMessageBox.warning(self, "Attention", "Veuillez sélectionner un fichier PDF.")
            return

        try:
            text = extract_text_from_pdf(file_path, use_pdfplumber=True, preserve_layout=False)

            if not text.strip():
                QMessageBox.warning(self, "Attention", "Aucun texte n'a pu être extrait du PDF.")
                return

            output_dir = Path("data/output")
            output_dir.mkdir(parents=True, exist_ok=True)

            input_filename = Path(file_path).stem
            output_path = output_dir / f"{input_filename}.txt"

            save_text_to_file(text, str(output_path))

            QMessageBox.information(
                self,
                "Conversion terminée",
                f"Le fichier PDF a été converti en texte.\n\n"
                f"Sortie : {output_path}\n\n"
                f"Nombre de caractères : {len(text)}"
            )
        except FileNotFoundError as e:
            QMessageBox.critical(self, "Erreur", f"Fichier PDF introuvable : {e}")
        except ValueError as e:
            QMessageBox.critical(self, "Erreur", f"Erreur de format : {e}")
        except Exception as e:
            QMessageBox.critical(self, "Erreur", f"Impossible de convertir le PDF : {e}")

    # ------------------------------------------------------------
    def _open_vulgarisation(self, mode="file"):
        # Vérifier l'algorithme si mode texte
        if mode == "text" and not self.selected_algorithm:
            algos = ["Huffman", "LZW"]
            algo, ok = QInputDialog.getItem(self, "Choix de l'algorithme", 
                                            "Veuillez choisir un algorithme pour la vulgarisation :", 
                                            algos, 0, False)
            if not ok or not algo:
                return
            self.selected_algorithm = algo

        page = self.router._pages.get("huffman_vulgar") if hasattr(self.router, "_pages") else None
        text = None

        if mode == "file" and self.selected_file:
            try:
                p = Path(self.selected_file)
                max_bytes = 50_000
                with p.open("rb") as f:
                    raw = f.read(max_bytes)
                text = raw.decode("utf-8", errors="replace")
            except Exception:
                text = None

        elif mode == "text":
            text, ok = QInputDialog.getMultiLineText(self, "Vulgarisation texte libre", 
                                                    "Entrez le texte à vulgariser :")
            if not ok or not text.strip():
                return

        if page and text:
            try:
                page.set_text(text)
            except Exception:
                pass

        try:
            self.router.go_to("huffman_vulgar")
        except Exception:
            pass
