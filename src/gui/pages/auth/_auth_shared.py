from __future__ import annotations

from dataclasses import dataclass, asdict
from pathlib import Path
import json

from PySide6.QtCore import Qt
from PySide6.QtGui import QFont
from PySide6.QtWidgets import QFrame, QLabel, QPushButton, QVBoxLayout, QLineEdit


AUTH_PANEL_STYLESHEET = """
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
"""


@dataclass
class UserData:
    name: str
    password: str = ""
    organization: str = ""


class UserStore:
    def __init__(self, file_path: str | Path):
        self.file_path = Path(file_path)

    def exists(self) -> bool:
        return self.file_path.exists()

    def load(self) -> UserData | None:
        if not self.exists():
            return None

        try:
            data = json.loads(self.file_path.read_text(encoding="utf-8"))
        except Exception:
            return None

        name = str(data.get("name", "")).strip()
        if not name:
            return None

        return UserData(
            name=name,
            password=str(data.get("password", "")),
            organization=str(data.get("organization", "")),
        )

    def save(self, user: UserData) -> None:
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        payload = asdict(user)
        self.file_path.write_text(
            json.dumps(payload, indent=4, ensure_ascii=False),
            encoding="utf-8",
        )


def build_brand_panel() -> QFrame:
    left = QFrame()
    left.setFixedWidth(420)
    left.setStyleSheet(
        """
        QFrame {
            background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                stop:0 #6366f1, stop:1 #0ea5e9);
        }
        """
    )

    left_layout = QVBoxLayout(left)
    left_layout.setAlignment(Qt.AlignCenter)

    logo = QLabel("🧠")
    logo.setStyleSheet("font-size: 80px; color: white;")

    title = QLabel("Compressemos")
    title.setStyleSheet("color: white; font-size: 26px; font-weight: bold;")

    left_layout.addWidget(logo)
    left_layout.addWidget(title)
    return left


def build_form_panel() -> tuple[QFrame, QVBoxLayout]:
    right = QFrame()
    right.setStyleSheet(AUTH_PANEL_STYLESHEET)

    form_layout = QVBoxLayout(right)
    form_layout.setContentsMargins(80, 80, 80, 80)
    form_layout.setSpacing(15)
    form_layout.setAlignment(Qt.AlignTop)
    return right, form_layout


def build_form_header(title_text: str, desc_text: str) -> tuple[QLabel, QLabel]:
    header = QLabel(title_text)
    header.setFont(QFont("Poppins", 22, QFont.Bold))

    desc = QLabel(desc_text)
    desc.setStyleSheet("color: #6b7280; font-size: 13px;")
    desc.setWordWrap(True)
    return header, desc


def create_link_button(text: str, callback) -> QPushButton:
    btn = QPushButton(text)
    btn.setCursor(Qt.PointingHandCursor)
    btn.setStyleSheet(
        """
        QPushButton {
            background: transparent;
            border: none;
            color: #2563eb;
            text-decoration: underline;
            padding: 4px 0;
            font-weight: 600;
        }
        QPushButton:hover { color: #1e40af; }
        """
    )
    btn.clicked.connect(callback)
    return btn


def create_input(placeholder: str, password: bool = False) -> QLineEdit:
    field = QLineEdit()
    field.setPlaceholderText(placeholder)
    if password:
        field.setEchoMode(QLineEdit.Password)
    return field
