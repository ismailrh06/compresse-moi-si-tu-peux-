import { memo } from "react";
import type { TileType } from "@/engine/mazeGenerator";

type Props = {
  type: TileType;
};

const STYLE_BY_TILE: Record<TileType, string> = {
  wall: "bg-gradient-to-br from-slate-500 via-slate-600 to-slate-800 border-slate-200/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-2px_3px_rgba(2,6,23,0.7)]",
  floor: "bg-gradient-to-br from-[#0b1220] via-[#0a1321] to-[#08101d] border-slate-900/80",
  narrow: "bg-gradient-to-br from-violet-900/80 via-violet-800/70 to-fuchsia-900/70 border-violet-300/60",
  spike: "bg-gradient-to-br from-rose-900/80 via-rose-800/70 to-red-900/70 border-rose-300/70",
  decompress: "bg-gradient-to-br from-amber-700/75 via-amber-700/65 to-orange-800/70 border-amber-300/75",
  virus: "bg-gradient-to-br from-emerald-900/80 via-emerald-800/70 to-teal-900/70 border-emerald-300/75",
};

const MARKER_BY_TILE: Partial<Record<TileType, string>> = {
  narrow: "▥",
  spike: "✶",
  decompress: "⇄",
  virus: "☣",
};

function Tile({ type }: Props) {
  const isHazard = type === "spike" || type === "virus" || type === "decompress";
  return (
    <div
      className={`group relative flex h-[34px] w-[34px] items-center justify-center border text-[11px] ${STYLE_BY_TILE[type]} ${isHazard ? "animate-pulse" : ""}`}
      aria-hidden
    >
      {type === "floor" && <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(34,211,238,0.04),transparent_55%)]" />}
      {type === "wall" && (
        <>
          <div className="absolute inset-[2px] rounded-[2px] border border-slate-200/35" />
          <div className="absolute left-[3px] right-[3px] top-1/2 h-px -translate-y-1/2 bg-slate-300/25" />
        </>
      )}
      {MARKER_BY_TILE[type] ? (
        <span className={`relative z-10 ${type === "spike" ? "text-rose-100" : type === "virus" ? "text-emerald-100" : "text-amber-100"} opacity-85`}>
          {MARKER_BY_TILE[type]}
        </span>
      ) : null}
    </div>
  );
}

export default memo(Tile);
