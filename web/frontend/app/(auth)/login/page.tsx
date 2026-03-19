"use client";

import { motion } from "framer-motion";
import { User, Lock, LogIn, AlertCircle } from "lucide-react";
import { FormEvent, useState } from "react";

type StoredUser = {
  fullName: string;
  password?: string;
};

const USERS_KEY = "compressemos_users";

export default function LoginPage() {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e: FormEvent) {
    e.preventDefault(); // IMPORTANT
    setError("");

    const normalizedName = fullName.trim();
    if (!normalizedName) {
      setError("Le nom complet est requis.");
      return;
    }

    const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
    const user = users.find(
      (u) => u.fullName.trim().toLowerCase() === normalizedName.toLowerCase()
    );

    if (!user) {
      setError("Aucun compte trouvé avec ce nom complet.");
      return;
    }

    const hasPassword = Boolean(user.password && user.password.length > 0);
    if (hasPassword && (user.password ?? "") !== password) {
      setError("Mot de passe incorrect.");
      return;
    }

    document.cookie = `auth_token=${encodeURIComponent(normalizedName)}; path=/;`;
    document.cookie = `full_name=${encodeURIComponent(normalizedName)}; path=/;`;
    window.location.href = "/onboarding"; // étape obligatoire
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 p-10 rounded-3xl shadow-xl"
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
              className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2"
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
              className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2"
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
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            className="w-full bg-white text-black font-semibold py-3 rounded-2xl flex gap-2 justify-center"
          >
            <LogIn size={20} />
            Se connecter
          </motion.button>
        </form>

        <p className="text-center text-white/60 text-sm mt-4">
          Pas de compte ? <a href="/signup" className="text-blue-300">S’inscrire</a>
        </p>
      </motion.div>
    </div>
  );
}
