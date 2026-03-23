"use client";

import { motion } from "framer-motion";
import { User, Lock, LogIn, AlertCircle, Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault(); // IMPORTANT
    setError("");

    const normalizedName = fullName.trim();
    if (!normalizedName) {
      setError("Le nom complet est requis.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.login({
        full_name: normalizedName,
        password,
      });

      document.cookie = `auth_token=${encodeURIComponent(response.full_name)}; path=/;`;
      document.cookie = `full_name=${encodeURIComponent(response.full_name)}; path=/;`;
      document.cookie = "onboarding_done=true; path=/;";
      sessionStorage.removeItem("intro_seen");
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de se connecter.");
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
          Se connecter
        </h1>

        <form className="space-y-6" onSubmit={handleLogin}>
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
              placeholder="Laisser vide si aucun"
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
              <><Loader2 size={20} className="animate-spin" /> Connexion en cours…</>
            ) : (
              <><LogIn size={20} /> Se connecter</>
            )}
          </motion.button>
        </form>

        <p className="mt-4 text-center text-sm text-white/60">
          Pas de compte ? <a href="/signup" className="text-blue-300">S’inscrire</a>
        </p>
      </motion.div>
    </div>
  );
}
