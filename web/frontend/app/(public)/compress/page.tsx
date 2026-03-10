"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileUp,
  FileDown,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [algorithm, setAlgorithm] = useState("huffman");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState("");

  const ALGOS = [
    { id: "huffman", label: "Huffman", desc: "Compression optimale binaire." },
    { id: "lzw", label: "LZW", desc: "Compression par dictionnaire." },
  ];

  async function handleCompress() {
    if (!file) return setError("Veuillez sélectionner un fichier.");
    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("algorithm", algorithm);

    try {
      const res = await fetch("/api/compress", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 404 || res.status === 502 || res.status === 503) {
          throw new Error("BACKEND_UNAVAILABLE");
        }
        throw new Error("Erreur serveur.");
      }
      
      const json = await res.json();

      if (json.error) {
        setError(json.error);
      } else {
        setResult(json);
      }
    } catch (err) {
      if (err instanceof Error && err.message === "BACKEND_UNAVAILABLE") {
        setError("Le backend n'est pas disponible. Déployez d'abord l'API puis configurez API_BASE_URL sur Vercel.");
      } else {
        setError("Une erreur est survenue lors de la compression.");
      }
    }

    setLoading(false);
  }

  return (
    <div className="text-white px-6 py-10">
      <motion.h1
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8"
      >
        Compression de fichiers
      </motion.h1>

      {/* Container principal */}
      <div className="max-w-3xl bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl mx-auto p-10 shadow-xl">

        {/* Upload */}
        <motion.label
          whileHover={{ scale: 1.02 }}
          className="flex flex-col items-center justify-center text-center cursor-pointer p-10 border border-white/20 rounded-3xl hover:bg-white/10 transition"
        >
          <FileUp size={40} className="mb-4" />
          <p className="text-white/80">
            {file ? (
              <span className="text-white font-medium">{file.name}</span>
            ) : (
              "Cliquez pour importer un fichier"
            )}
          </p>
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </motion.label>

        {/* Algorithmes */}
        <div className="mt-10">
          <p className="text-white/70 mb-3">Choisissez un algorithme :</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ALGOS.map((algo) => (
              <motion.button
                whileHover={{ scale: 1.03 }}
                key={algo.id}
                onClick={() => setAlgorithm(algo.id)}
                className={`p-5 rounded-2xl border transition text-left ${
                  algorithm === algo.id
                    ? "bg-white text-black border-white"
                    : "bg-white/10 text-white/80 border-white/20 hover:border-white/40"
                }`}
              >
                <h3 className="font-semibold">{algo.label}</h3>
                <p className="text-sm text-white/70">{algo.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Erreurs */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-400/40 rounded-xl flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-300" />
            <p>{error}</p>
          </div>
        )}

        {/* Bouton */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCompress}
          disabled={loading}
          className="mt-8 w-full bg-white text-black py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={22} />
              Compression…
            </>
          ) : (
            <>
              <FileDown size={22} />
              Compresser
            </>
          )}
        </motion.button>
      </div>

      {/* Résultats JSON */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-14 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-xl max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-4">Résultat</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/90">
            <p><b>Fichier :</b> {result.filename}</p>
            <p><b>Algorithme :</b> {result.algorithm.toUpperCase()}</p>
            <p><b>Taille originale :</b> {result.original_size} octets</p>
            <p><b>Taille compressée :</b> {result.compressed_size} octets</p>
            <p><b>Ratio :</b> {(result.ratio * 100).toFixed(2)}%</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
