"use client";

import { motion } from "framer-motion";
import { User, Lock, UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: FormEvent) {
    e.preventDefault(); // IMPORTANT
    setError("");

    const normalizedName = fullName.trim();
    if (!normalizedName) {
      setError("Le nom complet est requis.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.signup({
        full_name: normalizedName,
        password,
      });

      document.cookie = `auth_token=${encodeURIComponent(response.full_name)}; path=/;`;
      document.cookie = `full_name=${encodeURIComponent(response.full_name)}; path=/;`;
      sessionStorage.removeItem("intro_seen");
      // onboarding doit être fait encore → redirection
      window.location.href = "/onboarding";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de créer le compte.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-2xl sm:p-10"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          S’inscrire
        </h1>

        <form className="space-y-6" onSubmit={handleSignup}>
          <div>
            <label className="text-sm text-white/70 flex items-center gap-2 mb-2">
              <User size={16} />
              Nom complet
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Ismael Ndiaye"
              className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm text-white/70 flex items-center gap-2 mb-2">
              <Lock size={16} />
              Mot de passe (optionnel)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Optionnel"
              className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl border border-red-400/40 bg-red-500/20 text-red-200 flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={loading ? {} : { scale: 0.97 }}
            whileHover={loading ? {} : { scale: 1.02 }}
            className="w-full bg-white text-black font-semibold py-3 rounded-2xl flex gap-2 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={20} className="animate-spin" /> Inscription en cours…</>
            ) : (
              <><UserPlus size={20} /> S'inscrire</>
            )}
          </motion.button>
        </form>

        <p className="mt-4 text-center text-sm text-white/60">
          Déjà un compte ? <a href="/login" className="text-blue-300">Se connecter</a>
        </p>
      </motion.div>
    </div>
  );
}