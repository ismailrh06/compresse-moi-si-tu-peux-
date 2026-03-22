"use client";

import { useMemo, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Download,
  FileUp,
  Loader2,
  Trophy,
} from "lucide-react";
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

import { api } from "@/lib/api";

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

type AlgorithmResult = {
  algorithm: string;
  label: string;
  filename: string;
  output_filename: string | null;
  original_size: number;
  compressed_size: number | null;
  compression_ratio: number | null;
  space_saving: number | null;
  processing_ms: number | null;
  integrity_ok: boolean;
  compressed_base64: string | null;
  mime_type: string | null;
  error?: string;
};

type ComparisonResult = {
  filename: string;
  content_type: string;
  original_size: number;
  entropy: number;
  algorithms: AlgorithmResult[];
  best_algorithm: string | null;
  all_integrity_ok: boolean;
};

function formatBytes(value: number) {
  if (value < 1024) return `${value} o`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(2)} Ko`;
  return `${(value / 1024 ** 2).toFixed(2)} Mo`;
}

function toPercent(value: number | null) {
  if (value === null) return "—";
  return `${(value * 100).toFixed(2)}%`;
}

function decodeBase64ToBlob(base64: string, mimeType: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType || "application/octet-stream" });
}

export default function ComparePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const successfulAlgorithms = useMemo(
    () => result?.algorithms.filter((entry) => entry.compressed_size !== null) ?? [],
    [result]
  );

  const bestEntry = useMemo(
    () => successfulAlgorithms.find((entry) => entry.algorithm === result?.best_algorithm) ?? null,
    [result, successfulAlgorithms]
  );

  const barData = useMemo(
    () => ({
      labels: ["Original", ...successfulAlgorithms.map((entry) => entry.label)],
      datasets: [
        {
          label: "Taille du fichier (octets)",
          data: [
            result?.original_size ?? 0,
            ...successfulAlgorithms.map((entry) => entry.compressed_size ?? 0),
          ],
          backgroundColor: [
            "rgba(255, 255, 255, 0.72)",
            "rgba(168, 85, 247, 0.72)",
            "rgba(59, 130, 246, 0.72)",
          ],
          borderColor: "rgba(255, 255, 255, 1)",
          borderWidth: 2,
          borderRadius: 12,
        },
      ],
    }),
    [result, successfulAlgorithms]
  );

  const lineData = useMemo(
    () => ({
      labels: successfulAlgorithms.map((entry) => entry.label),
      datasets: [
        {
          label: "Gain de place (%)",
          data: successfulAlgorithms.map((entry) => ((entry.space_saving ?? 0) * 100).toFixed(2)),
          borderColor: "rgba(255, 255, 255, 0.9)",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          borderWidth: 3,
          pointRadius: 5,
          tension: 0.35,
        },
      ],
    }),
    [successfulAlgorithms]
  );

  const doughnutData = useMemo(
    () => ({
      labels: ["Espace conservé", "Espace économisé"],
      datasets: [
        {
          data: bestEntry
            ? [bestEntry.compressed_size ?? 0, result!.original_size - (bestEntry.compressed_size ?? 0)]
            : [1, 0],
          backgroundColor: ["rgba(255,255,255,0.6)", "rgba(167,139,250,0.8)"],
          hoverOffset: 8,
        },
      ],
    }),
    [bestEntry, result]
  );

  const timingData = useMemo(
    () => ({
      labels: successfulAlgorithms.map((entry) => entry.label),
      datasets: [
        {
          label: "Temps de compression (ms)",
          data: successfulAlgorithms.map((entry) => entry.processing_ms ?? 0),
          backgroundColor: [
            "rgba(16, 185, 129, 0.75)",
            "rgba(249, 115, 22, 0.75)",
          ],
          borderRadius: 12,
        },
      ],
    }),
    [successfulAlgorithms]
  );

  async function handleCompare() {
    if (!file) {
      setError("Veuillez sélectionner un vrai fichier à comparer.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const json = (await api.compare(file)) as ComparisonResult;
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de comparaison.");
    } finally {
      setLoading(false);
    }
  }

  function downloadCompressed(entry: AlgorithmResult) {
    if (!entry.compressed_base64 || !entry.output_filename) return;

    const blob = decodeBase64ToBlob(entry.compressed_base64, entry.mime_type || "application/octet-stream");
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = entry.output_filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="px-4 py-8 text-white sm:px-6 sm:py-10">
      <motion.h1
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mb-8 max-w-6xl text-3xl font-bold sm:mb-10 sm:text-4xl"
      >
        Comparaison des algorithmes
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mb-8 max-w-5xl rounded-3xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-xl sm:mb-10 sm:p-8"
      >
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-center">
          <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-3xl border border-white/20 px-5 py-8 text-center transition hover:bg-white/10 sm:min-h-52 sm:px-6 sm:py-10">
            <FileUp size={42} className="mb-4" />
            <p className="text-lg font-medium">
              {file ? file.name : "Importe un vrai fichier pour comparer Huffman et LZW"}
            </p>
            <p className="mt-2 text-sm text-white/65">
              Texte, PDF, image ou n’importe quel fichier binaire.
            </p>
            <input
              type="file"
              className="hidden"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/50 p-5 sm:p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Analyse réelle</p>
              <p className="mt-2 text-sm text-white/75">
                Le backend compresse le même fichier avec les deux algorithmes,
                mesure la taille finale, le temps d’exécution et vérifie l’intégrité après décompression.
              </p>
            </div>

            {file && (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                <p><span className="font-semibold">Nom :</span> {file.name}</p>
                <p><span className="font-semibold">Taille :</span> {formatBytes(file.size)}</p>
                <p><span className="font-semibold">Type :</span> {file.type || "application/octet-stream"}</p>
              </div>
            )}

            <button
              onClick={handleCompare}
              disabled={loading}
              className="w-full rounded-2xl bg-white py-3 font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-50 sm:py-4"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Comparaison en cours…
                </span>
              ) : (
                "Comparer sur ce fichier"
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-400/40 bg-red-500/20 px-4 py-3 text-sm">
            <AlertTriangle size={18} className="text-red-300" />
            <p>{error}</p>
          </div>
        )}
      </motion.div>

      {result && bestEntry && (
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-8 max-w-5xl rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-5 shadow-lg sm:mb-10 sm:p-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-200">
                <Trophy size={16} />
                Meilleur résultat sur ce fichier
              </p>
              <h2 className="mt-2 text-2xl font-bold">{bestEntry.label}</h2>
              <p className="mt-2 text-sm text-white/75">
                {bestEntry.label} produit ici le fichier compressé le plus petit,
                avec un gain de {toPercent(bestEntry.space_saving)} et une vérification d’intégrité {bestEntry.integrity_ok ? "valide" : "échouée"}.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:min-w-[320px]">
              <MetricCard label="Taille originale" value={formatBytes(result.original_size)} />
              <MetricCard label="Entropie" value={`${result.entropy.toFixed(2)} bits/symbole`} />
              <MetricCard label="Taille gagnante" value={formatBytes(bestEntry.compressed_size ?? 0)} />
              <MetricCard label="Intégrité globale" value={result.all_integrity_ok ? "100% OK" : "À vérifier"} />
            </div>
          </div>
        </motion.div>
      )}

      {result && (
        <>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-10">

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl sm:p-8"
            >
              <h2 className="text-xl font-semibold mb-6">
                Taille du fichier après compression
              </h2>
              <Bar data={barData} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl sm:p-8"
            >
              <h2 className="text-xl font-semibold mb-6">
                Gain de place
              </h2>
              <Line data={lineData} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl sm:p-8"
            >
              <h2 className="text-xl font-semibold mb-6 text-center">
                Répartition original / meilleur résultat
              </h2>
              <div className="mx-auto w-full max-w-[300px]">
                <Doughnut data={doughnutData} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl sm:p-8"
            >
              <h2 className="text-xl font-semibold mb-6">
                Temps de compression
              </h2>
              <Bar data={timingData} />
            </motion.div>
          </div>

          <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-2">
            {result.algorithms.map((entry) => (
              <motion.div
                key={entry.algorithm}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-3xl border p-5 shadow-xl backdrop-blur-xl sm:p-6 ${
                  entry.algorithm === result.best_algorithm
                    ? "border-emerald-400/40 bg-emerald-500/10"
                    : "border-white/20 bg-white/10"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{entry.label}</h3>
                    <p className="mt-1 text-sm text-white/65">
                      {entry.algorithm === result.best_algorithm
                        ? "Meilleure compression sur ce fichier."
                        : "Résultat mesuré sur le même fichier source."}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      entry.integrity_ok
                        ? "bg-emerald-400/20 text-emerald-200"
                        : "bg-red-400/20 text-red-200"
                    }`}
                  >
                    {entry.integrity_ok ? "Intégrité OK" : "Intégrité KO"}
                  </span>
                </div>

                {entry.error ? (
                  <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {entry.error}
                  </div>
                ) : (
                  <>
                    <div className="mt-6 grid grid-cols-1 gap-3 text-sm text-white/85 sm:grid-cols-2">
                      <MetricCard label="Taille finale" value={formatBytes(entry.compressed_size ?? 0)} />
                      <MetricCard label="Gain de place" value={toPercent(entry.space_saving)} />
                      <MetricCard label="Ratio final" value={toPercent(entry.compression_ratio)} />
                      <MetricCard label="Temps" value={`${(entry.processing_ms ?? 0).toFixed(3)} ms`} />
                    </div>

                    <button
                      onClick={() => downloadCompressed(entry)}
                      disabled={!entry.compressed_base64}
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      <Download size={18} />
                      Télécharger {entry.output_filename}
                    </button>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
