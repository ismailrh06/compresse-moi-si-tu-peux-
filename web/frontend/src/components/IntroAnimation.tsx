"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#%^&*{}[]<>~=+";
const TITLE = "Compresse moi si tu peux";

type Phase = "rain" | "title" | "compressing" | "exiting";

interface IntroAnimationProps {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState<Phase>("rain");
  const [progress, setProgress] = useState(0);
  const [scrambled, setScrambled] = useState(TITLE);
  const [compressionDone, setCompressionDone] = useState(false);

  /* ── Binary rain particles ── */
  const particles = useMemo(
    () =>
      Array.from({ length: 55 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 1.8,
        duration: 1.8 + Math.random() * 2.5,
        char: Math.random() > 0.5 ? "0" : "1",
        big: Math.random() > 0.75,
      })),
    []
  );

  /* ── Main animation sequence ── */
  useEffect(() => {
    let cancelled = false;
    const wait = (ms: number) =>
      new Promise<void>((r) => setTimeout(r, ms));

    const run = async () => {
      /* 1 — rain (600 ms) */
      await wait(600);
      if (cancelled) return;

      /* 2 — title appears (1.6 s) */
      setPhase("title");
      await wait(1600);
      if (cancelled) return;

      /* 3 — compression */
      setPhase("compressing");

      /* scramble effect */
      const chars = TITLE.split("");
      let iter = 0;
      const scrambleInterval = setInterval(() => {
        setScrambled(
          chars
            .map((ch, i) => {
              if (ch === " ") return " ";
              if (i < iter) return ch;
              return CHARSET[Math.floor(Math.random() * CHARSET.length)];
            })
            .join("")
        );
        iter += 0.45;
        if (iter >= chars.length) {
          setScrambled(TITLE);
          clearInterval(scrambleInterval);
        }
      }, 38);

      await wait(300);
      if (cancelled) return;

      /* progress bar */
      await new Promise<void>((resolve) => {
        let p = 0;
        const bar = setInterval(() => {
          p += 1.4;
          setProgress(Math.min(Math.round(p), 100));
          if (p >= 100) {
            clearInterval(bar);
            resolve();
          }
        }, 20);
      });

      if (cancelled) return;

      setCompressionDone(true);
      await wait(700);
      if (cancelled) return;

      /* 4 — exit */
      setPhase("exiting");
      await wait(700);
      if (cancelled) return;

      onComplete();
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [onComplete]);

  /* ── squish scaleX driven by progress ── */
  const scaleX = phase === "compressing" ? Math.max(0.12, 1 - progress / 115) : 1;

  return (
    <AnimatePresence>
      {phase !== "exiting" ? (
        <motion.div
          key="intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050816] overflow-hidden"
        >
          {/* ── Binary rain background ── */}
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ y: "-8%", opacity: 0 }}
              animate={{ y: "108%", opacity: [0, 0.45, 0.45, 0] }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "linear",
              }}
              className={`absolute font-mono select-none pointer-events-none
                ${p.big ? "text-sm text-purple-400/20" : "text-xs text-blue-400/15"}`}
              style={{ left: `${p.x}%` }}
            >
              {p.char}
            </motion.span>
          ))}

          {/* ── Radial glow ── */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={
                phase === "compressing"
                  ? { scale: [1, 1.4, 1], opacity: [0.15, 0.35, 0.15] }
                  : { opacity: 0.12 }
              }
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-[500px] w-[500px] rounded-full bg-purple-600 blur-[120px]"
            />
          </div>

          {/* ── Center content ── */}
          <div className="relative z-10 flex flex-col items-center text-center px-6">

            {/* TITLE */}
            <AnimatePresence mode="wait">
              {phase === "rain" && (
                <motion.div key="placeholder" className="h-20 sm:h-24" />
              )}

              {phase === "title" && (
                <motion.h1
                  key="title-in"
                  initial={{ opacity: 0, y: 35, filter: "blur(14px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight"
                >
                  {TITLE}
                </motion.h1>
              )}

              {phase === "compressing" && (
                <motion.h1
                  key="title-compress"
                  initial={{ opacity: 1 }}
                  className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight font-mono origin-center"
                  style={{
                    scaleX,
                    color: `hsl(${270 - progress * 0.5}, 80%, ${75 - progress * 0.2}%)`,
                    transition: "scale-x 0.05s linear, color 0.05s linear",
                  }}
                >
                  {scrambled}
                </motion.h1>
              )}
            </AnimatePresence>

            {/* Subtitle — title phase */}
            {phase === "title" && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="mt-4 text-white/35 text-sm sm:text-base font-light tracking-[0.25em] uppercase"
              >
                Algorithmes de compression avancés
              </motion.p>
            )}

            {/* Progress section — compressing phase */}
            {phase === "compressing" && (
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-12 w-72 sm:w-96"
              >
                {/* Labels */}
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-white/40">
                    {compressionDone ? "✓ Compression réussie !" : "Compression en cours…"}
                  </span>
                  <span className="text-purple-400 tabular-nums">{progress}%</span>
                </div>

                {/* Bar */}
                <div className="relative h-[5px] rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-purple-600 via-violet-500 to-blue-400"
                    style={{ width: `${progress}%` }}
                  />
                  {/* shimmer */}
                  <motion.div
                    animate={{ x: ["-100%", "250%"] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  />
                </div>

                {/* Size info */}
                <div className="flex justify-between text-[11px] font-mono text-white/25 mt-2">
                  <span>
                    24 KB → {Math.max(3, Math.round(24 * (1 - progress / 145)))} KB
                  </span>
                  <span>Huffman</span>
                </div>
              </motion.div>
            )}

            {/* Success pop */}
            <AnimatePresence>
              {compressionDone && phase === "compressing" && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 18 }}
                  className="mt-6 flex items-center gap-2 text-green-400 font-mono text-sm"
                >
                  <span className="text-xl">✓</span>
                  <span>Compression réussie</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Corner decorations ── */}
          <div className="absolute top-5 left-6 font-mono text-[11px] text-white/12">
            <motion.span
              animate={{ opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              v1.0.0
            </motion.span>
          </div>
          <div className="absolute top-5 right-6 font-mono text-[11px] text-white/12">
            <motion.span
              animate={{ opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1.2 }}
            >
              HUFFMAN · LZW
            </motion.span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
