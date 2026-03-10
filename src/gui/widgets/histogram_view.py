# src/compressemos/gui/widgets/histogram_view.py
from PySide6.QtWidgets import QWidget, QVBoxLayout
import pyqtgraph as pg
import numpy as np

class HistogramView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self._freq = np.zeros(256, dtype=np.int64)

        layout = QVBoxLayout(self)
        self.plot = pg.PlotWidget()
        self.plot.setLabel('left', 'Count')
        self.plot.setLabel('bottom', 'Byte value')

        # barres initiales
        self.bar = pg.BarGraphItem(x=np.arange(256), height=self._freq, width=0.8)
        self.plot.addItem(self.bar)

        layout.addWidget(self.plot)

    def update_data(self, freq_list):
        arr = np.array(freq_list, dtype=np.int64)
        self._freq = arr
        # remplace l'ancien BarGraphItem
        self.plot.removeItem(self.bar)
        self.bar = pg.BarGraphItem(x=np.arange(256), height=self._freq, width=0.8)
        self.plot.addItem(self.bar)
