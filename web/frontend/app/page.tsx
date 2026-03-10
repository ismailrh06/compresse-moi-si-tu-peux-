"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, FileCode, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="text-white">
      {/* HERO SECTION */}
      <section className="min-h-[70vh] flex flex-col lg:flex-row items-center justify-between px-6 lg:px-20 pt-10 lg:pt-20">
        
        {/* LEFT TEXT */}
        <div className="max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl lg:text-6xl font-extrabold leading-tight"
          >
            Compressez. Analysez.  
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
              Visualisez.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white/70 mt-6 text-lg"
          >
            Une plateforme moderne pour compresser vos fichiers, comprendre les 
            algorithmes et visualiser les statistiques en temps réel.
          </motion.p>

          {/* CTA BUTTON */}
          <motion.a
            href="/onboarding"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-3 mt-10 px-8 py-4 bg-white text-black font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition"
          >
            Commencer
            <ArrowRight size={20} />
          </motion.a>
        </div>

        {/* RIGHT ILLUSTRATION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="mt-14 lg:mt-0 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl"
        >
          <img
            src="/logo.svg"
            alt="illustration"
            className="w-64 opacity-80"
          />
        </motion.div>
      </section>

      {/* FEATURE CARDS */}
      <section className="px-6 lg:px-20 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* CARD 1 */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl"
        >
          <Zap size={40} className="text-yellow-300 mb-6" />
          <h3 className="text-xl font-semibold mb-3">Compression rapide</h3>
          <p className="text-white/70">
            Profitez de la puissance de Huffman et LZW avec une interface simple et moderne.
          </p>
        </motion.div>

        {/* CARD 2 */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl"
        >
          <FileCode size={40} className="text-blue-300 mb-6" />
          <h3 className="text-xl font-semibold mb-3">Analyse visuelle</h3>
          <p className="text-white/70">
            Visualisez l’arbre Huffman, les entropies et les fréquences dans des graphes interactifs.
          </p>
        </motion.div>

        {/* CARD 3 */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl"
        >
          <BarChart3 size={40} className="text-purple-300 mb-6" />
          <h3 className="text-xl font-semibold mb-3">Statistiques avancées</h3>
          <p className="text-white/70">
            Comparez les ratios de compression pour différents algorithmes et formats de fichiers.
          </p>
        </motion.div>

      </section>
    </div>
  );
}
