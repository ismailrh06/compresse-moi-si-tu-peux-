from PySide6.QtWidgets import QStackedWidget, QWidget


class Router(QStackedWidget):
    """
    Router central de l'application.

    - Gère les pages par nom
    - Fournit une navigation déterministe
    - Conserve l'état de la route courante
    """

    def __init__(self, parent=None):
        super().__init__(parent)
        self._pages: dict[str, QWidget] = {}
        self._current: str | None = None

    def register(self, route: str, widget: QWidget):
        if route in self._pages:
            raise ValueError(f"Route déjà enregistrée : {route}")

        self._pages[route] = widget
        self.addWidget(widget)

    def navigate(self, route: str):
        if route not in self._pages:
            raise KeyError(f"Route inconnue : {route}")

        if self._current == route:
            return  # évite les rechargements inutiles

        widget = self._pages[route]
        self.setCurrentWidget(widget)
        self._current = route

        if hasattr(widget, "on_show"):
            widget.on_show()

    def current_route(self) -> str | None:
        return self._current
