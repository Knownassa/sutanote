import { create } from "zustand";
import type { CanvasNode, CanvasEdge } from "./persistence/types";

interface BoardSnapshot {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

interface HistoryState {
  past: BoardSnapshot[];
  present: BoardSnapshot | null;
  future: BoardSnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  /** Capture a new snapshot (call after a completed gesture/operation). */
  push: (snapshot: BoardSnapshot) => void;
  /** Undo — restore previous snapshot. */
  undo: () => BoardSnapshot | null;
  /** Redo — restore next snapshot. */
  redo: () => BoardSnapshot | null;
  /** Replace present without creating history entry (e.g. during live drag). */
  replacePresent: (snapshot: BoardSnapshot) => void;
  /** Initialize present from loaded data. */
  init: (snapshot: BoardSnapshot) => void;
  /** Clear all history (on board switch). */
  clear: () => void;
}

const MAX_HISTORY = 100;

function cloneSnapshot(s: BoardSnapshot): BoardSnapshot {
  return {
    nodes: s.nodes.map((n) => ({ ...n, data: { ...n.data } })),
    edges: s.edges.map((e) => ({ ...e, data: e.data ? { ...e.data } : undefined })),
  };
}

function snapshotsEqual(a: BoardSnapshot, b: BoardSnapshot): boolean {
  if (a.nodes.length !== b.nodes.length || a.edges.length !== b.edges.length) return false;
  for (let i = 0; i < a.nodes.length; i++) {
    const an = a.nodes[i]!;
    const bn = b.nodes[i]!;
    if (an.id !== bn.id || an.position.x !== bn.position.x || an.position.y !== bn.position.y)
      return false;
    if (JSON.stringify(an.data) !== JSON.stringify(bn.data)) return false;
    if ((an.style?.width ?? null) !== (bn.style?.width ?? null)) return false;
    if ((an.style?.minHeight ?? null) !== (bn.style?.minHeight ?? null)) return false;
  }
  for (let i = 0; i < a.edges.length; i++) {
    const ae = a.edges[i]!;
    const be = b.edges[i]!;
    if (ae.id !== be.id) return false;
    if (JSON.stringify(ae.data) !== JSON.stringify(be.data)) return false;
  }
  return true;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  present: null,
  future: [],
  canUndo: false,
  canRedo: false,

  push: (snapshot) => {
    const { present, past } = get();
    if (present && snapshotsEqual(present, snapshot)) return;
    const newPast = [...past, present ? cloneSnapshot(present) : snapshot].slice(-MAX_HISTORY);
    set({
      past: newPast,
      present: cloneSnapshot(snapshot),
      future: [],
      canUndo: newPast.length > 0,
      canRedo: false,
    });
  },

  undo: () => {
    const { past, present, future } = get();
    if (past.length === 0 || !present) return null;
    const prev = past[past.length - 1]!;
    const newPast = past.slice(0, -1);
    const newFuture = [cloneSnapshot(present), ...future].slice(0, MAX_HISTORY);
    set({
      past: newPast,
      present: cloneSnapshot(prev),
      future: newFuture,
      canUndo: newPast.length > 0,
      canRedo: true,
    });
    return prev;
  },

  redo: () => {
    const { past, present, future } = get();
    if (future.length === 0 || !present) return null;
    const next = future[0]!;
    const newFuture = future.slice(1);
    const newPast = [...past, cloneSnapshot(present)].slice(-MAX_HISTORY);
    set({
      past: newPast,
      present: cloneSnapshot(next),
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0,
    });
    return next;
  },

  replacePresent: (snapshot) => {
    set({ present: cloneSnapshot(snapshot) });
  },

  init: (snapshot) => {
    set({
      past: [],
      present: cloneSnapshot(snapshot),
      future: [],
      canUndo: false,
      canRedo: false,
    });
  },

  clear: () => {
    set({
      past: [],
      present: null,
      future: [],
      canUndo: false,
      canRedo: false,
    });
  },
}));
