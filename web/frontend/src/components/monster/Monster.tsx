"use client";

type Props = {
  size: number;
  frenzy: boolean;
  mood: string;
};

export default function Monster({ size, frenzy, mood }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.18),transparent_38%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.14),transparent_45%)]" />
      <div
        style={{
          transform: `scale(${Math.min(3.6, 1.55 + (size - 1) * 0.95 + (frenzy ? 0.45 : 0))})`,
          transition: "transform 0.4s ease",
          display: "inline-block",
          filter: frenzy ? "drop-shadow(0 0 24px rgba(251,146,60,0.85))" : "drop-shadow(0 0 16px rgba(16,185,129,0.6))",
        }}
        className={frenzy ? "animate-bounce" : ""}
      >
        <span className="text-9xl">🐲</span>
      </div>
      <p className="mt-8 text-3xl">{mood}</p>
      <p className="mt-1 text-sm text-white/70">
        Taille : <span className="font-semibold text-emerald-300">{size.toFixed(1)}x</span>
      </p>
      {frenzy && (
        <p className="mt-2 inline-block rounded-full border border-orange-300/40 bg-orange-500/20 px-3 py-1 text-xs font-black tracking-wide text-orange-100">
          MODE FRENZY
        </p>
      )}
    </div>
  );
}