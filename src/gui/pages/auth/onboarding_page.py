from pathlib import Path

from PySide6.QtCore import Qt
from PySide6.QtWidgets import QWidget, QHBoxLayout, QPushButton, QMessageBox

from ._auth_shared import (
    UserData,
    UserStore,
    build_brand_panel,
    build_form_header,
    build_form_panel,
    create_input,
    create_link_button,
)


class OnboardingPage(QWidget):
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
            "👋 Bienvenue !",
            "Entrez vos informations pour commencer à explorer Compressemos.",
        )

        self.name_input = create_input("Nom complet")
        self.password_input = create_input("Mot de passe (optionnel)", password=True)
        self.org_input = create_input("Organisation / École (facultatif)")

        submit_btn = QPushButton("Sign Up 🚀")
        submit_btn.clicked.connect(self._save_user)

        link_create = create_link_button("Log In", self._go_to_login)

        form_layout.addWidget(header)
        form_layout.addWidget(desc)
        form_layout.addSpacing(15)
        form_layout.addWidget(self.name_input)
        form_layout.addWidget(self.password_input)
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
        password = self.password_input.text()
        org = self.org_input.text().strip()
        if not name:
            QMessageBox.warning(self, "Champs requis", "Veuillez remplir au moins le nom complet.")
            return

        self._store.save(
            UserData(
                name=name,
                password=password,
                organization=org,
            )
        )

        QMessageBox.information(self, "Bienvenue", f"Bienvenue, {name} !")
        self.main_window.main_stack.setCurrentWidget(self.main_window.app_root)


    def _go_to_login(self):
        self.main_window.main_stack.setCurrentWidget(self.main_window.login_page)
