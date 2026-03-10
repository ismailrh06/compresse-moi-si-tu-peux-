from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QFrame, QLabel,
    QLineEdit, QPushButton, QMessageBox
)
from PySide6.QtGui import QFont
from PySide6.QtCore import Qt
import json, os


class OnboardingPage(QWidget):
    def __init__(self, main_window):
        super().__init__()
        self.main_window = main_window
        self._user_file = main_window._user_file

        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)

        # --- Panneau gauche (logo + dégradé) ---
        left = QFrame()
        left.setFixedWidth(420)
        left.setStyleSheet("""
            QFrame {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 #6366f1, stop:1 #0ea5e9);
            }
        """)
        left_layout = QVBoxLayout(left)
        left_layout.setAlignment(Qt.AlignCenter)
        logo = QLabel("🧠")
        logo.setStyleSheet("font-size: 80px; color: white;")
        title = QLabel("Compressemos")
        title.setStyleSheet("color: white; font-size: 26px; font-weight: bold;")
        left_layout.addWidget(logo)
        left_layout.addWidget(title)

        # --- Panneau droit (formulaire) ---
        right = QFrame()
        right.setStyleSheet("""
            QFrame {
                background-color: #f9fafb;
            }
            QLineEdit {
                background-color: white;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                padding: 10px;
                font-size: 14px;
            }
            QLineEdit:focus {
                border: 1px solid #3b82f6;
            }
            QPushButton {
                background-color: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                                  stop:0 #6366f1, stop:1 #0ea5e9);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 12px 24px;
                font-weight: 600;
                font-size: 14px;
            }
            QPushButton:hover { opacity: 0.9; }
        """)

        form_layout = QVBoxLayout(right)
        form_layout.setContentsMargins(80, 80, 80, 80)
        form_layout.setSpacing(15)
        form_layout.setAlignment(Qt.AlignTop)

        header = QLabel("👋 Bienvenue !")
        header.setFont(QFont("Poppins", 22, QFont.Bold))
        desc = QLabel("Entrez vos informations pour commencer à explorer Compressemos.")
        desc.setStyleSheet("color: #6b7280; font-size: 13px;")
        desc.setWordWrap(True)

        self.name_input = QLineEdit()
        self.name_input.setPlaceholderText("Nom complet")
        self.email_input = QLineEdit()
        self.email_input.setPlaceholderText("Adresse e-mail")
        self.org_input = QLineEdit()
        self.org_input.setPlaceholderText("Organisation / École (facultatif)")

        submit_btn = QPushButton("Sign Up 🚀")
        submit_btn.clicked.connect(self._save_user)

        link_create = QPushButton("Log In")
        link_create.setCursor(Qt.PointingHandCursor)
        link_create.setStyleSheet("""
            QPushButton {
                background: transparent;
                border: none;
                color: #2563eb;
                text-decoration: underline;
                padding: 4px 0;
                font-weight: 600;
            }
            QPushButton:hover { color: #1e40af; }
        """)
        link_create.clicked.connect(self._go_to_login)

        form_layout.addWidget(header)
        form_layout.addWidget(desc)
        form_layout.addSpacing(15)
        form_layout.addWidget(self.name_input)
        form_layout.addWidget(self.email_input)
        form_layout.addWidget(self.org_input)
        form_layout.addSpacing(25)
        form_layout.addWidget(submit_btn)

        form_layout.addSpacing(10)
        form_layout.addWidget(link_create, alignment=Qt.AlignLeft)

        layout.addWidget(left)
        layout.addWidget(right)

    # Sauvegarde des infos utilisateur
    def _save_user(self):
        name = self.name_input.text().strip()
        email = self.email_input.text().strip()
        org = self.org_input.text().strip()
        if not name or not email:
            QMessageBox.warning(self, "Champs requis", "Veuillez remplir au moins le nom et l’e-mail.")
            return
        data = {"name": name, "email": email, "organization": org}
        with open(self._user_file, "w") as f:
            json.dump(data, f, indent=4)
        QMessageBox.information(self, "Bienvenue", f"Bienvenue, {name} !")
        self.main_window.main_stack.setCurrentWidget(self.main_window.app_root)


    def _go_to_login(self):
        self.main_window.main_stack.setCurrentWidget(self.main_window.login_page)
