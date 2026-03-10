"use client";

import { motion } from "framer-motion";
import { Mail, Lock, UserPlus } from "lucide-react";
import { FormEvent } from "react";

export default function SignupPage() {
  function handleSignup(e: FormEvent) {
    e.preventDefault(); // IMPORTANT

    // Simule une inscription réussie
    document.cookie = "auth_token=valid; path=/;";
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