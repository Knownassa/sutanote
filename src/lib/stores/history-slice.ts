/**
 * History Slice - Manages undo/redo functionality and history tracking
 *
 * This slice handles:
 * - Undo/redo operations
 * - History state management
 * - Snapshot capture for history entries
 *
 * Integrates with the history-store.ts for persistent history
 */

import { StateCreator } from "zustand";
import { useHistoryStore } from "../history-store";
import type { CanvasNode, CanvasEdge } from "../persistence/types";
import type { OnNodesChange } from "reactflow";

export interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
}

export interface HistoryActions {
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  /** Pushes history after a change - call BEFORE mutation */
  pushHistoryAfterChange: (baseline?: { nodes: CanvasNode[]; edges: CanvasEdge[] }) => void;
}

export type HistorySlice = HistoryState & HistoryActions;
type HistoryStore = HistorySlice & {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedNodeIds: string[];
  onNodesChange: OnNodesChange;
};

/**
 * Creates the history slice for Zustand store
 *
 * Note: This slice requires access to the main store's nodes and edges,
 * as well as the commitNodes function. These are passed via the get() method.
 */
export const createHistorySlice: StateCreator<
  HistoryStore,
  [["zustand/devtools", never]],
  [],
  HistorySlice
> = (set, get) => {
  // Pending baseline for history bridge pattern
  let pendingBaseline: { nodes: CanvasNode[]; edges: CanvasEdge[] } | null = null;

  const flushPendingHistory = () => {
    if (!pendingBaseline) return;
    const baseline = pendingBaseline;
    pendingBaseline = null;
    const history = useHistoryStore.getState();
    history.replacePresent(baseline);

    const store = get();
    history.push({ nodes: store.nodes, edges: store.edges });
  };

  return {
    canUndo: false,
    canRedo: false,

    pushHistory: () => {
      flushPendingHistory();
      const history = useHistoryStore.getState();
      const store = get();
      history.push({ nodes: store.nodes, edges: store.edges });
    },

    pushHistoryAfterChange: (baseline) => {
      if (pendingBaseline) flushPendingHistory();
      const store = get();
      pendingBaseline = baseline ?? { nodes: store.nodes, edges: store.edges };
      queueMicrotask(flushPendingHistory);
    },

    undo: () => {
      flushPendingHistory();
      const snapshot = useHistoryStore.getState().undo();
      if (!snapshot) return;

      const store = get();

      set({
        nodes: snapshot.nodes as CanvasNode[],
        edges: snapshot.edges as CanvasEdge[],
        selectedNodeIds: snapshot.nodes.filter((n) => n.selected).map((n) => n.id),
      });

      // Mark all restored nodes dirty for persistence
      snapshot.nodes.forEach((n) => {
        store.onNodesChange([
          { id: n.id, type: "position" as const, dragging: false, position: n.position },
        ]);
      });

      // Update history state
      const historyState = useHistoryStore.getState();
      set({
        canUndo: historyState.canUndo,
        canRedo: historyState.canRedo,
      });
    },

    redo: () => {
      flushPendingHistory();
      const snapshot = useHistoryStore.getState().redo();
      if (!snapshot) return;

      const store = get();

      set({
        nodes: snapshot.nodes as CanvasNode[],
        edges: snapshot.edges as CanvasEdge[],
        selectedNodeIds: snapshot.nodes.filter((n) => n.selected).map((n) => n.id),
      });

      // Mark all restored nodes dirty for persistence
      snapshot.nodes.forEach((n) => {
        store.onNodesChange([
          { id: n.id, type: "position" as const, dragging: false, position: n.position },
        ]);
      });

      // Update history state
      const historyState = useHistoryStore.getState();
      set({
        canUndo: historyState.canUndo,
        canRedo: historyState.canRedo,
      });
    },
  };
};
