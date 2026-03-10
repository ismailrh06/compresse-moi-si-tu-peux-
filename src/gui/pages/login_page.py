from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QFrame, QLabel,
    QLineEdit, QPushButton, QMessageBox
)
from PySide6.QtGui import QFont
from PySide6.QtCore import Qt
import json, os


class LoginPage(QWidget):
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

        # --- Panneau droit (connexion) ---
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

        header = QLabel("🔐 Connexion")
        header.setFont(QFont("Poppins", 22, QFont.Bold))
        desc = QLabel("Entrez votre e-mail pour continuer dans Compressemos.")
        desc.setStyleSheet("color: #6b7280; font-size: 13px;")
        desc.setWordWrap(True)

        self.email_input = QLineEdit()
        self.email_input.setPlaceholderText("Adresse e-mail")

        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Mot de passe (facultatif)")
        self.password_input.setEchoMode(QLineEdit.Password)

        submit_btn = QPushButton("Log In 🚀")
        submit_btn.clicked.connect(self._login_user)

        form_layout.addWidget(header)
        form_layout.addWidget(desc)
        form_layout.addSpacing(15)
        form_layout.addWidget(self.email_input)
        form_layout.addWidget(self.password_input)
        form_layout.addSpacing(25)
        form_layout.addWidget(submit_btn)

        link_create = QPushButton("Sign Up")
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
        link_create.clicked.connect(self._go_to_onboarding)

        form_layout.addSpacing(10)
        form_layout.addWidget(link_create, alignment=Qt.AlignLeft)


        layout.addWidget(left)
        layout.addWidget(right)

    def _login_user(self):
        email = self.email_input.text().strip()
        if not os.path.exists(self._user_file):
            QMessageBox.warning(self, "Erreur", "Aucun compte trouvé. Veuillez vous enregistrer d'abord.")
            self.main_window.main_stack.setCurrentWidget(self.main_window.onboarding)
            return

        with open(self._user_file, "r") as f:
            data = json.load(f)

        if email.lower() != data.get("email", "").lower():
            QMessageBox.warning(self, "Erreur", "Adresse e-mail incorrecte.")
            return

        QMessageBox.information(self, "Connexion réussie", f"Bienvenue de retour, {data.get('name')} !")
        self.main_window.main_stack.setCurrentWidget(self.main_window.app_root)


    def _go_to_onboarding(self):
        self.main_window.main_stack.setCurrentWidget(self.main_window.onboarding)
