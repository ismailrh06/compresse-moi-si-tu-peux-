"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type LzwMode = "tutorial" | "challenge" | "memory" | "survival";
type Difficulty = "easy" | "medium" | "hard";

type DictEntry = {
  code: number;
  value: string;
  isNew?: boolean;
};

type TurnLog = {
  picked: string;
  expected: string;
  good: boolean;
  emittedCode?: number;
  added?: string;
};

const MODE_INFO: Record<LzwMode, { label: string; icon: string; desc: string }> = {
  tutorial: {
    label: "Tutoriel",
    icon: "🧭",
    desc: "Guidage pas à pas pour comprendre la logique du dictionnaire LZW.",
  },
  challenge: {
    label: "Défi",
    icon: "🏁",
    desc: "Fais le meilleur score avec vitesse + précision + combo.",
  },
  memory: {
    label: "Mémoire",
    icon: "🧠",
    desc: "Le dictionnaire est partiellement caché, joue avec ta mémoire.",
  },
  survival: {
    label: "Survie",
    icon: "⏱️",
    desc: "Le temps baisse. Bonne réponse = +8s, erreur = -6s.",
  },
};

const DIFFICULTY_INFO: Record<Difficulty, { label: string; patterns: string[]; bonus: number; penalty: number; startTime: number }> = {
  easy: {
    label: "Facile",
    patterns: ["ABABABAABABA", "ABCABCABCAB", "TOBEORNOTTOBE", "BANANABANANA"],
    bonus: 8,
    penalty: 6,
    startTime: 85,
  },
  medium: {
    label: "Moyen",
    patterns: ["ABBCABBCABBCAB", "TOBEORTOBEORTOBE", "CABABACABABACA", "ABRACADABRABRA"],
    bonus: 7,
    penalty: 7,
    startTime: 65,
  },
  hard: {
    label: "Difficile",
    patterns: ["MISSISSIPPIISSIM", "BANANABANDANABAN", "TOBEORNOTTOBEORTO", "ABABCBABABCBABA"],
    bonus: 6,
    penalty: 8,
    startTime: 48,
  },
};

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function uniqueSortedChars(text: string) {
  return [...new Set(text.split(""))].sort();
}

function longestMatchAt(source: string, position: number, dictionaryValues: Set<string>) {
  const rest = source.slice(position);

  for (let length = rest.length; length >= 1; length -= 1) {
    const candidate = rest.slice(0, length);
    if (dictionaryValues.has(candidate)) return candidate;
  }

  return rest[0] ?? "";
}

function buildChoices(source: string, position: number, dictionary: DictEntry[], expected: string) {
  const rest = source.slice(position);
  const choices = new Set<string>([expected]);

  // Prefixes of expected (common mistake: pick too short)
  for (let length = 1; length < expected.length; length += 1) {
    const prefix = expected.slice(0, length);
    if (dictionary.some((entry) => entry.value === prefix)) choices.add(prefix);
  }

  // Distractors from dictionary that share first char
  const firstChar = rest[0] ?? "";
  const sameInitial = dictionary
    .map((entry) => entry.value)
    .filter((value) => value.startsWith(firstChar) && value !== expected)
    .slice(0, 3);
  sameInitial.forEach((value) => choices.add(value));

  // Distractor: expected + next char (often not yet in dictionary)
  if (rest.length > expected.length) {
    const fake = expected + rest[expected.length];
    if (!dictionary.some((entry) => entry.value === fake)) choices.add(fake);
  }

  // Fill up to 4 choices
  const fillers = shuffle(dictionary.map((entry) => entry.value)).filter(
    (value) => !choices.has(value)
  );
  for (const value of fillers) {
    if (choices.size >= 4) break;
    choices.add(value);
  }

  return shuffle([...choices]).slice(0, 4);
}

function formatSeconds(seconds: number) {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60);
  const s = String(safe % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function getComboMultiplier(streak: number) {
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

function scoreDelta(mode: LzwMode, streak: number, good: boolean) {
  if (!good) return mode === "tutorial" ? 0 : -15;

  const base = mode === "tutorial" ? 10 : 35;
  return Math.round(base * getComboMultiplier(streak));
}

export default function LzwGame() {
  const [mode, setMode] = useState<LzwMode>("tutorial");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  const [source, setSource] = useState("");
  const [position, setPosition] = useState(0);
  const [dictionary, setDictionary] = useState<DictEntry[]>([]);
  const [outputs, setOutputs] = useState<number[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [currentExpected, setCurrentExpected] = useState("");

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [steps, setSteps] = useState(0);
  const [errors, setErrors] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);

  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const [message, setMessage] = useState("Choisis un mode puis clique sur Commencer.");
  const [logs, setLogs] = useState<TurnLog[]>([]);

  const info = MODE_INFO[mode];
  const diffInfo = DIFFICULTY_INFO[difficulty];

  // Timers
  useEffect(() => {
    if (!started || finished || mode === "survival") return;
    const interval = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started, finished, mode]);

  useEffect(() => {
    if (!started || finished || mode !== "survival") return;

    if (countdown <= 0) {
      setFinished(true);
      setMessage("⏰ Temps écoulé. Rejoue pour battre ton score !");
      return;
    }

    const interval = setInterval(() => setCountdown((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [started, finished, mode, countdown]);

  const progressPercent = useMemo(() => {
    if (!source.length) return 0;
    return Math.round((position / source.length) * 100);
  }, [position, source.length]);

  const accuracy = useMemo(() => {
    const total = steps + errors;
    return total === 0 ? 100 : Math.round((steps / total) * 100);
  }, [steps, errors]);

  function computeTurnChoices(nextPosition: number, dict: DictEntry[]) {
    if (nextPosition >= source.length) {
      setChoices([]);
      setCurrentExpected("");
      return;
    }

    const values = new Set(dict.map((entry) => entry.value));
    const expected = longestMatchAt(source, nextPosition, values);
    setCurrentExpected(expected);
    setChoices(buildChoices(source, nextPosition, dict, expected));
  }

  function startGame() {
    const selectedPattern =
      diffInfo.patterns[Math.floor(Math.random() * diffInfo.patterns.length)];

    const baseChars = uniqueSortedChars(selectedPattern);
    const baseDictionary = baseChars.map((char, index) => ({
      code: index,
      value: char,
    }));

    setSource(selectedPattern);
    setPosition(0);
    setDictionary(baseDictionary);
    setOutputs([]);
    setSteps(0);
    setErrors(0);
    setStreak(0);
    setBestStreak(0);
    setScore(0);
    setElapsed(0);
    setCountdown(diffInfo.startTime);
    setStarted(true);
    setFinished(false);
    setLogs([]);

    setMessage(
      mode === "tutorial"
        ? "Trouve la plus longue séquence présente dans le dictionnaire."
        : mode === "survival"
        ? `Mode Survie: +${diffInfo.bonus}s par bonne réponse, -${diffInfo.penalty}s par erreur.`
        : "Choisis à chaque tour la plus longue séquence déjà présente dans le dictionnaire."
    );

    // Reset new flags
    const cleanDictionary = baseDictionary.map((entry) => ({ ...entry, isNew: false }));
    setDictionary(cleanDictionary);

    // Prepare first turn
    const values = new Set(cleanDictionary.map((entry) => entry.value));
    const expected = longestMatchAt(selectedPattern, 0, values);
    setCurrentExpected(expected);
    setChoices(buildChoices(selectedPattern, 0, cleanDictionary, expected));
  }

  function markDictionaryOld(entries: DictEntry[]) {
    return entries.map((entry) => ({ ...entry, isNew: false }));
  }

  function handlePick(choice: string) {
    if (!started || finished || !currentExpected) return;

    const good = choice === currentExpected;

    if (!good) {
      setErrors((e) => e + 1);
      setStreak(0);
      setScore((current) => Math.max(0, current + scoreDelta(mode, 0, false)));

      if (mode === "survival") {
        setCountdown((t) => Math.max(0, t - diffInfo.penalty));
      }

      setLogs((current) => [
        {
          picked: choice,
          expected: currentExpected,
          good: false,
        },
        ...current,
      ].slice(0, 10));

      setMessage(`❌ Mauvais choix. Ici il fallait "${currentExpected}".`);
      return;
    }

    const nextStreak = streak + 1;
    setStreak(nextStreak);
    setBestStreak((value) => Math.max(value, nextStreak));
    setSteps((s) => s + 1);
    setScore((current) => Math.max(0, current + scoreDelta(mode, nextStreak, true)));

    if (mode === "survival") {
      setCountdown((t) => t + diffInfo.bonus);
    }

    // Emit code of chosen sequence
    const currentDictionary = markDictionaryOld(dictionary);
    const emitted = currentDictionary.find((entry) => entry.value === choice)?.code;

    let nextDictionary = [...currentDictionary];
    const consumedUntil = position + choice.length;
    const nextChar = source[consumedUntil];

    let addedEntry: string | undefined;

    if (nextChar) {
      const newValue = choice + nextChar;
      const alreadyThere = nextDictionary.some((entry) => entry.value === newValue);

      if (!alreadyThere) {
        const nextCode = nextDictionary.length;
        nextDictionary = [
          ...nextDictionary,
          { code: nextCode, value: newValue, isNew: true },
        ];
        addedEntry = newValue;
      }
    }

    setDictionary(nextDictionary);
    if (typeof emitted === "number") {
      setOutputs((current) => [...current, emitted]);
    }

    setLogs((current) => [
      {
        picked: choice,
        expected: currentExpected,
        good: true,
        emittedCode: emitted,
        added: addedEntry,
      },
      ...current,
    ].slice(0, 10));

    const nextPosition = consumedUntil;
    setPosition(nextPosition);

    if (nextPosition >= source.length) {
      setFinished(true);
      setMessage("🎉 Encodage LZW terminé. Tu peux rejouer avec un mode plus difficile.");
      setChoices([]);
      setCurrentExpected("");
      return;
    }

    computeTurnChoices(nextPosition, nextDictionary);

    setMessage(
      mode === "tutorial"
        ? addedEntry
          ? `✅ Bien joué ! Code émis, et on ajoute "${addedEntry}" au dictionnaire.`
          : "✅ Bien joué ! Aucune nouvelle entrée à ajouter sur ce tour."
        : "✅ Correct. Continue !"
    );
  }

  const timerLabel = mode === "survival" ? formatSeconds(countdown) : formatSeconds(elapsed);
  const timerDanger = mode === "survival" && countdown <= 10;

  const consumed = source.slice(0, position);
  const cursorLength = currentExpected.length || 1;
  const currentChunk = source.slice(position, position + cursorLength);
  const pending = source.slice(position + cursorLength);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-fuchsia-500/15 via-sky-500/10 to-emerald-500/15 p-6 shadow-xl backdrop-blur-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">LZW Lab</p>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl">
              Dictionnaire LZW — <span className="text-cyan-300">jeu pédagogique</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              {info.icon} {info.desc}
            </p>
            <p className="mt-2 text-xs text-emerald-200/90">{message}</p>
          </div>

          <div className="w-full space-y-3 lg:w-[32rem]">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {(Object.keys(MODE_INFO) as LzwMode[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setMode(item)}
                  disabled={started && !finished}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${
                    item === mode
                      ? "border-white bg-white text-black"
                      : "border-white/25 bg-white/5 text-white/75 hover:border-white/50"
                  }`}
                >
                  {MODE_INFO[item].icon} {MODE_INFO[item].label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(DIFFICULTY_INFO) as Difficulty[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setDifficulty(item)}
                  disabled={started && !finished}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${
                    item === difficulty
                      ? "border-emerald-200 bg-emerald-200/90 text-black"
                      : "border-white/20 bg-white/5 text-white/75 hover:border-white/50"
                  }`}
                >
                  {DIFFICULTY_INFO[item].label}
                </button>
              ))}
            </div>

            <button
              onClick={startGame}
              className="w-full rounded-2xl bg-white px-5 py-3 font-semibold text-black shadow-lg transition hover:shadow-xl"
            >
              {started ? "Recommencer" : "Commencer"}
            </button>
          </div>
        </div>
      </div>

      {started && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          <Stat label="Mode" value={`${info.icon} ${info.label}`} />
          <Stat label="Niveau" value={diffInfo.label} />
          <Stat
            label={mode === "survival" ? "Temps restant" : "Temps"}
            value={timerLabel}
            accent={timerDanger ? "danger" : mode === "survival" ? "countdown" : undefined}
            pulse={timerDanger}
          />
          <Stat label="Progression" value={`${progressPercent}%`} />
          <Stat label="Bonnes réponses" value={steps} />
          <Stat label="Erreurs" value={errors} accent="error" />
          <Stat label="Meilleur combo" value={bestStreak} accent={bestStreak >= 3 ? "combo" : undefined} />
          <Stat label="Score" value={score} accent="success" />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-lg">
            <h2 className="text-xl font-semibold">Flux d'entrée</h2>
            <p className="mt-1 text-xs text-white/60">Position actuelle de l'encodage</p>

            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 font-mono text-sm tracking-wide">
              {source ? (
                <>
                  <span className="text-emerald-300/80">{consumed}</span>
                  <span className="rounded bg-fuchsia-500/25 px-1 text-fuchsia-200">{currentChunk || "·"}</span>
                  <span className="text-white/65">{pending}</span>
                </>
              ) : (
                <span className="text-white/45">Clique sur Commencer pour générer un flux.</span>
              )}
            </div>

            {started && !finished && (
              <>
                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/55">Choix du plus long match</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {choices.map((choice) => (
                    <motion.button
                      key={choice}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePick(choice)}
                      className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left font-mono text-lg transition hover:border-cyan-300/60 hover:bg-cyan-400/10"
                    >
                      {choice}
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            {finished && (
              <div className="mt-4 rounded-2xl border border-emerald-400/35 bg-emerald-500/12 px-4 py-3 text-sm text-emerald-100">
                Partie terminée. Tu as produit {outputs.length} codes avec {accuracy}% de précision.
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-lg">
            <h2 className="text-xl font-semibold">Sortie codée</h2>
            <p className="mt-1 text-xs text-white/60">Codes émis au fil des décisions</p>

            <div className="mt-4 min-h-16 rounded-2xl border border-white/10 bg-slate-900/60 p-3 font-mono text-sm">
              {outputs.length === 0 ? (
                <span className="text-white/45">Aucun code émis pour l'instant.</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {outputs.map((code, index) => (
                    <span
                      key={`${code}-${index}`}
                      className="rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-2 py-1 text-cyan-200"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <AnimatePresence>
              {bestStreak >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-yellow-300/45 bg-yellow-400/10 px-3 py-1.5 text-xs font-semibold text-yellow-200"
                >
                  🔥 Combo actif — x{getComboMultiplier(streak)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-lg">
            <h2 className="text-xl font-semibold">Dictionnaire LZW</h2>
            <p className="mt-1 text-xs text-white/60">
              {mode === "memory"
                ? "Mode Mémoire: les séquences sont cachées par défaut (survole pour les révéler)."
                : "Nouvelles entrées ajoutées après chaque bonne décision."}
            </p>

            <div className="mt-4 max-h-[24rem] overflow-auto rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-900/95 text-white/70">
                  <tr>
                    <th className="px-3 py-2 text-left">Code</th>
                    <th className="px-3 py-2 text-left">Séquence</th>
                  </tr>
                </thead>
                <tbody>
                  {dictionary.map((entry) => (
                    <tr
                      key={`${entry.code}-${entry.value}`}
                      className={`border-t border-white/5 ${entry.isNew ? "bg-emerald-400/10" : "bg-transparent"}`}
                    >
                      <td className="px-3 py-2 font-mono text-cyan-200">{entry.code}</td>
                      <td className="px-3 py-2">
                        <span
                          className={mode === "memory" ? "select-none blur-[4px] hover:blur-none transition" : ""}
                        >
                          {entry.value}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-lg">
            <h2 className="text-xl font-semibold">Journal des tours</h2>
            <p className="mt-1 text-xs text-white/60">Dernières décisions du joueur</p>

            <div className="mt-4 space-y-2">
              {logs.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/50">
                  Le journal apparaîtra après les premiers tours.
                </div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={`${log.picked}-${index}`}
                    className={`rounded-xl border px-3 py-2 text-xs ${
                      log.good
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                        : "border-rose-400/30 bg-rose-400/10 text-rose-100"
                    }`}
                  >
                    {log.good ? "✅" : "❌"} choisi "{log.picked}" • attendu "{log.expected}"{typeof log.emittedCode === "number" ? ` • code ${log.emittedCode}` : ""}
                    {log.added ? ` • ajout "${log.added}"` : ""}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type StatProps = {
  label: string;
  value: string | number;
  accent?: "error" | "success" | "combo" | "countdown" | "danger";
  pulse?: boolean;
};

function Stat({ label, value, accent, pulse = false }: StatProps) {
  const accentClass =
    accent === "error"
      ? "text-rose-300"
      : accent === "success"
      ? "text-emerald-300"
      : accent === "combo"
      ? "text-yellow-300"
      : accent === "countdown"
      ? "text-cyan-300"
      : accent === "danger"
      ? "text-red-400"
      : "text-white";

  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.03, 1] } : {}}
      transition={pulse ? { duration: 0.6, repeat: Infinity } : {}}
      className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 shadow-md"
    >
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className={`text-lg font-semibold ${accentClass}`}>{value}</div>
    </motion.div>
  );
}
