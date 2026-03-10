"use client";

import { useState, useEffect } from "react";
import StatsPanel from "./StatsPanel";
import NodeCard from "./NodeCard";
import HuffmanTree from "./HuffmanTree";
import DifficultySelector from "./DifficultySelector";

export type HuffmanNode = {
  id: string;
  label: string;
  value: number;
  left?: HuffmanNode;
  right?: HuffmanNode;
  isLeaf?: boolean;
};

export default function HuffmanGame() {
  const [nodes, setNodes] = useState<HuffmanNode[]>([]);
  const [root, setRoot] = useState<HuffmanNode | null>(null);
  const [steps, setSteps] = useState(0);
  const [errors, setErrors] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [message, setMessage] = useState("Clique sur Commencer pour jouer.");

  // Timer
  useEffect(() => {
    if (!started || finished) return;
    const interval = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started, finished]);

  function startGame() {
    const count = difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 8;
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const list: HuffmanNode[] = [];

    for (let i = 0; i < count; i++) {
      const freq = Math.floor(Math.random() * 40) + 5;
      list.push({
        id: alphabet[i],
        label: alphabet[i],
        value: freq,
        isLeaf: true,
      });
    }

    setNodes(list.sort((a, b) => a.value - b.value));
    setRoot(null);
    setSteps(0);
    setErrors(0);
    setElapsed(0);
    setStarted(true);
    setFinished(false);
    setMessage("Fusionne les deux plus petites valeurs en glissant les nœuds.");
  }

  function combine(a: HuffmanNode, b: HuffmanNode) {
    const sorted = [...nodes].sort((x, y) => x.value - y.value);
    const s1 = sorted[0];
    const s2 = sorted[1];

    const valid =
      (a.value === s1.value && b.value === s2.value) ||
      (b.value === s1.value && a.value === s2.value);

    if (!valid) {
      setErrors((e) => e + 1);
      setMessage("❌ Mauvaise fusion : choisis les deux plus petites fréquences.");
      return;
    }

    const newNode: HuffmanNode = {
      id: a.id + b.id,
      label: `${a.label}+${b.label}`,
      value: a.value + b.value,
      left: a,
      right: b,
    };

    const updated = nodes
      .filter((n) => n.id !== a.id && n.id !== b.id)
      .concat(newNode)
      .sort((x, y) => x.value - y.value);

    setNodes(updated);
    setSteps((s) => s + 1);
    setMessage("✔ Bonne fusion ! Continue.");

    if (updated.length === 1) {
      setFinished(true);
      setRoot(newNode);
      setMessage("🎉 Arbre de Huffman complété !");
    }
  }

  function handleDrop(e: any, source: HuffmanNode) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;

    const targetEl = el.closest("[data-node-id]") as HTMLElement | null;
    const targetId = targetEl?.dataset.nodeId;
    if (!targetId || targetId === source.id) return;

    const target = nodes.find((n) => n.id === targetId);
    if (target) combine(source, target);
  }

  const score = Math.max(0, 1000 - steps * 25 - errors * 50 - elapsed * 2);
  const timeFormatted = `${Math.floor(elapsed / 60)}:${String(
    elapsed % 60
  ).padStart(2, "0")}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header “hero” */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-sky-500/20 via-emerald-500/10 to-fuchsia-500/20 px-6 py-5 md:px-8 md:py-6 shadow-[0_0_45px_rgba(15,23,42,0.9)] backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">
              Atelier interactif
            </p>
            <h1 className="text-3xl md:text-4xl font-bold">
              Arbre de Huffman — <span className="text-emerald-300">jeu pédagogique</span>
            </h1>
            <p className="text-sm md:text-base text-white/70 max-w-xl">
              Glisse-dépose les nœuds pour fusionner les symboles les moins fréquents
              et reconstruire l’arbre de Huffman étape par étape.
            </p>
            <p className="text-xs text-emerald-200/90 mt-1">{message}</p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <DifficultySelector
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              disabled={started && !finished}
            />
            <button
              onClick={startGame}
              className="px-5 py-2.5 rounded-2xl bg-white text-black font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/50 transition"
            >
              {started ? "Recommencer" : "Commencer"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {started && (
        <StatsPanel
          time={timeFormatted}
          score={score}
          steps={steps}
          errors={errors}
        />
      )}

      {/* Panneaux jeu + arbre */}
      <div className="grid lg:grid-cols-2 gap-7">
        {/* Nœuds */}
        <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.15),transparent_55%),_rgba(15,23,42,0.95)] p-6 md:p-7 shadow-xl shadow-black/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Nœuds à fusionner</h2>
            <span className="text-xs text-white/55">
              Glisse un nœud sur un autre pour les combiner.
            </span>
          </div>

          {nodes.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-white/50 text-sm">
              Clique sur <span className="font-semibold ml-1">Commencer</span> pour générer un jeu de symboles.
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
              {nodes.map((node) => (
                <NodeCard key={node.id} node={node} onDrop={handleDrop} />
              ))}
            </div>
          )}
        </div>

        {/* Arbre de Huffman */}
        <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_55%),_rgba(15,23,42,0.96)] p-6 md:p-7 shadow-xl shadow-black/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Arbre de Huffman</h2>
            <span className="text-xs text-white/55">
              Le nœud racine représente l’agrégation finale.
            </span>
          </div>

          <HuffmanTree root={root} />
        </div>
      </div>

      {finished && (
        <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-600/30 via-emerald-500/25 to-emerald-400/30 px-5 py-3 text-sm shadow-lg shadow-emerald-500/40">
          <span className="mr-2">🎉</span>
          Bravo ! Arbre terminé — <span className="font-semibold">score final {score}</span>.
        </div>
      )}
    </div>
  );
}
