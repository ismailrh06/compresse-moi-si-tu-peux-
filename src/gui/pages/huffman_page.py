from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QLabel, QLineEdit, QPushButton,
    QGraphicsView, QGraphicsScene, QGraphicsEllipseItem, QGraphicsTextItem, QGraphicsLineItem, QHBoxLayout
)
from PySide6.QtCore import Qt
from PySide6.QtGui import QPen, QColor, QFont, QPainter, QLinearGradient, QBrush, QPalette
from collections import Counter
import heapq
from itertools import count

class HuffmanNode:
    def __init__(self, char=None, freq=0, left=None, right=None):
        self.char = char
        self.freq = freq
        self.left = left
        self.right = right

class HuffmanVulgarisationPage(QWidget):
    def __init__(self):
        super().__init__()

        layout = QVBoxLayout(self)
        layout.setSpacing(12)

        # Titre
        title = QLabel("🌲 Vulgarisation de l’algorithme Huffman")
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet("font-size: 24px; font-weight: bold;")
        layout.addWidget(title)

        # Champ texte
        self.input_field = QLineEdit()
        self.input_field.setPlaceholderText("Exemple : bonjour")
        layout.addWidget(self.input_field)

        # Bouton pour préparer les étapes
        prepare_btn = QPushButton("Préparer la vulgarisation")
        prepare_btn.clicked.connect(self.prepare_steps)
        layout.addWidget(prepare_btn)

        # Label pour texte explicatif
        self.step_label = QLabel("")
        self.step_label.setAlignment(Qt.AlignCenter)
        self.step_label.setWordWrap(True)
        layout.addWidget(self.step_label)

        # Bouton étape suivante
        self.next_button = QPushButton("➡️ Étape suivante")
        self.next_button.clicked.connect(self.show_next_step)
        self.next_button.setEnabled(False)
        layout.addWidget(self.next_button)

        # Graphics view pour l'arbre
        self.scene = QGraphicsScene()
        self.view = QGraphicsView(self.scene)
        self.view.setRenderHints(self.view.renderHints() | QPainter.Antialiasing)
        self.view.setMinimumHeight(500)
        layout.addWidget(self.view)

        self.setLayout(layout)

        # Variables pour étapes
        self.steps = []
        self.step_index = 0

    def set_text(self, text: str):
        """Pré-remplit le champ d'entrée et prépare les étapes.

        Utiliser cette méthode plutôt que d'accéder directement à
        `input_field` depuis l'extérieur — elle garantit que la
        préparation des étapes est déclenchée proprement.
        """
        try:
            self.input_field.setText(text)
            # Lance la préparation immédiatement pour montrer l'arbre
            self.prepare_steps()
        except Exception:
            # Silencieusement ignorer si l'UI n'est pas prête
            pass

    def prepare_steps(self):
        text = self.input_field.text()
        if not text:
            self.step_label.setText("Veuillez entrer un texte.")
            self.next_button.setEnabled(False)
            self.scene.clear()
            return

        freq = Counter(text)
        counter = count()
        heap = [[f, next(counter), HuffmanNode(c, f)] for c, f in freq.items()]
        heapq.heapify(heap)

        self.steps = []

        # Ajouter étape initiale: afficher les fréquences
        chars_str = ", ".join([f"'{c}': {f}" for c, f in sorted(freq.items())])
        self.steps.append({
            "text": f"Fréquences: {chars_str}",
            "root": None
        })

        # Fusionner les nœuds jusqu'à avoir un seul arbre
        while len(heap) > 1:
            lo = heapq.heappop(heap)
            hi = heapq.heappop(heap)
            merged = HuffmanNode(None, lo[0]+hi[0], lo[2], hi[2])
            heapq.heappush(heap, [merged.freq, next(counter), merged])

            # Ajouter étape explicative
            lo_char = lo[2].char if lo[2].char else "•"
            hi_char = hi[2].char if hi[2].char else "•"
            self.steps.append({
                "text": f"Fusion de '{lo_char}' ({lo[0]}) et '{hi_char}' ({hi[0]}) -> fréquence {merged.freq}",
                "root": merged
            })

        self.step_index = 0
        self.next_button.setEnabled(len(self.steps) > 1)
        self.show_next_step()

    def show_next_step(self):
        if self.step_index >= len(self.steps):
            self.step_label.setText("✅ Fin de la vulgarisation.")
            self.next_button.setEnabled(False)
            return

        step = self.steps[self.step_index]
        self.step_label.setText(step["text"])
        self.scene.clear()

        # Si root est None (étape de fréquences initiales), ne pas dessiner d'arbre
        if step["root"] is not None:
            positions = {}
            self.assign_leaf_positions(step["root"], 0, positions)
            if positions:
                leaf_count = max(positions.values()) + 1
                spacing = 100
                for node in positions:
                    positions[node] = positions[node] * spacing + 50
                self.draw_tree(step["root"], 50, positions, offset_y=100)

        self.step_index += 1

    def assign_leaf_positions(self, node, x=0, positions=None):
        if positions is None:
            positions = {}
        if node.left is None and node.right is None:
            positions[node] = x
            return x+1
        if node.left:
            x = self.assign_leaf_positions(node.left, x, positions)
        if node.right:
            x = self.assign_leaf_positions(node.right, x, positions)
        children = [child for child in (node.left, node.right) if child]
        positions[node] = sum(positions[child] for child in children)/len(children)
        return x

    def draw_tree(self, node, y, positions, offset_y=100):
        if node is None:
            return

        radius = 25
        x = positions[node]

        # Cercle
        circle = QGraphicsEllipseItem(x-radius, y-radius, radius*2, radius*2)
        circle.setBrush(QColor("#2E2E2E"))
        circle.setPen(QPen(QColor("#FFFFFF"), 2))
        self.scene.addItem(circle)

        # Texte
        text_item = QGraphicsTextItem(f"{node.char if node.char else '•'}\n{node.freq}")
        text_item.setDefaultTextColor(QColor("#FFFFFF"))
        font = QFont("Segoe UI", 10, QFont.Bold)
        text_item.setFont(font)
        text_item.setPos(x-radius+5, y-radius+5)
        self.scene.addItem(text_item)

        for child in (node.left, node.right):
            if child:
                child_y = y + offset_y
                line = QGraphicsLineItem(x, y+radius, positions[child], child_y-radius)
                line.setPen(QPen(QColor(200,200,200,150), 2))
                self.scene.addItem(line)
                self.draw_tree(child, child_y, positions, offset_y)
