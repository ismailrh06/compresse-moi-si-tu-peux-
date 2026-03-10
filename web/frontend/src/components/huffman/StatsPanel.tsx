"use client";

export default function StatsPanel({
  time,
  score,
  steps,
  errors,
}: {
  time: string;
  score: number;
  steps: number;
  errors: number;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Stat label="Temps" value={time} />
      <Stat label="Fusions" value={steps} />
      <Stat label="Erreurs" value={errors} accent="error" />
      <Stat label="Score" value={score} accent="success" />
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "error" | "success";
}) {
  const accentClass =
    accent === "error"
      ? "text-rose-300"
      : accent === "success"
      ? "text-emerald-300"
      : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 shadow-md shadow-black/60">
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400 mb-1">
        {label}
      </div>
      <div className={`text-lg font-semibold ${accentClass}`}>{value}</div>
    </div>
  );
}
