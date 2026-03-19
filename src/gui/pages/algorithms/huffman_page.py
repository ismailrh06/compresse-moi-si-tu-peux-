from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QLabel, QLineEdit, QPushButton, QComboBox,
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
    def __init__(self, router):
        super().__init__()
        self.router = router

        layout = QVBoxLayout(self)
        layout.setSpacing(12)

        # Titre
        title = QLabel("Algorithme Huffman")
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet("font-size: 24px; font-weight: bold;")
        layout.addWidget(title)

        # Champ texte
        # self.input_field = QLineEdit()
        # self.input_field.setPlaceholderText("Exemple : bonjour")
        # layout.addWidget(self.input_field)

        self.choixBox = True
        self.saisirText = False

        self.input_layout = QHBoxLayout()
        self.input_layout.setSpacing(12)

        self.input_field = QComboBox()
        self.input_field.addItems(["ABCABCABC", "ABRACADABRA" , "ACGTACGTACGT", "AAGGTTCCAAGGTTCC", "TOBEORNOTTOBE", "MISSISSIPPI"])
        # self.input_field.setStyleSheet("""
        #     QComboBox {
        #         background-color: white;
        #         color: #000000;
        #         border: 1px solid #cbd5e1;
        #         border-radius: 8px;
        #         padding: 8px 12px;
        #         font-size: 14px;
        #     }
        #     QComboBox:focus {
        #         border: 2px solid #5865F2;
        #     }

        #     QComboBox QAbstractItemView {
        #         background-color: white; /* Couleur de fond de la liste déroulante */
        #         color: #000000; /* Couleur du texte des éléments */
        #         border: 1px solid #cbd5e1;
        #         selection-background-color: #E7EAFF; /* Couleur de fond de l'élément sélectionné */
        #         selection-color: #000000; /* Couleur du texte de l'élément sélectionné */
        #     }
        # """)

        switch_btn = QPushButton("switch")
        switch_btn.setFixedWidth(120)
        # switch_btn.setStyleSheet("""
        #     QPushButton {
        #         background-color: #5865F2;
        #         color: white;
        #         border: none;
        #         border-radius: 8px;
        #         padding: 8px 16px;
        #         font-weight: 600;
        #         font-size: 13px;
        #     }
        #     QPushButton:hover { background-color: #6D78F7; }
        #     QPushButton:pressed { background-color: #4752C4; }
        # """)
        switch_btn.clicked.connect(self.switch_fonction)

        self.input_layout.addWidget(self.input_field)
        self.input_layout.addWidget(switch_btn)
        layout.addLayout(self.input_layout)


        # Bouton pour préparer les étapes
        prepare_btn = QPushButton("Préparer")
        prepare_btn.clicked.connect(self.prepare_steps)
        layout.addWidget(prepare_btn)

        # Label pour texte explicatif

        self.stepFrequence_label = QLabel("")
        self.stepFrequence_label.setAlignment(Qt.AlignCenter)
        self.stepFrequence_label.setWordWrap(True)

        self.step_label = QLabel("")
        self.step_label.setAlignment(Qt.AlignCenter)
        self.step_label.setWordWrap(True)
        
        layout.addWidget(self.stepFrequence_label)
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

    # def set_text(self, text: str):
    #     """Pré-remplit le champ d'entrée et prépare les étapes.

    #     Utiliser cette méthode plutôt que d'accéder directement à
    #     `input_field` depuis l'extérieur — elle garantit que la
    #     préparation des étapes est déclenchée proprement.
    #     """
    #     try:
    #         self.input_field.setText(text)
    #         # Lance la préparation immédiatement pour montrer l'arbre
    #         self.prepare_steps()
    #     except Exception:
    #         # Silencieusement ignorer si l'UI n'est pas prête
    #         pass

    def prepare_steps(self):
        #text = self.input_field.text()
        self.stepFrequence_label.setText("")
        self.step_label.setText("")

        if self.choixBox:
            text = self.input_field.currentText()
        elif self.saisirText:
            text = self.input_field.text().strip()

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
            "textFrequence": f"Fréquences: {chars_str}",
            "textExplicatif": None,
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

            # Mettre à jour la liste des fréquences pour refléter la fusion
            updated_freq = []
            for node in heap:
                char = node[2].char if node[2].char else "."
                updated_freq.append(f"{char}:{node[0]}")

            chars_str = ", ".join(updated_freq)

            self.steps.append({
                "textFrequence": f"Fréquences: {chars_str}",
                "textExplicatif": f"Fusion de '{lo_char}' ({lo[0]}) et '{hi_char}' ({hi[0]}) -> fréquence {merged.freq}",
                "root": merged
            })

        self.step_index = 0
        self.next_button.setEnabled(len(self.steps) > 1)
        self.show_next_step()

    def show_next_step(self):
        if self.step_index >= len(self.steps):
            self.step_label.setText("✅ Fin de la Simulation.")
            self.next_button.setEnabled(False)
            return

        step = self.steps[self.step_index]
        self.stepFrequence_label.setText(step["textFrequence"])
        if step["textExplicatif"]:
            self.step_label.setText(step["textExplicatif"])
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

    def switch_fonction(self):
        self.input_layout.removeWidget(self.input_field)
        self.input_field.deleteLater()

        # Alterner entre QComboBox et QLineEdit
        if self.choixBox:
            self.input_field = QLineEdit()
            self.input_field.setPlaceholderText("Ex: bonjour, hello, compression...")
            # self.input_field.setStyleSheet("""
            #     QLineEdit {
            #         background-color: white;
            #         color: #000000;
            #         border: 1px solid #cbd5e1;
            #         border-radius: 8px;
            #         padding: 8px 12px;
            #         font-size: 14px;
            #     }
            #     QLineEdit:focus {
            #         border: 2px solid #5865F2;
            #     }
            # """)
        else:
            self.input_field = QComboBox()
            self.input_field.addItems(["ABCABCABC", "ABRACADABRA" , "ACGTACGTACGT", "AAGGTTCCAAGGTTCC", "TOBEORNOTTOBE", "MISSISSIPPI"])
            # self.input_field.setStyleSheet("""
            #     QComboBox {
            #         background-color: white;
            #         color: #000000;
            #         border: 1px solid #cbd5e1;
            #         border-radius: 8px;
            #         padding: 8px 12px;
            #         font-size: 14px;
            #     }
            #     QComboBox:focus {
            #         border: 2px solid #5865F2;
            #     }
            # """)

        # Ajouter le nouveau widget au layout
        self.input_layout.insertWidget(0, self.input_field)

        # Alterner les états
        self.choixBox = not self.choixBox
        self.saisirText = not self.saisirText
