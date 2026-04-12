"use client";

import { useEffect, useRef, useState } from "react";

export const ALL_ITEM_TYPES = ["🍕", "🍔", "🍟", "🍬", "🤖", "🧊"] as const;
export const EASY_ITEM_TYPES = ["🍕", "🍔", "🍟", "🍬"] as const;
export type ItemType = (typeof ALL_ITEM_TYPES)[number];
export type GamePhase = "idle" | "running" | "lost";
export type FallingItem = { id: number; type: ItemType };
export type Explosion = { id: number; x: number; y: number };

export type CommandId = "compress" | "devour" | "chain" | "blast" | "wait";
export type CommandDef = { id: CommandId; key: string; name: string; icon: string; desc: string; cooldownTicks: number };

export const COMMAND_DEFS: CommandDef[] = [
  { id: "compress", key: "C / Espace", name: "COMPRESS", icon: "💥", desc: "Compresse le type sélectionné", cooldownTicks: 0 },
  { id: "chain",    key: "X",          name: "CHAIN",    icon: "⛓️", desc: "Compresse TOUS les types disponibles en une fois", cooldownTicks: 10 },
  { id: "devour",   key: "D",          name: "DEVOUR",   icon: "🍖", desc: "Avale tout le stock instantanément ×3 pts", cooldownTicks: 15 },
  { id: "blast",    key: "B",          name: "BLAST",    icon: "💣", desc: "Détruit le type cible même avec 1 seul objet", cooldownTicks: 8 },
  { id: "wait",     key: "W",          name: "WAIT",     icon: "🧘", desc: "Pause 3 ticks + frustration −20", cooldownTicks: 12 },
];

const TICK_MS = 400;
const DANGER_TOTAL = 20;

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function useGame(assistMode: boolean) {
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [items, setItems] = useState<FallingItem[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [monsterSize, setMonsterSize] = useState(1);
  const [frustration, setFrustration] = useState(0);
  const [compressedStock, setCompressedStock] = useState(0);
  const [frenzyTicks, setFrenzyTicks] = useState(0);
  const [message, setMessage] = useState("Appuie sur Start !");
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [commandLog, setCommandLog] = useState<string[]>([]);
  const [cooldowns, setCooldowns] = useState<Record<CommandId, number>>({
    compress: 0, devour: 0, chain: 0, blast: 0, wait: 0,
  });
  const [selectedType, setSelectedType] = useState<ItemType>(ALL_ITEM_TYPES[0]);
  const [pauseTicks, setPauseTicks] = useState(0);

  const tickRef = useRef(0);
  const nextIdRef = useRef(1);
  const lastCompressTickRef = useRef(-100);
  const comboRef = useRef(0);
  const frenzyRef = useRef(0);
  const pauseRef = useRef(0);

  const spawnPool = assistMode ? EASY_ITEM_TYPES : ALL_ITEM_TYPES;
  const minGroup = assistMode ? 2 : 3;

  const byType = ALL_ITEM_TYPES.reduce<Record<ItemType, number>>((acc, type) => {
    acc[type] = items.filter((it) => it.type === type).length;
    return acc;
  }, { "🍕": 0, "🍔": 0, "🍟": 0, "🍬": 0, "🤖": 0, "🧊": 0 });

  const bestType = ALL_ITEM_TYPES.reduce<ItemType>(
    (best, type) => (byType[type] > byType[best] ? type : best),
    ALL_ITEM_TYPES[0]
  );

  function addLog(msg: string) {
    setCommandLog((prev) => [msg, ...prev].slice(0, 8));
  }

  useEffect(() => {
    if (phase !== "running") return;

    const interval = setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;
      const level = Math.min(8, Math.floor(tick / 24));
      const spawnEvery = Math.max(assistMode ? 3 : 2, (assistMode ? 7 : 6) - level);

      // Decrement cooldowns every tick
      setCooldowns((prev) => {
        const next = { ...prev } as Record<CommandId, number>;
        for (const k of Object.keys(next) as CommandId[]) if (next[k] > 0) next[k]--;
        return next;
      });

      // Pause: skip spawn & eating, only decrement pause counter
      if (pauseRef.current > 0) {
        pauseRef.current -= 1;
        setPauseTicks(pauseRef.current);
        return;
      }
      setPauseTicks(0);

      // Spawn new items
      if (tick % spawnEvery === 0) {
        const count = Math.random() < (assistMode ? 0.2 : 0.35) ? 2 : 1;
        setItems((prev) => {
          const next = [...prev];
          for (let i = 0; i < count; i++) {
            next.push({ id: nextIdRef.current++, type: randomItem(spawnPool) });
          }
          return next;
        });
      }

      // Overflow → frustration
      setItems((prev) => {
        if (prev.length > DANGER_TOTAL) {
          const overflow = prev.length - DANGER_TOTAL;
          setFrustration((f) => {
            const next = Math.min(100, f + overflow * (assistMode ? 2 : 4));
            if (next >= 100) setPhase("lost");
            return next;
          });
        }
        return prev;
      });

      // Auto-assist compression
      if (assistMode && tick % 5 === 0) {
        setItems((prev) => {
          const counts = ALL_ITEM_TYPES.reduce<Record<ItemType, number>>((acc, type) => {
            acc[type] = prev.filter((it) => it.type === type).length;
            return acc;
          }, { "🍕": 0, "🍔": 0, "🍟": 0, "🍬": 0, "🤖": 0, "🧊": 0 });
          const top = ALL_ITEM_TYPES.reduce<ItemType>(
            (b, t) => (counts[t] > counts[b] ? t : b),
            ALL_ITEM_TYPES[0]
          );
          if (counts[top] >= 2) {
            const removed = counts[top];
            setCompressedStock((s) => s + Math.floor(removed / 2));
            setScore((s) => s + removed * 12);
            setFrustration((f) => Math.max(0, f - 4));
            addLog(`🤝 Auto ${top} ×${removed}`);
            setMessage(`🤝 Auto ${top} ×${removed} compressé !`);
            return prev.filter((it) => it.type !== top);
          }
          return prev;
        });
      }

      // Monster eats from stock every 2 ticks
      if (tick % 2 === 0) {
        const fr = frenzyRef.current;
        setCompressedStock((stock) => {
          if (stock > 0) {
            const eat = Math.min(stock, fr > 0 ? 2 : 1);
            setScore((s) => s + Math.round(eat * 22 * (fr > 0 ? 1.7 : 1)));
            setMonsterSize((m) => Math.min(4, m + eat * 0.2));
            setFrustration((f) => Math.max(0, f - eat * 7));
            return stock - eat;
          } else {
            setFrustration((f) => {
              const next = Math.min(100, f + (assistMode ? 1 : 3));
              if (next >= 100) setPhase("lost");
              return next;
            });
            return stock;
          }
        });
        setFrenzyTicks((t) => {
          const next = Math.max(0, t - 1);
          frenzyRef.current = next;
          return next;
        });
      }
    }, TICK_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, assistMode]);

  function start() {
    tickRef.current = 0;
    nextIdRef.current = 1;
    lastCompressTickRef.current = -100;
    comboRef.current = 0;
    frenzyRef.current = 0;
    pauseRef.current = 0;
    setPhase("running");
    setItems([]);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setMonsterSize(1);
    setFrustration(assistMode ? 6 : 18);
    setCompressedStock(0);
    setFrenzyTicks(0);
    setExplosions([]);
    setCommandLog([]);
    setSelectedType(ALL_ITEM_TYPES[0]);
    setCooldowns({ compress: 0, devour: 0, chain: 0, blast: 0, wait: 0 });
    setPauseTicks(0);
    setMessage("🎮 Lance tes commandes !");
  }

  function compressType(targetType: ItemType, x?: number, y?: number) {
    setItems((prev) => {
      const count = prev.filter((it) => it.type === targetType).length;
      if (count < minGroup) {
        setMessage(`❌ Pas assez de ${targetType}. Min ${minGroup}.`);
        return prev;
      }

      const timeSinceLast = tickRef.current - lastCompressTickRef.current;
      const newCombo = timeSinceLast <= (assistMode ? 12 : 8) ? comboRef.current + 1 : 1;
      lastCompressTickRef.current = tickRef.current;
      comboRef.current = newCombo;

      const packs = Math.floor(count / minGroup);
      const gain = count * 18 + packs * 35 + (newCombo >= 2 ? newCombo * 20 : 0);

      setCombo(newCombo);
      setBestCombo((b) => Math.max(b, newCombo));
      setScore((s) => s + gain);
      setCompressedStock((s) => s + packs);
      setFrustration((f) => Math.max(0, f - packs * 3));
      const logMsg = `💥 COMPRESS ${targetType} ×${count} → +${packs} snacks`;
      setMessage(`${logMsg} | Combo ×${newCombo}`);
      addLog(logMsg);

      if (newCombo >= (assistMode ? 3 : 4)) {
        const ticks = assistMode ? 14 : 10;
        setFrenzyTicks(ticks);
        frenzyRef.current = ticks;
      }

      if (x !== undefined && y !== undefined) {
        setExplosions((expl) => [...expl, { id: Date.now(), x, y }]);
      }

      return prev.filter((it) => it.type !== targetType);
    });
  }

  function executeCommand(id: CommandId, target?: ItemType) {
    if (phase !== "running") return;
    const cd = cooldowns[id];
    if (id !== "compress" && cd > 0) {
      setMessage(`⏳ ${id.toUpperCase()} en recharge — encore ${cd} tick${cd > 1 ? "s" : ""}`);
      return;
    }
    const def = COMMAND_DEFS.find((d) => d.id === id)!;
    let commandSucceeded = false;

    switch (id) {
      case "compress":
        compressType(target ?? selectedType);
        return;

      case "chain": {
        const canChain = ALL_ITEM_TYPES.some((type) => byType[type] >= minGroup);
        if (!canChain) {
          setMessage("❌ CHAIN : aucun type avec assez d'objets.");
          break;
        }
        commandSucceeded = true;
        setItems((prev) => {
          let next = [...prev];
          let totalPacks = 0;
          let totalScore = 0;
          const parts: string[] = [];
          for (const type of ALL_ITEM_TYPES) {
            const count = next.filter((it) => it.type === type).length;
            if (count >= minGroup) {
              const packs = Math.floor(count / minGroup);
              totalPacks += packs;
              totalScore += count * 18 + packs * 35;
              parts.push(`${type}×${count}`);
              next = next.filter((it) => it.type !== type);
            }
          }
          const newCombo = comboRef.current + 1;
          comboRef.current = newCombo;
          setCombo(newCombo);
          setBestCombo((b) => Math.max(b, newCombo));
          setCompressedStock((s) => s + totalPacks);
          setScore((s) => s + totalScore);
          setFrustration((f) => Math.max(0, f - totalPacks * 5));
          const logMsg = `⛓️ CHAIN ${parts.join(" ")} → +${totalPacks}`;
          setMessage(`${logMsg} | Combo ×${newCombo}`);
          addLog(logMsg);
          setExplosions((expl) => [
            ...expl,
            { id: Date.now(),     x: 20, y: 50 },
            { id: Date.now() + 1, x: 50, y: 50 },
            { id: Date.now() + 2, x: 80, y: 50 },
          ]);
          return next;
        });
        break;
      }

      case "devour": {
        if (compressedStock === 0) {
          setMessage("❌ DEVOUR : stock vide !");
          break;
        }
        commandSucceeded = true;
        setCompressedStock((stock) => {
          const bonus = Math.round(stock * 22 * 3);
          setScore((s) => s + bonus);
          setMonsterSize((m) => Math.min(4, m + stock * 0.4));
          setFrustration((f) => Math.max(0, f - 30));
          const logMsg = `🍖 DEVOUR ×${stock} → +${bonus} pts !!`;
          setMessage(logMsg);
          addLog(logMsg);
          setExplosions((expl) => [
            ...expl,
            { id: Date.now(),     x: 40, y: 30 },
            { id: Date.now() + 1, x: 60, y: 60 },
          ]);
          return 0;
        });
        break;
      }

      case "blast": {
        const t = target ?? selectedType;
        if (byType[t] === 0) {
          setMessage(`❌ BLAST : aucun ${t}.`);
          break;
        }
        commandSucceeded = true;
        setItems((prev) => {
          const count = prev.filter((it) => it.type === t).length;
          const logMsg = `💣 BLAST ${t} ×${count} éliminés`;
          setMessage(logMsg);
          addLog(logMsg);
          setFrustration((f) => Math.max(0, f - count * 2));
          setExplosions((expl) => [...expl, { id: Date.now(), x: 50, y: 50 }]);
          return prev.filter((it) => it.type !== t);
        });
        break;
      }

      case "wait": {
        commandSucceeded = true;
        pauseRef.current = 3;
        setPauseTicks(3);
        setFrustration((f) => Math.max(0, f - 20));
        const logMsg = "🧘 WAIT — pause 3 ticks, frustration −20";
        setMessage(logMsg);
        addLog(logMsg);
        break;
      }
    }

    if (commandSucceeded && def.cooldownTicks > 0) {
      setCooldowns((prev) => ({ ...prev, [id]: def.cooldownTicks }));
    }
  }

  function removeExplosion(id: number) {
    setExplosions((expl) => expl.filter((e) => e.id !== id));
  }

  return {
    phase, items, score, combo, bestCombo, monsterSize, frustration,
    compressedStock, frenzyTicks, byType, bestType, minGroup, message,
    explosions, commandLog, cooldowns, selectedType, pauseTicks,
    start, compressType, executeCommand, removeExplosion, setSelectedType,
    dangerTotal: DANGER_TOTAL,
  };
}