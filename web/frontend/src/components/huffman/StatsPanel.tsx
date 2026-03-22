"use client";

import { motion } from "framer-motion";

export default function StatsPanel({
  time,
  score,
  steps,
  errors,
  difficulty,
  accuracy,
  streak = 0,
  mode,
  isCountdown = false,
  countdownUrgent = false,
  countdownDanger = false,
}: {
  time: string;
  score: number;
  steps: number;
  errors: number;
  difficulty: string;
  accuracy: number;
  streak?: number;
  mode?: string;
  isCountdown?: boolean;
  countdownUrgent?: boolean;
  countdownDanger?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
      {mode && <Stat label="Mode" value={mode} />}
      <Stat label="Niveau" value={difficulty} />
      <Stat
        label={isCountdown ? "Temps restant" : "Temps"}
        value={time}
        accent={isCountdown ? (countdownDanger ? "danger" : countdownUrgent ? "warning" : "countdown") : undefined}
        pulse={countdownDanger}
      />
      <Stat label="Fusions" value={steps} />
      <Stat label="Erreurs" value={errors} accent="error" />
      <Stat label="Précision" value={`${accuracy}%`} />
      <Stat label="Meilleure série" value={streak} accent={streak >= 3 ? "combo" : undefined} />
      <Stat label="Score" value={score} accent="success" />
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  pulse = false,
}: {
  label: string;
  value: string | number;
  accent?: "error" | "success" | "combo" | "countdown" | "warning" | "danger";
  pulse?: boolean;
}) {
  const accentClass =
    accent === "error" ? "text-rose-300" :
    accent === "success" ? "text-emerald-300" :
    accent === "combo" ? "text-yellow-300" :
    accent === "danger" ? "text-red-400" :
    accent === "warning" ? "text-orange-300" :
    accent === "countdown" ? "text-cyan-300" :
    "text-white";

  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.03, 1] } : {}}
      transition={pulse ? { duration: 0.6, repeat: Infinity } : {}}
      className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 shadow-md shadow-black/60"
    >
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400 mb-1">{label}</div>
      <div className={`text-lg font-semibold ${accentClass}`}>{value}</div>
    </motion.div>
  );
}
