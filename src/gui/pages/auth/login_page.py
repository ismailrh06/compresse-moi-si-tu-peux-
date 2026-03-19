from pathlib import Path

from PySide6.QtCore import Qt
from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QPushButton, QMessageBox

from ._auth_shared import (
    UserStore,
    build_brand_panel,
    build_form_header,
    build_form_panel,
    create_input,
    create_link_button,
)


class LoginPage(QWidget):
    def __init__(self, main_window):
        super().__init__()
        self.main_window = main_window
        self._user_file = getattr(main_window, "_user_file", str(Path("user_info.json")))
        self._store = UserStore(self._user_file)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)

        left = build_brand_panel()
        right, form_layout = build_form_panel()

        header, desc = build_form_header(
            "🔐 Connexion",
            "Entrez votre nom complet pour continuer dans Compressemos.",
        )

        self.name_input = create_input("Nom complet")
        self.password_input = create_input("Mot de passe (facultatif)", password=True)

        submit_btn = QPushButton("Log In 🚀")
        submit_btn.clicked.connect(self._login_user)

        form_layout.addWidget(header)
        form_layout.addWidget(desc)
        form_layout.addSpacing(15)
        form_layout.addWidget(self.name_input)
        form_layout.addWidget(self.password_input)
        form_layout.addSpacing(25)
        form_layout.addWidget(submit_btn)

        link_create = create_link_button("Sign Up", self._go_to_onboarding)

        form_layout.addSpacing(10)
        form_layout.addWidget(link_create, alignment=Qt.AlignLeft)


        layout.addWidget(left)
        layout.addWidget(right)

    def _login_user(self):
        name = self.name_input.text().strip()
        password = self.password_input.text()

        if not name:
            QMessageBox.warning(self, "Erreur", "Veuillez entrer votre nom complet.")
            return

        user = self._store.load()
        if user is None:
            QMessageBox.warning(self, "Erreur", "Aucun compte trouvé. Veuillez vous enregistrer d'abord.")
            self.main_window.main_stack.setCurrentWidget(self.main_window.onboarding)
            return

        if name.lower() != user.name.lower():
            QMessageBox.warning(self, "Erreur", "Nom complet incorrect.")
            return

        if user.password and password != user.password:
            QMessageBox.warning(self, "Erreur", "Mot de passe incorrect.")
            return

        QMessageBox.information(self, "Connexion réussie", f"Bienvenue de retour, {user.name} !")
        self.main_window.main_stack.setCurrentWidget(self.main_window.app_root)


    def _go_to_onboarding(self):
        self.main_window.main_stack.setCurrentWidget(self.main_window.onboarding)
