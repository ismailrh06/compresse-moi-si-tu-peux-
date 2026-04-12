import type { InventoryStack } from "@/engine/gameLogic";

type Props = {
  score: number;
  elapsed: number;
  slotsUsed: number;
  memoryLimit: number;
  efficiency: number;
  combo: number;
  comboBest: number;
  multiplier: number;
  phase: "idle" | "running" | "gameover";
  message: string;
  overflowTimer: number;
  inventory: InventoryStack[];
  totalItems: number;
};

function StatCard({ label, value, className = "" }: { label: string; value: string | number; className?: string }) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 p-3 ${className}`}>
      <p className="text-[11px] uppercase tracking-wider text-white/60">{label}</p>
      <p className="text-xl font-extrabold text-white">{value}</p>
    </div>
  );
}

export default function HUD({
  score,
  elapsed,
  slotsUsed,
  memoryLimit,
  efficiency,
  combo,
  comboBest,
  multiplier,
  phase,
  message,
  overflowTimer,
  inventory,
  totalItems,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-500/10 via-fuchsia-500/10 to-emerald-500/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">BYTE MAZE</p>
            <h2 className="text-xl font-black text-white">COMPRESSION RUN</h2>
          </div>
          <div className="rounded-full border border-cyan-300/50 bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-100">
            {phase === "running" ? "RUNNING" : phase === "gameover" ? "GAME OVER" : "READY"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <StatCard label="Score" value={score} className="border-cyan-300/20" />
        <StatCard label="Time" value={`${elapsed.toFixed(1)}s`} className="border-fuchsia-300/20" />
        <StatCard label="Combo" value={`x${combo}`} className="border-amber-300/20" />
        <StatCard label="Multiplier" value={`x${multiplier}`} className="border-emerald-300/20" />
      </div>

      <div className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70">Memory slots</span>
          <span className={`font-bold ${slotsUsed > memoryLimit ? "text-rose-300" : "text-cyan-200"}`}>
            {slotsUsed} / {memoryLimit}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full transition-all duration-150 ${slotsUsed > memoryLimit ? "bg-rose-400" : "bg-cyan-400"}`}
            style={{ width: `${Math.min(100, (slotsUsed / memoryLimit) * 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-white/70">
          <span>Compression efficiency</span>
          <span>{Math.round(efficiency * 100)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-emerald-400" style={{ width: `${Math.round(efficiency * 100)}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Overflow pressure</span>
          <span>{Math.round((overflowTimer / 5.5) * 100)}%</span>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <p className="mb-2 text-xs uppercase tracking-wider text-white/60">Inventory stacks ({totalItems} items)</p>
        <div className="flex min-h-12 flex-wrap gap-2">
          {inventory.length === 0 ? <span className="text-sm text-white/45">Empty memory...</span> : null}
          {inventory.map((stack, index) => (
            <div
              key={`${stack.type}-${index}`}
              className={`rounded-lg border px-2 py-1 text-sm ${stack.count >= 8 ? "border-amber-300 bg-amber-500/20" : "border-cyan-300/30 bg-cyan-500/10"}`}
            >
              <span>{stack.type}</span>
              <span className="ml-1 font-semibold text-white/90">x{stack.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-fuchsia-300/30 bg-fuchsia-500/10 px-3 py-2 text-sm text-fuchsia-100">
        {message}
      </div>

      <div className="rounded-xl border border-cyan-300/20 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 p-3 text-xs text-white/75">
        <p>Controls: Flèches / WASD / ZQSD</p>
        <p>Espace: stop net pour reprendre le contrôle.</p>
        <p>Goal: chain identical pickups to keep slots low and score high.</p>
        <p>Best combo: x{comboBest}</p>
      </div>
    </div>
  );
}
