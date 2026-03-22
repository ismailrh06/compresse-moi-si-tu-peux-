"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { HuffmanNode } from "./HuffmanGame";

export default function NodeCard({
  node,
  onDrop,
  onSelect,
  selected,
  disabled,
  hideValue = false,
}: {
  node: HuffmanNode;
  onDrop: (point: { x: number; y: number }, source: HuffmanNode) => void;
  onSelect: (source: HuffmanNode) => void;
  selected: boolean;
  disabled?: boolean;
  hideValue?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const showValue = !hideValue || hovered || selected;

  return (
    <motion.div
      layout
      drag
      dragListener={!disabled}
      dragElastic={0.16}
      dragMomentum={false}
      dragSnapToOrigin
      dragTransition={{ bounceStiffness: 380, bounceDamping: 24 }}
      onDragEnd={(_, info) => onDrop(info.point, node)}
      onClick={() => onSelect(node)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      data-node-id={node.id}
      whileHover={{ scale: 1.03, translateY: -4 }}
      whileTap={{ scale: 0.98 }}
      whileDrag={{ scale: 1.04, zIndex: 20 }}
      transition={{ layout: { type: "spring", stiffness: 420, damping: 28 } }}
      className={`group relative min-h-[96px] w-full overflow-hidden rounded-xl border px-3 py-3 shadow-lg shadow-black/55 select-none transition ${
        selected
          ? "border-emerald-200 bg-gradient-to-br from-emerald-400/35 via-slate-800/95 to-cyan-400/20 ring-2 ring-emerald-300/50"
          : hideValue && !hovered
          ? "border-violet-400/60 bg-gradient-to-br from-violet-900/60 via-slate-800/95 to-purple-900/40"
          : "border-slate-400/80 bg-gradient-to-br from-slate-700/95 via-slate-850/95 to-slate-950 hover:border-sky-200/70"
      } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-grab active:cursor-grabbing"}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-95 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.36),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(52,211,153,0.28),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-1 inline-flex rounded-full border border-white/20 bg-white/12 px-2 py-0.5 text-[7px] uppercase tracking-[0.12em] text-slate-100/85">
            {hideValue && !hovered ? "🧠 ?" : node.isLeaf ? "Symbole" : "Fusion"}
          </div>
          <div className="text-lg font-black tracking-tight text-white drop-shadow-lg">
            {node.label}
          </div>
          <div className="mt-1.5 flex items-center justify-center gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.1em] text-slate-200/75">Poids :</span>
            <motion.span
              animate={{ opacity: showValue ? 1 : 0.35, filter: showValue ? "blur(0px)" : "blur(4px)" }}
              transition={{ duration: 0.2 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-emerald-200/50 bg-gradient-to-br from-emerald-400/25 to-cyan-400/15 font-black text-emerald-50 shadow-lg shadow-emerald-500/20"
            >
              {showValue ? node.value : "?"}
            </motion.span>
          </div>
        </div>

        <div className="mt-2 text-[8px] text-slate-300 group-hover:text-white transition-colors">
          {selected ? "Sélectionné" : hideValue && !hovered ? "Survole pour révéler" : "Cliquer / glisser"}
        </div>
      </div>
    </motion.div>
  );
}
