"use client";

export default function DifficultySelector({
  difficulty,
  setDifficulty,
  disabled,
}: {
  difficulty: string;
  setDifficulty: any;
  disabled: boolean;
}) {
  const options = [
    { id: "easy", label: "Facile" },
    { id: "medium", label: "Moyen" },
    { id: "hard", label: "Difficile" },
  ];

  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setDifficulty(opt.id)}
          disabled={disabled}
          className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
            opt.id === difficulty
              ? "bg-white text-black shadow"
              : "bg-white/5 text-white/70 border-white/20 hover:border-white/50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
