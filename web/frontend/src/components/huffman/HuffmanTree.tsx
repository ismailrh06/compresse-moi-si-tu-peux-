"use client";

import { motion } from "framer-motion";
import type { HuffmanNode } from "./HuffmanGame";

export default function HuffmanTree({ root }: { root: HuffmanNode | null }) {
  if (!root) {
    return (
      <div className="h-40 flex items-center justify-center text-white/50 text-sm">
        Construis progressivement l’arbre en fusionnant tous les nœuds.
      </div>
    );
  }

  const renderNode = (node: HuffmanNode) => {
    const isLeaf = !node.left && !node.right;

    return (
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-3 py-2 rounded-xl border text-sm mb-2 shadow-md ${
            isLeaf
              ? "bg-emerald-500/25 border-emerald-300/70"
              : "bg-slate-900/70 border-slate-500/70"
          }`}
        >
          <div className="font-semibold">{node.label}</div>
          <div className="text-[11px] text-slate-200/80">
            freq : <span className="font-mono">{node.value}</span>
          </div>
        </motion.div>

        {(node.left || node.right) && (
          <div className="flex items-start gap-8 mt-1">
            {node.left && (
              <div className="flex flex-col items-center">
                <div className="text-[11px] text-slate-300/80 mb-1">0</div>
                {renderNode(node.left)}
              </div>
            )}
            {node.right && (
              <div className="flex flex-col items-center">
                <div className="text-[11px] text-slate-300/80 mb-1">1</div>
                {renderNode(node.right)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-h-[360px] overflow-auto pr-2 custom-scrollbar">
      {renderNode(root)}
    </div>
  );
}
