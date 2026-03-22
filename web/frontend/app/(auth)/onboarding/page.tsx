"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function Onboarding() {
  const [step, setStep] = useState(0);

  // Phase 1 : profil du visiteur
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  // Phase 2 : intention principale
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const steps = [
    {
      title: "Ton profil en 1 clic",
      desc: "Pour adapter l'expérience, dis-nous qui visite le site aujourd'hui.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <button
            onClick={() => setSelectedProfile("student")}
            className={`bg-black/20 p-5 rounded-2xl border transition 
              ${
                selectedProfile === "student"
                  ? "border-yellow-400 shadow-lg"
                  : "border-white/10"
              }
            `}
          >
            <h3 className="font-semibold text-white mb-2">Étudiant / Apprenant</h3>
            <p className="text-white/60 text-sm">
              Je veux comprendre les bases de Huffman et LZW avec des exemples simples.
            </p>
          </button>

          <button
            onClick={() => setSelectedProfile("dev")}
            className={`bg-black/20 p-5 rounded-2xl border transition 
              ${
                selectedProfile === "dev"
                  ? "border-yellow-400 shadow-lg"
                  : "border-white/10"
              }
            `}
          >
            <h3 className="font-semibold text-white mb-2">Dev / Tech</h3>
            <p className="text-white/60 text-sm">
              Je veux comparer les algorithmes et voir les performances rapidement.
            </p>
          </button>

          <button
            onClick={() => setSelectedProfile("teacher")}
            className={`bg-black/20 p-5 rounded-2xl border transition 
              ${
                selectedProfile === "teacher"
                  ? "border-yellow-400 shadow-lg"
                  : "border-white/10"
              }
            `}
          >
            <h3 className="font-semibold text-white mb-2">Enseignant / Formateur</h3>
            <p className="text-white/60 text-sm">
              Je veux vulgariser la compression pour un cours ou une démonstration.
            </p>
          </button>

          <button
            onClick={() => setSelectedProfile("curious")}
            className={`bg-black/20 p-5 rounded-2xl border transition 
              ${
                selectedProfile === "curious"
                  ? "border-yellow-400 shadow-lg"
                  : "border-white/10"
              }
            `}
          >
            <h3 className="font-semibold text-white mb-2">Curieux</h3>
            <p className="text-white/60 text-sm">
              Je découvre le sujet et je veux une approche visuelle et ludique.
            </p>
          </button>
        </div>
      ),
    },

    {
      title: "Ce que tu veux faire en priorité",
      desc: "Choisis ton objectif principal pour démarrer directement au bon rythme.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <button
            onClick={() => setSelectedGoal("learn")}
            className={`bg-black/20 p-5 rounded-2xl border transition 
              ${
                selectedGoal === "learn"
                  ? "border-yellow-400 shadow-lg"
                  : "border-white/10"
              }
            `}
          >
            <h3 className="font-semibold text-white mb-2">Apprendre les algorithmes</h3>
            <p className="text-white/60 text-sm">
              Je veux des explications claires, visuelles et progressives.
            </p>
          </button>

          <button
            onClick={() => setSelectedGoal("compress")}
            className={`bg-black/20 p-5 rounded-2xl border transition 
              ${
                selectedGoal === "compress"
                  ? "border-yellow-400 shadow-lg"
                  : "border-white/10"
              }
            `}
          >
            <h3 className="font-semibold text-white mb-2">Compresser un fichier vite</h3>
            <p className="text-white/60 text-sm">
              Aller à l'essentiel : importer, choisir, compresser, télécharger.
            </p>
          </button>

          <button
            onClick={() => setSelectedGoal("play")}
            className={`bg-black/20 p-5 rounded-2xl border transition 
              ${
                selectedGoal === "play"
                  ? "border-yellow-400 shadow-lg"
                  : "border-white/10"
              }
            `}
          >
            <h3 className="font-semibold text-white mb-2">Jouer & pratiquer</h3>
            <p className="text-white/60 text-sm">
              Je veux apprendre via les jeux Huffman / LZW et le challenge.
            </p>
          </button>

          <button
            onClick={() => setSelectedGoal("compare")}
            className={`bg-black/20 p-5 rounded-2xl border transition 
              ${
                selectedGoal === "compare"
                  ? "border-yellow-400 shadow-lg"
                  : "border-white/10"
              }
            `}
          >
            <h3 className="font-semibold text-white mb-2">Comparer Huffman vs LZW</h3>
            <p className="text-white/60 text-sm">
              Je veux surtout analyser les ratios, tailles et performances.
            </p>
          </button>
        </div>
      ),
    },
  ];

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const finish = () => {
    document.cookie = "onboarding_done=true; path=/;";
    if (selectedProfile) {
      document.cookie = `visitor_profile=${encodeURIComponent(selectedProfile)}; path=/;`;
    }
    if (selectedGoal) {
      document.cookie = `visitor_goal=${encodeURIComponent(selectedGoal)}; path=/;`;
    }
    window.location.href = "/";
  };

  // Conditions de validation
  const isNextDisabled =
    (step === 0 && !selectedProfile) || (step === 1 && !selectedGoal);

  return (
    <div className="flex min-h-screen items-start justify-center px-4 py-6 sm:items-center sm:py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl rounded-3xl border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur-2xl sm:p-10"
      >
        {/* Header */}
        <div className="mb-10">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white sm:text-3xl">
            <Sparkles className="text-yellow-300" size={26} />
            Onboarding
          </h1>
          <p className="text-white/60 mt-1">
            Étape {step + 1} sur {steps.length}
          </p>
          <div className="mt-4 h-2 w-full rounded-full bg-white/10">
            <motion.div
              initial={false}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.25 }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
            />
          </div>
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
            <h2 className="mb-3 text-xl font-bold text-white sm:text-2xl">
              {steps[step].title}
            </h2>

            <p className="text-white/60 mb-6">{steps[step].desc}</p>

            {steps[step].content}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-10 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">

          {/* Précédent */}
          {step > 0 ? (
            <button
              onClick={prevStep}
              className="inline-flex items-center gap-2 text-white/70 transition hover:text-white"
            >
              <ArrowLeft size={18} />
              Précédent
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}

          {/* Skip + Next */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">

            {/* Skip */}
            <button
              onClick={finish}
              className="text-left text-sm text-white/40 transition hover:text-white/70 sm:text-center"
            >
              Passer
            </button>

            {/* Suivant / Terminer */}
            <button
              disabled={isNextDisabled}
              onClick={() => {
                if (step === steps.length - 1) finish();
                else nextStep();
              }}
              className={`
                flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition sm:w-auto
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
