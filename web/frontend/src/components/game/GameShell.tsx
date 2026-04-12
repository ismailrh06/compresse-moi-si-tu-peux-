"use client";

import Maze, { MAZE_TILE_SIZE } from "@/components/maze/Maze";
import HUD from "@/components/game/HUD";
import ExplosionLayer from "@/components/effects/ExplosionLayer";
import { useGameState } from "@/hooks/useGameState";

export default function GameShell() {
  const { maze, state, slotsUsed, totalItems, efficiency, playerScale, memoryLimit, startGame } = useGameState();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[1700px] flex-col items-center space-y-5 px-4 py-5 text-white sm:px-6">
      <div className="w-full max-w-6xl rounded-2xl border border-cyan-300/20 bg-gradient-to-r from-cyan-500/10 via-fuchsia-500/10 to-emerald-500/10 p-3 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-cyan-100">Arcade maze run with real-time sequence compression.</p>
          <button
            onClick={startGame}
            className="rounded-lg border border-cyan-200/40 bg-cyan-500/25 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:scale-[1.02] hover:bg-cyan-500/40"
          >
            {state.phase === "running" ? "Restart Run" : "Start Run"}
          </button>
        </div>
      </div>

      <div className="relative mx-auto w-fit rounded-2xl border border-white/10 bg-black/20 p-2 shadow-[0_0_35px_rgba(56,189,248,0.18)]">
        <Maze
          maze={maze}
          items={state.items}
          player={{ x: state.player.x, y: state.player.y }}
          playerScale={playerScale}
          shakeIntensity={state.screenShake}
        />
        <ExplosionLayer particles={state.particles} tileSize={MAZE_TILE_SIZE} />
      </div>

      <div className="grid w-full max-w-6xl gap-5 xl:grid-cols-[380px_1fr]">
        <HUD
          score={state.score}
          elapsed={state.elapsed}
          slotsUsed={slotsUsed}
          memoryLimit={memoryLimit}
          efficiency={efficiency}
          combo={state.inventory.comboStreak}
          comboBest={state.comboBest}
          multiplier={state.multiplier}
          phase={state.phase}
          message={state.message}
          overflowTimer={state.overflowTimer}
          inventory={state.inventory.stacks}
          totalItems={totalItems}
        />

        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Comment le jeu fonctionne</p>
          <h3 className="text-lg font-black text-white">Lien entre labyrinthe et compression</h3>
          <ol className="space-y-2 text-sm text-white/80">
            <li><span className="font-semibold text-cyan-200">1.</span> Tu te déplaces dans le labyrinthe pour ramasser des symboles (🍕, 🍔, 🍟…).</li>
            <li><span className="font-semibold text-cyan-200">2.</span> Si tu prends plusieurs fois le même symbole à la suite, ils se regroupent en une pile (compression en séquence).</li>
            <li><span className="font-semibold text-cyan-200">3.</span> Plus il y a de regroupement, moins tu utilises de slots mémoire, et ton efficacité monte.</li>
            <li><span className="font-semibold text-cyan-200">4.</span> Les cases pièges (spike / virus / decompress) cassent ou mélangent les piles pour simuler une décompression/corruption.</li>
          </ol>

          <div className="grid gap-2 rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
            <p className="text-xs uppercase tracking-wider text-white/60">Légende des symboles</p>
            <p className="text-white/85">
              <span className="mr-2 inline-flex items-center gap-1 rounded-md border border-violet-300/40 bg-violet-500/20 px-2 py-0.5 font-semibold text-violet-200">Violet ▥</span>
              Couloir étroit: passage plus serré, il faut mieux contrôler les virages.
            </p>
            <p className="text-white/85">
              <span className="mr-2 inline-flex items-center gap-1 rounded-md border border-rose-300/40 bg-rose-500/20 px-2 py-0.5 font-semibold text-rose-200">Rouge ✶</span>
              Spike: te pénalise en score quand tu marches dessus.
            </p>
            <p className="text-white/85">
              <span className="mr-2 inline-flex items-center gap-1 rounded-md border border-emerald-300/40 bg-emerald-500/20 px-2 py-0.5 font-semibold text-emerald-200">Vert ☣</span>
              Virus: mélange les types de ton inventaire et casse ta logique de compression.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
            Objectif: garder la mémoire compacte, maintenir le combo, et éviter l&apos;overflow.
          </div>
        </section>
      </div>
    </div>
  );
}
