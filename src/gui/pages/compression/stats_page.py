import random
import matplotlib
matplotlib.use("QtAgg")

from PySide6.QtWidgets import QWidget, QVBoxLayout, QLabel, QPushButton, QFrame
from PySide6.QtCore import Qt
from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg as FigureCanvas
import matplotlib.pyplot as plt

class StatsPage(QWidget):
    def __init__(self, router):
        super().__init__()

        layout = QVBoxLayout()
        label = QLabel("📊 Page de comparaison (vide pour l’instant)")
        label.setAlignment(Qt.AlignCenter)
        layout.addWidget(label)

        self.setLayout(layout)