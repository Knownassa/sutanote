/**
 * Z-Index Slice - Manages node stacking order
 *
 * This slice handles z-index operations for layering:
 * - bringToFront: Move node to top of stack
 * - sendToBack: Move node to bottom of stack
 * - bringForward: Move node up one level
 * - sendBackward: Move node down one level
 *
 * Container types (section, frame, column) maintain their z-order
 * to avoid covering their children
 */

import { StateCreator } from "zustand";
import type { CanvasNode } from "../persistence/types";

// Types that always stay behind regular items (backdrops / containers)
const CONTAINER_TYPES = ["section", "frame", "column"];

/**
 * Stacking rule: the most recently edited item sits on top of the stack.
 * Containers keep their z-order so they never cover their own children.
 */
function withTopZ(nodes: CanvasNode[], id: string): CanvasNode[] {
  const target = nodes.find((n) => n.id === id);
  if (!target || CONTAINER_TYPES.includes(target.type ?? "")) return nodes;

  const maxZ = nodes.reduce((m, n) => Math.max(m, n.zIndex ?? 0), 0);
  if ((target.zIndex ?? 0) >= maxZ) return nodes;

  return nodes.map((n) => (n.id === id ? { ...n, zIndex: maxZ + 1 } : n));
}

export type ZIndexState = Record<never, never>;

export interface ZIndexActions {
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
}

export type ZIndexSlice = ZIndexState & ZIndexActions;
type ZIndexStore = ZIndexSlice & {
  nodes: CanvasNode[];
  pushHistoryAfterChange: () => void;
  markNodeDirty: (node: CanvasNode) => void;
  scheduleFlush: () => void;
};

/**
 * Creates the z-index slice for Zustand store
 *
 * Note: This slice requires access to other slices via get():
 * - nodes: current nodes array
 * - persistence: markNodeDirty, scheduleFlush
 * - history: pushHistoryAfterChange
 */
export const createZIndexSlice: StateCreator<
  ZIndexStore,
  [["zustand/devtools", never]],
  [],
  ZIndexSlice
> = (set, get) => ({
  bringToFront: (id) => {
    const store = get();

    store.pushHistoryAfterChange();
    const maxZ = store.nodes.reduce((m, n) => Math.max(m, n.zIndex ?? 0), 0);
    const next = store.nodes.map((n) => (n.id === id ? { ...n, zIndex: maxZ + 1 } : n));

    set({ nodes: next });
    const node = next.find((n) => n.id === id);
    if (node) {
      store.markNodeDirty(node);
      store.scheduleFlush();
    }
  },

  sendToBack: (id) => {
    const store = get();

    store.pushHistoryAfterChange();
    const minZ = store.nodes.reduce((m, n) => Math.min(m, n.zIndex ?? 0), Number.POSITIVE_INFINITY);
    const base = Number.isFinite(minZ) ? minZ - 1 : -1;
    const next = store.nodes.map((n) => (n.id === id ? { ...n, zIndex: base } : n));

    set({ nodes: next });
    const node = next.find((n) => n.id === id);
    if (node) {
      store.markNodeDirty(node);
      store.scheduleFlush();
    }
  },

  bringForward: (id) => {
    const store = get();

    store.pushHistoryAfterChange();
    const sorted = [...store.nodes].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
    const idx = sorted.findIndex((n) => n.id === id);

    if (idx < 0 || idx === sorted.length - 1) return;

    const swap = sorted[idx + 1];
    if (!swap) return;

    const cur = sorted[idx]!;
    const next = store.nodes.map((n) => {
      if (n.id === id) return { ...n, zIndex: swap.zIndex ?? 0 };
      if (n.id === swap.id) return { ...n, zIndex: cur.zIndex ?? 0 };
      return n;
    }) as CanvasNode[];

    set({ nodes: next });
    next
      .filter((n) => n.id === id || n.id === swap.id)
      .forEach((n) => {
        store.markNodeDirty(n);
        store.scheduleFlush();
      });
  },

  sendBackward: (id) => {
    const store = get();

    store.pushHistoryAfterChange();
    const sorted = [...store.nodes].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
    const idx = sorted.findIndex((n) => n.id === id);

    if (idx <= 0) return;

    const swap = sorted[idx - 1];
    if (!swap) return;

    const cur = sorted[idx]!;
    const next = store.nodes.map((n) => {
      if (n.id === id) return { ...n, zIndex: swap.zIndex ?? 0 };
      if (n.id === swap.id) return { ...n, zIndex: cur.zIndex ?? 0 };
      return n;
    }) as CanvasNode[];

    set({ nodes: next });
    next
      .filter((n) => n.id === id || n.id === swap.id)
      .forEach((n) => {
        store.markNodeDirty(n);
        store.scheduleFlush();
      });
  },
});

// Export helper for use in other slices
export { withTopZ };
