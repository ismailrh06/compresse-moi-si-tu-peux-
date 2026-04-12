export const ITEM_TYPES = ["🍕", "🍔", "🍟", "🍬", "🤖", "🧊"] as const;

export type ItemType = (typeof ITEM_TYPES)[number];

export type InventoryStack = {
  type: ItemType;
  count: number;
};

export type InventoryState = {
  stacks: InventoryStack[];
  comboStreak: number;
};

export const MEMORY_LIMIT = 10;
export const SUPER_PACK_THRESHOLD = 8;

export function compressConsecutiveInventory(stacks: InventoryStack[]): InventoryStack[] {
  if (stacks.length === 0) return [];

  const merged: InventoryStack[] = [{ ...stacks[0] }];
  for (let i = 1; i < stacks.length; i += 1) {
    const current = stacks[i];
    const last = merged[merged.length - 1];
    if (last.type === current.type) {
      last.count += current.count;
    } else {
      merged.push({ ...current });
    }
  }
  return merged;
}

export function getSlotsUsed(stacks: InventoryStack[]): number {
  return stacks.length;
}

export function getTotalItems(stacks: InventoryStack[]): number {
  return stacks.reduce((sum, stack) => sum + stack.count, 0);
}

export function getCompressionEfficiency(stacks: InventoryStack[]): number {
  const total = getTotalItems(stacks);
  if (total <= 0) return 1;
  return 1 - getSlotsUsed(stacks) / total;
}

export function addItemToInventory(
  state: InventoryState,
  item: ItemType,
): {
  nextState: InventoryState;
  createdNewSlot: boolean;
  superPack: boolean;
} {
  const nextStacks = state.stacks.map((stack) => ({ ...stack }));

  let createdNewSlot = false;
  let comboStreak = 1;

  const last = nextStacks[nextStacks.length - 1];
  if (last && last.type === item) {
    last.count += 1;
    comboStreak = state.comboStreak + 1;
  } else {
    nextStacks.push({ type: item, count: 1 });
    createdNewSlot = true;
    comboStreak = 1;
  }

  const normalized = compressConsecutiveInventory(nextStacks);
  const currentLast = normalized[normalized.length - 1];

  return {
    nextState: {
      stacks: normalized,
      comboStreak,
    },
    createdNewSlot,
    superPack: Boolean(currentLast && currentLast.count >= SUPER_PACK_THRESHOLD),
  };
}

export function breakAllStacks(stacks: InventoryStack[]): InventoryStack[] {
  const broken: InventoryStack[] = [];
  for (const stack of stacks) {
    for (let i = 0; i < stack.count; i += 1) {
      broken.push({ type: stack.type, count: 1 });
    }
  }
  return broken;
}

export function randomizeInventoryTypes(stacks: InventoryStack[], rng: () => number = Math.random): InventoryStack[] {
  const randomized = stacks.map((stack) => ({
    type: ITEM_TYPES[Math.floor(rng() * ITEM_TYPES.length)],
    count: stack.count,
  }));
  return compressConsecutiveInventory(randomized);
}

export function calculatePickupScore(params: {
  comboStreak: number;
  multiplier: number;
  efficiency: number;
}): number {
  const base = 10;
  const comboBonus = Math.max(0, params.comboStreak - 1) * 3;
  const efficiencyBonus = Math.round(params.efficiency * 8);
  return Math.round((base + comboBonus + efficiencyBonus) * params.multiplier);
}
