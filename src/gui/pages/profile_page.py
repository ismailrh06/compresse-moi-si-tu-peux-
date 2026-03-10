from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QFrame, 
    QLineEdit, QMessageBox, QScrollArea
)
from PySide6.QtGui import QFont, QColor, QPalette, QBrush
from PySide6.QtCore import Qt
from src.gui.widgets.sidebar import RoundedPixmap


class ProfilePage(QWidget):
    def __init__(self, router):
        super().__init__()
        self.router = router
        self._setup_background()
        self._build_ui()

    def _setup_background(self):
        pal = QPalette()
        pal.setBrush(QPalette.Window, QBrush(QColor("#0B0B0B")))
        self.setPalette(pal)
        self.setAutoFillBackground(True)

    def _build_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(40, 30, 40, 30)
        layout.setSpacing(24)
        layout.setAlignment(Qt.AlignTop)

        # Header
        header_layout = QHBoxLayout()
        back_btn = QPushButton("← Retour")
        back_btn.setCursor(Qt.PointingHandCursor)
        back_btn.setFixedWidth(100)
        back_btn.setFixedHeight(40)
        back_btn.clicked.connect(lambda: self.router.navigate("home"))
        back_btn.setStyleSheet("""
            QPushButton {
                background-color: rgba(255, 255, 255, 0.05);
                color: #E0E0E0;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                font-weight: 600;
                font-size: 13px;
            }
            QPushButton:hover {
                background-color: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.2);
            }
        """)
        
        title = QLabel("Mon Profil")
        title.setStyleSheet("color: #F8FAFC; font-size: 28px; font-weight: 700;")
        
        header_layout.addWidget(back_btn)
        header_layout.addWidget(title)
        header_layout.addStretch()
        layout.addLayout(header_layout)

        # Main card
        main_card = QFrame()
        main_card.setMaximumWidth(900)
        main_card.setStyleSheet("""
            QFrame {
                background-color: #1F1F1F;
                border: 1px solid #2B2B2B;
                border-radius: 18px;
            }
        """)
        card_layout = QVBoxLayout(main_card)
        card_layout.setContentsMargins(36, 36, 36, 36)
        card_layout.setSpacing(28)

        # Profile section
        profile_section = QHBoxLayout()
        profile_section.setSpacing(24)
        profile_section.setAlignment(Qt.AlignTop)

        # Avatar grande taille
        avatar = RoundedPixmap("U", size=80)
        avatar.setFixedSize(80, 80)
        profile_section.addWidget(avatar)

        # User info
        user_info_layout = QVBoxLayout()
        user_info_layout.setSpacing(8)

        user_name_label = QLabel("Utilisateur")
        user_name_label.setStyleSheet("""
            color: #F8FAFC;
            font-size: 22px;
            font-weight: 700;
        """)
        user_info_layout.addWidget(user_name_label)

        user_email_label = QLabel("utilisateur@example.com")
        user_email_label.setStyleSheet("""
            color: #A0A0A0;
            font-size: 13px;
        """)
        user_info_layout.addWidget(user_email_label)

        status_badge = QLabel("🟢 Premium")
        status_badge.setStyleSheet("""
            color: #10B981;
            font-size: 12px;
            font-weight: 600;
        """)
        user_info_layout.addWidget(status_badge)
        user_info_layout.addStretch()

        profile_section.addLayout(user_info_layout)
        profile_section.addStretch()

        card_layout.addLayout(profile_section)

        # Separator
        separator = QFrame()
        separator.setFrameShape(QFrame.HLine)
        separator.setStyleSheet("background-color: rgba(255, 255, 255, 0.1);")
        separator.setFixedHeight(1)
        card_layout.addWidget(separator)

        # Informations section
        info_title = QLabel("Informations personnelles")
        info_title.setStyleSheet("""
            color: #E0E0E0;
            font-size: 16px;
            font-weight: 700;
        """)
        card_layout.addWidget(info_title)

        # Form fields
        form_layout = QVBoxLayout()
        form_layout.setSpacing(16)

        # Nom
        form_layout.addWidget(self._create_field("Nom complet", "Ismael"))

        # Email
        form_layout.addWidget(self._create_field("Email", "ismael@example.com"))

        # Téléphone
        form_layout.addWidget(self._create_field("Téléphone", "+33 6 XX XX XX XX"))

        # Abonnement
        form_layout.addWidget(self._create_field("Abonnement", "Premium - 9.99€/mois", read_only=True))

        card_layout.addLayout(form_layout)

        # Separator
        separator2 = QFrame()
        separator2.setFrameShape(QFrame.HLine)
        separator2.setStyleSheet("background-color: rgba(255, 255, 255, 0.1);")
        separator2.setFixedHeight(1)
        card_layout.addWidget(separator2)

        # Statistics section
        stats_title = QLabel("Statistiques")
        stats_title.setStyleSheet("""
            color: #E0E0E0;
            font-size: 16px;
            font-weight: 700;
        """)
        card_layout.addWidget(stats_title)

        stats_layout = QHBoxLayout()
        stats_layout.setSpacing(20)

        stats_layout.addWidget(self._create_stat_card("5", "Fichiers compressés"))
        stats_layout.addWidget(self._create_stat_card("2.4 MB", "Taille économisée"))
        stats_layout.addWidget(self._create_stat_card("68%", "Ratio de compression"))

        card_layout.addLayout(stats_layout)

        layout.addWidget(main_card)

        # Action buttons
        btn_layout = QHBoxLayout()
        btn_layout.setSpacing(12)
        btn_layout.setAlignment(Qt.AlignCenter)

        save_btn = QPushButton("💾 Enregistrer les modifications")
        save_btn.setCursor(Qt.PointingHandCursor)
        save_btn.setFixedHeight(44)
        save_btn.setFixedWidth(280)
        save_btn.clicked.connect(self._save_changes)
        save_btn.setStyleSheet("""
            QPushButton {
                background-color: #FFFFFF;
                color: #111827;
                border: none;
                border-radius: 12px;
                font-weight: 700;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #F3F4F6;
            }
            QPushButton:pressed {
                background-color: #E5E7EB;
            }
        """)
        btn_layout.addWidget(save_btn)

        logout_btn = QPushButton("🚪 Se déconnecter")
        logout_btn.setCursor(Qt.PointingHandCursor)
        logout_btn.setFixedHeight(44)
        logout_btn.setFixedWidth(200)
        logout_btn.clicked.connect(self._logout)
        logout_btn.setStyleSheet("""
            QPushButton {
                background-color: rgba(239, 68, 68, 0.1);
                color: #EF4444;
                border: 1px solid rgba(239, 68, 68, 0.3);
                border-radius: 12px;
                font-weight: 600;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: rgba(239, 68, 68, 0.15);
                border-color: rgba(239, 68, 68, 0.5);
            }
        """)
        btn_layout.addWidget(logout_btn)

        layout.addLayout(btn_layout)
        layout.addStretch()

    def _create_field(self, label, value, read_only=False):
        """Crée un champ de formulaire"""
        field_widget = QWidget()
        field_layout = QVBoxLayout(field_widget)
        field_layout.setContentsMargins(0, 0, 0, 0)
        field_layout.setSpacing(6)

        label_widget = QLabel(label)
        label_widget.setStyleSheet("""
            color: #A0A0A0;
            font-size: 12px;
            font-weight: 600;
        """)
        field_layout.addWidget(label_widget)

        input_field = QLineEdit(value)
        input_field.setReadOnly(read_only)
        input_field.setFixedHeight(40)
        input_field.setStyleSheet("""
            QLineEdit {
                background-color: rgba(255, 255, 255, 0.03);
                color: #F8FAFC;
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 8px;
                padding: 10px 12px;
                font-size: 13px;
            }
            QLineEdit:focus {
                background-color: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(10, 165, 233, 0.4);
            }
        """)
        if read_only:
            input_field.setStyleSheet("""
                QLineEdit {
                    background-color: rgba(255, 255, 255, 0.02);
                    color: #808080;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    padding: 10px 12px;
                    font-size: 13px;
                }
            """)

        field_layout.addWidget(input_field)
        return field_widget

    def _create_stat_card(self, value, label):
        """Crée une carte statistique"""
        card = QFrame()
        card.setStyleSheet("""
            QFrame {
                background-color: rgba(10, 165, 233, 0.08);
                border: 1px solid rgba(10, 165, 233, 0.15);
                border-radius: 12px;
            }
        """)
        layout = QVBoxLayout(card)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(8)
        layout.setAlignment(Qt.AlignCenter)

        value_label = QLabel(value)
        value_label.setStyleSheet("""
            color: #0EA5E9;
            font-size: 24px;
            font-weight: 700;
        """)
        value_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(value_label)

        label_widget = QLabel(label)
        label_widget.setStyleSheet("""
            color: #A0A0A0;
            font-size: 12px;
        """)
        label_widget.setAlignment(Qt.AlignCenter)
        layout.addWidget(label_widget)

        return card

    def _save_changes(self):
        QMessageBox.information(self, "Succès", "Vos modifications ont été enregistrées !")

    def _logout(self):
        reply = QMessageBox.question(
            self, 
            "Confirmation", 
            "Êtes-vous sûr de vouloir vous déconnecter ?",
            QMessageBox.Yes | QMessageBox.No
        )
        if reply == QMessageBox.Yes:
            QMessageBox.information(self, "Déconnexion", "Vous avez été déconnecté avec succès !")
