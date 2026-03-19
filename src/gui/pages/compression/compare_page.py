from pathlib import Path
import time

from PySide6.QtCharts import (
    QBarSeries,
    QBarSet,
    QCategoryAxis,
    QChart,
    QChartView,
    QLineSeries,
    QPieSeries,
    QValueAxis,
)
from PySide6.QtCore import Qt
from PySide6.QtGui import QColor, QPainter, QPen
from PySide6.QtWidgets import (
    QFileDialog,
    QFrame,
    QGraphicsDropShadowEffect,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QMessageBox,
    QPushButton,
    QScrollArea,
    QSizePolicy,
    QVBoxLayout,
    QWidget,
)

from src.algorithms.huffman.compress import huffman_compress
from src.algorithms.lzw.encoder import encoder as lzw_encoder


class ComparePage(QWidget):
    def __init__(self, router):
        super().__init__()
        self.router = router

        self.setObjectName("compare-page")
        self.setStyleSheet("""
            #compare-page {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 #0b1220, stop:0.5 #0f172a, stop:1 #111827);
            }
        """)

        # === Scroll global ===
        root_layout = QVBoxLayout(self)
        root_layout.setContentsMargins(0, 0, 0, 0)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.NoFrame)
        root_layout.addWidget(scroll)

        content = QWidget()
        scroll.setWidget(content)

        # === Layout principal ===
        layout = QVBoxLayout(content)
        layout.setAlignment(Qt.AlignTop)
        layout.setSpacing(18)
        layout.setContentsMargins(24, 24, 24, 24)

        # --- En-tête premium ---
        hero = QFrame()
        hero.setStyleSheet("""
            QFrame {
                background-color: rgba(255, 255, 255, 0.04);
                border-radius: 22px;
                border: 1px solid rgba(255, 255, 255, 0.12);
                padding: 18px;
            }
        """)
        hero_shadow = QGraphicsDropShadowEffect()
        hero_shadow.setBlurRadius(20)
        hero_shadow.setOffset(0, 6)
        hero_shadow.setColor(Qt.black)
        hero.setGraphicsEffect(hero_shadow)

        hero_layout = QHBoxLayout(hero)
        hero_layout.setSpacing(16)

        hero_left = QVBoxLayout()
        badge = QLabel("Analyse avancée")
        badge.setStyleSheet("""
            QLabel {
                background-color: rgba(167, 139, 250, 0.2);
                color: #c4b5fd;
                border: 1px solid rgba(167, 139, 250, 0.45);
                border-radius: 999px;
                padding: 4px 10px;
                font-size: 11px;
                font-weight: 600;
            }
        """)
        badge.setFixedHeight(22)

        title = QLabel("Comparaison des algorithmes")
        title.setStyleSheet("""
            QLabel {
                font-size: 28px;
                font-weight: 700;
                color: #f8fafc;
            }
        """)

        subtitle = QLabel("Taille après compression, ratio et répartition")
        subtitle.setStyleSheet("color: #cbd5f5; font-size: 14px;")

        hero_left.addWidget(badge, alignment=Qt.AlignLeft)
        hero_left.addWidget(title)
        hero_left.addWidget(subtitle)

        hero_layout.addLayout(hero_left)

        # --- Bouton ---
        self.btn_generate = QPushButton("📁 Utiliser le dernier fichier compressé")
        self.btn_generate.setStyleSheet("""
            QPushButton {
                background-color: rgba(255, 255, 255, 0.08);
                color: #f8fafc;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 14px;
                padding: 10px 18px;
                font-size: 14px;
                font-weight: 600;
            }
            QPushButton:hover {
                background-color: rgba(255, 255, 255, 0.16);
            }
        """)
        self.btn_generate.clicked.connect(self.generate_from_file)
        hero_layout.addWidget(self.btn_generate, alignment=Qt.AlignRight | Qt.AlignVCenter)

        layout.addWidget(hero)

        # --- Cartes stats ---
        stats_row = QHBoxLayout()
        stats_row.setSpacing(18)

        def make_stat_card(title_text: str):
            card = QFrame()
            card.setStyleSheet("""
                QFrame {
                    background-color: rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    padding: 12px 16px;
                }
            """)
            layout_card = QVBoxLayout(card)
            layout_card.setSpacing(6)
            title_lbl = QLabel(title_text)
            title_lbl.setStyleSheet("color: #cbd5f5; font-size: 12px;")
            value_lbl = QLabel("—")
            value_lbl.setStyleSheet("color: #f8fafc; font-size: 18px; font-weight: 700;")
            layout_card.addWidget(title_lbl)
            layout_card.addWidget(value_lbl)
            return card, value_lbl

        stat1, self.stat_best = make_stat_card("Meilleur ratio")
        stat2, self.stat_gain = make_stat_card("Gain moyen")
        stat3, self.stat_time = make_stat_card("Temps moyen")

        stat1.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
        stat2.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
        stat3.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)

        stats_row.addWidget(stat1)
        stats_row.addWidget(stat2)
        stats_row.addWidget(stat3)
        layout.addLayout(stats_row)

        # --- Grille de cartes ---
        grid = QGridLayout()
        grid.setHorizontalSpacing(18)
        grid.setVerticalSpacing(18)

        def make_card(title_text: str, description_text: str):
            card = QFrame()
            card.setStyleSheet("""
                QFrame {
                    background-color: rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    padding: 16px;
                }
            """)
            card_layout = QVBoxLayout(card)
            card_layout.setSpacing(10)
            card_layout.setContentsMargins(14, 14, 14, 14)
            header = QLabel(title_text)
            header.setStyleSheet("""
                QLabel {
                    color: #f8fafc;
                    font-size: 15px;
                    font-weight: 600;
                }
            """)
            description = QLabel(description_text)
            description.setWordWrap(True)
            description.setStyleSheet("""
                QLabel {
                    color: #cbd5f5;
                    font-size: 12px;
                    margin-top: 4px;
                }
            """)
            card_layout.addWidget(header)
            return card, card_layout, description

        # --- Carte 1: Bar chart ---
        self.card_bar, self.card_bar_layout, self.desc_bar = make_card(
            "Taille du fichier après compression",
            "Comparaison directe des tailles. Une barre plus basse signifie une compression plus efficace."
        )
        # --- Carte 2: Line chart ---
        self.card_line, self.card_line_layout, self.desc_line = make_card(
            "Ratio de compression (%)",
            "Un ratio plus faible indique une meilleure réduction de taille."
        )
        # --- Carte 3: Time chart ---
        self.card_time, self.card_time_layout, self.desc_time = make_card(
            "Temps d'exécution",
            "Mesure de la rapidité d'encodage. Un temps plus court améliore l'usage en temps réel."
        )
        # --- Carte 4: Donut chart ---
        self.card_donut, self.card_donut_layout, self.desc_donut = make_card(
            "Répartition Original / Compressé",
            "La part compressée représente la réduction moyenne obtenue par les algorithmes."
        )

        grid.addWidget(self.card_bar, 0, 0)
        grid.addWidget(self.card_line, 0, 1)
        grid.addWidget(self.card_time, 1, 0)
        grid.addWidget(self.card_donut, 1, 1)
        layout.addLayout(grid)

        # --- Graphiques QtCharts (4 cartes) ---
        self.chart_bar_view = self._build_chart_view()
        self.chart_line_view = self._build_chart_view()
        self.chart_time_view = self._build_chart_view()
        self.chart_donut_view = self._build_chart_view(min_height=260)

        self.card_bar_layout.addWidget(self.chart_bar_view)
        self.card_bar_layout.addWidget(self.desc_bar)
        self.card_line_layout.addWidget(self.chart_line_view)
        self.card_line_layout.addWidget(self.desc_line)
        self.card_time_layout.addWidget(self.chart_time_view)
        self.card_time_layout.addWidget(self.desc_time)
        self.card_donut_layout.addWidget(self.chart_donut_view)
        self.card_donut_layout.addWidget(self.desc_donut)

        # --- Label résumé ---
        self.summary_label = QLabel("")
        self.summary_label.setAlignment(Qt.AlignCenter)
        self.summary_label.setStyleSheet("font-size: 13px; color: #e2e8f0; margin-top: 8px;")
        layout.addWidget(self.summary_label)

        self.setLayout(root_layout)

        self._set_empty_state()

    def _build_chart_view(self, min_height: int = 240) -> QChartView:
        view = QChartView()
        view.setRenderHint(QPainter.Antialiasing)
        view.setStyleSheet("background: transparent;")
        view.setMinimumHeight(min_height)
        view.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
        return view

    def on_show(self):
        self.generate_from_file(use_last_only=True)


    def _set_empty_state(self):
        self.stat_best.setText("—")
        self.stat_gain.setText("—")
        self.stat_time.setText("—")
        self.desc_bar.setText("Comparaison directe des tailles après compression.")
        self.desc_line.setText("Évolution du ratio de compression par algorithme.")
        self.desc_time.setText("Comparaison des temps d'exécution.")
        self.desc_donut.setText("Répartition entre taille originale et taille compressée moyenne.")
        self.summary_label.setText("Sélectionnez un fichier pour générer les graphiques.")

        for chart_view in (
            self.chart_bar_view,
            self.chart_line_view,
            self.chart_time_view,
            self.chart_donut_view,
        ):
            empty_chart = QChart()
            empty_chart.legend().setVisible(False)
            chart_view.setChart(empty_chart)

    def _get_last_context(self):
        last = getattr(self.router, "last_compress", None)
        if not isinstance(last, dict):
            return None
        original = last.get("original")
        if not original or not Path(original).exists():
            return None
        return last

    def _compress_measure(self, data: bytes, out_path: Path, algorithm, cached_time=None):
        if out_path.exists():
            out_size = out_path.stat().st_size
            if cached_time is not None:
                return out_size, float(cached_time)

            start = time.perf_counter()
            algorithm(data)
            return out_size, time.perf_counter() - start

        start = time.perf_counter()
        compressed = algorithm(data)
        elapsed = time.perf_counter() - start
        out_path.write_bytes(compressed)
        return len(compressed), elapsed

    def generate_from_file(self, use_last_only: bool = False):
        """Génère la comparaison à partir d'un fichier réel."""
        last = self._get_last_context()
        if last:
            in_path = Path(last["original"])
        else:
            if use_last_only:
                self._set_empty_state()
                return
            file_path, _ = QFileDialog.getOpenFileName(self, "Choisir un fichier à analyser")
            if not file_path:
                return
            in_path = Path(file_path)

        try:
            data = in_path.read_bytes()
        except Exception as e:
            QMessageBox.critical(self, "Erreur", f"Impossible de lire le fichier : {e}")
            return

        original_size = len(data) if data else 1

        out_dir = Path("data/output")
        out_dir.mkdir(parents=True, exist_ok=True)
        huf_path = Path(last["outputs"].get("Huffman")) if last and last.get("outputs", {}).get("Huffman") else out_dir / f"{in_path.stem}.huf"
        lzw_path = Path(last["outputs"].get("LZW")) if last and last.get("outputs", {}).get("LZW") else out_dir / f"{in_path.stem}.lzw"

        size_huffman, time_huffman = self._compress_measure(
            data,
            huf_path,
            huffman_compress,
            cached_time=last.get("times", {}).get("Huffman") if last else None,
        )
        size_lzw, time_lzw = self._compress_measure(
            data,
            lzw_path,
            lzw_encoder,
            cached_time=last.get("times", {}).get("LZW") if last else None,
        )

        sizes = [original_size, size_huffman, size_lzw]
        ratios = [
            (size_huffman / original_size) * 100,
            (size_lzw / original_size) * 100,
        ]
        times = [round(time_huffman, 4), round(time_lzw, 4)]

        best_idx = [size_huffman, size_lzw].index(min([size_huffman, size_lzw]))
        best_algo = ["Huffman", "LZW"][best_idx]
        avg_gain = round(100 - (sum(ratios) / len(ratios)), 2)
        avg_time = round(sum(times) / len(times), 4)

        self.stat_best.setText(f"{best_algo}")
        self.stat_gain.setText(f"{avg_gain}%")
        self.stat_time.setText(f"{avg_time} s")

        # --- BAR CHART (QtCharts) ---
        bar_chart = QChart()
        bar_chart.setBackgroundBrush(QColor("#f8fafc"))
        bar_chart.setPlotAreaBackgroundBrush(QColor("#f1f5f9"))
        bar_chart.setPlotAreaBackgroundVisible(True)
        bar_chart.legend().setVisible(True)
        bar_chart.legend().setAlignment(Qt.AlignBottom)
        bar_chart.legend().setMarkerShape(bar_chart.legend().markerShape())
        bar_chart.setAnimationOptions(QChart.SeriesAnimations)

        bar_series = QBarSeries()
        bar_set_original = QBarSet("Original")
        bar_set_huffman = QBarSet("Huffman")
        bar_set_lzw = QBarSet("LZW")
        bar_set_original.append([original_size])
        bar_set_huffman.append([size_huffman])
        bar_set_lzw.append([size_lzw])
        bar_set_original.setColor(QColor("#e2e8f0"))
        bar_set_huffman.setColor(QColor("#8b5cf6"))
        bar_set_lzw.setColor(QColor("#38bdf8"))
        bar_series.append(bar_set_original)
        bar_series.append(bar_set_huffman)
        bar_series.append(bar_set_lzw)
        bar_chart.addSeries(bar_series)

        bar_axis_x = QCategoryAxis()
        bar_axis_x.append("Taille", 0)
        bar_axis_x.setLabelsColor(QColor("#0f172a"))
        bar_axis_x.setGridLineVisible(False)
        bar_axis_y = QValueAxis()
        bar_axis_y.setTitleText("Octets")
        bar_axis_y.setTitleBrush(QColor("#0f172a"))
        bar_axis_y.setLabelsColor(QColor("#0f172a"))
        bar_axis_y.setGridLinePen(QPen(QColor("#cbd5e1"), 1, Qt.DotLine))
        bar_axis_y.setRange(0, max(sizes) * 1.25)
        bar_chart.addAxis(bar_axis_x, Qt.AlignBottom)
        bar_chart.addAxis(bar_axis_y, Qt.AlignLeft)
        bar_series.attachAxis(bar_axis_x)
        bar_series.attachAxis(bar_axis_y)
        self.chart_bar_view.setChart(bar_chart)

        # --- LINE CHART (QtCharts) ---
        line_chart = QChart()
        line_chart.setBackgroundBrush(QColor("#f8fafc"))
        line_chart.setPlotAreaBackgroundBrush(QColor("#f1f5f9"))
        line_chart.setPlotAreaBackgroundVisible(True)
        line_chart.legend().setVisible(False)
        line_chart.setAnimationOptions(QChart.SeriesAnimations)

        line_series = QLineSeries()
        line_series.append(0, ratios[0])
        line_series.append(1, ratios[1])
        line_series.setColor(QColor("#0f172a"))
        line_series.setPen(QPen(QColor("#0f172a"), 2.2))
        line_chart.addSeries(line_series)

        line_axis_x = QCategoryAxis()
        line_axis_x.append("Huffman", 0)
        line_axis_x.append("LZW", 1)
        line_axis_x.setLabelsColor(QColor("#0f172a"))
        line_axis_x.setGridLineVisible(False)
        line_axis_y = QValueAxis()
        line_axis_y.setTitleText("%")
        line_axis_y.setTitleBrush(QColor("#0f172a"))
        line_axis_y.setLabelsColor(QColor("#0f172a"))
        line_axis_y.setGridLinePen(QPen(QColor("#cbd5e1"), 1, Qt.DotLine))
        line_axis_y.setRange(0, max(ratios) * 1.3)
        line_chart.addAxis(line_axis_x, Qt.AlignBottom)
        line_chart.addAxis(line_axis_y, Qt.AlignLeft)
        line_series.attachAxis(line_axis_x)
        line_series.attachAxis(line_axis_y)
        self.chart_line_view.setChart(line_chart)

        # --- TIME CHART (QtCharts) ---
        time_chart = QChart()
        time_chart.setBackgroundBrush(QColor("#f8fafc"))
        time_chart.setPlotAreaBackgroundBrush(QColor("#f1f5f9"))
        time_chart.setPlotAreaBackgroundVisible(True)
        time_chart.legend().setVisible(True)
        time_chart.legend().setAlignment(Qt.AlignBottom)
        time_chart.setAnimationOptions(QChart.SeriesAnimations)

        time_series = QBarSeries()
        time_set_huffman = QBarSet("Huffman")
        time_set_lzw = QBarSet("LZW")
        time_set_huffman.append([times[0]])
        time_set_lzw.append([times[1]])
        time_set_huffman.setColor(QColor("#8b5cf6"))
        time_set_lzw.setColor(QColor("#38bdf8"))
        time_series.append(time_set_huffman)
        time_series.append(time_set_lzw)
        time_chart.addSeries(time_series)

        time_axis_x = QCategoryAxis()
        time_axis_x.append("Temps", 0)
        time_axis_x.setLabelsColor(QColor("#0f172a"))
        time_axis_x.setGridLineVisible(False)
        time_axis_y = QValueAxis()
        time_axis_y.setTitleText("Secondes")
        time_axis_y.setTitleBrush(QColor("#0f172a"))
        time_axis_y.setLabelsColor(QColor("#0f172a"))
        time_axis_y.setGridLinePen(QPen(QColor("#cbd5e1"), 1, Qt.DotLine))
        time_axis_y.setRange(0, max(times) * 1.6 if max(times) > 0 else 1)
        time_chart.addAxis(time_axis_x, Qt.AlignBottom)
        time_chart.addAxis(time_axis_y, Qt.AlignLeft)
        time_series.attachAxis(time_axis_x)
        time_series.attachAxis(time_axis_y)
        self.chart_time_view.setChart(time_chart)

        # --- DONUT CHART (QtCharts) ---
        donut_chart = QChart()
        donut_chart.setBackgroundBrush(QColor("#f8fafc"))
        donut_chart.setPlotAreaBackgroundBrush(QColor("#f1f5f9"))
        donut_chart.setPlotAreaBackgroundVisible(True)
        donut_chart.legend().setVisible(True)
        donut_chart.legend().setAlignment(Qt.AlignBottom)
        donut_chart.setAnimationOptions(QChart.SeriesAnimations)

        avg_compressed = (size_huffman + size_lzw) / 2
        donut_series = QPieSeries()
        donut_series.setHoleSize(0.55)
        donut_series.append("Original", original_size)
        donut_series.append("Compressé", avg_compressed)
        donut_series.slices()[0].setColor(QColor("#e2e8f0"))
        donut_series.slices()[1].setColor(QColor("#8b5cf6"))
        donut_series.slices()[0].setLabelVisible(True)
        donut_series.slices()[1].setLabelVisible(True)
        donut_chart.addSeries(donut_series)

        compression_percent = round((avg_compressed / original_size) * 100, 1)
        donut_chart.setTitle(f"{compression_percent}% compressé")
        self.chart_donut_view.setChart(donut_chart)

        # --- Descriptions dynamiques ---
        min_ratio = min(ratios)
        fastest = min(times)
        self.desc_bar.setText(
            f"Comparaison des tailles: meilleure compression = {best_algo} avec {min_ratio:.1f}% de la taille originale."
        )
        self.desc_line.setText(
            "Le ratio (%) exprime l'efficacité de compression. Un ratio inférieur indique une réduction supérieure."
        )
        self.desc_time.setText(
            f"Temps moyens d'encodage. L'algorithme le plus rapide est à {fastest} s."
        )
        self.desc_donut.setText(
            "Vue synthétique de la taille originale versus la taille moyenne compressée."
        )

        # --- Résumé textuel ---
        summary = (
            f"<b>Taille originale :</b> {original_size:,} octets<br>"
            f"💠 <b>Huffman</b> → {size_huffman:,} o | {round(100 - ratios[0], 2)}% de réduction | {times[0]} s<br>"
            f"💠 <b>LZW</b> → {size_lzw:,} o | {round(100 - ratios[1], 2)}% de réduction | {times[1]} s"
        )
        self.summary_label.setText(summary)
