"use client";

import { GamePhase } from "../hooks/useGame";

type Props = {
  phase: GamePhase;
  assistMode: boolean;
  frenzyActive: boolean;
  onStart: () => void;
  onToggleAssist: () => void;
};

export default function Controls({ phase, assistMode, frenzyActive, onStart, onToggleAssist }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={onStart}
        className="rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"
      >
        {phase === "running" ? "🔄 Restart" : "▶️ Start"} (Entrée)
      </button>
      <button
        onClick={onToggleAssist}
        className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
          assistMode
            ? "border-emerald-200/60 bg-emerald-400/20 text-emerald-100"
            : "border-white/25 bg-white/10 text-white/70"
        }`}
      >
        🤝 Assisté: {assistMode ? "ON" : "OFF"}{frenzyActive ? " 🔥" : ""}
      </button>
    </div>
  );
}