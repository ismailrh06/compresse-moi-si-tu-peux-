"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import StatsPanel from "./StatsPanel";
import NodeCard from "./NodeCard";
import HuffmanTree from "./HuffmanTree";
import DifficultySelector from "./DifficultySelector";

/* ═══════════════════════════════ TYPES ══════════════════════════════ */

export type Difficulty = "easy" | "medium" | "hard";
export type GameMode = "classic" | "survival" | "memory";

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

/* ═══════════════════════════════ CONSTANTS ══════════════════════════ */

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

const SURVIVAL_START: Record<Difficulty, number> = { easy: 90, medium: 65, hard: 45 };
const SURVIVAL_BONUS = 12;
const SURVIVAL_PENALTY = 8;

const MODE_INFO: Record<GameMode, { label: string; icon: string; desc: string; color: string }> = {
  classic: {
    label: "Classique",
    icon: "🎯",
    desc: "Construis l'\u0061rbre et enchaîne les bonnes fusions pour déclencher des combos !",
    color: "from-sky-500/25 via-emerald-500/10 to-fuchsia-500/20",
  },
  survival: {
    label: "Survie",
    icon: "⏱️",
    desc: `La montre tourne ! Bonne fusion = +${SURVIVAL_BONUS}s, erreur = −${SURVIVAL_PENALTY}s.`,
    color: "from-orange-500/25 via-red-500/10 to-yellow-500/20",
  },
  memory: {
    label: "Mémoire",
    icon: "🧠",
    desc: "Valeurs cachées ! Survole une carte pour la révéler, puis fusionne les deux plus petites.",
    color: "from-violet-500/25 via-purple-500/10 to-pink-500/20",
  },
};

/* ═══════════════════════════════ HELPERS ════════════════════════════ */

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildNodeLabel(symbols: string[]) {
  if (symbols.length === 1) return symbols[0];
  const compact = symbols.join("");
  return compact.length <= 6 ? `{${compact}}` : `{${compact.slice(0, 6)}…}`;
}

function sortPair(a: HuffmanNode, b: HuffmanNode) {
  return [a, b].sort((l, r) => {
    if (l.value !== r.value) return l.value - r.value;
    return l.label.localeCompare(r.label);
  });
}

function expectedValues(nodes: HuffmanNode[]) {
  return [...nodes]
    .sort((a, b) => (a.value !== b.value ? a.value - b.value : a.label.localeCompare(b.label)))
    .slice(0, 2)
    .map((n) => n.value)
    .sort((a, b) => a - b);
}

function generateInitialNodes(difficulty: Difficulty): HuffmanNode[] {
  const config = DIFFICULTY_CONFIG[difficulty];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const values: number[] = [randomInt(config.minBase, config.maxBase)];
  for (let i = 1; i < config.nodeCount; i++) {
    const useTie = Math.random() < config.tieProbability;
    const increment = useTie ? 0 : randomInt(config.minIncrement, config.maxIncrement);
    values.push(values[i - 1] + increment);
  }
  return shuffle(
    values.map((value, i) => ({
      id: `${alphabet[i]}-${value}-${i}`,
      label: alphabet[i],
      value,
      isLeaf: true,
      symbols: [alphabet[i]],
    } satisfies HuffmanNode))
  );
}

function readCookieValue(name: string) {
  if (typeof document === "undefined") return "";
  const cookie = document.cookie.split("; ").find((r) => r.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : "";
}

function getStreakInfo(streak: number) {
  if (streak >= 5)
    return { label: "⚡ COMBO ×2", multiplier: 2, color: "text-yellow-300", bg: "border-yellow-400/50 bg-yellow-500/15", pulse: true };
  if (streak >= 3)
    return { label: "🔥 En feu ×1.5", multiplier: 1.5, color: "text-orange-300", bg: "border-orange-400/50 bg-orange-500/15", pulse: true };
  if (streak >= 1)
    return { label: `✓ Série ×${streak}`, multiplier: 1, color: "text-emerald-300", bg: "border-emerald-400/30 bg-emerald-500/10", pulse: false };
  return { label: "", multiplier: 1, color: "", bg: "", pulse: false };
}

/* ═══════════════════════════════ COMPONENT ══════════════════════════ */

export default function HuffmanGame() {
  const [nodes, setNodes] = useState<HuffmanNode[]>([]);
  const [root, setRoot] = useState<HuffmanNode | null>(null);
  const [steps, setSteps] = useState(0);
  const [errors, setErrors] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [gameMode, setGameMode] = useState<GameMode>("classic");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [mergeQueueIds, setMergeQueueIds] = useState<string[]>([]);
  const [history, setHistory] = useState<MergeRecord[]>([]);
  const [message, setMessage] = useState("Choisis un mode, puis clique sur Commencer.");
  const [leaderboardMessage, setLeaderboardMessage] = useState("");
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [comboAnim, setComboAnim] = useState<string | null>(null);
  const mergeZoneRef = useRef<HTMLDivElement | null>(null);
  const scoreSubmittedRef = useRef(false);

  const config = DIFFICULTY_CONFIG[difficulty];
  const streakInfo = getStreakInfo(streak);
  const modeInfo = MODE_INFO[gameMode];

  /* Classic / Memory timer */
  useEffect(() => {
    if (!started || finished || gameOver || gameMode === "survival") return;
    const id = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [started, finished, gameOver, gameMode]);

  /* Survival countdown */
  useEffect(() => {
    if (!started || finished || gameOver || gameMode !== "survival") return;
    if (countdown <= 0) {
      setGameOver(true);
      setFinished(true);
      setMessage("⏰ Temps écoulé ! Tu n'as pas eu le temps de finir l'arbre.");
      return;
    }
    const id = setInterval(() => setCountdown((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [started, finished, gameOver, gameMode, countdown]);

  const mergeQueueNodes = useMemo(
    () => mergeQueueIds.map((id) => nodes.find((n) => n.id === id)).filter(Boolean) as HuffmanNode[],
    [mergeQueueIds, nodes]
  );

  function startGame() {
    setNodes(generateInitialNodes(difficulty));
    setRoot(null);
    setSteps(0);
    setErrors(0);
    setElapsed(0);
    setCountdown(SURVIVAL_START[difficulty]);
    setMergeQueueIds([]);
    setHistory([]);
    setStarted(true);
    setFinished(false);
    setGameOver(false);
    setLeaderboardMessage("");
    setStreak(0);
    setBestStreak(0);
    setComboAnim(null);
    scoreSubmittedRef.current = false;
    const hints: Record<GameMode, string> = {
      classic: "Fusionne les deux nœuds les plus légers. Enchaîne pour déclencher des combos !",
      survival: `${SURVIVAL_START[difficulty]}s au compteur. Vite ! Chaque bonne fusion = +${SURVIVAL_BONUS}s.`,
      memory: "Les valeurs sont masquées. Survole une carte pour la révéler, puis fusionne !",
    };
    setMessage(hints[gameMode]);
  }

  function triggerComboAnim(label: string) {
    setComboAnim(label);
    setTimeout(() => setComboAnim(null), 1400);
  }

  function combine(a: HuffmanNode, b: HuffmanNode) {
    if (finished) return;
    const validPair = expectedValues(nodes);
    const selectedPair = [a.value, b.value].sort((l, r) => l - r);
    const valid = selectedPair[0] === validPair[0] && selectedPair[1] === validPair[1];

    if (!valid) {
      setErrors((e) => e + 1);
      setMergeQueueIds([]);
      setStreak(0);
      if (gameMode === "survival") {
        setCountdown((c) => Math.max(0, c - SURVIVAL_PENALTY));
        setMessage(`❌ Faux ! −${SURVIVAL_PENALTY}s. Il fallait combiner ${validPair[0]} et ${validPair[1]}.`);
      } else {
        setMessage(`❌ Fusion non optimale : il faut combiner ${validPair[0]} et ${validPair[1]}.`);
      }
      return;
    }

    const [left, right] = sortPair(a, b);
    const mergedSymbols = [
      ...(left.symbols ?? [left.label]),
      ...(right.symbols ?? [right.label]),
    ].sort();

    const newNode: HuffmanNode = {
      id: `${left.id}-${right.id}-${steps + 1}`,
      label: buildNodeLabel(mergedSymbols),
      value: left.value + right.value,
      left,
      right,
      symbols: mergedSymbols,
    };

    const updated = shuffle(nodes.filter((n) => n.id !== a.id && n.id !== b.id).concat(newNode));

    const newStreak = streak + 1;
    setStreak(newStreak);
    setBestStreak((b) => Math.max(b, newStreak));
    if (newStreak === 3 || newStreak === 5 || newStreak === 7) {
      triggerComboAnim(getStreakInfo(newStreak).label);
    }

    if (gameMode === "survival") {
      setCountdown((c) => c + SURVIVAL_BONUS);
      setMessage(`✔ +${SURVIVAL_BONUS}s ! Continue — enchaîne les combos.`);
    } else {
      setMessage("✔ Fusion optimale. Continue jusqu'à obtenir une seule racine.");
    }

    setNodes(updated);
    setRoot(newNode);
    setMergeQueueIds([]);
    setHistory((h) => [...h, { left: left.value, right: right.value, total: newNode.value }]);
    setSteps((s) => s + 1);

    if (updated.length === 1) {
      setFinished(true);
      setMessage("🎉 Arbre de Huffman complété !");
    }
  }

  function addNodeToMergeQueue(node: HuffmanNode) {
    if (!started || finished) return;
    setMergeQueueIds((current) => {
      if (current.includes(node.id)) return current.filter((id) => id !== node.id);
      if (current.length === 0) {
        setMessage(`1er nœud : ${node.label} (${node.value}). Sélectionne le second.`);
        return [node.id];
      }
      if (current.length === 1) {
        const first = nodes.find((n) => n.id === current[0]);
        setMessage(`2e nœud : ${node.label} (${node.value}). Fusion en cours…`);
        if (first) setTimeout(() => combine(first, node), 120);
        return [...current, node.id];
      }
      setMessage(`Nouvelle sélection : ${node.label} (${node.value}).`);
      return [current[1], node.id];
    });
  }

  function handleDropToMergeZone(point: { x: number; y: number }, source: HuffmanNode) {
    if (!started || finished) return;
    const zone = mergeZoneRef.current;
    if (!zone) return;
    const bounds = zone.getBoundingClientRect();
    const inside =
      point.x >= bounds.left && point.x <= bounds.right &&
      point.y >= bounds.top && point.y <= bounds.bottom;
    if (inside) addNodeToMergeQueue(source);
  }

  /* Score */
  const totalAttempts = steps + errors;
  const accuracy = totalAttempts === 0 ? 100 : Math.round((steps / totalAttempts) * 100);
  const rawScore = Math.max(
    0,
    config.scoreBase - steps * 20 - errors * config.errorPenalty - elapsed * config.timePenalty
  );
  const score = Math.round(rawScore * streakInfo.multiplier);
  const timeFormatted = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;
  const countdownFormatted = `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`;
  const countdownUrgent = countdown <= 15;
  const countdownDanger = countdown <= 8;

  /* Score submission */
  useEffect(() => {
    if (!started || !finished || gameOver || scoreSubmittedRef.current) return;
    scoreSubmittedRef.current = true;
    const playerName = readCookieValue("full_name") || readCookieValue("auth_token");
    if (!playerName) {
      setLeaderboardMessage("Connecte-toi pour apparaître dans le classement global.");
      return;
    }
    setLeaderboardMessage("Enregistrement du score…");
    void api
      .submitLeaderboard({ player_name: playerName, score, steps, errors, elapsed_seconds: elapsed, difficulty, accuracy })
      .then(() => setLeaderboardMessage("Score enregistré dans le classement global."))
      .catch((err: unknown) =>
        setLeaderboardMessage(err instanceof Error ? `Classement indisponible : ${err.message}` : "Score non enregistré.")
      );
  }, [accuracy, difficulty, elapsed, errors, finished, gameOver, score, started, steps]);

  /* ══════════════════════════ RENDER ═══════════════════════════ */
  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Combo floating overlay */}
      <AnimatePresence>
        {comboAnim && (
          <motion.div
            key={comboAnim}
            initial={{ opacity: 0, scale: 0.4, y: 40 }}
            animate={{ opacity: 1, scale: 1.1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, y: -60, transition: { duration: 0.6 } }}
            transition={{ duration: 0.35 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          >
            <span className="rounded-3xl border border-yellow-300/60 bg-yellow-500/20 px-10 py-5 text-4xl font-black text-yellow-200 shadow-2xl shadow-yellow-500/40 backdrop-blur-xl">
              {comboAnim}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className={`rounded-3xl border border-white/10 bg-gradient-to-r ${modeInfo.color} px-6 py-5 md:px-8 md:py-6 shadow-[0_0_45px_rgba(15,23,42,0.9)] backdrop-blur-2xl`}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Atelier interactif</p>
            <h1 className="text-3xl md:text-4xl font-bold">
              Arbre de Huffman — <span className="text-emerald-300">jeu pédagogique</span>
            </h1>
            <p className="text-sm text-white/70 max-w-xl">{modeInfo.icon} {modeInfo.desc}</p>
            <p className="text-xs text-white/55 max-w-xl">Niveau {config.label} : {config.description}</p>
            <p className="text-xs text-emerald-200/90 mt-1">{message}</p>
          </div>

          <div className="flex w-full flex-col items-stretch gap-3 md:w-auto md:items-end">
            {/* Mode selector */}
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(MODE_INFO) as GameMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setGameMode(m)}
                  disabled={started && !finished}
                  className={`rounded-xl border px-3 py-2 text-center text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    m === gameMode
                      ? "border-white bg-white text-black shadow-md"
                      : "border-white/20 bg-white/5 text-white/70 hover:border-white/50"
                  }`}
                >
                  <div className="text-base">{MODE_INFO[m].icon}</div>
                  <div className="mt-0.5">{MODE_INFO[m].label}</div>
                </button>
              ))}
            </div>

            <DifficultySelector difficulty={difficulty} setDifficulty={setDifficulty} disabled={started && !finished} />

            <button
              onClick={startGame}
              className="w-full rounded-2xl bg-white px-5 py-2.5 font-semibold text-black shadow-lg transition hover:shadow-xl md:w-auto"
            >
              {started ? "Recommencer" : "Commencer"}
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      {started && (
        <div className="space-y-2">
          <StatsPanel
            time={gameMode === "survival" ? countdownFormatted : timeFormatted}
            score={score}
            steps={steps}
            errors={errors}
            difficulty={config.label}
            accuracy={accuracy}
            streak={bestStreak}
            mode={`${modeInfo.icon} ${modeInfo.label}`}
            isCountdown={gameMode === "survival"}
            countdownUrgent={countdownUrgent}
            countdownDanger={countdownDanger}
          />
          <AnimatePresence>
            {streak >= 1 && (
              <motion.div
                key={streak}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-1.5 text-sm font-semibold ${streakInfo.bg} ${streakInfo.color} ${streakInfo.pulse ? "animate-pulse" : ""}`}
              >
                {streakInfo.label}
                {streakInfo.multiplier > 1 && (
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">×{streakInfo.multiplier} sur le score</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* GAME AREA */}
      <div className="space-y-7">
        <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.15),transparent_55%),_rgba(15,23,42,0.95)] p-6 md:p-7 shadow-xl shadow-black/60">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold">Nœuds à fusionner</h2>
            <span className="text-xs text-white/55">
              {gameMode === "memory" ? "🧠 Survole une carte pour révéler sa valeur" : "Clique les cartes ou glisse-les dans la zone de fusion."}
            </span>
          </div>

          {nodes.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-white/50 text-sm">
              Clique sur <span className="font-semibold ml-1">Commencer</span> pour générer un jeu de symboles.
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/65">
                {gameMode === "memory"
                  ? "🧠 Mode Mémoire : valeurs masquées par défaut. Survole ou sélectionne une carte pour la révéler."
                  : gameMode === "survival"
                  ? `⏱️ Mode Survie : il te reste ${countdownFormatted} — chaque bonne fusion ajoute ${SURVIVAL_BONUS}s.`
                  : "Règle : à chaque étape, fusionne les deux nœuds de poids minimal."}
              </div>

              {/* Merge zone */}
              <div
                ref={mergeZoneRef}
                className="mt-4 rounded-3xl border border-dashed border-emerald-300/35 bg-gradient-to-br from-emerald-500/12 via-emerald-500/8 to-cyan-500/10 p-5 shadow-inner shadow-emerald-900/20"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-base font-semibold text-emerald-200">Zone de fusion</div>
                    <div className="mt-1 text-xs text-white/60">Dépose ici deux nœuds, ou clique sur deux cartes.</div>
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
                  {[0, 1].map((slotIdx) => {
                    const qNode = mergeQueueNodes[slotIdx];
                    return (
                      <div key={slotIdx} className="flex min-h-[132px] items-center rounded-[24px] border border-white/10 bg-slate-950/55 px-5 py-5 shadow-lg shadow-black/20">
                        {qNode ? (
                          <div className="w-full">
                            <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-200/70">Slot {slotIdx + 1}</div>
                            <div className="mt-2 text-2xl font-bold">{qNode.label}</div>
                            <div className="mt-1 text-sm text-white/70">Fréquence : <span className="font-bold text-emerald-300">{qNode.value}</span></div>
                          </div>
                        ) : (
                          <div className="text-sm text-white/40">{slotIdx === 0 ? "Choisis le premier nœud" : "Choisis le second nœud"}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cards */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {nodes.map((node) => (
                  <NodeCard
                    key={node.id}
                    node={node}
                    onDrop={handleDropToMergeZone}
                    onSelect={addNodeToMergeQueue}
                    selected={mergeQueueIds.includes(node.id)}
                    disabled={finished}
                    hideValue={gameMode === "memory" && !mergeQueueIds.includes(node.id)}
                  />
                ))}
              </div>

              {/* History */}
              {history.length > 0 && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4">
                  <div className="mb-3 text-sm font-semibold">Historique des fusions</div>
                  <div className="flex flex-wrap gap-2 text-xs text-white/70">
                    {history.map((item, idx) => (
                      <span key={`${item.left}-${item.right}-${idx}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        {item.left} + {item.right} = <span className="text-emerald-300 font-semibold">{item.total}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Tree */}
        <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_55%),_rgba(15,23,42,0.96)] p-6 md:p-7 shadow-xl shadow-black/60">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold">Arbre de Huffman</h2>
            <span className="text-xs text-white/55">
              {root ? (finished && !gameOver ? "Arbre final complet." : "Construction progressive.") : "Apparaît après la première fusion."}
            </span>
          </div>
          <HuffmanTree root={root} />
        </div>
      </div>

      {/* Completion banner */}
      {finished && !gameOver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-600/30 via-emerald-500/25 to-emerald-400/30 px-5 py-4 shadow-lg shadow-emerald-500/40"
        >
          <div className="text-base font-semibold">
            🎉 Bravo ! Arbre terminé — <span className="text-emerald-300">score final {score}</span>
            {bestStreak >= 3 && <span className="ml-3 text-sm text-yellow-300">• Meilleure série : {bestStreak} 🔥</span>}
          </div>
          {leaderboardMessage && <div className="mt-2 text-xs text-emerald-50/90">{leaderboardMessage}</div>}
        </motion.div>
      )}

      {/* Game over banner (survival) */}
      {finished && gameOver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-600/30 via-rose-500/25 to-orange-400/30 px-5 py-4 shadow-lg shadow-rose-500/40"
        >
          <div className="text-base font-semibold">
            ⏰ Temps écoulé ! Tu avais réalisé <span className="text-orange-300">{steps} fusions</span> sur {config.nodeCount - 1} nécessaires.
          </div>
          <div className="mt-1 text-sm text-white/70">Réessaie — chaque bonne fusion = +{SURVIVAL_BONUS}s !</div>
        </motion.div>
      )}
    </div>
  );
}
