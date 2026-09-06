/**
 * Selection Slice - Manages node selection state and operations
 *
 * This slice handles all selection-related logic including:
 * - Selected node IDs management
 * - Multi-select operations
 * - Selection clearing and synchronization
 */

import { StateCreator } from "zustand";
import type { CanvasNode } from "../persistence/types";

export interface SelectionState {
  selectedNodeIds: string[];
}

export interface SelectionActions {
  setSelectedIds: (ids: string[]) => void;
  selectAll: () => void;
  clearSelection: () => void;
}

export type SelectionSlice = SelectionState & SelectionActions;
type SelectionStore = SelectionSlice & {
  nodes: CanvasNode[];
};

/**
 * Computes selected node IDs from the nodes array
 */
export function computeSelectedIds(nodes: CanvasNode[]): string[] {
  return nodes.filter((n) => n.selected).map((n) => n.id);
}

/**
 * Syncs selected IDs to state
 */
export function syncSelected(ids: string[]): { selectedNodeIds: string[] } {
  return { selectedNodeIds: ids };
}

/**
 * Creates the selection slice for Zustand store
 */
export const createSelectionSlice: StateCreator<
  SelectionStore,
  [["zustand/devtools", never]],
  [],
  SelectionSlice
> = (set, get) => ({
  selectedNodeIds: [],

  setSelectedIds: (ids) => {
    const { nodes } = get();
    const next = nodes.map((n) => ({ ...n, selected: ids.includes(n.id) }));
    set({ nodes: next, ...syncSelected(ids) });
  },

  selectAll: () => {
    const { nodes } = get();
    const next = nodes.map((n) => ({ ...n, selected: true }));
    set({ nodes: next, selectedNodeIds: computeSelectedIds(next) });
  },

  clearSelection: () => {
    const { nodes } = get();
    const next = nodes.map((n) => (n.selected ? { ...n, selected: false } : n));
    set({ nodes: next, selectedNodeIds: [] });
  },
});
