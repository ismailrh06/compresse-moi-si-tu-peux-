"use client";

import { motion } from "framer-motion";
import { Mail, Lock, LogIn } from "lucide-react";
import { FormEvent } from "react";

export default function LoginPage() {
  function handleLogin(e: FormEvent) {
    e.preventDefault(); // IMPORTANT

    // Simule un login réussi → tu mets ton vrai backend plus tard
    document.cookie = "auth_token=valid; path=/;";
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
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              required
              className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2"
            />
          </div>

          <div>
            <label className="text-sm text-white/70 flex items-center gap-2 mb-2">
              <Lock size={16} />
              Mot de passe
            </label>
            <input
              type="password"
              required
              className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2"
            />
          </div>

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
