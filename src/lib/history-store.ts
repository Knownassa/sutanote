import { create } from "zustand";
import type { CanvasNode, CanvasEdge } from "./persistence/types";

interface BoardSnapshot {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

/**
 * Command/diff history.
 *
 * Instead of keeping up to 100 full copies of every node and edge, we keep a
 * single `present` snapshot plus a list of small patches. A patch only holds
 * the entries that actually changed (before/after), so 100 undo steps on a
 * 2,000-node board normally cost kilobytes rather than 200,000 node copies.
 *
 * Two limits apply, whichever comes first: MAX_COMMANDS entries, or
 * MAX_HISTORY_BYTES of estimated patch payload.
 */
interface EntryPatch<T> {
  id: string;
  /** Absent when the entry was created by this command. */
  before?: T;
  /** Absent when the entry was deleted by this command. */
  after?: T;
}

export interface HistoryPatch {
  nodes: EntryPatch<CanvasNode>[];
  edges: EntryPatch<CanvasEdge>[];
  /** Approximate serialized size in bytes, used for the memory budget. */
  bytes: number;
}

interface HistoryState {
  /** Undo stack of patches (oldest first). */
  past: HistoryPatch[];
  present: BoardSnapshot | null;
  /** Redo stack of patches (next redo first). */
  future: HistoryPatch[];
  canUndo: boolean;
  canRedo: boolean;
  /** Estimated bytes held by past + future patches. */
  bytes: number;
  /** Capture a new state (call after a completed gesture/operation). */
  push: (snapshot: BoardSnapshot) => void;
  /** Undo — returns the restored snapshot. */
  undo: () => BoardSnapshot | null;
  /** Redo — returns the restored snapshot. */
  redo: () => BoardSnapshot | null;
  /** Replace present without creating a history entry (e.g. during live drag). */
  replacePresent: (snapshot: BoardSnapshot) => void;
  /** Initialize present from loaded data. */
  init: (snapshot: BoardSnapshot) => void;
  /** Clear all history (on board switch). */
  clear: () => void;
}

const MAX_COMMANDS = 200;
const MAX_HISTORY_BYTES = 48 * 1024 * 1024; // 48 MB budget

function cloneNode(n: CanvasNode): CanvasNode {
  return { ...n, data: { ...n.data } };
}

function cloneEdge(e: CanvasEdge): CanvasEdge {
  return { ...e, data: e.data ? { ...e.data } : undefined };
}

function cloneSnapshot(s: BoardSnapshot): BoardSnapshot {
  return { nodes: s.nodes.map(cloneNode), edges: s.edges.map(cloneEdge) };
}

/** Identity of a node for change detection — cheap fields first. */
function nodeKey(n: CanvasNode): string {
  return JSON.stringify([
    n.type,
    n.position.x,
    n.position.y,
    n.style?.width ?? null,
    n.style?.minHeight ?? null,
    n.zIndex ?? null,
    n.data,
  ]);
}

function edgeKey(e: CanvasEdge): string {
  return JSON.stringify([e.source, e.target, e.sourceHandle ?? null, e.targetHandle ?? null, e.type ?? null, e.data ?? null]);
}

function diffList<T>(
  before: T[],
  after: T[],
  getId: (v: T) => string,
  keyOf: (v: T) => string,
  clone: (v: T) => T,
): EntryPatch<T>[] {
  const beforeMap = new Map(before.map((v) => [getId(v), v]));
  const afterMap = new Map(after.map((v) => [getId(v), v]));
  const patches: EntryPatch<T>[] = [];

  for (const [id, a] of afterMap) {
    const b = beforeMap.get(id);
    if (!b) {
      patches.push({ id, after: clone(a) });
    } else if (keyOf(b) !== keyOf(a)) {
      patches.push({ id, before: clone(b), after: clone(a) });
    }
  }
  for (const [id, b] of beforeMap) {
    if (!afterMap.has(id)) patches.push({ id, before: clone(b) });
  }
  return patches;
}

function estimateBytes(patch: Omit<HistoryPatch, "bytes">): number {
  // Rough but consistent: UTF-16-ish accounting of the serialized payload.
  try {
    return JSON.stringify(patch).length * 2;
  } catch {
    return 0;
  }
}

function makePatch(before: BoardSnapshot, after: BoardSnapshot): HistoryPatch | null {
  const nodes = diffList(before.nodes, after.nodes, (n) => n.id, nodeKey, cloneNode);
  const edges = diffList(before.edges, after.edges, (e) => e.id, edgeKey, cloneEdge);
  if (nodes.length === 0 && edges.length === 0) return null;
  return { nodes, edges, bytes: estimateBytes({ nodes, edges }) };
}

/** Apply a patch to a snapshot. `direction` -1 restores `before` (undo). */
function applyPatch(snapshot: BoardSnapshot, patch: HistoryPatch, direction: 1 | -1): BoardSnapshot {
  const applyTo = <T,>(list: T[], patches: EntryPatch<T>[], getId: (v: T) => string): T[] => {
    if (patches.length === 0) return list;
    const target = new Map<string, T | null>();
    for (const p of patches) {
      const value = direction === -1 ? p.before : p.after;
      target.set(p.id, value ?? null);
    }
    const out: T[] = [];
    for (const item of list) {
      const id = getId(item);
      if (target.has(id)) {
        const replacement = target.get(id);
        if (replacement) out.push(replacement);
        target.delete(id);
        continue;
      }
      out.push(item);
    }
    // Remaining entries did not exist in the list — they are re-creations.
    for (const value of target.values()) if (value) out.push(value);
    return out;
  };

  return {
    nodes: applyTo(snapshot.nodes, patch.nodes, (n) => n.id),
    edges: applyTo(snapshot.edges, patch.edges, (e) => e.id),
  };
}

function trim(past: HistoryPatch[], future: HistoryPatch[]) {
  let nextPast = past.slice(-MAX_COMMANDS);
  let bytes = nextPast.reduce((sum, p) => sum + p.bytes, 0) + future.reduce((sum, p) => sum + p.bytes, 0);
  while (bytes > MAX_HISTORY_BYTES && nextPast.length > 1) {
    bytes -= nextPast[0]!.bytes;
    nextPast = nextPast.slice(1);
  }
  return { past: nextPast, bytes };
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  present: null,
  future: [],
  canUndo: false,
  canRedo: false,
  bytes: 0,

  push: (snapshot) => {
    const { present, past } = get();
    if (!present) {
      set({ present: cloneSnapshot(snapshot) });
      return;
    }
    const patch = makePatch(present, snapshot);
    if (!patch) return;
    const { past: nextPast, bytes } = trim([...past, patch], []);
    set({
      past: nextPast,
      present: cloneSnapshot(snapshot),
      future: [],
      canUndo: nextPast.length > 0,
      canRedo: false,
      bytes,
    });
  },

  undo: () => {
    const { past, present, future } = get();
    if (past.length === 0 || !present) return null;
    const patch = past[past.length - 1]!;
    const restored = applyPatch(present, patch, -1);
    const nextPast = past.slice(0, -1);
    const nextFuture = [patch, ...future];
    const { bytes } = trim(nextPast, nextFuture);
    set({
      past: nextPast,
      present: restored,
      future: nextFuture,
      canUndo: nextPast.length > 0,
      canRedo: true,
      bytes,
    });
    return cloneSnapshot(restored);
  },

  redo: () => {
    const { past, present, future } = get();
    if (future.length === 0 || !present) return null;
    const patch = future[0]!;
    const restored = applyPatch(present, patch, 1);
    const nextFuture = future.slice(1);
    const nextPast = [...past, patch];
    const { past: trimmedPast, bytes } = trim(nextPast, nextFuture);
    set({
      past: trimmedPast,
      present: restored,
      future: nextFuture,
      canUndo: trimmedPast.length > 0,
      canRedo: nextFuture.length > 0,
      bytes,
    });
    return cloneSnapshot(restored);
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
      bytes: 0,
    });
  },

  clear: () => {
    set({ past: [], present: null, future: [], canUndo: false, canRedo: false, bytes: 0 });
  },
}));
