"use client";

import { Bar, Doughnut, Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function ComparePage() {
  // Données factices (plus tard → backend)
  const dataOriginal = 10240; // 10 KB
  const dataHuffman = 4200;
  const dataLZW = 5100;
  const dataRLE = 8600;

  // Bar chart
  const barData = {
    labels: ["Original", "Huffman", "LZW", "RLE"],
    datasets: [
      {
        label: "Taille du fichier (en octets)",
        data: [dataOriginal, dataHuffman, dataLZW, dataRLE],
        backgroundColor: [
          "rgba(255, 255, 255, 0.7)",
          "rgba(168, 85, 247, 0.7)",
          "rgba(59, 130, 246, 0.7)",
          "rgba(244, 114, 182, 0.7)",
        ],
        borderColor: "rgba(255, 255, 255, 1)",
        borderWidth: 2,
        borderRadius: 12,
      },
    ],
  };

  // Line chart (ratio)
  const lineData = {
    labels: ["Huffman", "LZW", "RLE"],
    datasets: [
      {
        label: "Ratio de compression (%)",
        data: [
          (dataHuffman / dataOriginal) * 100,
          (dataLZW / dataOriginal) * 100,
          (dataRLE / dataOriginal) * 100,
        ],
        borderColor: "rgba(255, 255, 255, 0.9)",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 3,
        pointRadius: 5,
        tension: 0.4,
      },
    ],
  };

  // Donut chart (distribution)
  const donutData = {
    labels: ["Original", "Compressé"],
    datasets: [
      {
        data: [dataOriginal, (dataHuffman + dataLZW + dataRLE) / 3],
        backgroundColor: ["rgba(255, 255, 255, 0.6)", "rgba(167, 139, 250, 0.7)"],
        hoverOffset: 8,
      },
    ],
  };

  return (
    <div className="text-white px-6 py-10">
      <motion.h1
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-10"
      >
        Comparaison des algorithmes
      </motion.h1>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* BAR CHART */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8"
        >
          <h2 className="text-xl font-semibold mb-6">
            Taille du fichier après compression
          </h2>
          <Bar data={barData} />
        </motion.div>

        {/* LINE CHART */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8"
        >
          <h2 className="text-xl font-semibold mb-6">
            Ratio de compression
          </h2>
          <Line data={lineData} />
        </motion.div>

        {/* DONUT CHART */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8"
        >
          <h2 className="text-xl font-semibold mb-6 text-center">
            Répartition Original / Compressé
          </h2>
          <div className="w-[300px] mx-auto">
            <Doughnut data={donutData} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
