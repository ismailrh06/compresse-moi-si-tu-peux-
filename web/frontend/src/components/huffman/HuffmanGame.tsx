"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import StatsPanel from "./StatsPanel";
import NodeCard from "./NodeCard";
import HuffmanTree from "./HuffmanTree";
import DifficultySelector from "./DifficultySelector";

export type Difficulty = "easy" | "medium" | "hard";

export type HuffmanNode = {
  id: string;
  label: string;
  value: number;
  left?: HuffmanNode;
  right?: HuffmanNode;
  isLeaf?: boolean;
  symbols?: string[];
};

type MergeRecord = {
  left: number;
  right: number;
  total: number;
};

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  {
    label: string;
    nodeCount: number;
    description: string;
    minBase: number;
    maxBase: number;
    minIncrement: number;
    maxIncrement: number;
    tieProbability: number;
    scoreBase: number;
    timePenalty: number;
    errorPenalty: number;
  }
> = {
  easy: {
    label: "Facile",
    nodeCount: 5,
    description: "Peu de symboles et des écarts de fréquence très visibles.",
    minBase: 4,
    maxBase: 9,
    minIncrement: 4,
    maxIncrement: 9,
    tieProbability: 0,
    scoreBase: 900,
    timePenalty: 2,
    errorPenalty: 45,
  },
  medium: {
    label: "Moyen",
    nodeCount: 7,
    description: "Plus de symboles, fréquences proches et premières ambiguïtés.",
    minBase: 3,
    maxBase: 8,
    minIncrement: 2,
    maxIncrement: 5,
    tieProbability: 0.18,
    scoreBase: 1150,
    timePenalty: 3,
    errorPenalty: 60,
  },
  hard: {
    label: "Difficile",
    nodeCount: 9,
    description: "Davantage de cartes, fréquences serrées et égalités possibles.",
    minBase: 2,
    maxBase: 6,
    minIncrement: 1,
    maxIncrement: 3,
    tieProbability: 0.38,
    scoreBase: 1400,
    timePenalty: 4,
    errorPenalty: 80,
  },
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

function buildNodeLabel(symbols: string[]) {
  if (symbols.length === 1) return symbols[0];

  const compact = symbols.join("");
  return compact.length <= 6 ? `{${compact}}` : `{${compact.slice(0, 6)}…}`;
}

function sortPair(a: HuffmanNode, b: HuffmanNode) {
  return [a, b].sort((left, right) => {
    if (left.value !== right.value) return left.value - right.value;
    return left.label.localeCompare(right.label);
  });
}

function expectedValues(nodes: HuffmanNode[]) {
  return [...nodes]
    .sort((a, b) => (a.value !== b.value ? a.value - b.value : a.label.localeCompare(b.label)))
    .slice(0, 2)
    .map((node) => node.value)
    .sort((a, b) => a - b);
}

function generateInitialNodes(difficulty: Difficulty): HuffmanNode[] {
  const config = DIFFICULTY_CONFIG[difficulty];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const values: number[] = [randomInt(config.minBase, config.maxBase)];

  for (let index = 1; index < config.nodeCount; index += 1) {
    const useTie = Math.random() < config.tieProbability;
    const increment = useTie ? 0 : randomInt(config.minIncrement, config.maxIncrement);
    values.push(values[index - 1] + increment);
  }

  const nodes = values.map((value, index) => {
    const symbol = alphabet[index];
    return {
      id: `${symbol}-${value}-${index}`,
      label: symbol,
      value,
      isLeaf: true,
      symbols: [symbol],
    } satisfies HuffmanNode;
  });

  return shuffle(nodes);
}

function readCookieValue(name: string) {
  if (typeof document === "undefined") return "";

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : "";
}

export default function HuffmanGame() {
  const [nodes, setNodes] = useState<HuffmanNode[]>([]);
  const [root, setRoot] = useState<HuffmanNode | null>(null);
  const [steps, setSteps] = useState(0);
  const [errors, setErrors] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [mergeQueueIds, setMergeQueueIds] = useState<string[]>([]);
  const [history, setHistory] = useState<MergeRecord[]>([]);
  const [message, setMessage] = useState("Clique sur Commencer pour jouer.");
  const [leaderboardMessage, setLeaderboardMessage] = useState("");
  const mergeZoneRef = useRef<HTMLDivElement | null>(null);
  const scoreSubmittedRef = useRef(false);

  const config = DIFFICULTY_CONFIG[difficulty];

  // Timer
  useEffect(() => {
    if (!started || finished) return;
    const interval = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started, finished]);

  const mergeQueueNodes = useMemo(
    () => mergeQueueIds.map((id) => nodes.find((node) => node.id === id)).filter(Boolean) as HuffmanNode[],
    [mergeQueueIds, nodes]
  );

  function startGame() {
    setNodes(generateInitialNodes(difficulty));
    setRoot(null);
    setSteps(0);
    setErrors(0);
    setElapsed(0);
    setMergeQueueIds([]);
    setHistory([]);
    setStarted(true);
    setFinished(false);
    setLeaderboardMessage("");
    scoreSubmittedRef.current = false;
    setMessage("Place deux cartes dans la zone de fusion. Les cartes sont volontairement mélangées.");
  }

  function combine(a: HuffmanNode, b: HuffmanNode) {
    if (finished) return;

    const validPair = expectedValues(nodes);
    const selectedPair = [a.value, b.value].sort((left, right) => left - right);
    const valid =
      selectedPair[0] === validPair[0] &&
      selectedPair[1] === validPair[1];

    if (!valid) {
      const expectedText = `${validPair[0]} et ${validPair[1]}`;
      setErrors((e) => e + 1);
      setMergeQueueIds([]);
      setMessage(`❌ Fusion non optimale : à ce stade, il faut combiner ${expectedText}.`);
      return;
    }

    const [left, right] = sortPair(a, b);
    const mergedSymbols = [...(left.symbols ?? [left.label]), ...(right.symbols ?? [right.label])].sort();

    const newNode: HuffmanNode = {
      id: `${left.id}-${right.id}-${steps + 1}`,
      label: buildNodeLabel(mergedSymbols),
      value: left.value + right.value,
      left,
      right,
      symbols: mergedSymbols,
    };

    const updated = shuffle(
      nodes
        .filter((n) => n.id !== a.id && n.id !== b.id)
        .concat(newNode)
    );

    setNodes(updated);
    setRoot(newNode);
    setMergeQueueIds([]);
    setHistory((current) => [...current, { left: left.value, right: right.value, total: newNode.value }]);
    setSteps((s) => s + 1);
    setMessage("✔ Fusion optimale. Continue jusqu’à obtenir une seule racine.");

    if (updated.length === 1) {
      setFinished(true);
      setMessage("🎉 Arbre de Huffman complété avec une suite de fusions optimales.");
    }
  }

  function addNodeToMergeQueue(node: HuffmanNode) {
    if (!started || finished) return;

    setMergeQueueIds((current) => {
      if (current.includes(node.id)) {
        return current.filter((id) => id !== node.id);
      }

      if (current.length === 0) {
        setMessage(`Premier nœud choisi : ${node.label} (${node.value}). Sélectionne le second.`);
        return [node.id];
      }

      if (current.length === 1) {
        const first = nodes.find((entry) => entry.id === current[0]);
        setMessage(`Deuxième nœud choisi : ${node.label} (${node.value}). Fusion en cours…`);

        if (first) {
          setTimeout(() => combine(first, node), 120);
        }

        return [...current, node.id];
      }

      setMessage(`Nouvelle sélection : ${node.label} (${node.value}). Choisis encore un nœud.`);
      return [current[1], node.id];
    });
  }

  function handleDropToMergeZone(point: { x: number; y: number }, source: HuffmanNode) {
    if (!started || finished) return;

    const zone = mergeZoneRef.current;
    if (!zone) return;

    const bounds = zone.getBoundingClientRect();
    const insideZone =
      point.x >= bounds.left &&
      point.x <= bounds.right &&
      point.y >= bounds.top &&
      point.y <= bounds.bottom;

    if (insideZone) {
      addNodeToMergeQueue(source);
    }
  }

  const totalAttempts = steps + errors;
  const accuracy = totalAttempts === 0 ? 100 : Math.round((steps / totalAttempts) * 100);
  const score = Math.max(
    0,
    config.scoreBase - steps * 20 - errors * config.errorPenalty - elapsed * config.timePenalty
  );
  const timeFormatted = `${Math.floor(elapsed / 60)}:${String(
    elapsed % 60
  ).padStart(2, "0")}`;

  useEffect(() => {
    if (!started || !finished || scoreSubmittedRef.current) return;

    scoreSubmittedRef.current = true;
    const playerName = readCookieValue("full_name") || readCookieValue("auth_token");

    if (!playerName) {
      setLeaderboardMessage("Connecte-toi pour apparaître dans le classement global.");
      return;
    }

    setLeaderboardMessage("Enregistrement du score dans le classement…");

    void api
      .submitLeaderboard({
        player_name: playerName,
        score,
        steps,
        errors,
        elapsed_seconds: elapsed,
        difficulty,
        accuracy,
      })
      .then(() => {
        setLeaderboardMessage("Score enregistré dans le classement global.");
      })
      .catch((error) => {
        setLeaderboardMessage(
          error instanceof Error
            ? `Classement indisponible : ${error.message}`
            : "Impossible d'enregistrer le score."
        );
      });
  }, [accuracy, difficulty, elapsed, errors, finished, score, started, steps]);

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
            <p className="text-xs text-white/55 max-w-xl">
              Niveau {config.label} : {config.description}
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
          difficulty={config.label}
          accuracy={accuracy}
        />
      )}

      {/* Panneaux jeu + arbre */}
      <div className="space-y-7">
        {/* Nœuds */}
        <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.15),transparent_55%),_rgba(15,23,42,0.95)] p-6 md:p-7 shadow-xl shadow-black/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Nœuds à fusionner</h2>
            <span className="text-xs text-white/55">
              Clique les cartes ou glisse-les dans la zone de fusion.
            </span>
          </div>

          {nodes.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-white/50 text-sm">
              Clique sur <span className="font-semibold ml-1">Commencer</span> pour générer un jeu de symboles.
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/65">
                Règle académique : à chaque étape, l’algorithme de Huffman fusionne les deux poids minimaux,
                même si les cartes sont affichées dans un ordre aléatoire.
              </div>

              <div
                ref={mergeZoneRef}
                className="mt-4 rounded-3xl border border-dashed border-emerald-300/35 bg-gradient-to-br from-emerald-500/12 via-emerald-500/8 to-cyan-500/10 p-5 shadow-inner shadow-emerald-900/20"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-emerald-200">Zone de fusion</div>
                    <div className="mt-1 text-xs text-white/60">
                      Dépose ici deux nœuds, ou clique sur deux cartes pour lancer une fusion fluide.
                    </div>
                  </div>

                  <button
                    onClick={() => setMergeQueueIds([])}
                    disabled={mergeQueueIds.length === 0}
                    className="rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-xs text-white/75 transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Vider
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[0, 1].map((slotIndex) => {
                    const queuedNode = mergeQueueNodes[slotIndex];

                    return (
                      <div
                        key={slotIndex}
                        className="flex min-h-[132px] items-center rounded-[24px] border border-white/10 bg-slate-950/55 px-5 py-5 shadow-lg shadow-black/20"
                      >
                        {queuedNode ? (
                          <div className="w-full">
                            <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-200/70">
                              Slot {slotIndex + 1}
                            </div>
                            <div className="mt-2 text-2xl font-bold">{queuedNode.label}</div>
                            <div className="mt-1 text-sm text-white/70">Fréquence : {queuedNode.value}</div>
                          </div>
                        ) : (
                          <div className="text-sm text-white/40">
                            {slotIndex === 0 ? "Choisis le premier nœud" : "Choisis le second nœud"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {nodes.map((node) => (
                  <NodeCard
                    key={node.id}
                    node={node}
                    onDrop={handleDropToMergeZone}
                    onSelect={addNodeToMergeQueue}
                    selected={mergeQueueIds.includes(node.id)}
                    disabled={finished}
                  />
                ))}
              </div>

              {history.length > 0 && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4">
                  <div className="mb-3 text-sm font-semibold">Historique des fusions</div>
                  <div className="flex flex-wrap gap-2 text-xs text-white/70">
                    {history.map((item, index) => (
                      <span
                        key={`${item.left}-${item.right}-${index}`}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                      >
                        {item.left} + {item.right} = {item.total}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Arbre de Huffman */}
        <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_55%),_rgba(15,23,42,0.96)] p-6 md:p-7 shadow-xl shadow-black/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Arbre de Huffman</h2>
            <span className="text-xs text-white/55">
              {root
                ? finished
                  ? "Arbre final complet."
                  : "Construction progressive après chaque fusion."
                : "Le nœud racine apparaîtra après la première fusion."}
            </span>
          </div>

          <HuffmanTree root={root} />
        </div>
      </div>

      {finished && (
        <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-600/30 via-emerald-500/25 to-emerald-400/30 px-5 py-3 text-sm shadow-lg shadow-emerald-500/40">
          <span className="mr-2">🎉</span>
          Bravo ! Arbre terminé — <span className="font-semibold">score final {score}</span>.
          {leaderboardMessage && (
            <div className="mt-2 text-xs text-emerald-50/90">{leaderboardMessage}</div>
          )}
        </div>
      )}
    </div>
  );
}
