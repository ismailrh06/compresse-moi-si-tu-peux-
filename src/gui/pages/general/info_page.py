import webbrowser

from PySide6.QtWidgets import (
	QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QScrollArea,
	QFrame, QGraphicsDropShadowEffect
)
from PySide6.QtGui import QFont, QColor, QLinearGradient, QPalette, QBrush
from PySide6.QtCore import Qt


class InfoPage(QWidget):
	"""Page d'information académique simple et professionnelle (plateforme & compression)."""

	PRIMARY = "#F5F7FB"
	PRIMARY_SOFT = "#E9EDF6"
	ACCENT = "#2563EB"
	ACCENT_2 = "#0EA5E9"
	CARD_BG = "rgba(255, 255, 255, 0.92)"
	CARD_BORDER = "rgba(15, 23, 42, 0.12)"
	TEXT_PRIMARY = "#0F172A"
	TEXT_SECONDARY = "#334155"
	TEXT_MUTED = "#64748B"

	def __init__(self, router):
		super().__init__()
		self.router = router
		self._setup_background()
		self._build_ui()

	def _setup_background(self):
		gradient = QLinearGradient(0, 0, 1920, 1080)
		gradient.setCoordinateMode(QLinearGradient.StretchToDeviceMode)
		gradient.setColorAt(0.0, QColor("#F8FAFF"))
		gradient.setColorAt(0.5, QColor("#EEF2FF"))
		gradient.setColorAt(1.0, QColor("#E2E8F0"))
		pal = QPalette()
		pal.setBrush(QPalette.Window, QBrush(gradient))
		self.setPalette(pal)
		self.setAutoFillBackground(True)

	def _build_ui(self):
		scroll = QScrollArea()
		scroll.setWidgetResizable(True)
		scroll.setFrameShape(QFrame.NoFrame)
		scroll.setStyleSheet("""
			QScrollArea { background: transparent; }
			QScrollBar:vertical {
				background: transparent;
				width: 12px;
				margin: 6px 4px 6px 0px;
			}
			QScrollBar::handle:vertical {
				background: rgba(37,99,235,0.35);
				border-radius: 6px;
				min-height: 30px;
			}
			QScrollBar::handle:vertical:hover { background: rgba(37,99,235,0.5); }
			QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
				height: 0px;
				background: transparent;
			}
		""")

		content = QWidget()
		scroll.setWidget(content)

		page_layout = QVBoxLayout(self)
		page_layout.setContentsMargins(0, 0, 0, 0)
		page_layout.addWidget(scroll)

		layout = QVBoxLayout(content)
		layout.setContentsMargins(32, 32, 32, 32)
		layout.setSpacing(16)

		# === Main container ===
		main = QFrame()
		main.setStyleSheet(f"""
			QFrame {{
				background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
					stop:0 rgba(255,255,255,0.96), stop:1 rgba(248,250,255,0.92));
				border: 1px solid {self.CARD_BORDER};
				border-radius: 22px;
				padding: 24px;
			}}
		""")
		main_shadow = QGraphicsDropShadowEffect()
		main_shadow.setBlurRadius(22)
		main_shadow.setOffset(0, 8)
		main_shadow.setColor(QColor(15, 23, 42, 70))
		main.setGraphicsEffect(main_shadow)
		layout.addWidget(main)

		main_layout = QVBoxLayout(main)
		main_layout.setSpacing(14)

		badge = QLabel("Plateforme académique")
		badge.setStyleSheet("""
			QLabel {
				background-color: rgba(37,99,235,0.08);
				color: #1E3A8A;
				border: 1px solid rgba(37,99,235,0.22);
				border-radius: 999px;
				padding: 4px 10px;
				font-size: 11px;
				font-weight: 600;
			}
		""")
		badge.setFixedHeight(22)

		title = QLabel("Compression de données — Huffman & LZW")
		title.setFont(QFont("Inter", 24, QFont.Bold))
		title.setStyleSheet(f"color: {self.TEXT_PRIMARY};")

		subtitle = QLabel(
			"Une plateforme pédagogique pour comprendre la compression sans perte, analyser des fichiers réels et comparer les algorithmes sur des métriques objectives."
		)
		subtitle.setWordWrap(True)
		subtitle.setStyleSheet(f"color: {self.TEXT_SECONDARY}; font-size: 13px;")

		main_layout.addWidget(badge, alignment=Qt.AlignLeft)
		main_layout.addWidget(title)
		main_layout.addWidget(subtitle)

		def divider():
			line = QFrame()
			line.setFrameShape(QFrame.HLine)
			line.setStyleSheet("QFrame { color: rgba(15,23,42,0.12); }")
			line.setFixedHeight(1)
			return line

		def section(title_text, body_text):
			t = QLabel(title_text)
			t.setStyleSheet(f"color: {self.TEXT_PRIMARY}; font-size: 14px; font-weight: 700;")
			b = QLabel(body_text)
			b.setWordWrap(True)
			b.setStyleSheet(f"color: {self.TEXT_SECONDARY}; font-size: 12.5px; line-height: 1.6em;")
			main_layout.addWidget(t)
			main_layout.addWidget(b)

		main_layout.addWidget(divider())
		section(
			"À propos de la plateforme",
			"Cette application offre un environnement clair pour expérimenter la compression, comparer les méthodes et interpréter les résultats de manière académique. Elle combine une interface graphique, des mesures automatiques et des visualisations simples."
		)
		main_layout.addWidget(divider())
		section(
			"Fondements de la compression",
			"La compression sans perte garantit la restitution exacte des données. Elle s'appuie sur l'entropie, l'exploitation des redondances et l'organisation statistique des symboles."
		)
		main_layout.addWidget(divider())
		section(
			"Huffman et LZW",
			"Huffman attribue des codes courts aux symboles fréquents via un arbre binaire optimal. LZW construit un dictionnaire dynamique qui capture les séquences répétées pour réduire la taille globale."
		)
		main_layout.addWidget(divider())
		section(
			"Évaluation et métriques",
			"Les mesures clés incluent le taux de compression, la taille finale, le temps d'exécution et la stabilité selon les types de fichiers. L'analyse comparative met en évidence les avantages selon les structures de données."
		)
		main_layout.addWidget(divider())
		section(
			"Méthodologie d'analyse",
			"Comparer des corpus variés (texte, documents structurés, archives) et observer l'impact des redondances, de la fréquence des symboles et de la taille des motifs."
		)
		main_layout.addWidget(divider())

		links_row = QHBoxLayout()
		links_row.setSpacing(10)

		def link_btn(text, url):
			btn = QPushButton(text)
			btn.setCursor(Qt.PointingHandCursor)
			btn.setFixedHeight(34)
			btn.setStyleSheet("""
				QPushButton {
					background: rgba(37,99,235,0.08);
					color: #1E40AF;
					border: 1px solid rgba(37,99,235,0.25);
					border-radius: 8px;
					font-weight: 600;
				}
				QPushButton:hover { background: rgba(37,99,235,0.14); }
			""")
			btn.clicked.connect(lambda: webbrowser.open(url))
			return btn

		links_row.addWidget(link_btn("Compression (Wiki)", "https://en.wikipedia.org/wiki/Data_compression"))
		links_row.addWidget(link_btn("Huffman (Wiki)", "https://en.wikipedia.org/wiki/Huffman_coding"))
		links_row.addWidget(link_btn("LZW (Wiki)", "https://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Welch"))
		links_row.addStretch(1)

		main_layout.addLayout(links_row)
