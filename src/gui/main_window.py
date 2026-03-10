from PySide6.QtWidgets import QMainWindow, QWidget, QHBoxLayout
from .router import Router
from .widgets.sidebar import Sidebar

from .pages.home_page import HomePage
from .pages.compress_page import CompressPage
from .pages.compare_page import ComparePage
from .pages.info_page import InfoPage
from .pages.huffman_page import HuffmanVulgarisationPage
from .pages.lzwPage import LZWPage
from .pages.profile_page import ProfilePage
from .pages.huffman_game_page import HuffmanGamePage


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
        self.router.register("huffman", HuffmanVulgarisationPage())
        self.router.register("lzw", LZWPage())
        self.router.register("huffman_game", HuffmanGamePage(self.router))
        self.router.register("info", InfoPage(self.router))
        self.router.register("profile", ProfilePage(self.router))

        self.router.navigate("home")
        sidebar.set_active("home")

