/**
 * Persistence Slice - Manages data persistence with PGlite
 *
 * This slice handles:
 * - Dirty state tracking for nodes and edges
 * - Scheduled flushing to database
 * - Immediate flush operations
 * - Persistence status management
 *
 * Integrates with PGlite for local-first storage
 */

import { StateCreator } from "zustand";
import type { CanvasNode, CanvasEdge, PersistenceStatus } from "../persistence/types";
import { DEFAULT_BOARD_ID } from "../persistence/types";
import { flushBoard } from "../persistence/persistence-manager";

export interface PersistenceState {
  persistenceStatus: PersistenceStatus;
  lastSavedAt: number | null;
  lastSaveError: string | null;
  pendingChanges: number;
}

export interface PersistenceActions {
  flushNow: () => Promise<void>;
  scheduleFlush: () => void;
  markNodeDirty: (node: CanvasNode) => void;
  markNodeDeleted: (id: string) => void;
  markEdgeDirty: (edge: CanvasEdge) => void;
  markEdgeDeleted: (id: string) => void;
}

export type PersistenceSlice = PersistenceState & PersistenceActions;
type PersistenceStore = PersistenceSlice & {
  edges: CanvasEdge[];
  currentBoardId: string;
};

// Entity-level persistence queue — lives outside React state
const dirtyNodes = new Map<string, CanvasNode>();
const deletedNodeIds = new Set<string>();
const dirtyEdges = new Map<string, CanvasEdge>();
const deletedEdgeIds = new Set<string>();

const SAVE_DELAY = 500;
let flushTimer: ReturnType<typeof setTimeout> | undefined;
let flushing = false;

function storageBoardId(boardId: string): string {
  return boardId === "b-moodboard" ? DEFAULT_BOARD_ID : boardId;
}

/**
 * Gets the total size of the dirty queue
 */
function queueSize(): number {
  return dirtyNodes.size + dirtyEdges.size + deletedNodeIds.size + deletedEdgeIds.size;
}

/**
 * Creates the persistence slice for Zustand store
 */
export const createPersistenceSlice: StateCreator<
  PersistenceStore,
  [["zustand/devtools", never]],
  [],
  PersistenceSlice
> = (set, get) => ({
  persistenceStatus: "clean",
  lastSavedAt: null,
  lastSaveError: null,
  pendingChanges: 0,

  markNodeDirty: (node) => {
    deletedNodeIds.delete(node.id);
    dirtyNodes.set(node.id, node);
  },

  markNodeDeleted: (id) => {
    dirtyNodes.delete(id);
    deletedNodeIds.add(id);

    // Also delete connected edges
    const { edges } = get();
    for (const e of edges) {
      if (e.source === id || e.target === id) {
        dirtyEdges.delete(e.id);
        deletedEdgeIds.add(e.id);
      }
    }
  },

  markEdgeDirty: (edge) => {
    deletedEdgeIds.delete(edge.id);
    dirtyEdges.set(edge.id, edge);
  },

  markEdgeDeleted: (id) => {
    dirtyEdges.delete(id);
    deletedEdgeIds.add(id);
  },

  scheduleFlush: () => {
    set({ persistenceStatus: "dirty", pendingChanges: queueSize() });
    if (flushTimer) return;
    flushTimer = setTimeout(async () => {
      flushTimer = undefined;
      await get().flushNow();
    }, SAVE_DELAY);
  },

  flushNow: async () => {
    if (flushing) return;

    const dn = new Map(dirtyNodes);
    const dd = new Set(deletedNodeIds);
    const de = new Map(dirtyEdges);
    const dde = new Set(deletedEdgeIds);

    if (dn.size === 0 && dd.size === 0 && de.size === 0 && dde.size === 0) {
      set({ persistenceStatus: "clean", pendingChanges: 0 });
      return;
    }

    flushing = true;
    set({ persistenceStatus: "saving" });

    try {
      const store = get();
      await flushBoard(storageBoardId(store.currentBoardId), dn, dd, de, dde);

      // Clean up flushed items
      for (const [id, snap] of dn) {
        if (dirtyNodes.get(id) === snap) dirtyNodes.delete(id);
      }
      for (const id of dd) {
        if (deletedNodeIds.has(id) && !dirtyNodes.has(id)) deletedNodeIds.delete(id);
      }
      for (const [id, snap] of de) {
        if (dirtyEdges.get(id) === snap) dirtyEdges.delete(id);
      }
      for (const id of dde) {
        if (deletedEdgeIds.has(id) && !dirtyEdges.has(id)) deletedEdgeIds.delete(id);
      }

      set({
        persistenceStatus: queueSize() > 0 ? "dirty" : "saved",
        lastSavedAt: Date.now(),
        lastSaveError: null,
        pendingChanges: queueSize(),
      });
    } catch (err) {
      set({
        persistenceStatus: "error",
        lastSaveError: err instanceof Error ? err.message : String(err),
        pendingChanges: queueSize(),
      });
    } finally {
      flushing = false;
      // Single scheduler: if changes arrived during flush, re-schedule cleanly
      if (queueSize() > 0) get().scheduleFlush();
    }
  },
});

// Export for use in other slices
export { dirtyNodes, deletedNodeIds, dirtyEdges, deletedEdgeIds, queueSize };
