"use client";

import { COMMAND_DEFS, CommandId, ItemType } from "@/components/hooks/useGame";

interface CommandPanelProps {
  cooldowns: Record<CommandId, number>;
  selectedType: ItemType;
  commandLog: string[];
  pauseTicks: number;
  activeCommand: CommandId | null;
  phase: "idle" | "running" | "lost";
  onExecute: (id: CommandId) => void;
}

export default function CommandPanel({
  cooldowns,
  selectedType,
  commandLog,
  pauseTicks,
  activeCommand,
  phase,
  onExecute,
}: CommandPanelProps) {
  const disabled = phase !== "running";

  return (
    <div className="flex flex-col gap-3">
      {/* Command buttons */}
      <div className="grid grid-cols-1 gap-2">
        {COMMAND_DEFS.map((def) => {
          const cd = cooldowns[def.id];
          const isReady = cd === 0;
          const isActive = activeCommand === def.id;
          const isDisabled = disabled || (!isReady && def.id !== "compress");

          return (
            <button
              key={def.id}
              onClick={() => !isDisabled && onExecute(def.id)}
              disabled={isDisabled}
              className={[
                "relative flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left",
                "text-sm font-mono transition-all duration-150",
                isActive
                  ? "scale-[1.02] border-yellow-300/80 bg-yellow-400/20 shadow-md shadow-yellow-500/20"
                  : isReady && !disabled
                  ? "cursor-pointer border-cyan-400/50 bg-gradient-to-r from-cyan-900/70 to-indigo-900/50 hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-500/20"
                  : "cursor-not-allowed border-white/10 bg-black/30 opacity-55",
              ].join(" ")}
            >
              {/* Cooldown progress bar */}
              {cd > 0 && (
                <div
                  className="absolute bottom-0 left-0 h-0.5 bg-cyan-500/60 rounded-b-lg transition-all"
                  style={{
                    width: `${100 - (cd / (COMMAND_DEFS.find((d) => d.id === def.id)?.cooldownTicks ?? 1)) * 100}%`,
                  }}
                />
              )}

              <span className="text-xl leading-none">{def.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold tracking-wider text-xs ${
                      isActive ? "text-yellow-300" : isReady ? "text-cyan-300" : "text-gray-500"
                    }`}
                  >
                    [{def.key}]
                  </span>
                  <span className={`font-bold ${isActive ? "text-yellow-200" : isReady ? "text-white" : "text-gray-500"}`}>
                    {def.name}
                  </span>
                  {def.id === "compress" && (
                    <span className="text-xs text-yellow-400 font-bold ml-1">→ {selectedType}</span>
                  )}
                  {cd > 0 && (
                    <span className="ml-auto text-xs text-orange-400 font-mono">⏳{cd}</span>
                  )}
                  {isReady && !disabled && def.id !== "compress" && (
                    <span className="ml-auto text-xs text-green-400">PRÊT</span>
                  )}
                </div>
                <p className="text-gray-400 text-xs truncate">{def.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Pause indicator */}
      {pauseTicks > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-900/50 border border-indigo-500/50 rounded-lg">
          <span className="text-indigo-300 text-sm">🧘 PAUSE</span>
          <div className="flex gap-1 ml-auto">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i < pauseTicks ? "bg-indigo-400" : "bg-gray-700"}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Command log */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/35">
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-1.5">
          <span className="text-xs font-mono text-gray-400">▸ LOG</span>
          <span className="text-xs text-gray-500">({commandLog.length})</span>
        </div>
        <div className="flex min-h-[80px] max-h-[120px] flex-col gap-0.5 overflow-y-auto p-2">
          {commandLog.length === 0 ? (
            <p className="text-gray-600 text-xs font-mono italic px-1">En attente de commandes...</p>
          ) : (
            commandLog.map((entry, i) => (
              <p
                key={i}
                className={`text-xs font-mono px-1 ${
                  i === 0 ? "text-cyan-300" : "text-gray-500"
                }`}
              >
                {i === 0 && <span className="text-green-500 mr-1">▸</span>}
                {entry}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
