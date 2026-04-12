"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addItemToInventory,
  breakAllStacks,
  calculatePickupScore,
  getCompressionEfficiency,
  getSlotsUsed,
  getTotalItems,
  ITEM_TYPES,
  MEMORY_LIMIT,
  randomizeInventoryTypes,
  type InventoryState,
  type ItemType,
} from "@/engine/gameLogic";
import { generateMaze, isTileWalkable, type MazeData, type TileType } from "@/engine/mazeGenerator";
import { useGameLoop } from "@/hooks/useGameLoop";

export type Phase = "idle" | "running" | "gameover";

export type Direction = { x: number; y: number };

type PlayerState = {
  x: number;
  y: number;
  dir: Direction;
  desired: Direction;
};

export type SpawnedItem = {
  id: number;
  type: ItemType;
  x: number;
  y: number;
};

export type Particle = {
  id: number;
  x: number;
  y: number;
  emoji: string;
  life: number;
};

type RuntimeState = {
  phase: Phase;
  player: PlayerState;
  inventory: InventoryState;
  items: SpawnedItem[];
  score: number;
  elapsed: number;
  multiplier: number;
  frenzyTimer: number;
  spawnTimer: number;
  overflowTimer: number;
  comboBest: number;
  screenShake: number;
  trapCooldowns: {
    spike: number;
    decompress: number;
    virus: number;
  };
  particles: Particle[];
  message: string;
};

const BASE_SPEED = 3.9;
const MAZE_WIDTH = 27;
const MAZE_HEIGHT = 19;

const DIR_NONE: Direction = { x: 0, y: 0 };
const DIR_MAP: Record<string, Direction> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  z: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  q: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

function createInitialState(maze: MazeData): RuntimeState {
  return {
    phase: "idle",
    player: {
      x: maze.spawn.x,
      y: maze.spawn.y,
      dir: { x: 1, y: 0 },
      desired: { x: 1, y: 0 },
    },
    inventory: {
      stacks: [],
      comboStreak: 0,
    },
    items: [],
    score: 0,
    elapsed: 0,
    multiplier: 1,
    frenzyTimer: 0,
    spawnTimer: 0,
    overflowTimer: 0,
    comboBest: 0,
    screenShake: 0,
    trapCooldowns: {
      spike: 0,
      decompress: 0,
      virus: 0,
    },
    particles: [],
    message: "Collect identical items in sequence to compress memory.",
  };
}

function getTileType(maze: MazeData, x: number, y: number): TileType {
  const tx = Math.max(0, Math.min(maze.width - 1, Math.round(x)));
  const ty = Math.max(0, Math.min(maze.height - 1, Math.round(y)));
  return maze.tiles[ty][tx].type;
}

function isPositionWalkable(maze: MazeData, x: number, y: number, playerSize: number): boolean {
  const tx = Math.round(x);
  const ty = Math.round(y);
  if (tx < 0 || tx >= maze.width || ty < 0 || ty >= maze.height) return false;
  return isTileWalkable(maze.tiles[ty][tx].type, playerSize);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function useGameState() {
  const [maze, setMaze] = useState<MazeData>(() => generateMaze(MAZE_WIDTH, MAZE_HEIGHT));
  const [state, setState] = useState<RuntimeState>(() => createInitialState(maze));

  const walkableTiles = useMemo(() => {
    const slots: Array<{ x: number; y: number }> = [];
    for (let y = 0; y < maze.height; y += 1) {
      for (let x = 0; x < maze.width; x += 1) {
        if (maze.tiles[y][x].type !== "wall") {
          slots.push({ x, y });
        }
      }
    }
    return slots;
  }, [maze]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && state.phase !== "running") {
        event.preventDefault();
        setMaze((prevMaze) => {
          const nextMaze = generateMaze(prevMaze.width, prevMaze.height);
          setState(createInitialState(nextMaze));
          setState((prevState) => ({ ...prevState, phase: "running", message: "RUN! Keep memory compressed." }));
          return nextMaze;
        });
        return;
      }

      if (event.key === " ") {
        if (state.phase !== "running") return;
        event.preventDefault();
        setState((prev) => ({
          ...prev,
          player: {
            ...prev.player,
            desired: DIR_NONE,
            dir: DIR_NONE,
          },
        }));
        return;
      }

      const direction = DIR_MAP[event.key] ?? DIR_MAP[event.key.toLowerCase()];
      if (!direction || state.phase !== "running") return;
      event.preventDefault();
      setState((prev) => ({
        ...prev,
        player: {
          ...prev.player,
          desired: direction,
        },
      }));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.phase]);

  useGameLoop(
    (dt) => {
      setState((prev) => {
        if (prev.phase !== "running") return prev;

        const next: RuntimeState = {
          ...prev,
          elapsed: prev.elapsed + dt,
          frenzyTimer: Math.max(0, prev.frenzyTimer - dt),
          multiplier: prev.frenzyTimer > 0 ? 2 : 1,
          screenShake: Math.max(0, prev.screenShake - dt * 2.5),
          trapCooldowns: {
            spike: Math.max(0, prev.trapCooldowns.spike - dt),
            decompress: Math.max(0, prev.trapCooldowns.decompress - dt),
            virus: Math.max(0, prev.trapCooldowns.virus - dt),
          },
          particles: prev.particles
            .map((p) => ({ ...p, life: p.life - dt }))
            .filter((p) => p.life > 0),
        };

        const slotsUsed = getSlotsUsed(next.inventory.stacks);
        const playerSize = 0.9 + slotsUsed / MEMORY_LIMIT;

        const overflowPressure = Math.max(0, slotsUsed - MEMORY_LIMIT);
        const overflowDelta = overflowPressure > 0 ? dt * (1.2 + overflowPressure * 0.7) : -dt * 0.8;
        next.overflowTimer = clamp(prev.overflowTimer + overflowDelta, 0, 8);

        if (next.overflowTimer >= 5.5) {
          return {
            ...next,
            phase: "gameover",
            message: "Memory overflow! Compression failed.",
          };
        }

        const difficulty = 1 + Math.min(0.8, next.elapsed / 140);
        const speedPenalty = slotsUsed > MEMORY_LIMIT ? 0.6 : 1;
        const speed = BASE_SPEED * difficulty * speedPenalty * (next.frenzyTimer > 0 ? 1.25 : 1);

        let activeDirection = prev.player.dir;
        const desired = prev.player.desired;
        const isTurning = desired.x !== activeDirection.x || desired.y !== activeDirection.y;
        const snapThreshold = 0.2;

        if (desired !== DIR_NONE) {
          // Assist turning: snap to lane center when changing direction.
          const alignedX = isTurning && desired.y !== 0
            ? Math.abs(prev.player.x - Math.round(prev.player.x)) <= snapThreshold
              ? Math.round(prev.player.x)
              : prev.player.x
            : prev.player.x;
          const alignedY = isTurning && desired.x !== 0
            ? Math.abs(prev.player.y - Math.round(prev.player.y)) <= snapThreshold
              ? Math.round(prev.player.y)
              : prev.player.y
            : prev.player.y;

          const probeX = alignedX + desired.x * 0.24;
          const probeY = alignedY + desired.y * 0.24;
          if (isPositionWalkable(maze, probeX, probeY, playerSize)) {
            activeDirection = desired;
          }
        }

        const step = speed * dt;
        let nextX = prev.player.x + activeDirection.x * step;
        let nextY = prev.player.y + activeDirection.y * step;

        if (!isPositionWalkable(maze, nextX, prev.player.y, playerSize)) {
          nextX = prev.player.x;
        }
        if (!isPositionWalkable(maze, nextX, nextY, playerSize)) {
          nextY = prev.player.y;
        }

        next.player = {
          ...prev.player,
          x: clamp(nextX, 0, maze.width - 1),
          y: clamp(nextY, 0, maze.height - 1),
          dir: activeDirection,
        };

        // Item spawn logic + difficulty scaling
        const spawnInterval = Math.max(0.35, 1.05 - next.elapsed * 0.0042);
        next.spawnTimer = prev.spawnTimer + dt;
        if (next.spawnTimer >= spawnInterval && next.items.length < 42) {
          next.spawnTimer = 0;
          const itemsToSpawn = next.elapsed > 40 && Math.random() < 0.35 ? 2 : 1;
          const occupied = new Set(next.items.map((item) => `${item.x}-${item.y}`));
          occupied.add(`${Math.round(next.player.x)}-${Math.round(next.player.y)}`);

          const freshItems = [...next.items];
          for (let i = 0; i < itemsToSpawn; i += 1) {
            const candidates = walkableTiles.filter(({ x, y }) => !occupied.has(`${x}-${y}`));
            if (candidates.length === 0) break;
            const spawn = randomFrom(candidates);
            occupied.add(`${spawn.x}-${spawn.y}`);
            freshItems.push({
              id: Math.floor(Math.random() * 1_000_000_000),
              type: ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)],
              x: spawn.x,
              y: spawn.y,
            });
          }
          next.items = freshItems;
        }

        // Pickup detection
        let inventory = next.inventory;
        let scoreDelta = 0;
        const pickedParticles: Particle[] = [];
        const remainingItems: SpawnedItem[] = [];

        for (const item of next.items) {
          const dx = item.x - next.player.x;
          const dy = item.y - next.player.y;
          const distance = Math.hypot(dx, dy);

          if (distance < 0.42) {
            const added = addItemToInventory(inventory, item.type);
            inventory = added.nextState;

            const efficiency = getCompressionEfficiency(inventory.stacks);
            scoreDelta += calculatePickupScore({
              comboStreak: inventory.comboStreak,
              multiplier: next.multiplier,
              efficiency,
            });

            if (added.superPack) {
              next.frenzyTimer = Math.max(next.frenzyTimer, 6);
              next.multiplier = 2;
              next.screenShake = Math.min(1.8, next.screenShake + 0.7);
              next.message = `SUPER PACK! ${item.type} x8 unlocked Frenzy mode.`;
            }

            pickedParticles.push({
              id: item.id,
              x: item.x,
              y: item.y,
              emoji: item.type,
              life: 0.5,
            });
          } else {
            remainingItems.push(item);
          }
        }

        if (pickedParticles.length > 0) {
          next.items = remainingItems;
          next.inventory = inventory;
          next.score += scoreDelta;
          next.comboBest = Math.max(next.comboBest, inventory.comboStreak);
          next.particles = [...next.particles, ...pickedParticles];
        }

        // Tile trap effects
        const currentTile = getTileType(maze, next.player.x, next.player.y);
        if (currentTile === "spike" && next.trapCooldowns.spike <= 0) {
          next.score = Math.max(0, next.score - 18);
          next.screenShake = Math.min(1.5, next.screenShake + 0.55);
          next.trapCooldowns.spike = 1.1;
          next.message = "Spike hit! Score reduced.";
        }

        if (currentTile === "decompress" && next.trapCooldowns.decompress <= 0) {
          next.inventory = {
            stacks: breakAllStacks(next.inventory.stacks),
            comboStreak: 0,
          };
          next.trapCooldowns.decompress = 2.2;
          next.message = "Decompression zone! Stacks exploded into raw data.";
        }

        if (currentTile === "virus" && next.trapCooldowns.virus <= 0) {
          next.inventory = {
            stacks: randomizeInventoryTypes(next.inventory.stacks),
            comboStreak: 0,
          };
          next.trapCooldowns.virus = 2.2;
          next.message = "Virus tile! Your inventory got randomized.";
        }

        return next;
      });
    },
    true,
  );

  const slotsUsed = getSlotsUsed(state.inventory.stacks);
  const totalItems = getTotalItems(state.inventory.stacks);
  const efficiency = getCompressionEfficiency(state.inventory.stacks);
  const playerScale = 0.9 + slotsUsed / MEMORY_LIMIT;

  const startGame = () => {
    const nextMaze = generateMaze(MAZE_WIDTH, MAZE_HEIGHT);
    setMaze(nextMaze);
    setState({
      ...createInitialState(nextMaze),
      phase: "running",
      message: "BYTE MAZE: COMPRESSION RUN started.",
    });
  };

  return {
    maze,
    state,
    slotsUsed,
    totalItems,
    efficiency,
    playerScale,
    memoryLimit: MEMORY_LIMIT,
    startGame,
    itemTypes: ITEM_TYPES,
  };
}
