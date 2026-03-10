from PySide6.QtWidgets import QWidget, QVBoxLayout, QLabel
from PySide6.QtCore import Qt


class FeatureCard(QWidget):
    def __init__(self, icon: str, title: str, description: str):
        super().__init__()
        self.setObjectName("FeatureCard")
        self.setMinimumWidth(260)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(12)

        # Icône
        icon_label = QLabel(icon)
        icon_label.setAlignment(Qt.AlignLeft)
        icon_label.setStyleSheet("font-size:26px;")
        icon_label.setObjectName("CardIcon")

        # Titre
        title_label = QLabel(title)
        title_label.setObjectName("CardTitle")

        # Description
        desc_label = QLabel(description)
        desc_label.setWordWrap(True)
        desc_label.setObjectName("CardDescription")

        layout.addWidget(icon_label)
        layout.addSpacing(8)
        layout.addWidget(title_label)
        layout.addWidget(desc_label)
        layout.addStretch()
