"use client";

import { motion } from "framer-motion";
import type { HuffmanNode } from "./HuffmanGame";

export default function HuffmanTree({ root }: { root: HuffmanNode | null }) {
  if (!root) {
    return (
      <div className="flex h-48 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-sm text-white/50">
        L’arbre apparaîtra ici dès la première fusion.
      </div>
    );
  }

  const renderNode = (node: HuffmanNode, depth = 0) => {
    const isLeaf = !node.left && !node.right;
    const hasBothChildren = Boolean(node.left && node.right);

    return (
      <div className="flex min-w-[92px] flex-col items-center">
        <motion.div
          layout
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className={`relative min-w-[74px] rounded-lg border px-2 py-1.5 text-[10px] shadow-md shadow-black/40 backdrop-blur-sm ${
            isLeaf
              ? "border-emerald-200/80 bg-gradient-to-br from-emerald-400/35 via-emerald-500/15 to-slate-950/80"
              : "border-sky-200/75 bg-gradient-to-br from-sky-400/30 via-cyan-500/15 to-slate-950/80"
          }`}
        >
          <div className="mb-0.5 text-[7px] uppercase tracking-[0.12em] text-white/75 text-center">
            {isLeaf ? "Feuille" : depth === 0 ? "Racine" : "Fusion"}
          </div>
          <div className="text-center text-xs font-extrabold text-white">{node.label}</div>
          <div className="text-center text-[9px] text-slate-100/95">
            fréquence : <span className="font-mono font-semibold">{node.value}</span>
          </div>

          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-2 w-px bg-white/30" />
        </motion.div>

        {(node.left || node.right) && (
          <div className="relative mt-3 pt-4">
            {hasBothChildren && (
              <div className="pointer-events-none absolute left-1/4 right-1/4 top-0 h-px bg-white/25" />
            )}

            <div className={`flex items-start ${hasBothChildren ? "gap-4 md:gap-7" : "gap-0"}`}>
            {node.left && (
              <div className="flex flex-col items-center relative pt-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-px bg-white/25" />
                <div className="mb-2 rounded-full border border-white/10 bg-slate-900/45 px-2.5 py-0.5 text-[11px] text-slate-300/80">0</div>
                {renderNode(node.left, depth + 1)}
              </div>
            )}
            {node.right && (
              <div className="flex flex-col items-center relative pt-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-px bg-white/25" />
                <div className="mb-2 rounded-full border border-white/10 bg-slate-900/45 px-2.5 py-0.5 text-[11px] text-slate-300/80">1</div>
                {renderNode(node.right, depth + 1)}
              </div>
            )}
          </div>
          </div>
        )}
      </div>
    );
  };

  const leafCount = root.symbols?.length ?? 1;

  return (
    <div className="max-h-[520px] overflow-auto pr-2 custom-scrollbar">
      <div className="mb-4 inline-flex gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/65">
        <span>Sous-arbre courant</span>
        <span>•</span>
        <span>{leafCount} feuille{leafCount > 1 ? "s" : ""}</span>
      </div>

      <div className="min-w-max px-4 pb-4 pt-2">
        {renderNode(root)}
      </div>
    </div>
  );
}
