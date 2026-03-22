import os

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QFrame,
    QGraphicsDropShadowEffect
)
from PySide6.QtCore import Qt, QPropertyAnimation, QEasingCurve, QParallelAnimationGroup
from PySide6.QtGui import QFont, QColor, QPixmap
from .._ui_shared import apply_solid_background


def _font(size: int, weight: int = QFont.Medium) -> QFont:
    f = QFont()
    f.setFamilies([
            "Inter",
        "Inter", "Segoe UI Variable", "Segoe UI",
        "-apple-system", "Helvetica Neue"
    ])
    f.setPointSize(size)
    f.setWeight(weight)
    return f


class FeatureCard(QFrame):
    """Carte de fonctionnalité éducative et professionnelle avec animations sophistiquées."""

    def __init__(self, title: str, description: str, icon, metrics: list = None, parent=None):
        super().__init__(parent)
        self.setObjectName("FeatureCard")
        self.setMinimumSize(320, 360)
        self.setCursor(Qt.PointingHandCursor)
        self.metrics = metrics or []

        # Ombre initiale
        self._shadow = QGraphicsDropShadowEffect(self)
        self._shadow.setBlurRadius(20)
        self._shadow.setOffset(0, 4)
        self._shadow.setColor(QColor(0, 0, 0, 80))
        self.setGraphicsEffect(self._shadow)

        self.setStyleSheet("""
            QFrame#FeatureCard {
                background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                    stop:0 rgba(31, 31, 31, 0.95),
                    stop:1 rgba(25, 25, 30, 0.98));
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.12);
            }
        """)

        self._anim = None
        self._y_anim = None
        self.original_y = 0
        self._build(title, description, icon)

    def _build(self, title: str, description: str, icon):
        layout = QVBoxLayout(self)
        layout.setSpacing(18)
        layout.setContentsMargins(32, 32, 32, 32)

        # En-tête avec icône et ligne decorative
        header = QHBoxLayout()
        header.setSpacing(12)

        icon_label = QLabel()
        icon_label.setAlignment(Qt.AlignCenter)
        icon_label.setFixedSize(56, 56)
        icon_label.setStyleSheet("""
            background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                stop:0 rgba(10, 165, 233, 0.1),
                stop:1 rgba(6, 182, 212, 0.05));
            border-radius: 12px;
        """)

        if isinstance(icon, str) and os.path.exists(icon):
            pixmap = QPixmap(icon)
            if not pixmap.isNull():
                icon_label.setPixmap(pixmap.scaled(28, 28, Qt.KeepAspectRatio, Qt.SmoothTransformation))
            else:
                icon_label.setText("•")
                icon_label.setFont(_font(26, QFont.Bold))
        else:
            icon_label.setText(str(icon))
            icon_label.setFont(_font(32, QFont.Bold))

        title_label = QLabel(title)
        title_label.setFont(_font(16, QFont.Bold))
        title_label.setStyleSheet("color: #F8FAFC;")
        title_label.setWordWrap(True)

        header.addWidget(icon_label)
        header.addWidget(title_label, 1)

        layout.addLayout(header)

        # Séparateur décoratif
        separator = QFrame()
        separator.setFrameShape(QFrame.HLine)
        separator.setStyleSheet("""
            background: qlineargradient(x1:0,y1:0,x2:1,y2:0,
                stop:0 rgba(10, 165, 233, 0),
                stop:0.5 rgba(10, 165, 233, 0.2),
                stop:1 rgba(10, 165, 233, 0));
        """)
        separator.setFixedHeight(1)
        layout.addWidget(separator)

        # Description principale
        desc_label = QLabel(description)
        desc_label.setWordWrap(True)
        desc_label.setFont(_font(11, QFont.Medium))
        desc_label.setStyleSheet("color: #CBD5E1; line-height: 1.6em;")

        layout.addWidget(desc_label)

        # Métriques/points clés
        if self.metrics:
            metrics_layout = QVBoxLayout()
            metrics_layout.setSpacing(8)
            
            for metric in self.metrics:
                metric_item = QHBoxLayout()
                metric_item.setSpacing(8)
                
                bullet = QLabel("▸")
                bullet.setStyleSheet("color: #0EA5E9; font-weight: bold;")
                bullet.setFixedWidth(12)
                
                metric_text = QLabel(metric)
                metric_text.setFont(_font(10, QFont.Medium))
                metric_text.setStyleSheet("color: #A0A0A0;")
                metric_text.setWordWrap(True)
                
                metric_item.addWidget(bullet)
                metric_item.addWidget(metric_text, 1)
                metrics_layout.addLayout(metric_item)
            
            layout.addLayout(metrics_layout)

        layout.addStretch(1)

    def enterEvent(self, event):
        """Survol: animations fluides et changement de style."""
        if self._anim:
            self._anim.stop()
        if self._y_anim:
            self._y_anim.stop()

        # Animation de l'ombre (blur et offset)
        a1 = QPropertyAnimation(self._shadow, b"blurRadius")
        a1.setDuration(400)
        a1.setEasingCurve(QEasingCurve.OutQuart)
        a1.setEndValue(48)

        a2 = QPropertyAnimation(self._shadow, b"yOffset")
        a2.setDuration(400)
        a2.setEasingCurve(QEasingCurve.OutQuart)
        a2.setEndValue(16)

        self._anim = QParallelAnimationGroup(self)
        self._anim.addAnimation(a1)
        self._anim.addAnimation(a2)
        self._anim.start()

        # Changement de style avec gradient professionnel
        self.setStyleSheet("""
            QFrame#FeatureCard {
                background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                    stop:0 rgba(10, 165, 233, 0.08),
                    stop:0.5 rgba(20, 30, 48, 0.9),
                    stop:1 rgba(6, 182, 212, 0.05));
                border-radius: 16px;
                border: 1.5px solid rgba(10, 165, 233, 0.4);
            }
        """)
        return super().enterEvent(event)

    def leaveEvent(self, event):
        """Sortie du survol: retour au style initial."""
        if self._anim:
            self._anim.stop()

        # Animation de retour
        a1 = QPropertyAnimation(self._shadow, b"blurRadius")
        a1.setDuration(350)
        a1.setEasingCurve(QEasingCurve.OutQuart)
        a1.setEndValue(20)

        a2 = QPropertyAnimation(self._shadow, b"yOffset")
        a2.setDuration(350)
        a2.setEasingCurve(QEasingCurve.OutQuart)
        a2.setEndValue(4)

        self._anim = QParallelAnimationGroup(self)
        self._anim.addAnimation(a1)
        self._anim.addAnimation(a2)
        self._anim.start()

        self.setStyleSheet("""
            QFrame#FeatureCard {
                background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                    stop:0 rgba(31, 31, 31, 0.95),
                    stop:1 rgba(25, 25, 30, 0.98));
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.08);
            }
        """)
        return super().leaveEvent(event)


class HomePage(QWidget):
    def __init__(self, router, sidebar):
        super().__init__()
        self.router = router
        self.sidebar = sidebar
        self._logo_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "../../../../assets/Compresse_moi_si_tu_peux.png")
        )
        self.setObjectName("HomePage")
        self._setup_background()
        self._build_ui()

    def _setup_background(self):
        """Configure le fond moderne et dégradé."""
        apply_solid_background(self, "#0B0B0B")

    def _nav(self, route: str):
        """Navigation sécurisée vers une route."""
        fn = getattr(self.router, "navigate", None) or getattr(self.router, "go_to", None)
        if callable(fn):
            try:
                fn(route)
            except Exception:
                pass

    def _build_ui(self):
        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        root.addWidget(self._create_hero(), 1)
        root.addWidget(self._create_features(), 0)

    def _create_hero(self) -> QWidget:
        """Section héro avec titre accrocheur et boutons d'action."""
        hero = QWidget()
        hero.setObjectName("HeroSection")

        layout = QHBoxLayout(hero)
        layout.setContentsMargins(80, 60, 80, 60)
        layout.setSpacing(64)

        # LEFT (Texte et boutons)
        left = QVBoxLayout()
        left.setSpacing(24)
        left.setAlignment(Qt.AlignVCenter)

        # Titre principal
        title_wrap = QVBoxLayout()
        title_wrap.setSpacing(8)

        t1 = QLabel("Compressez.")
        t1.setFont(_font(42, QFont.Black))
        t1.setStyleSheet("color: #F8FAFC;")

        t2_row = QHBoxLayout()
        t2_row.setSpacing(6)

        t2a = QLabel("Analysez.")
        t2a.setFont(_font(42, QFont.Black))
        t2a.setStyleSheet("color: #C4B5FD;")

        t2b = QLabel("Visualisez.")
        t2b.setFont(_font(42, QFont.Black))
        t2b.setStyleSheet("color: #93C5FD;")

        # Glow effect sur le texte accentué
        glow_a = QGraphicsDropShadowEffect(t2a)
        glow_a.setBlurRadius(30)
        glow_a.setOffset(0, 0)
        glow_a.setColor(QColor(164, 126, 255, 120))
        t2a.setGraphicsEffect(glow_a)

        glow_b = QGraphicsDropShadowEffect(t2b)
        glow_b.setBlurRadius(30)
        glow_b.setOffset(0, 0)
        glow_b.setColor(QColor(96, 165, 250, 120))
        t2b.setGraphicsEffect(glow_b)

        t2_row.addWidget(t2a)
        t2_row.addWidget(t2b)
        t2_row.addStretch(1)

        title_wrap.addWidget(t1)
        title_wrap.addLayout(t2_row)

        # Sous-titre
        subtitle = QLabel(
            "Utilisez les meilleurs algorithmes de compression (Huffman, LZW) "
            "pour optimiser vos fichiers. Visualisez les statistiques et analysez "
            "les performances en temps réel."
        )
        subtitle.setWordWrap(True)
        subtitle.setFont(_font(12, QFont.Medium))
        subtitle.setStyleSheet("color: #A0A0A0; line-height: 1.7em;")
        subtitle.setMaximumWidth(580)

        # Boutons d'action
        btn_row = QHBoxLayout()
        btn_row.setSpacing(14)

        primary = QPushButton("Commencer →")
        primary.setObjectName("PrimaryButton")
        primary.setCursor(Qt.PointingHandCursor)
        primary.setFixedHeight(48)
        primary.setMinimumWidth(200)
        primary.setFont(_font(12, QFont.Bold))
        primary.clicked.connect(lambda: (self.router.navigate("compress"), self.sidebar.set_active("compress")))
        primary.setStyleSheet("""
            QPushButton#PrimaryButton {
                background: qlineargradient(x1:0,y1:0,x2:1,y2:0,
                    stop:0 #0EA5E9,
                    stop:1 #06B6D4);
                color: #FFFFFF;
                border: none;
                border-radius: 12px;
                font-weight: 800;
                font-size: 12px;
                padding: 12px 28px;
            }
            QPushButton#PrimaryButton:hover {
                background: qlineargradient(x1:0,y1:0,x2:1,y2:0,
                    stop:0 #38BDF8,
                    stop:1 #22D3EE);
            }
            QPushButton#PrimaryButton:pressed {
                background: qlineargradient(x1:0,y1:0,x2:1,y2:0,
                    stop:0 #0284C7,
                    stop:1 #0891B2);
            }
        """)
        
        # Ombre du bouton primaire
        p_shadow = QGraphicsDropShadowEffect(primary)
        p_shadow.setBlurRadius(24)
        p_shadow.setOffset(0, 8)
        p_shadow.setColor(QColor(14, 165, 233, 140))
        primary.setGraphicsEffect(p_shadow)

        secondary = QPushButton("Informations →")
        secondary.setObjectName("SecondaryButton")
        secondary.setCursor(Qt.PointingHandCursor)
        secondary.setFixedHeight(48)
        secondary.setFont(_font(12, QFont.Bold))
        secondary.clicked.connect(lambda: (self.router.navigate("info"), self.sidebar.set_active("info")))
        secondary.setStyleSheet("""
            QPushButton#SecondaryButton {
                background: rgba(255, 255, 255, 0.03);
                color: #E0E0E0;
                border: 1.5px solid rgba(255, 255, 255, 0.12);
                border-radius: 12px;
                font-weight: 700;
                font-size: 12px;
                padding: 12px 28px;
            }
            QPushButton#SecondaryButton:hover {
                background: rgba(255, 255, 255, 0.06);
                border: 1.5px solid rgba(255, 255, 255, 0.20);
                color: #FFFFFF;
            }
            QPushButton#SecondaryButton:pressed {
                background: rgba(255, 255, 255, 0.04);
            }
        """)

        btn_row.addWidget(primary)
        btn_row.addWidget(secondary)
        btn_row.addStretch(1)

        left.addLayout(title_wrap)
        left.addWidget(subtitle)
        left.addSpacing(12)
        left.addLayout(btn_row)
        left.addStretch(1)

        # RIGHT (Carte héro)
        card = self._create_hero_card()

        layout.addLayout(left, 1)
        layout.addWidget(card, 0)

        return hero

    def _create_hero_card(self) -> QWidget:
        """Logo seul (sans carte)."""
        logo = QWidget()
        logo.setMinimumSize(220, 220)
        logo.setMaximumSize(240, 240)

        layout = QVBoxLayout(logo)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setAlignment(Qt.AlignCenter)

        icon_label = QLabel()
        icon_label.setAlignment(Qt.AlignCenter)
        if os.path.exists(self._logo_path):
            pixmap = QPixmap(self._logo_path)
            if not pixmap.isNull():
                icon_label.setPixmap(pixmap.scaled(220, 220, Qt.KeepAspectRatio, Qt.SmoothTransformation))
            else:
                icon_label.setText("⚡")
                icon_label.setFont(_font(64))
        else:
            icon_label.setText("⚡")
            icon_label.setFont(_font(64))

        layout.addWidget(icon_label)
        return logo

    def _create_features(self) -> QWidget:
        """Section des fonctionnalités principales."""
        section = QWidget()
        section.setObjectName("FeaturesSection")

        layout = QVBoxLayout(section)
        layout.setContentsMargins(80, 40, 80, 60)
        layout.setSpacing(32)

        # Titre de section
        title = QLabel("Fonctionnalités principales")
        title.setFont(_font(28, QFont.Black))
        title.setStyleSheet("color: #F8FAFC;")
        layout.addWidget(title)

        # Description
        subtitle = QLabel(
            "Outils complets pour analyser et optimiser vos fichiers avec des algorithmes professionnels"
        )
        subtitle.setFont(_font(11, QFont.Medium))
        subtitle.setStyleSheet("color: #A0A0A0;")
        subtitle.setMaximumWidth(700)
        layout.addWidget(subtitle)

        layout.addSpacing(8)

        # Cartes de fonctionnalités
        row = QHBoxLayout()
        row.setSpacing(24)

        icons_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "../../../../assets/icons")
        )
        features = [
            (os.path.join(icons_dir, "compress.svg"), "Compression rapide",
             "Implémentation optimisée des algorithmes Huffman et LZW avec analyse de performance instantanée.",
             ["Temps de compression < 100ms", "Support multi-formats", "Optimisation adaptative"]),
            (os.path.join(icons_dir, "visualize.svg"), "Visualisation avancée",
             "Graphiques interactifs montrant les arbres de codage et histogrammes de fréquence détaillés.",
             ["Arbres de Huffman 3D", "Histogrammes temps réel", "Entropie de Shannon"]),
            (os.path.join(icons_dir, "reports.svg"), "Rapports détaillés",
             "Comparaisons complètes des algorithmes avec statistiques et ratios de compression variables.",
             ["Benchmark automatique", "Ratios comparatifs", "Analyse de performance"]),
        ]

        for icon, title_text, description, metrics in features:
            row.addWidget(FeatureCard(title_text, description, icon, metrics), 1)

        layout.addLayout(row)
        return section
