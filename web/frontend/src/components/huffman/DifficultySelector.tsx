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
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 md:w-auto md:min-w-[30rem]">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setDifficulty(opt.id as Difficulty)}
          disabled={disabled}
          className={`rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition sm:text-center ${
            opt.id === difficulty
              ? "bg-white text-black shadow"
              : "bg-white/5 text-white/70 border-white/20 hover:border-white/50"
          }`}
        >
          <div className="text-sm font-semibold">{opt.label}</div>
          <div className="mt-0.5 text-[11px] opacity-75">{opt.desc}</div>
        </button>
      ))}
    </div>
  );
}
