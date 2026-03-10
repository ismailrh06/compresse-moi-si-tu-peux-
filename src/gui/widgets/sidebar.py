import os

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QLabel, QToolButton, QFrame, QHBoxLayout, QPushButton
)
from PySide6.QtCore import Qt, QSize, QPropertyAnimation, QEasingCurve
from PySide6.QtGui import QIcon, QPixmap, QColor, QPainter, QFont
from PySide6.QtWidgets import QSizePolicy


class RoundedPixmap(QWidget):
    """Avatar arrondi avec initiales"""
    def __init__(self, text="U", size=40):
        super().__init__()
        self.text = text.upper()[:1]
        self.size = size
        self.setFixedSize(size, size)
        
    def paintEvent(self, event):
        painter = QPainter(self)
        try:
            painter.setRenderHint(QPainter.Antialiasing)

            # Dégradé pour l'avatar
            from PySide6.QtGui import QLinearGradient, QBrush
            gradient = QLinearGradient(0, 0, self.size, self.size)
            gradient.setColorAt(0, QColor("#6B46C1"))
            gradient.setColorAt(1, QColor("#3B82F6"))

            painter.setBrush(QBrush(gradient))
            painter.setPen(Qt.NoPen)
            painter.drawEllipse(0, 0, self.size, self.size)

            # Texte
            painter.setPen(QColor("#FFFFFF"))
            font = QFont("Segoe UI", self.size // 3, QFont.Bold)
            painter.setFont(font)
            painter.drawText(0, 0, self.size, self.size, Qt.AlignCenter, self.text)
        except KeyboardInterrupt:
            return
        finally:
            painter.end()


class SidebarButton(QToolButton):
    """Bouton sidebar avec icône et animation"""
    def __init__(self, text, icon_path=None):
        super().__init__()
        self.setText(text)
        self.setCheckable(True)
        self.setCursor(Qt.PointingHandCursor)
        self.setIconSize(QSize(22, 22))
        self.setFixedHeight(55)
        self.setToolButtonStyle(Qt.ToolButtonTextBesideIcon)
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
        self.setStyleSheet("""
            QToolButton {
                text-align: left;
                padding-left: 16px;
                font-weight: 500;
                font-size: 14px;
            }
        """)
        
        if icon_path:
            self.setIcon(QIcon(icon_path))


class Sidebar(QWidget):
    def __init__(self, router):
        super().__init__()
        self.setObjectName("Sidebar")
        self.router = router
        self._buttons = {}

        # Largeur fixe et style principal de la sidebar
        self.setFixedWidth(280)
        self.setStyleSheet("""
            Sidebar {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #1A202C,
                    stop:1 #0F172A);
                border-right: 1px solid rgba(255, 255, 255, 0.05);
            }
        """)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # ===== HEADER SECTION =====
        header = self._create_header()
        layout.addWidget(header)

        # ===== SEPARATOR =====
        separator = QFrame()
        separator.setFrameShape(QFrame.HLine)
        separator.setStyleSheet("background-color: #2D3748; margin: 0px;")
        separator.setFixedHeight(1)
        layout.addWidget(separator)

        # ===== NAVIGATION SECTION =====
        nav_container = QWidget()
        nav_layout = QVBoxLayout(nav_container)
        nav_layout.setContentsMargins(8, 16, 8, 0)
        nav_layout.setSpacing(6)

        # Groupe Principal
        self._add_section_label(nav_layout, "Navigation")
        self._add_nav(nav_layout, "   Accueil", "home", "home")
        self._add_nav(nav_layout, "     Compression", "compress", "file-down")
        self._add_nav(nav_layout, "     Comparaison", "compare", "bar-chart-2")

        nav_layout.addSpacing(16)

        # Groupe Algorithmes
        self._add_section_label(nav_layout, "Algorithmes")
        self._add_nav(nav_layout, "     Huffman", "huffman", "book-open")
        self._add_nav(nav_layout, "     Lempel-Ziv", "lzw", "book-open")
        self._add_nav(nav_layout, "     Jeu Huffman", "huffman_game", "gamepad-2")

        nav_layout.addSpacing(16)

        # Groupe Utilitaires
        self._add_section_label(nav_layout, "Autres")
        self._add_nav(nav_layout, "     Informations", "info", "info")

        layout.addWidget(nav_container)
        layout.addStretch()

        # ===== FOOTER SECTION =====
        footer = self._create_footer()
        layout.addWidget(footer)

        # Route par défaut
        self.set_active("home")

    def _create_header(self):
        """Crée le header avec logo et titre"""
        header = QWidget()
        header.setFixedHeight(100)
        header_layout = QVBoxLayout(header)
        header_layout.setContentsMargins(18, 18, 18, 14)
        header_layout.setSpacing(8)

        # Logo + Titre
        logo_layout = QHBoxLayout()
        logo_layout.setSpacing(12)

        # Logo stylisé - Circle
        logo = QLabel("C")
        logo.setStyleSheet("""
            background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                stop:0 #0EA5E9,
                stop:1 #06B6D4);
            color: white;
            font-size: 20px;
            font-weight: 800;
            border-radius: 8px;
            padding: 4px 8px;
            min-width: 32px;
            text-align: center;
        """)
        logo_layout.addWidget(logo)

        # Titre
        title = QLabel("Compressemos")
        title.setStyleSheet("""
            color: #F8FAFC;
            font-size: 16px;
            font-weight: 700;
            letter-spacing: -0.3px;
        """)
        logo_layout.addWidget(title)
        logo_layout.addStretch()

        header_layout.addLayout(logo_layout)

        # Sous-titre
        subtitle = QLabel("Compression Hub")
        subtitle.setStyleSheet("""
            color: #64748B;
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 0.3px;
        """)
        header_layout.addWidget(subtitle)

        return header

    def _create_footer(self):
        """Crée le footer avec infos utilisateur et logout"""
        footer = QWidget()
        footer_layout = QVBoxLayout(footer)
        footer_layout.setContentsMargins(12, 12, 12, 14)
        footer_layout.setSpacing(14)

        # Separator
        separator = QFrame()
        separator.setFrameShape(QFrame.HLine)
        separator.setStyleSheet("background-color: rgba(255, 255, 255, 0.05); margin: 0px;")
        separator.setFixedHeight(1)
        footer_layout.addWidget(separator)

        # User Profile
        user_profile = QPushButton()
        user_profile.setFlat(True)
        user_profile.setCursor(Qt.PointingHandCursor)
        user_layout = QHBoxLayout(user_profile)
        user_layout.setContentsMargins(12, 6, 12, 6)
        user_layout.setSpacing(12)

        # Avatar
        avatar = RoundedPixmap("U", size=32)
        avatar.setFixedSize(32, 32)
        user_layout.addWidget(avatar)

        # User info (name + status)
        user_info_layout = QVBoxLayout()
        user_info_layout.setSpacing(2)
        user_info_layout.setContentsMargins(0, 0, 0, 0)
        user_info_layout.setAlignment(Qt.AlignVCenter)

        user_name = QLabel("Utilisateur")
        user_name.setStyleSheet("""
            color: #F8FAFC;
            font-weight: 800;
            font-size: 12px;
        """)
        user_name.setAlignment(Qt.AlignLeft | Qt.AlignVCenter)
        user_info_layout.addWidget(user_name)

        user_status = QLabel("Premium")
        user_status.setStyleSheet("""
            color: #10B981;
            font-size: 10px;
            font-weight: 800;
        """)
        user_status.setAlignment(Qt.AlignLeft | Qt.AlignVCenter)
        user_info_layout.addWidget(user_status)

        user_layout.addLayout(user_info_layout)
        user_layout.addStretch()
        
        # Style pour le bouton profil
        user_profile.setStyleSheet("""
            QPushButton {
                background: rgba(15, 23, 42, 0.6);
                border: 1px solid rgba(148, 163, 184, 0.18);
                border-radius: 14px;
                padding: 12px 14px;
            }
            QPushButton:hover {
                background: rgba(15, 23, 42, 0.85);
                border: 1px solid rgba(56, 189, 248, 0.35);
            }
            QPushButton:pressed {
                background: rgba(2, 6, 23, 0.9);
                border: 1px solid rgba(56, 189, 248, 0.5);
            }
        """)
        user_profile.setFixedHeight(60)
        user_profile.clicked.connect(lambda: self._navigate("profile"))

        footer_layout.addWidget(user_profile)

        # Logout button
        logout = QToolButton(text="Déconnexion")
#        logout.clicked.connect(self._logout)
        logout.setStyleSheet("""
            QToolButton {
                background-color: rgba(255, 255, 255, 0.03);
                color: #E2E8F0;
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 10px;
                padding: 10px 12px;
                font-weight: 500;
                font-size: 12px;
            }
            QToolButton:hover {
                background-color: rgba(255, 255, 255, 0.06);
                border-color: rgba(255, 255, 255, 0.12);
                color: #F8FAFC;
            }
            QToolButton:pressed {
                background-color: rgba(255, 255, 255, 0.02);
            }
        """)
        logout.setFixedHeight(36)
        logout.setFixedWidth(250)
        footer_layout.addWidget(logout)

        return footer

    def _add_section_label(self, layout, text):
        """Ajoute un label de section"""
        label = QLabel(text)
        label.setStyleSheet("""
            color: #64748B;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin-top: 8px;
            margin-bottom: 4px;
            text-transform: uppercase;
        """)
        layout.addWidget(label)

    def _icon_path(self, name: str) -> str:
        return os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "assets", "icons", f"{name}.svg")
        )

    def _add_nav(self, layout, text, route, icon_name=None):
        """Ajoute un bouton de navigation"""
        icon_path = self._icon_path(icon_name) if icon_name else None
        btn = SidebarButton(text, icon_path=icon_path if icon_path and os.path.exists(icon_path) else None)
        btn.setAutoExclusive(True)
        btn.setCursor(Qt.PointingHandCursor)
        btn.setStyleSheet("""
            QToolButton {
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.04);
                padding: 12px 16px;
                border-radius: 10px;
                color: #CBD5E1;
                text-align: left;
                font-weight: 600;
                font-size: 14px;
                margin: 4px 8px;
            }
            QToolButton:hover {
                background-color: rgba(255, 255, 255, 0.04);
                border-color: rgba(10, 165, 233, 0.15);
                color: #F1F5F9;
            }
            QToolButton:pressed {
                background-color: rgba(255, 255, 255, 0.02);
            }
            QToolButton:checked {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 rgba(10, 165, 233, 0.15),
                    stop:1 rgba(6, 182, 212, 0.10));
                color: #0EA5E9;
                font-weight: 700;
                border: 1px solid rgba(10, 165, 233, 0.20);
                padding-left: 18px;
            }
        """)
        
        btn.clicked.connect(lambda: self._navigate(route))
        self._buttons[route] = btn
        layout.addWidget(btn)

    def _navigate(self, route):
        """Navigue vers une route"""
        self.router.navigate(route)
        self.set_active(route)

    def set_active(self, route):
        """Définit la route active"""
        for r, btn in self._buttons.items():
            btn.setChecked(r == route)
