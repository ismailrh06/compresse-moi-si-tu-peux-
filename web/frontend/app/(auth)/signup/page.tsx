"use client";

import { motion } from "framer-motion";
import { User, Lock, UserPlus, AlertCircle } from "lucide-react";
import { FormEvent, useState } from "react";

type StoredUser = {
  fullName: string;
  password?: string;
};

const USERS_KEY = "compressemos_users";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSignup(e: FormEvent) {
    e.preventDefault(); // IMPORTANT
    setError("");

    const normalizedName = fullName.trim();
    if (!normalizedName) {
      setError("Le nom complet est requis.");
      return;
    }

    const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
    const alreadyExists = users.some(
      (u) => u.fullName.trim().toLowerCase() === normalizedName.toLowerCase()
    );

    if (alreadyExists) {
      setError("Un compte existe déjà avec ce nom complet.");
      return;
    }

    const nextUsers = [...users, { fullName: normalizedName, password: password || "" }];
    localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));

    document.cookie = `auth_token=${encodeURIComponent(normalizedName)}; path=/;`;
    document.cookie = `full_name=${encodeURIComponent(normalizedName)}; path=/;`;
    // onboarding doit être fait encore → redirection
    window.location.href = "/onboarding";
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
              placeholder="Optionnel"
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
            <UserPlus size={20} />
            S’inscrire
          </motion.button>
        </form>

        <p className="text-center text-white/60 text-sm mt-4">
          Déjà un compte ? <a href="/login" className="text-blue-300">Se connecter</a>
        </p>
      </motion.div>
    </div>
  );
}