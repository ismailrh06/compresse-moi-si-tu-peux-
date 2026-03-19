"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileUp,
  FileDown,
  Download,
  Loader2,
  AlertTriangle,
  Sparkles,
  FileArchive,
  Gauge,
} from "lucide-react";

import { api } from "@/lib/api";

type CompressionResult = {
  filename: string;
  output_filename: string;
  original_size: number;
  compressed_size: number;
  ratio: number;
  algorithm: string;
  compressed_base64: string;
  mime_type: string;
};

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [algorithm, setAlgorithm] = useState("huffman");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState("");

  const ALGOS = [
    {
      id: "huffman",
      label: "Huffman",
      desc: "Excellent pour les fichiers texte et symboliques.",
    },
    {
      id: "lzw",
      label: "LZW",
      desc: "Rapide avec dictionnaire, efficace sur motifs répétés.",
    },
  ];

  function formatBytes(value: number) {
    if (value < 1024) return `${value} o`;
    if (value < 1024 ** 2) return `${(value / 1024).toFixed(2)} Ko`;
    return `${(value / 1024 ** 2).toFixed(2)} Mo`;
  }

  async function handleCompress() {
    if (!file) return setError("Veuillez sélectionner un fichier.");
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const json = (await api.compress(file, algorithm)) as CompressionResult;
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de la compression.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadCompressed() {
    if (!result?.compressed_base64) return;

    const binary = atob(result.compressed_base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: result.mime_type || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.output_filename || "compressed.bin";
    link.click();
    URL.revokeObjectURL(url);
  }

  const savedBytes = result ? result.original_size - result.compressed_size : 0;
  const savedPercent =
    result && result.original_size > 0
      ? ((result.original_size - result.compressed_size) / result.original_size) * 100
      : 0;
  const ratioPercent = result ? result.ratio * 100 : 0;

  return (
    <div className="relative overflow-hidden px-6 py-10 text-white">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mb-8 max-w-5xl"
      >
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-white/80">
          <Sparkles size={14} />
          Compression intelligente
        </p>
        <h1 className="text-4xl font-bold md:text-5xl">Compresse ton fichier en un clic</h1>
        <p className="mt-3 max-w-3xl text-white/70">
          Importe un fichier, choisis l’algorithme adapté, puis télécharge immédiatement la version compressée.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto grid max-w-5xl gap-6 rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl md:grid-cols-[1.3fr_1fr] md:p-8"
      >
        <div>
          <motion.label
            whileHover={{ scale: 1.01 }}
            className="group flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/30 bg-slate-950/30 px-6 py-10 text-center transition hover:border-white/60 hover:bg-white/10"
          >
            <FileUp size={42} className="mb-4 text-white/90" />
            <p className="text-lg font-medium text-white">
              {file ? file.name : "Clique pour importer un fichier"}
            </p>
            <p className="mt-2 text-sm text-white/65">
              Formats pris en charge : texte, PDF, images et fichiers binaires.
            </p>
            <input
              type="file"
              className="hidden"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </motion.label>

          {file && (
            <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80">
              <p><span className="font-semibold">Nom :</span> {file.name}</p>
              <p><span className="font-semibold">Taille :</span> {formatBytes(file.size)}</p>
              <p><span className="font-semibold">Type :</span> {file.type || "application/octet-stream"}</p>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-white/60">
            Choix de l’algorithme
          </p>
          <div className="space-y-3">
            {ALGOS.map((algo) => (
              <motion.button
                whileHover={{ scale: 1.015 }}
                key={algo.id}
                onClick={() => setAlgorithm(algo.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  algorithm === algo.id
                    ? "border-cyan-300/70 bg-cyan-400/20"
                    : "border-white/20 bg-white/5 hover:border-white/40"
                }`}
              >
                <h3 className="font-semibold text-white">{algo.label}</h3>
                <p className="mt-1 text-sm text-white/65">{algo.desc}</p>
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCompress}
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-4 font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Compression en cours…
              </>
            ) : (
              <>
                <FileDown size={20} />
                Lancer la compression
              </>
            )}
          </motion.button>

          {error && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-400/40 bg-red-500/20 px-4 py-3 text-sm">
              <AlertTriangle size={18} className="text-red-300" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </motion.div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-10 max-w-5xl rounded-3xl border border-emerald-300/30 bg-emerald-500/10 p-6 shadow-xl backdrop-blur-xl md:p-8"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100">
                <CheckCircle2 size={14} />
                Compression terminée
              </p>
              <h2 className="mt-3 text-2xl font-bold md:text-3xl">{result.output_filename}</h2>
              <p className="mt-2 text-sm text-white/75">
                Fichier compressé avec <span className="font-semibold">{result.algorithm.toUpperCase()}</span>
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleDownloadCompressed}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-black"
            >
              <Download size={18} />
              Télécharger le fichier
            </motion.button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<FileArchive size={17} />}
              label="Taille originale"
              value={formatBytes(result.original_size)}
            />
            <StatCard
              icon={<FileDown size={17} />}
              label="Taille compressée"
              value={formatBytes(result.compressed_size)}
            />
            <StatCard
              icon={<Gauge size={17} />}
              label="Ratio"
              value={`${ratioPercent.toFixed(2)}%`}
            />
            <StatCard
              icon={<Sparkles size={17} />}
              label={savedBytes >= 0 ? "Espace économisé" : "Surcoût"}
              value={`${formatBytes(Math.abs(savedBytes))} (${Math.abs(savedPercent).toFixed(2)}%)`}
            />
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm text-white/75">
              <span>Gain de place</span>
              <span>{savedPercent >= 0 ? `${savedPercent.toFixed(2)}%` : "0.00%"}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-all"
                style={{ width: `${Math.max(0, Math.min(savedPercent, 100))}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
      <p className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-white/60">
        {icon}
        {label}
      </p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
