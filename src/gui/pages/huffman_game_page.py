import random
from collections import Counter

from PySide6.QtCore import Qt, QTimer
from PySide6.QtGui import QColor, QBrush, QPen, QFont, QPainter
from PySide6.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QLineEdit,
    QGraphicsView,
    QGraphicsScene,
    QGraphicsEllipseItem,
    QGraphicsTextItem,
    QFrame,
    QListWidget,
    QListWidgetItem,
)


class _Bubble(QGraphicsEllipseItem):
    def __init__(self, node_id: int, char: str | None, freq: int, size: int):
        super().__init__(0, 0, size, size)
        self.node_id = node_id
        self.char = char
        self.freq = freq

        color = QColor.fromHsv(200 + (node_id * 23) % 40, 160, 230)
        self.setBrush(QBrush(color))
        self.setPen(QPen(QColor("#E2E8F0"), 2))
        self.setFlag(QGraphicsEllipseItem.ItemIsSelectable)

        label = char if char else "•"
        text = QGraphicsTextItem(f"{label}\n{freq}", self)
        text.setDefaultTextColor(Qt.white)
        text.setFont(QFont("Segoe UI", 10, QFont.Bold))
        rect = text.boundingRect()
        text.setPos((size - rect.width()) / 2, (size - rect.height()) / 2)


class HuffmanGamePage(QWidget):
    """Jeu Huffman ADN — version pro et moderne."""

    def __init__(self, router=None):
        super().__init__()
        self.router = router

        self.nodes: list[_Bubble] = []
        self.history: list[str] = []
        self.node_id = 0
        self.elapsed = 0
        self.mistakes = 0
        self.steps = 0
        self.original_size = 0

        self.timer = QTimer(self)
        self.timer.timeout.connect(self._tick)

        self._build_ui()

    def _build_ui(self):
        self.setObjectName("huffmanGame")
        self.setStyleSheet(
            """
            QWidget#huffmanGame {
                background: #0B1020;
                color: #E5E7EB;
                font-family: "Inter", "Segoe UI", sans-serif;
            }
            QFrame#panel {
                background: #121A2C;
                border: 1px solid #1F2A44;
                border-radius: 16px;
            }
            QFrame#hero {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #1D4ED8, stop:0.5 #22D3EE, stop:1 #14B8A6);
                border-radius: 18px;
            }
            QLabel#title {
                font-size: 24px;
                font-weight: 800;
                color: #F8FAFC;
            }
            QLabel#muted {
                color: #94A3B8;
                font-size: 12px;
            }
            QLabel#chip {
                background: rgba(34, 211, 238, 0.15);
                color: #A5F3FC;
                padding: 4px 10px;
                border-radius: 999px;
                font-size: 11px;
                font-weight: 700;
            }
            QLineEdit#input {
                background: #0F172A;
                border: 1px solid #23314D;
                border-radius: 10px;
                padding: 10px 12px;
                color: #E2E8F0;
            }
            QPushButton#primary {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 #2563EB, stop:1 #22D3EE);
                border: none;
                padding: 10px 16px;
                border-radius: 10px;
                font-weight: 700;
                color: #F8FAFF;
            }
            QPushButton#secondary {
                background: #0F172A;
                border: 1px solid #23314D;
                padding: 10px 16px;
                border-radius: 10px;
                font-weight: 700;
                color: #E2E8F0;
            }
            QListWidget {
                background: #0F172A;
                border: 1px solid #23314D;
                border-radius: 10px;
                padding: 6px;
            }
            """
        )

        root = QVBoxLayout(self)
        root.setContentsMargins(24, 24, 24, 24)
        root.setSpacing(16)

        hero = QFrame()
        hero.setObjectName("hero")
        hero_layout = QHBoxLayout(hero)
        hero_layout.setContentsMargins(16, 14, 16, 14)

        title = QLabel("Huffman ADN — Mission Compression")
        title.setObjectName("title")
        subtitle = QLabel("Fusionne les deux fréquences minimales et observe la compression en direct.")
        subtitle.setObjectName("muted")

        hero_left = QVBoxLayout()
        hero_left.addWidget(title)
        hero_left.addWidget(subtitle)

        self.timer_label = QLabel("⏱ 00:00")
        self.timer_label.setObjectName("chip")
        self.score_label = QLabel("🏆 0")
        self.score_label.setObjectName("chip")

        hero_right = QVBoxLayout()
        hero_right.addWidget(self.timer_label, 0, Qt.AlignRight)
        hero_right.addWidget(self.score_label, 0, Qt.AlignRight)

        hero_layout.addLayout(hero_left, 3)
        hero_layout.addLayout(hero_right, 1)
        root.addWidget(hero)

        content = QHBoxLayout()
        content.setSpacing(16)

        # Left panel
        left = QVBoxLayout()
        left.setSpacing(12)

        input_card = QFrame()
        input_card.setObjectName("panel")
        input_layout = QVBoxLayout(input_card)
        input_layout.setContentsMargins(14, 14, 14, 14)
        input_layout.setSpacing(8)

        input_title = QLabel("Séquence ADN")
        input_title.setObjectName("muted")
        input_layout.addWidget(input_title)

        self.input_field = QLineEdit()
        self.input_field.setObjectName("input")
        self.input_field.setPlaceholderText("Ex: ATGCGTACGATC (A,C,G,T)")
        input_layout.addWidget(self.input_field)

        btn_row = QHBoxLayout()
        self.start_btn = QPushButton("Générer")
        self.start_btn.setObjectName("secondary")
        self.start_btn.clicked.connect(self.start_game)
        self.merge_btn = QPushButton("Fusionner")
        self.merge_btn.setObjectName("primary")
        self.merge_btn.clicked.connect(self.merge_selected)
        btn_row.addWidget(self.start_btn)
        btn_row.addWidget(self.merge_btn)
        input_layout.addLayout(btn_row)

        self.status_label = QLabel("Clique sur Générer pour démarrer.")
        self.status_label.setObjectName("muted")
        self.status_label.setWordWrap(True)
        input_layout.addWidget(self.status_label)

        left.addWidget(input_card)

        stats_card = QFrame()
        stats_card.setObjectName("panel")
        stats_layout = QHBoxLayout(stats_card)
        stats_layout.setContentsMargins(14, 14, 14, 14)
        stats_layout.setSpacing(10)

        self.time_label = QLabel("Temps: 0:00")
        self.steps_label = QLabel("Fusions: 0")
        self.errors_label = QLabel("Erreurs: 0")
        self.compression_label = QLabel("Compression: 0%")
        for lbl in (self.time_label, self.steps_label, self.errors_label, self.compression_label):
            lbl.setObjectName("muted")
            stats_layout.addWidget(lbl)

        left.addWidget(stats_card)

        list_card = QFrame()
        list_card.setObjectName("panel")
        list_layout = QVBoxLayout(list_card)
        list_layout.setContentsMargins(14, 14, 14, 14)
        list_layout.setSpacing(8)

        list_title = QLabel("Bases disponibles")
        list_title.setObjectName("muted")
        list_layout.addWidget(list_title)

        self.node_list = QListWidget()
        self.node_list.setSelectionMode(QListWidget.MultiSelection)
        self.node_list.itemSelectionChanged.connect(self._sync_selection)
        list_layout.addWidget(self.node_list)

        left.addWidget(list_card)

        content.addLayout(left, 2)

        # Center panel (scene)
        center_card = QFrame()
        center_card.setObjectName("panel")
        center_layout = QVBoxLayout(center_card)
        center_layout.setContentsMargins(10, 10, 10, 10)

        self.scene = QGraphicsScene()
        self.scene.setSceneRect(0, 0, 860, 420)
        self.view = QGraphicsView(self.scene)
        self.view.setRenderHints(QPainter.Antialiasing | QPainter.TextAntialiasing)
        self.view.setStyleSheet("background: transparent; border: none;")
        self.view.setDragMode(QGraphicsView.RubberBandDrag)
        center_layout.addWidget(self.view)

        content.addWidget(center_card, 3)

        # Right panel (history + forest)
        right = QVBoxLayout()
        right.setSpacing(12)

        history_card = QFrame()
        history_card.setObjectName("panel")
        history_layout = QVBoxLayout(history_card)
        history_layout.setContentsMargins(14, 14, 14, 14)
        history_layout.setSpacing(8)

        history_title = QLabel("Historique")
        history_title.setObjectName("muted")
        history_layout.addWidget(history_title)

        self.history_list = QListWidget()
        history_layout.addWidget(self.history_list)

        right.addWidget(history_card)

        forest_card = QFrame()
        forest_card.setObjectName("panel")
        forest_layout = QVBoxLayout(forest_card)
        forest_layout.setContentsMargins(14, 14, 14, 14)
        forest_layout.setSpacing(8)

        forest_title = QLabel("Forêt de Huffman")
        forest_title.setObjectName("muted")
        forest_layout.addWidget(forest_title)

        self.forest_label = QLabel("—")
        self.forest_label.setObjectName("muted")
        self.forest_label.setWordWrap(True)
        forest_layout.addWidget(self.forest_label)

        right.addWidget(forest_card)

        content.addLayout(right, 2)

        root.addLayout(content)

    def start_game(self):
        self.scene.clear()
        self.nodes.clear()
        self.history.clear()
        self.node_list.clear()
        self.history_list.clear()
        self.node_id = 0
        self.elapsed = 0
        self.mistakes = 0
        self.steps = 0
        self.timer.start(1000)

        text = self._sanitize_dna(self.input_field.text())
        if not text:
            text = "".join(random.choices("ACGT", k=32))
        self.input_field.setText(text)

        freq = Counter(text)
        self.original_size = sum(freq.values()) * 2

        for ch, fr in sorted(freq.items(), key=lambda kv: (kv[1], kv[0])):
            self.nodes.append(self._new_node(ch, fr))

        self._refresh_list()
        self._layout_nodes()
        self._update_stats()
        self._update_forest()
        self.status_label.setText("Fusionne les deux plus petites fréquences.")

    def merge_selected(self):
        selected = [item.data(Qt.UserRole) for item in self.node_list.selectedItems()]
        if len(selected) != 2:
            self.status_label.setText("Sélectionne exactement 2 nœuds.")
            return

        selected_freqs = sorted([n.freq for n in selected])
        all_freqs = sorted([n.freq for n in self.nodes])
        if selected_freqs != all_freqs[:2]:
            self.mistakes += 1
            self.status_label.setText("❌ Choisis les deux plus petites fréquences.")
            self._update_stats()
            return

        left, right = selected
        merged = self._new_node(None, left.freq + right.freq, left, right)
        self.nodes = [n for n in self.nodes if n not in selected]
        self.nodes.append(merged)

        self.steps += 1
        self.history.append(f"Fusion {left.freq} + {right.freq} → {merged.freq}")
        self.history_list.addItem(QListWidgetItem(self.history[-1]))

        self._refresh_list()
        self._layout_nodes()
        self._update_stats()
        self._update_forest()

        if len(self.nodes) == 1:
            self.timer.stop()
            self.status_label.setText("🎉 Arbre complet !")

    def _new_node(self, char: str | None, freq: int, left=None, right=None):
        self.node_id += 1
        size = 50 + min(80, freq * 3)
        bubble = _Bubble(self.node_id, char, freq, size)
        bubble.left = left
        bubble.right = right
        self.scene.addItem(bubble)
        return bubble

    def _layout_nodes(self):
        if not self.nodes:
            return
        width = int(self.scene.sceneRect().width())
        margin = 20
        x = margin
        y = 30
        row_height = 0
        for node in sorted(self.nodes, key=lambda n: (n.freq, n.node_id)):
            size = node.rect().width()
            if x + size + margin > width:
                x = margin
                y += row_height + 20
                row_height = 0
            node.setPos(x, y)
            x += size + 20
            row_height = max(row_height, size)

    def _refresh_list(self):
        self.node_list.clear()
        for node in sorted(self.nodes, key=lambda n: (n.freq, n.node_id)):
            label = node.char if node.char else "•"
            item = QListWidgetItem(f"{label} — {node.freq}")
            item.setData(Qt.UserRole, node)
            self.node_list.addItem(item)

    def _sync_selection(self):
        selected_nodes = {item.data(Qt.UserRole) for item in self.node_list.selectedItems()}
        for node in self.nodes:
            node.setSelected(node in selected_nodes)

    def _update_stats(self):
        minutes = self.elapsed // 60
        seconds = self.elapsed % 60
        self.time_label.setText(f"Temps: {minutes}:{seconds:02d}")
        self.steps_label.setText(f"Fusions: {self.steps}")
        self.errors_label.setText(f"Erreurs: {self.mistakes}")
        self.score_label.setText(f"🏆 {max(0, 100 - self.mistakes * 10 - self.steps * 3)}")

        compression = self._compression_ratio()
        self.compression_label.setText(f"Compression: {compression:.1f}%")

    def _update_forest(self):
        if not self.nodes:
            self.forest_label.setText("—")
            return
        if len(self.nodes) == 1:
            lines: list[str] = []
            self._render_tree(self.nodes[0], "", lines)
            self.forest_label.setText("\n".join(lines))
            return
        lines = ["Forêt (fusion en parallèle) :"]
        for idx, root in enumerate(sorted(self.nodes, key=lambda n: (n.freq, n.node_id)), start=1):
            lines.append(f"\nArbre {idx} — {root.freq}")
            self._render_tree(root, "  ", lines)
        self.forest_label.setText("\n".join(lines))

    def _render_tree(self, node, prefix, lines):
        label = node.char if node.char else "•"
        lines.append(f"{prefix}{label} ({node.freq})")
        if getattr(node, "left", None):
            self._render_tree(node.left, prefix + " 0→ ", lines)
        if getattr(node, "right", None):
            self._render_tree(node.right, prefix + " 1→ ", lines)

    def _sanitize_dna(self, text: str) -> str:
        text = text.upper().replace(" ", "")
        return "".join(ch for ch in text if ch in {"A", "C", "G", "T"})

    def _compression_ratio(self) -> float:
        if len(self.nodes) != 1 or not self.original_size:
            return 0.0
        avg_len = self._avg_code_length(self.nodes[0])
        if not avg_len:
            return 0.0
        fixed = 2.0
        return max(0.0, (1 - avg_len / fixed) * 100)

    def _avg_code_length(self, root) -> float:
        freq = Counter(self.input_field.text())
        total = sum(freq.values()) or 1
        codes = self._build_codes(root)
        return sum(freq[ch] * len(codes[ch]) for ch in codes) / total

    def _build_codes(self, node, prefix="", out=None):
        if out is None:
            out = {}
        if getattr(node, "left", None) is None and getattr(node, "right", None) is None:
            out[node.char] = prefix or "0"
            return out
        if getattr(node, "left", None):
            self._build_codes(node.left, prefix + "0", out)
        if getattr(node, "right", None):
            self._build_codes(node.right, prefix + "1", out)
        return out

    def _tick(self):
        self.elapsed += 1
        minutes = self.elapsed // 60
        seconds = self.elapsed % 60
        self.timer_label.setText(f"⏱ {minutes:02d}:{seconds:02d}")
        self._update_stats()