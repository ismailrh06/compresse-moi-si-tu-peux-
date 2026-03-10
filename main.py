import sys
from PySide6.QtWidgets import QApplication
from src.gui.main_window import MainWindow
from pathlib import Path



def main():
    app = QApplication(sys.argv)
    app.setApplicationName("Compressemos")
    app.setOrganizationName("Université – Projet d’Année")

    window = MainWindow()
    window.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
