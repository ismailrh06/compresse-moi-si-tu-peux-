"use client";

import { motion } from "framer-motion";
import type { HuffmanNode } from "./HuffmanGame";

export default function NodeCard({
  node,
  onDrop,
}: {
  node: HuffmanNode;
  onDrop: (e: any, source: HuffmanNode) => void;
}) {
  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={(e) => onDrop(e, node)}
      data-node-id={node.id}
      whileHover={{ scale: 1.04, translateY: -2 }}
      whileTap={{ scale: 0.97 }}
      className="relative p-4 rounded-2xl bg-slate-900/70 border border-slate-600/70 
                 shadow-lg shadow-black/60 cursor-grab active:cursor-grabbing select-none
                 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.7),transparent_55%)]" />
      <div className="relative">
        <div className="text-sm uppercase tracking-wide text-slate-300/80 mb-1">
          {node.isLeaf ? "Symbole" : "Fusion"}
        </div>
        <div className="text-lg font-semibold">{node.label}</div>
        <div className="mt-1 text-xs text-slate-300/80">
          fréquence : <span className="font-mono">{node.value}</span>
        </div>
      </div>
    </motion.div>
  );
}
