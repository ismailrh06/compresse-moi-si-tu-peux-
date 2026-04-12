export type TileType = "wall" | "floor" | "narrow" | "spike" | "decompress" | "virus";

export type Tile = {
  x: number;
  y: number;
  type: TileType;
};

export type MazeData = {
  width: number;
  height: number;
  tiles: Tile[][];
  spawn: { x: number; y: number };
};

function createGrid(width: number, height: number, type: TileType): Tile[][] {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({ x, y, type })),
  );
}

function shuffle<T>(arr: T[]): T[] {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function inBounds(x: number, y: number, width: number, height: number): boolean {
  return x > 0 && y > 0 && x < width - 1 && y < height - 1;
}

export function generateMaze(width = 21, height = 15): MazeData {
  const oddWidth = width % 2 === 0 ? width - 1 : width;
  const oddHeight = height % 2 === 0 ? height - 1 : height;

  const tiles = createGrid(oddWidth, oddHeight, "wall");

  const stack: Array<{ x: number; y: number }> = [{ x: 1, y: 1 }];
  tiles[1][1].type = "floor";

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const dirs = shuffle([
      { dx: 2, dy: 0 },
      { dx: -2, dy: 0 },
      { dx: 0, dy: 2 },
      { dx: 0, dy: -2 },
    ]);

    let moved = false;
    for (const d of dirs) {
      const nx = current.x + d.dx;
      const ny = current.y + d.dy;

      if (!inBounds(nx, ny, oddWidth, oddHeight)) continue;
      if (tiles[ny][nx].type !== "wall") continue;

      tiles[ny][nx].type = "floor";
      tiles[current.y + d.dy / 2][current.x + d.dx / 2].type = "floor";
      stack.push({ x: nx, y: ny });
      moved = true;
      break;
    }

    if (!moved) stack.pop();
  }

  // Open zones for arcade flow.
  const extraOpenings = Math.floor((oddWidth * oddHeight) * 0.08);
  for (let i = 0; i < extraOpenings; i += 1) {
    const x = 1 + Math.floor(Math.random() * (oddWidth - 2));
    const y = 1 + Math.floor(Math.random() * (oddHeight - 2));
    if (tiles[y][x].type === "wall") {
      tiles[y][x].type = "floor";
    }
  }

  const floorTiles: Tile[] = [];
  for (let y = 1; y < oddHeight - 1; y += 1) {
    for (let x = 1; x < oddWidth - 1; x += 1) {
      if (tiles[y][x].type === "floor" && !(x <= 3 && y <= 3)) {
        floorTiles.push(tiles[y][x]);
      }
    }
  }

  const narrowCount = Math.max(6, Math.floor(floorTiles.length * 0.08));
  const spikeCount = Math.max(5, Math.floor(floorTiles.length * 0.05));
  const decompressCount = 3;
  const virusCount = 3;

  const shuffled = shuffle(floorTiles);
  const mark = (count: number, type: TileType, start: number): number => {
    for (let i = start; i < start + count && i < shuffled.length; i += 1) {
      const t = shuffled[i];
      tiles[t.y][t.x].type = type;
    }
    return start + count;
  };

  let index = 0;
  index = mark(narrowCount, "narrow", index);
  index = mark(spikeCount, "spike", index);
  index = mark(decompressCount, "decompress", index);
  mark(virusCount, "virus", index);

  return {
    width: oddWidth,
    height: oddHeight,
    tiles,
    spawn: { x: 1, y: 1 },
  };
}

export function isTileWalkable(type: TileType, playerSize: number): boolean {
  if (type === "wall") return false;
  if (type === "narrow" && playerSize > 1.3) return false;
  return true;
}
