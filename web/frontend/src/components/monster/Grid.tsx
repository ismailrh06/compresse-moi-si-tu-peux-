"use client";

import { useRef } from "react";
import { ItemType, GamePhase } from "../hooks/useGame";

type Props = {
  visibleTypes: ItemType[];
  byType: Record<ItemType, number>;
  bestType: ItemType;
  selectedType: ItemType;
  minGroup: number;
  phase: GamePhase;
  onSelect: (type: ItemType) => void;
  onCompress: (type: ItemType, x: number, y: number) => void;
};

export default function Grid({ visibleTypes, byType, bestType, selectedType, minGroup, phase, onSelect, onCompress }: Props) {
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function handleClick(type: ItemType) {
    const btn = btnRefs.current[type];
    let x = 50;
    let y = 50;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const container = btn.closest(".relative");
      if (container) {
        const cr = container.getBoundingClientRect();
        x = ((rect.left + rect.width / 2 - cr.left) / cr.width) * 100;
        y = ((rect.top + rect.height / 2 - cr.top) / cr.height) * 100;
      }
    }
    onCompress(type, x, y);
  }

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-white/80">
        Clique pour sélectionner · double-clic pour compresser directement
      </p>
      <div className={`grid gap-3 ${visibleTypes.length <= 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3 sm:grid-cols-6"}`}>
        {visibleTypes.map((type) => {
          const count = byType[type];
          const canCompress = count >= minGroup && phase === "running";
          const isOverflowing = count >= 8;
          const isBest = type === bestType && count >= minGroup;
          const isSelected = type === selectedType;

          return (
            <button
              key={type}
              ref={(el) => { btnRefs.current[type] = el; }}
              onClick={() => phase === "running" && onSelect(type)}
              onDoubleClick={() => canCompress && handleClick(type)}
              disabled={phase !== "running"}
              className={`flex flex-col items-center gap-1 rounded-2xl border p-3 transition-all duration-200 ${
                isSelected
                  ? "scale-105 border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-500/20 ring-2 ring-yellow-400/50"
                  : isOverflowing
                  ? "border-red-400/70 bg-red-500/20 animate-pulse"
                  : isBest
                  ? "border-emerald-300 bg-emerald-400/25"
                  : canCompress
                  ? "border-cyan-500/50 bg-cyan-500/10 hover:border-cyan-300"
                  : "cursor-not-allowed border-white/10 bg-white/5 opacity-60"
              }`}
            >
              <div className="flex min-h-[2.5rem] flex-wrap justify-center gap-0.5">
                {Array.from({ length: Math.min(count, 9) }).map((_, i) => (
                  <span key={i} className="text-xl leading-none">{type}</span>
                ))}
                {count > 9 && <span className="self-end text-xs text-white/70">+{count - 9}</span>}
                {count === 0 && <span className="text-2xl text-white/20">·</span>}
              </div>
              <div className={`text-xs font-black ${
                isSelected ? "text-yellow-300" :
                isOverflowing ? "text-red-300" :
                canCompress ? "text-emerald-300" : "text-white/50"
              }`}>
                {count} {isSelected ? "← CIBLE" : canCompress ? "→ 💥" : `(min ${minGroup})`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}