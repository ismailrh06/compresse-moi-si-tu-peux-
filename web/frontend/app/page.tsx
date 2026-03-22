"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap, FileCode, BarChart3 } from "lucide-react";
import IntroAnimation from "@/components/IntroAnimation";

export default function Home() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    // Show the intro animation once per browser session
    const seen = sessionStorage.getItem("intro_seen");
    if (!seen) {
      setShowIntro(true);
    }
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem("intro_seen", "1");
    setShowIntro(false);
  };

  return (
    <>
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
    <div className="pb-10 text-white">
      {/* HERO SECTION */}
      <section className="flex min-h-[70vh] flex-col items-center justify-between px-5 pt-8 sm:px-6 lg:flex-row lg:px-20 lg:pt-20">
        
        {/* LEFT TEXT */}
        <div className="max-w-xl text-center lg:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl"
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
            className="mt-6 text-base text-white/70 sm:text-lg"
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
            className="mt-10 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 font-semibold text-black shadow-xl transition hover:shadow-2xl sm:w-auto"
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
          className="mt-12 w-full max-w-sm rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl sm:p-8 lg:mt-0"
        >
          <img
            src="/images/compresse-moi-si-tu-peux.png"
            alt="Compresse moi si tu peux"
            className="mx-auto w-full max-w-xs sm:max-w-sm"
          />
        </motion.div>
      </section>

      {/* FEATURE CARDS */}
      <section className="grid grid-cols-1 gap-6 px-5 py-14 sm:px-6 md:grid-cols-3 lg:px-20 lg:py-20">
        
        {/* CARD 1 */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8"
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
          className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8"
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
          className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8"
        >
          <BarChart3 size={40} className="text-purple-300 mb-6" />
          <h3 className="text-xl font-semibold mb-3">Statistiques avancées</h3>
          <p className="text-white/70">
            Comparez les ratios de compression pour différents algorithmes et formats de fichiers.
          </p>
        </motion.div>

      </section>
    </div>
    </>
  );
}
