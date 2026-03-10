from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QLabel, QLineEdit, QPushButton, QHBoxLayout,
    QListWidget, QTableWidget, QTableWidgetItem, QHeaderView, QComboBox, QScrollArea
)
from PySide6.QtCore import Qt, QTimer
from PySide6.QtGui import QLinearGradient, QColor, QPalette, QBrush


class LZWPage(QWidget):
    def __init__(self):
        super().__init__()

        self._gradient = QLinearGradient(0, 0, 0, 900)
        self._gradient.setColorAt(0.0, QColor("#EEF0FF"))
        self._gradient.setColorAt(1.0, QColor("#E7EAFF"))
        pal = QPalette()
        pal.setBrush(QPalette.Window, QBrush(self._gradient))
        self.setPalette(pal)
        self.setAutoFillBackground(True)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(100, 60, 100, 60)
        layout.setSpacing(20)
        layout.setAlignment(Qt.AlignTop)

        title = QLabel("Algorithme LZW")
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet("font-size: 28px; font-weight: bold; color: #1e1b4b;")
        layout.addWidget(title)

        self.choixBox = True
        self.saisirText = False

        self.input_layout = QHBoxLayout()
        self.input_layout.setSpacing(12)

        
        self.input_field = QComboBox()
        self.input_field.addItems(["bonjour", "hello", "compression", "algorithme", "dictionnaire", "mississippi"])
        self.input_field.setStyleSheet("""
            QComboBox {
                background-color: white;
                color: #000000;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                padding: 8px 12px;
                font-size: 14px;
            }
            QComboBox:focus {
                border: 2px solid #5865F2;
            }

            QComboBox QAbstractItemView {
                background-color: white; /* Couleur de fond de la liste déroulante */
                color: #000000; /* Couleur du texte des éléments */
                border: 1px solid #cbd5e1;
                selection-background-color: #E7EAFF; /* Couleur de fond de l'élément sélectionné */
                selection-color: #000000; /* Couleur du texte de l'élément sélectionné */
            }
        """)
        
        

        display_btn = QPushButton("👁️ Préparer")
        display_btn.setFixedWidth(120)
        display_btn.setStyleSheet("""
            QPushButton {
                background-color: #5865F2;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 8px 16px;
                font-weight: 600;
                font-size: 13px;
            }
            QPushButton:hover { background-color: #6D78F7; }
            QPushButton:pressed { background-color: #4752C4; }
        """)
        display_btn.clicked.connect(self.prepare_simulation)

        switch_btn = QPushButton("switch")
        switch_btn.setFixedWidth(120)
        switch_btn.setStyleSheet("""
            QPushButton {
                background-color: #5865F2;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 8px 16px;
                font-weight: 600;
                font-size: 13px;
            }
            QPushButton:hover { background-color: #6D78F7; }
            QPushButton:pressed { background-color: #4752C4; }
        """)
        switch_btn.clicked.connect(self.switch_fonction)

        self.input_layout.addWidget(self.input_field)
        self.input_layout.addWidget(display_btn)
        self.input_layout.addWidget(switch_btn)
        layout.addLayout(self.input_layout)

        # === Contrôles de simulation ===
        btn_style = """
            QPushButton {
                background-color: #5865F2;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 8px 16px;
                font-weight: 600;
                font-size: 13px;
            }
            QPushButton:hover { background-color: #6D78F7; }
            QPushButton:pressed { background-color: #4752C4; }
            QPushButton:disabled { background-color: #a5b4fc; }
        """

        controls_layout = QHBoxLayout()
        controls_layout.setSpacing(8)

        self.step_btn = QPushButton("➡️ Étape suivante")
        self.step_btn.setEnabled(False)
        self.step_btn.setStyleSheet(btn_style)

        self.run_btn = QPushButton("▶️ Exécuter tout")
        self.run_btn.setEnabled(False)
        self.run_btn.setStyleSheet(btn_style)

        self.reset_btn = QPushButton("🔄 Réinitialiser")
        self.reset_btn.setEnabled(False)
        self.reset_btn.setStyleSheet(btn_style)

        self.step_btn.clicked.connect(self.next_step)
        self.run_btn.clicked.connect(self.run_all)
        self.reset_btn.clicked.connect(self.reset_simulation)

        controls_layout.addWidget(self.step_btn)
        controls_layout.addWidget(self.run_btn)
        controls_layout.addWidget(self.reset_btn)
        layout.addLayout(controls_layout)

        # Affichage du mot courant avec coloration
        self.display_label = QLabel("")
        self.display_label.setAlignment(Qt.AlignCenter)
        self.display_label.setStyleSheet("font-size: 36px; font-weight: bold; color: #1e1b4b;")
        layout.addWidget(self.display_label)

        # Info étape courante
        self.step_info_label = QLabel("")
        self.step_info_label.setAlignment(Qt.AlignCenter)
        self.step_info_label.setStyleSheet("font-size: 14px; color: #374151;")
        layout.addWidget(self.step_info_label)

        # === Tableau du dictionnaire ===
        dict_label = QLabel("Dictionnaire (clé → code) :")
        dict_label.setStyleSheet("font-weight: 600; color: #000000;")
        layout.addWidget(dict_label)

        self.dict_table = QTableWidget(0, 2)
        self.dict_table.setHorizontalHeaderLabels(["Clé (chaine)", "Code"])
        self.dict_table.horizontalHeader().setSectionResizeMode(0, QHeaderView.Stretch)
        self.dict_table.horizontalHeader().setSectionResizeMode(1, QHeaderView.Stretch)
        self.dict_table.setMinimumHeight(180)
        self.dict_table.setMaximumHeight(260)
        self.dict_table.setStyleSheet("""
            QTableWidget {
                background-color: white;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
            }
            QHeaderView::section {
                background-color: #E7EAFF;
                color: #000000;
                font-weight: 600;
                padding: 6px;
            }
            QTableWidget::item {
                padding: 4px 8px;
            }
        """)
        layout.addWidget(self.dict_table)

        # Résultat de la compression
        result_title = QLabel("Codes de sortie :")
        result_title.setStyleSheet("font-weight: 600; color: #000000;")
        layout.addWidget(result_title)

        # Ajout d'une QScrollArea pour le résultat
        self.result_scroll_area = QScrollArea()
        self.result_scroll_area.setWidgetResizable(True)
        self.result_scroll_area.setVerticalScrollBarPolicy(Qt.ScrollBarAlwaysOff)  # Désactiver la barre verticale
        #self.result_scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarAsNeeded)  # Activer la barre horizontale si nécessaire
        self.result_scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        self.result_scroll_area.setMinimumHeight(60)  # Hauteur minimale
        self.result_scroll_area.setMaximumHeight(60)  # Hauteur maximale (facultatif)
        self.result_scroll_area.setStyleSheet("""
            QScrollArea {
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                background-color: white;
            }
            
        """)

        self.result_label = QLabel("")
        self.result_label.setAlignment(Qt.AlignCenter)
        #self.result_label.setAlignment(Qt.AlignLeft | Qt.AlignVCenter)
        # self.result_label.setStyleSheet(
        #     "font-size: 28px; font-weight: bold; color: #5865F2; "
        #     "background-color: white; border-radius: 8px; padding: 12px; "
        #     "border: 1px solid #cbd5e1;"
        # )
        self.result_label.setStyleSheet(
            "font-size: 28px; font-weight: bold; color: #5865F2; "
            "background-color: white; padding: 12px;"
        )
        self.result_label.setWordWrap(False)  # Désactiver le retour à la ligne automatique

        # Ajouter le QLabel dans la QScrollArea
        self.result_scroll_area.setWidget(self.result_label)
        layout.addWidget(self.result_scroll_area)
        #layout.addWidget(self.result_label)

        # Message de fin de simulation
        self.simulation_label = QLabel("")
        self.simulation_label.setAlignment(Qt.AlignCenter)
        self.simulation_label.setStyleSheet("font-size: 18px; font-weight: bold; color: #16a34a;")
        layout.addWidget(self.simulation_label)

        # --- État interne ---
        self._word = ""
        self._steps = []          # liste de (w, c, output_code, new_entry, pos_start, pos_end)
        self._step_index = 0
        self._dictionary = {}
        self._output_codes = []
        self._timer = QTimer()
        self._timer.setInterval(600)
        self._timer.timeout.connect(self._auto_step)

    # ------------------------------------------------------------------ #
    #  Algorithme LZW : calcule toutes les étapes à l'avance              #
    # ------------------------------------------------------------------ #
    def _compute_lzw_steps(self, text):
        """
        Retourne (dict_initial, steps).

        steps est une liste de dicts :
          - w          : tampon courant (avant cette étape)
          - c          : prochain caractère lu
          - wc         : w + c
          - output     : code émis (int ou None)
          - new_key    : nouvelle entrée ajoutée au dict (str ou None)
          - new_code   : code de la nouvelle entrée (int ou None)
          - pos_start  : index de début dans le mot original
          - pos_end    : index de fin   (exclusif) dans le mot original
        """
        # Initialisation : chaque caractère ASCII de base
        dictionary = {}
        code = 0
        for ch in sorted(set(text)):
            dictionary[ch] = code
            code += 1

        steps = []
        w = ""
        i = 0
        next_code = code

        while i < len(text):
            c = text[i]
            wc = w + c
            pos_start = i - len(w)   # position du début de w dans text
            pos_end = i + 1          # position après c

            if wc in dictionary:
                # On peut étendre le tampon
                steps.append({
                    "w": w, "c": c, "wc": wc,
                    "output": None,
                    "new_key": None, "new_code": None,
                    "pos_start": pos_start, "pos_end": pos_end,
                    "action": "extend"
                })
                w = wc
                i += 1
            else:
                # On émet le code de w et on ajoute wc au dictionnaire
                out_code = dictionary[w]
                steps.append({
                    "w": w, "c": c, "wc": wc,
                    "output": out_code,
                    "new_key": wc, "new_code": next_code,
                    "pos_start": pos_start, "pos_end": pos_end,
                    "action": "emit"
                })
                dictionary[wc] = next_code
                next_code += 1
                w = c
                i += 1

        # Émettre le dernier tampon
        if w:
            pos_start = len(text) - len(w)
            steps.append({
                "w": w, "c": "", "wc": w,
                "output": dictionary[w],
                "new_key": None, "new_code": None,
                "pos_start": pos_start, "pos_end": len(text),
                "action": "final"
            })

        return dictionary, steps

    # ------------------------------------------------------------------ #
    #  Préparation                                                         #
    # ------------------------------------------------------------------ #
    def prepare_simulation(self):
        self._timer.stop()
        if self.choixBox:
            self._word = self.input_field.currentText()
        elif self.saisirText:
            self._word = self.input_field.text().strip()

        if not self._word:
            return

        # Calcul des étapes
        init_dict, self._steps = self._compute_lzw_steps(self._word)

        # Initialisation du dictionnaire (caractères de base)
        self._dictionary = {}
        code = 0
        for ch in sorted(set(self._word)):
            self._dictionary[ch] = code
            code += 1

        self._step_index = 0
        self._output_codes = []
        self._next_code = code

        # Mise à jour de l'interface
        self._rebuild_dict_table(highlight_row=None)
        self.result_label.setText("")
        self.simulation_label.setText("")
        self.step_info_label.setText("Prêt. Cliquez sur 'Étape suivante' ou 'Exécuter tout'.")
        self._render_word(pos_start=0, pos_end=0)

        self.step_btn.setEnabled(True)
        self.run_btn.setEnabled(True)
        self.reset_btn.setEnabled(True)

    # ------------------------------------------------------------------ #
    #  Navigation                                                          #
    # ------------------------------------------------------------------ #
    def next_step(self):
        if self._step_index >= len(self._steps):
            self._finish()
            return
        self._apply_step(self._steps[self._step_index])
        self._step_index += 1
        if self._step_index >= len(self._steps):
            self._finish()

    def run_all(self):
        self.step_btn.setEnabled(False)
        self.run_btn.setEnabled(False)
        self._timer.start()

    def _auto_step(self):
        if self._step_index >= len(self._steps):
            self._timer.stop()
            self._finish()
            return
        self._apply_step(self._steps[self._step_index])
        self._step_index += 1

    def reset_simulation(self):
        self._timer.stop()
        self._step_index = 0
        self._output_codes = []
        self._dictionary = {}
        code = 0
        for ch in sorted(set(self._word)):
            self._dictionary[ch] = code
            code += 1
        self._next_code = code
        self._rebuild_dict_table(highlight_row=None)
        self.result_label.setText("")
        self.simulation_label.setText("")
        self.step_info_label.setText("Réinitialisé. Cliquez sur 'Étape suivante' ou 'Exécuter tout'.")
        self._render_word(pos_start=0, pos_end=0)
        self.step_btn.setEnabled(True)
        self.run_btn.setEnabled(True)

    # ------------------------------------------------------------------ #
    #  Application d'une étape                                            #
    # ------------------------------------------------------------------ #
    def _apply_step(self, step):
        pos_start = step["pos_start"]
        pos_end   = step["pos_end"]
        action    = step["action"]
        w         = step["w"]
        c         = step["c"]
        wc        = step["wc"]

        # Coloration du mot
        self._render_word(pos_start, pos_end)

        highlight_row = None

        if action == "extend":
            self.step_info_label.setText(
                f"🔍  « {wc} » est dans le dictionnaire → on étend le tampon"
            )

        elif action == "emit":
            out = step["output"]
            self._output_codes.append(out)
            self.result_label.setText("  ,  ".join(str(x) for x in self._output_codes))

            # Ajout dans le dictionnaire
            new_key  = step["new_key"]
            new_code = step["new_code"]
            self._dictionary[new_key] = new_code
            self._next_code = new_code + 1

            self._rebuild_dict_table(highlight_row=None)
            # Trouver la ligne de la nouvelle entrée
            for row in range(self.dict_table.rowCount()):
                if self.dict_table.item(row, 0) and self.dict_table.item(row, 0).text() == new_key:
                    highlight_row = row
                    break

            self._rebuild_dict_table(highlight_row=highlight_row)
            self.step_info_label.setText(
                f"📤  « {wc} » absent → émission code {out} pour « {w} » | "
                f"Ajout : « {new_key} » → {new_code}"
            )

        elif action == "final":
            out = step["output"]
            self._output_codes.append(out)
            self.result_label.setText("  ,  ".join(str(x) for x in self._output_codes))
            self.step_info_label.setText(
                f"🏁  Fin du texte → émission code {out} pour « {w} »"
            )

    # ------------------------------------------------------------------ #
    #  Fin de simulation                                                  #
    # ------------------------------------------------------------------ #
    def _finish(self):
        self.step_btn.setEnabled(False)
        self.run_btn.setEnabled(False)
        self._render_word(0, 0)   # plus de surbrillance
        self.simulation_label.setText("✅ Simulation terminée.")
        self.step_info_label.setText(
            f"Compression : {len(self._word)} caractères → {len(self._output_codes)} codes"
        )

    # ------------------------------------------------------------------ #
    #  Rendu du mot avec coloration de la fenêtre courante                #
    # ------------------------------------------------------------------ #
    def _render_word(self, pos_start, pos_end):
        word = self._word
        if not word:
            self.display_label.setText("")
            return

        # Couleurs : avant=gris, courant=bleu sur fond jaune, après=noir
        html = '<html><body style="font-size:36px; font-weight:bold;">'
        for i, ch in enumerate(word):
            if pos_start == pos_end:
                # Pas de surbrillance
                html += f'<span style="color:#1e1b4b;">{ch}</span>'
            elif pos_start <= i < pos_end:
                # Partie active : fond jaune, texte bleu
                html += (
                    f'<span style="color:#2563eb; background-color:#FEF08A; '
                    f'border-radius:4px; padding:0 2px;">{ch}</span>'
                )
            elif i < pos_start:
                # Déjà traité : gris
                html += f'<span style="color:#9ca3af;">{ch}</span>'
            else:
                # Pas encore traité : noir
                html += f'<span style="color:#1e1b4b;">{ch}</span>'
        html += '</body></html>'
        self.display_label.setText(html)

    # ------------------------------------------------------------------ #
    #  Reconstruction du tableau du dictionnaire                          #
    # ------------------------------------------------------------------ #
    def _rebuild_dict_table(self, highlight_row=None):
        self.dict_table.setRowCount(0)
        for key, code in sorted(self._dictionary.items(), key=lambda x: x[1]):
            row = self.dict_table.rowCount()
            self.dict_table.insertRow(row)
            item_key  = QTableWidgetItem(key)
            item_code = QTableWidgetItem(str(code))
            item_key.setTextAlignment(Qt.AlignCenter)
            item_code.setTextAlignment(Qt.AlignCenter)

            # Désactiver l'édition des cellules
            item_key.setFlags(item_key.flags() & ~Qt.ItemIsEditable)
            item_code.setFlags(item_code.flags() & ~Qt.ItemIsEditable)

            item_key.setForeground(QBrush(QColor("#000000")))
            item_code.setForeground(QBrush(QColor("#000000")))

            if row == highlight_row:
                # Nouvelle entrée : fond vert clair
                for item in (item_key, item_code):
                    item.setBackground(QBrush(QColor("#bbf7d0")))
                    item.setForeground(QBrush(QColor("#15803d")))

            self.dict_table.setItem(row, 0, item_key)
            self.dict_table.setItem(row, 1, item_code)

        # Scroll vers la dernière ligne (nouvelle entrée)
        if highlight_row is not None:
            self.dict_table.scrollToItem(self.dict_table.item(highlight_row, 0))

    def switch_fonction(self):
        self.input_layout.removeWidget(self.input_field)
        self.input_field.deleteLater()

        # Alterner entre QComboBox et QLineEdit
        if self.choixBox:
            self.input_field = QLineEdit()
            self.input_field.setPlaceholderText("Ex: bonjour, hello, compression...")
            self.input_field.setStyleSheet("""
                QLineEdit {
                    background-color: white;
                    color: #000000;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    padding: 8px 12px;
                    font-size: 14px;
                }
                QLineEdit:focus {
                    border: 2px solid #5865F2;
                }
            """)
        else:
            self.input_field = QComboBox()
            self.input_field.addItems(["bonjour", "hello", "compression", "algorithme", "dictionnaire", "mississippi"])
            self.input_field.setStyleSheet("""
                QComboBox {
                    background-color: white;
                    color: #000000;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    padding: 8px 12px;
                    font-size: 14px;
                }
                QComboBox:focus {
                    border: 2px solid #5865F2;
                }
            """)

        # Ajouter le nouveau widget au layout
        self.input_layout.insertWidget(0, self.input_field)

        # Alterner les états
        self.choixBox = not self.choixBox
        self.saisirText = not self.saisirText