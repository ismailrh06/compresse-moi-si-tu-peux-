import matplotlib
matplotlib.use("QtAgg")

from PySide6.QtWidgets import QWidget, QVBoxLayout, QLabel
from PySide6.QtCore import Qt

class StatsPage(QWidget):
    def __init__(self, router):
        super().__init__()

        layout = QVBoxLayout()
        label = QLabel("📊 Page de comparaison (vide pour l’instant)")
        label.setAlignment(Qt.AlignCenter)
        layout.addWidget(label)

        self.setLayout(layout)