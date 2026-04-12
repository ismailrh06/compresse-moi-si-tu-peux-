import { memo } from "react";
import type { MazeData } from "@/engine/mazeGenerator";
import type { SpawnedItem } from "@/hooks/useGameState";
import Tile from "@/components/maze/Tile";
import Player from "../player/Player";

export const MAZE_TILE_SIZE = 34;

type Props = {
  maze: MazeData;
  items: SpawnedItem[];
  player: { x: number; y: number };
  playerScale: number;
  shakeIntensity: number;
};

function Maze({ maze, items, player, playerScale, shakeIntensity }: Props) {
  const width = maze.width * MAZE_TILE_SIZE;
  const height = maze.height * MAZE_TILE_SIZE;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-cyan-200/30 bg-[#060b14] shadow-[0_0_50px_rgba(34,211,238,0.16)]"
      style={{
        width,
        height,
        transform: `translate(${(Math.random() - 0.5) * shakeIntensity * 6}px, ${(Math.random() - 0.5) * shakeIntensity * 6}px)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.14),transparent_45%),radial-gradient(circle_at_80%_75%,rgba(217,70,239,0.12),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-20 [background-image:linear-gradient(rgba(56,189,248,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.12)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div
        className="absolute inset-0 z-10 grid"
        style={{
          gridTemplateColumns: `repeat(${maze.width}, ${MAZE_TILE_SIZE}px)`,
        }}
      >
        {maze.tiles.flatMap((row, y) => row.map((tile, x) => <Tile key={`${x}-${y}`} type={tile.type} />))}
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          className="absolute z-20 flex h-7 w-7 items-center justify-center rounded-md border border-white/15 bg-black/30 text-xl drop-shadow-[0_0_10px_rgba(255,255,255,0.75)]"
          style={{
            left: item.x * MAZE_TILE_SIZE,
            top: item.y * MAZE_TILE_SIZE,
            width: MAZE_TILE_SIZE,
            height: MAZE_TILE_SIZE,
          }}
        >
          {item.type}
        </div>
      ))}

      <Player x={player.x} y={player.y} tileSize={MAZE_TILE_SIZE} scale={playerScale} />
    </div>
  );
}

export default memo(Maze);
