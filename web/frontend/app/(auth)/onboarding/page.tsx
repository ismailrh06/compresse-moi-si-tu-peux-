"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function Onboarding() {
  const [step, setStep] = useState(0);

  // Étape 1 sélection
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  // Étape 2 sélection
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const steps = [
    {
      title: "Bienvenue sur Compressemos",
      desc: "On va configurer ton expérience en 3 petites étapes. Promis, ça va être rapide ✨",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Option 1 */}
          <button
            onClick={() => setSelectedMode("demo")}
            className={`bg-black/20 p-5 rounded-2xl border transition 
              ${
                selectedMode === "demo"
                  ? "border-yellow-400 shadow-lg"
                  : "border-white/10"
              }
            `}
          >
            <h3 className="font-semibold text-white mb-2">Démo / Projet scolaire</h3>
            <p className="text-white/60 text-sm">
              Tu veux montrer le projet en soutenance, expliquer les algorithmes de compression et impressionner le jury.
            </p>
          </button>

          {/* Option 2 */}
          <button
            onClick={() => setSelectedMode("exploration")}
            className={`bg-black/20 p-5 rounded-2xl border transition 
              ${
                selectedMode === "exploration"
                  ? "border-yellow-400 shadow-lg"
                  : "border-white/10"
              }
            `}
          >
            <h3 className="font-semibold text-white mb-2">Exploration perso</h3>
            <p className="text-white/60 text-sm">
              Tu explores la compression par curiosité, pour apprendre comment les algos fonctionnent en pratique.
            </p>
          </button>
        </div>
      ),
    },

    {
      title: "Choisis ton style d'utilisation",
      desc: "Dis-nous comment tu vas utiliser Compressemos pour personnaliser ton expérience.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Option 1 */}
          <button
            onClick={() => setSelectedStyle("learning")}
            className={`bg-black/20 p-5 rounded-2xl border transition 
              ${
                selectedStyle === "learning"
                  ? "border-yellow-400 shadow-lg"
                  : "border-white/10"
              }
            `}
          >
            <h3 className="font-semibold text-white mb-2">Mode Apprentissage</h3>
            <p className="text-white/60 text-sm">
              Explications détaillées, graphiques, et vulgarisation des algorithmes.
            </p>
          </button>

          {/* Option 2 */}
          <button
            onClick={() => setSelectedStyle("fast")}
            className={`bg-black/20 p-5 rounded-2xl border transition 
              ${
                selectedStyle === "fast"
                  ? "border-yellow-400 shadow-lg"
                  : "border-white/10"
              }
            `}
          >
            <h3 className="font-semibold text-white mb-2">Mode Rapide</h3>
            <p className="text-white/60 text-sm">
              Tu veux compresser vite, sans explications. Simple, rapide, efficace.
            </p>
          </button>
        </div>
      ),
    },

    {
      title: "Prêt à commencer ?",
      desc: "Ton espace Compressemos est prêt. Tu peux maintenant commencer à compresser 🚀",
      content: (
        <div className="mt-8 text-center text-white/70 text-lg">
          <p>Tu es prêt à découvrir la magie de la compression.</p>
        </div>
      ),
    },
  ];

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const finish = () => {
    document.cookie = "onboarding_done=true; path=/;";
    window.location.href = "/";
  };

  // Conditions de validation
  const isNextDisabled =
    (step === 0 && !selectedMode) || (step === 1 && !selectedStyle);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl bg-black/40 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-2xl"
      >
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold flex gap-2 items-center text-white">
            <Sparkles className="text-yellow-300" size={26} />
            Onboarding
          </h1>
          <p className="text-white/60 mt-1">
            Étape {step + 1} sur {steps.length}
          </p>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-3">
              {steps[step].title}
            </h2>

            <p className="text-white/60 mb-6">{steps[step].desc}</p>

            {steps[step].content}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-12">

          {/* Précédent */}
          {step > 0 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 text-white/70 hover:text-white transition"
            >
              <ArrowLeft size={18} />
              Précédent
            </button>
          ) : (
            <div></div>
          )}

          {/* Skip + Next */}
          <div className="flex items-center gap-4">

            {/* Skip */}
            <button
              onClick={() => {
                if (step === steps.length - 1) finish();
                else nextStep();
              }}
              className="text-white/40 hover:text-white/70 transition text-sm"
            >
              Skip
            </button>

            {/* Suivant / Terminer */}
            <button
              disabled={isNextDisabled}
              onClick={() => {
                if (step === steps.length - 1) finish();
                else nextStep();
              }}
              className={`
                px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition
                ${
                  isNextDisabled
                    ? "bg-white/20 text-black/20 cursor-not-allowed"
                    : "bg-white text-black hover:scale-[1.03]"
                }
              `}
            >
              {step === steps.length - 1 ? (
                <>
                  Terminer <CheckCircle2 size={18} />
                </>
              ) : (
                <>
                  Suivant <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
