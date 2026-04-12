"use client";

import { useEffect, useRef, useState } from "react";
import { useGame, ALL_ITEM_TYPES, EASY_ITEM_TYPES, ItemType, CommandId } from "../hooks/useGame";
import MonsterView from "./Monster";
import Grid from "./Grid";
import Controls from "./Controls";
import ExplosionLayer from "./ExplosionLayer";
import CommandPanel from "./CommandPanel";
import HowToPlay from "./HowToPlay";

export default function Game() {
  const [assistMode, setAssistMode] = useState(true);
  const game = useGame(assistMode);
  const gameRef = useRef(game);
  useEffect(() => { gameRef.current = game; }, [game]);

  const [activeCommand, setActiveCommand] = useState<CommandId | null>(null);
  const frenzyActive = game.frenzyTicks > 0;
  const mood = frenzyActive ? "🤩" : game.frustration > 75 ? "😡" : game.frustration > 45 ? "😤" : "😋";
  const visibleTypes = (assistMode ? EASY_ITEM_TYPES : ALL_ITEM_TYPES) as unknown as ItemType[];

  // Keep selected type visible when switching assist mode
  useEffect(() => {
    if (!visibleTypes.includes(game.selectedType)) {
      game.setSelectedType(visibleTypes[0]);
    }
  }, [game.selectedType, game.setSelectedType, visibleTypes]);

  // Contextual hint for the player
  const hint = (() => {
    if (game.phase !== "running") return null;
    const bestCount = game.byType[game.bestType];
    if (game.items.length >= game.dangerTotal * 0.8)
      return { level: "danger", msg: `⚠️ File presque pleine ! Lance CHAIN [X] pour tout compresser d'un coup.` };
    if (game.compressedStock >= 8)
      return { level: "bonus", msg: `🍖 Stock de ${game.compressedStock} snacks ! Lance DEVOUR [D] pour ×3 points.` };
    if (game.combo >= 2)
      return { level: "combo", msg: `🔥 Combo ×${game.combo} ! Continue vite pour déclencher le FRENZY.` };
    if (bestCount >= game.minGroup)
      return { level: "info", msg: `💡 ${game.bestType} a ${bestCount} objets — appuie sur C pour compresser.` };
    return { level: "idle", msg: `Attends que les piles grossissent, puis compresse !` };
  })();

  function flash(id: CommandId) {
    setActiveCommand(id);
    setTimeout(() => setActiveCommand(null), 300);
  }

  function handleCommand(id: CommandId, target?: ItemType) {
    flash(id);
    gameRef.current.executeCommand(id, target);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (e.key === "Enter") { e.preventDefault(); g.start(); return; }
      if (g.phase !== "running") return;
      switch (e.key) {
        case " ": case "c": case "C":
          e.preventDefault(); handleCommand("compress"); return;
        case "x": case "X":
          e.preventDefault(); handleCommand("chain"); return;
        case "d": case "D":
          e.preventDefault(); handleCommand("devour"); return;
        case "b": case "B":
          e.preventDefault(); handleCommand("blast"); return;
        case "w": case "W":
          e.preventDefault(); handleCommand("wait"); return;
      }
      const idx = Number(e.key) - 1;
      if (!Number.isNaN(idx) && idx >= 0 && idx < visibleTypes.length) {
        e.preventDefault();
        g.setSelectedType(visibleTypes[idx]);
        flash("compress");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleTypes]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-fuchsia-500/20 via-orange-500/10 to-emerald-500/20 p-5 shadow-xl backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_45%),radial-gradient(circle_at_80%_60%,rgba(34,211,238,0.12),transparent_40%)]" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐲</span>
            <div>
              <p className="text-xs uppercase tracking-widest text-white/50">Arcade Compression</p>
              <h1 className="text-xl font-black sm:text-2xl">Monster Eater: Chaos Feast</h1>
            </div>
          </div>
          <Controls
            phase={game.phase}
            assistMode={assistMode}
            frenzyActive={frenzyActive}
            onStart={game.start}
            onToggleAssist={() => setAssistMode((v) => !v)}
          />
        </div>
      </div>

      {/* HOW TO PLAY — shown only on idle */}
      {game.phase === "idle" && (
        <HowToPlay
          assistMode={assistMode}
          onStart={game.start}
          onToggleAssist={() => setAssistMode((v) => !v)}
        />
      )}

      {/* RUNNING / LOST layout */}
      {game.phase !== "idle" && (
      <div className="grid gap-6 lg:grid-cols-[1fr_340px_0.7fr]">
        {/* Left: game field */}
        <div className="relative space-y-4 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(56,189,248,0.12),transparent_40%),radial-gradient(circle_at_85%_90%,rgba(244,114,182,0.12),transparent_42%)]" />
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-white/40 font-mono">📦 piles d&apos;objets</p>
            <p className="text-xs text-white/40 font-mono">{game.message}</p>
          </div>
          {/* Score bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {([
              { label: "Score", value: game.score, color: "text-cyan-300" },
              { label: "Combo", value: `×${game.combo}`, color: "text-orange-300" },
              { label: "Meilleur", value: `×${game.bestCombo}`, color: "text-pink-300" },
              { label: "Stock 🍖", value: game.compressedStock, color: "text-emerald-300" },
            ] as const).map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-white/60">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Contextual hint */}
          {hint && (
            <div className={`flex items-start gap-3 rounded-xl border px-4 py-2.5 text-sm ${
              hint.level === "danger" ? "border-red-400/50 bg-red-500/10 text-red-200" :
              hint.level === "bonus"  ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-200" :
              hint.level === "combo"  ? "border-orange-400/50 bg-orange-500/10 text-orange-200" :
              "border-sky-400/30 bg-sky-500/10 text-sky-200"
            }`}>
              <span className="font-medium">{hint.msg}</span>
            </div>
          )}

          {/* Overflow bar */}
          {game.phase === "running" && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/60">
                <span>File d&apos;attente</span>
                <span className={game.items.length >= game.dangerTotal ? "text-red-400 font-bold animate-pulse" : ""}>
                  {game.items.length} / {game.dangerTotal}
                  {game.items.length >= game.dangerTotal && " ⚠️ DÉBORDEMENT !"}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full transition-all duration-300 ${
                    game.items.length >= game.dangerTotal ? "bg-red-400" :
                    game.items.length >= game.dangerTotal * 0.6 ? "bg-amber-400" : "bg-sky-400"
                  }`}
                  style={{ width: `${Math.min(100, (game.items.length / game.dangerTotal) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Selected type indicator */}
          {game.phase === "running" && (
            <div className="flex items-center gap-3 rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2">
              <span className="text-yellow-200 text-sm font-mono">CIBLE SÉLECTIONNÉE :</span>
              <span className="text-3xl">{game.selectedType}</span>
              <span className="text-yellow-300/70 text-xs ml-auto">touches 1–{visibleTypes.length} pour changer</span>
            </div>
          )}

          {/* Pile grid */}
          <Grid
            visibleTypes={visibleTypes}
            byType={game.byType}
            bestType={game.bestType}
            selectedType={game.selectedType}
            minGroup={game.minGroup}
            phase={game.phase}
            onSelect={(type) => game.setSelectedType(type)}
            onCompress={(type, x, y) => { game.setSelectedType(type); handleCommand("compress", type); }}
          />
        </div>

        {/* Centre: command panel */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-cyan-500/10 to-indigo-500/5 p-5 shadow-2xl backdrop-blur-xl lg:sticky lg:top-6 lg:self-start">
          <div className="mb-3 space-y-0.5">
            <p className="text-xs font-mono uppercase tracking-widest text-cyan-400">⌘ tes commandes</p>
            <p className="text-xs text-white/40">Clique ou utilise les raccourcis clavier</p>
          </div>
          <CommandPanel
            cooldowns={game.cooldowns}
            selectedType={game.selectedType}
            commandLog={game.commandLog}
            pauseTicks={game.pauseTicks}
            activeCommand={activeCommand}
            phase={game.phase}
            onExecute={(id) => handleCommand(id)}
          />
        </div>

        {/* Right: monster panel */}
        <div className="relative space-y-4 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-emerald-500/10 to-white/5 p-5 shadow-2xl backdrop-blur-xl">
          <p className="text-xs uppercase tracking-widest text-white/40 font-mono">🐲 ton monstre</p>
          <MonsterView size={game.monsterSize} frenzy={frenzyActive} mood={mood} />

          {/* Frustration bar */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex justify-between text-xs text-white/70">
              <span>Frustration {mood}</span>
              <span>{Math.round(game.frustration)}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full transition-all ${game.frustration > 70 ? "bg-red-400" : "bg-amber-300"}`}
                style={{ width: `${game.frustration}%` }}
              />
            </div>
          </div>

          {/* Snack stock */}
          <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4">
            <p className="text-xs uppercase tracking-widest text-emerald-200/80">Snacks compressés 🍖</p>
            <p className="mt-1 text-3xl font-bold text-emerald-300">{game.compressedStock}</p>
            <p className="mt-1 text-xs text-white/60">Le monstre mange automatiquement.</p>
          </div>

          {/* Frenzy */}
          {frenzyActive && (
            <div className="animate-pulse rounded-2xl border border-orange-300/40 bg-orange-500/20 p-4 text-center font-bold text-orange-100">
              🔥 FRENZY ({((game.frenzyTicks * 400) / 1000).toFixed(1)}s)
            </div>
          )}

          {/* Game over */}
          {game.phase === "lost" && (
            <div className="rounded-2xl border border-red-300/40 bg-red-500/20 p-4 text-center text-red-100">
              💀 Partie terminée
              <br />
              <span className="text-xl font-bold">{game.score} pts</span>
              <br />
              <button
                onClick={game.start}
                className="mt-3 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
              >
                Rejouer (Entrée)
              </button>
            </div>
          )}

          <ExplosionLayer explosions={game.explosions} remove={game.removeExplosion} />
        </div>
      </div>
      )}
    </div>
  );
}
