from __future__ import annotations

from PySide6.QtGui import QColor, QPalette, QBrush
from PySide6.QtWidgets import QPushButton, QWidget


WHITE_ACTION_BUTTON_STYLE = """
QPushButton {
    background-color: #FFFFFF;
    color: #111827;
    border: none;
    border-radius: 14px;
    font-weight: 700;
    font-size: 14px;
}
QPushButton:hover { background-color: #F3F4F6; }
QPushButton:pressed { background-color: #E5E7EB; }
"""


def apply_solid_background(widget: QWidget, color: str = "#0B0B0B") -> None:
    palette = QPalette()
    palette.setBrush(QPalette.Window, QBrush(QColor(color)))
    widget.setPalette(palette)
    widget.setAutoFillBackground(True)


def make_action_button(
    text: str,
    callback,
    *,
    height: int = 44,
    style: str = WHITE_ACTION_BUTTON_STYLE,
) -> QPushButton:
    button = QPushButton(text)
    button.setFixedHeight(height)
    button.setStyleSheet(style)
    button.clicked.connect(callback)
    return button
