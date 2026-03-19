"use client";

import type { Difficulty } from "./HuffmanGame";

export default function DifficultySelector({
  difficulty,
  setDifficulty,
  disabled,
}: {
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
  disabled: boolean;
}) {
  const options = [
    { id: "easy", label: "Facile", desc: "5 symboles · écarts nets" },
    { id: "medium", label: "Moyen", desc: "7 symboles · fréquences proches" },
    { id: "hard", label: "Difficile", desc: "9 symboles · égalités et pièges" },
  ];

  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setDifficulty(opt.id as Difficulty)}
          disabled={disabled}
          className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
            opt.id === difficulty
              ? "bg-white text-black shadow"
              : "bg-white/5 text-white/70 border-white/20 hover:border-white/50"
          }`}
        >
          <div>{opt.label}</div>
          <div className="text-[10px] opacity-70">{opt.desc}</div>
        </button>
      ))}
    </div>
  );
}
