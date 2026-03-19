from PySide6.QtWidgets import QMainWindow, QWidget, QHBoxLayout
from .router import Router
from .widgets.sidebar import Sidebar

from .pages.general.home_page import HomePage
from .pages.compression.compress_page import CompressPage
from .pages.compression.compare_page import ComparePage
from .pages.general.info_page import InfoPage
from .pages.algorithms.huffman_page import HuffmanVulgarisationPage
from .pages.algorithms.lzwPage import LZWPage
from .pages.general.profile_page import ProfilePage


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Compresse moi si tu peux 🤔")
        self.resize(1300, 800)

        self.router = Router()

        central = QWidget()
        layout = QHBoxLayout(central)
        layout.setContentsMargins(0, 0, 0, 0)

        sidebar = Sidebar(self.router)
        layout.addWidget(sidebar)
        layout.addWidget(self.router)

        self.setCentralWidget(central)

        # ===== Pages =====
        self.router.register("home", HomePage(self.router, sidebar))
        self.router.register("compress", CompressPage(self.router))
        self.router.register("compare", ComparePage(self.router))
        self.router.register("huffman", HuffmanVulgarisationPage(self.router))
        self.router.register("lzw", LZWPage(self.router))
        self.router.register("info", InfoPage(self.router))
        self.router.register("profile", ProfilePage(self.router))

        self.router.navigate("home")
        sidebar.set_active("home")

