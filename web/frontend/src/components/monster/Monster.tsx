"use client";

type Props = {
  size: number;
  frenzy: boolean;
  mood: string;
};

export default function Monster({ size, frenzy, mood }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
      <div
        style={{
          transform: `scale(${Math.min(3, size + (frenzy ? 0.3 : 0))})`,
          transition: "transform 0.4s ease",
          display: "inline-block",
        }}
        className={frenzy ? "animate-bounce" : ""}
      >
        <span className="text-7xl">🐲</span>
      </div>
      <p className="mt-8 text-3xl">{mood}</p>
      <p className="mt-1 text-sm text-white/70">
        Taille : <span className="font-semibold text-emerald-300">{size.toFixed(1)}x</span>
      </p>
    </div>
  );
}