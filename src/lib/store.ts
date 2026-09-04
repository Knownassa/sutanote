import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  Connection,
} from "reactflow";
import { nanoid } from "nanoid";
import { initDB } from "./init-db";
import { db } from "./database";
import { loadNodesByBoard } from "./persistence/node-repository";
import { loadEdgesByBoard } from "./persistence/edge-repository";
import { getNodeDef } from "./node-definitions";
import { flushBoard } from "./persistence/persistence-manager";
import { useSettingsStore } from "./settings-store";
import { useHistoryStore } from "./history-store";
import { useBoardTreeStore } from "./board-tree-store";
import { createDefaultTable } from "./table";
import {
  DEFAULT_BOARD_ID,
  type CanvasNodeData,
  type CanvasNode,
  type CanvasEdge,
  type PersistenceStatus,
} from "./persistence/types";

interface CanvasState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedNodeIds: string[];
  isLoaded: boolean;
  persistenceStatus: PersistenceStatus;
  lastSavedAt: number | null;
  lastSaveError: string | null;
  pendingChanges: number;
  currentBoardId: string;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<CanvasNodeData>) => void;
  updateNodeDataWithHistory: (id: string, data: Partial<CanvasNodeData>) => void;
  updateNodeSize: (id: string, width: number, height: number) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  deleteNode: (id: string) => void;
  setSelectedIds: (ids: string[]) => void;
  selectAll: () => void;
  clearSelection: () => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  copySelected: () => void;
  cutSelected: () => void;
  pasteAt: (position: { x: number; y: number }) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  alignSelected: (edge: "left" | "centerX" | "right" | "top" | "centerY" | "bottom") => void;
  distributeSelected: (axis: "horizontal" | "vertical") => void;
  matchSizeSelected: (dim: "width" | "height") => void;
  setColorSelected: (color: string) => void;
  setBackgroundColorSelected: (hex: string) => void;
  setPositionSelected: (id: string, x: number, y: number) => void;
  setSizeSelected: (id: string, width: number, height: number) => void;
  setWidthSelected: (width: number) => void;
  setHeightSelected: (height: number) => void;
  setLockedSelected: (locked: boolean) => void;
  patchSelectedData: (patch: Partial<CanvasNodeData>) => void;
  setRotationSelected: (deg: number) => void;
  setOpacitySelected: (opacity: number) => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  flushNow: () => Promise<void>;
  initializeStore: () => Promise<void>;
  switchBoard: (boardId: string) => Promise<void>;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

const defaultColors: Record<string, string> = {
  text: "bg-card",
  sticky: "bg-note-yellow",
  todo: "bg-card",
  image: "bg-card",
  link: "bg-card",
  file: "bg-card",
  comment: "bg-card",
};

const SAVE_DELAY = 500;

const queueSize = () =>
  dirtyNodes.size + dirtyEdges.size + deletedNodeIds.size + deletedEdgeIds.size;

const GRID_SIZE = 16;
const snapValue = (v: number) => Math.round(v / GRID_SIZE) * GRID_SIZE;

/** Types that always stay behind regular items (backdrops / containers). */
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

// Entity-level persistence queue — lives outside React state so it is not
// recreated on every render and survives across store updates.
const dirtyNodes = new Map<string, CanvasNode>();
const deletedNodeIds = new Set<string>();
const dirtyEdges = new Map<string, CanvasEdge>();
const deletedEdgeIds = new Set<string>();

// In-memory clipboard for copy/cut/paste/duplicate (no cross-app format yet).
let clipboard: CanvasNode[] = [];

// Snapshot captured at drag/resize start for undo history.
let dragStartSnapshot: { nodes: CanvasNode[]; edges: CanvasEdge[] } | null = null;

function storageBoardId(boardId: string): string {
  // Preserve data created before the board tree became persisted. The seeded
  // Moodboard is the compatibility home for that original default board.
  return boardId === "b-moodboard" ? DEFAULT_BOARD_ID : boardId;
}

let flushTimer: ReturnType<typeof setTimeout> | undefined;
let flushing = false;

function syncSelected(ids: string[]): { selectedNodeIds: string[] } {
  return { selectedNodeIds: ids };
}

function computeSelectedIds(nodes: CanvasNode[]): string[] {
  return nodes.filter((n) => n.selected).map((n) => n.id);
}

export const useCanvasStore = create<CanvasState>((set, get) => {
  /**
   * Diff history bridge: call this immediately BEFORE (or right after) a
   * mutation. It records the baseline, then on the next microtask — once the
   * mutation has landed — replaces `present` with the baseline and pushes the
   * live state, so the stored patch is baseline -> result.
   */
  let pendingBaseline: { nodes: CanvasNode[]; edges: CanvasEdge[] } | null = null;
  const flushPendingHistory = () => {
    if (!pendingBaseline) return;
    const baseline = pendingBaseline;
    pendingBaseline = null;
    const history = useHistoryStore.getState();
    history.replacePresent(baseline);
    history.push({ nodes: get().nodes, edges: get().edges });
  };
  const pushHistoryAfterChange = (baseline?: { nodes: CanvasNode[]; edges: CanvasEdge[] }) => {
    if (pendingBaseline) flushPendingHistory();
    pendingBaseline = baseline ?? { nodes: get().nodes, edges: get().edges };
    queueMicrotask(flushPendingHistory);
  };

  const markNodeDirty = (node: CanvasNode) => {
    deletedNodeIds.delete(node.id);
    dirtyNodes.set(node.id, node);
  };

  const markNodeDeleted = (id: string) => {
    dirtyNodes.delete(id);
    deletedNodeIds.add(id);
    const edges = get().edges;
    for (const e of edges) {
      if (e.source === id || e.target === id) {
        dirtyEdges.delete(e.id);
        deletedEdgeIds.add(e.id);
      }
    }
  };

  const markEdgeDirty = (edge: CanvasEdge) => {
    deletedEdgeIds.delete(edge.id);
    dirtyEdges.set(edge.id, edge);
  };

  const markEdgeDeleted = (id: string) => {
    dirtyEdges.delete(id);
    deletedEdgeIds.add(id);
  };

  const scheduleFlush = () => {
    set({ persistenceStatus: "dirty", pendingChanges: queueSize() });
    if (flushTimer) return;
    flushTimer = setTimeout(async () => {
      flushTimer = undefined;
      await get().flushNow();
    }, SAVE_DELAY);
  };

  const commitNodes = (next: CanvasNode[]) => {
    set({ nodes: next, ...syncSelected(computeSelectedIds(next)) });
  };

  const applyToSelected = (fn: (n: CanvasNode) => CanvasNode) => {
    const next = get().nodes.map((n) => (n.selected ? fn(n) : n)) as CanvasNode[];
    commitNodes(next);
    next
      .filter((n) => n.selected)
      .forEach((n) => {
        markNodeDirty(n);
        scheduleFlush();
      });
  };

  return {
    nodes: [],
    edges: [],
    selectedNodeIds: [],
    isLoaded: false,
    persistenceStatus: "clean",
    lastSavedAt: null,
    lastSaveError: null,
    pendingChanges: 0,
    currentBoardId: useBoardTreeStore.getState().activeBoardId,

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
        await flushBoard(storageBoardId(get().currentBoardId), dn, dd, de, dde);
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
        // Single scheduler: if changes arrived during flush, re-schedule cleanly.
        if (queueSize() > 0) scheduleFlush();
      }
    },

    initializeStore: async () => {
      if (get().isLoaded) return;
      await initDB();
      const boardId = useBoardTreeStore.getState().activeBoardId;
      const dbBoardId = storageBoardId(boardId);
      const dbNodes = await loadNodesByBoard(dbBoardId);
      const dbEdges = await loadEdgesByBoard(dbBoardId);

      if (dbNodes.length > 0) {
        set({
          nodes: dbNodes as CanvasNode[],
          edges: dbEdges as CanvasEdge[],
          selectedNodeIds: [],
          isLoaded: true,
          persistenceStatus: "saved",
          lastSavedAt: Date.now(),
          pendingChanges: 0,
          currentBoardId: boardId,
        });
        // Initialize history with loaded state.
        useHistoryStore.getState().init({
          nodes: dbNodes as CanvasNode[],
          edges: dbEdges as CanvasEdge[],
        });
        return;
      }

      // Safety: check whether ANY nodes exist in the database (any board).
      // If yes, the current board filter just didn't match — do NOT seed demo content.
      const anyNodes = await db.query<{ cnt: number }>(
        `SELECT COUNT(*)::int AS cnt FROM canvas_nodes WHERE deleted_at IS NULL`,
      );
      if ((anyNodes.rows[0]?.cnt ?? 0) > 0) {
        // Data exists elsewhere — load empty for this board but don't seed.
        set({
          nodes: [],
          edges: dbEdges as CanvasEdge[],
          selectedNodeIds: [],
          isLoaded: true,
          persistenceStatus: "saved",
          lastSavedAt: Date.now(),
          pendingChanges: 0,
          currentBoardId: boardId,
        });
        return;
      }

      const seeded: CanvasNode[] = [
        {
          id: nanoid(),
          type: "sticky",
          position: { x: -120, y: -80 },
          zIndex: 1,
          data: {
            text: "Welcome to Sutonote. This canvas is yours — infinite, private, and local.",
            color: "bg-note-yellow",
            rotation: -0.8,
          },
          style: {
            width: getNodeDef("sticky").defaultWidth,
            minHeight: getNodeDef("sticky").defaultHeight,
          },
        },
        {
          id: nanoid(),
          type: "text",
          position: { x: 160, y: -60 },
          zIndex: 2,
          data: {
            title: "",
            text: "Click a tool below to begin — or drag to explore the canvas.",
            color: "bg-card",
            rotation: 0,
          },
          style: {
            width: getNodeDef("text").defaultWidth,
            minHeight: getNodeDef("text").defaultHeight,
          },
        },
        {
          id: nanoid(),
          type: "todo",
          position: { x: -40, y: 120 },
          zIndex: 3,
          data: {
            text: "",
            color: "bg-card",
            rotation: 0,
            todos: [
              { label: "Try dragging this card around", done: false },
              { label: "Click the canvas to deselect", done: false },
              { label: "Press Delete to remove a card", done: false },
            ],
          },
          style: {
            width: getNodeDef("todo").defaultWidth,
            minHeight: getNodeDef("todo").defaultHeight,
          },
        },
      ];

      set({
        nodes: seeded,
        edges: dbEdges as CanvasEdge[],
        selectedNodeIds: [],
        isLoaded: true,
        persistenceStatus: "dirty",
        pendingChanges: seeded.length,
        currentBoardId: boardId,
      });
      seeded.forEach(markNodeDirty);
      scheduleFlush();
    },

    switchBoard: async (boardId) => {
      if (!boardId || boardId === get().currentBoardId) return;
      if (!get().isLoaded) {
        useBoardTreeStore.getState().setActiveBoard(boardId);
        return;
      }

      // Finish the outgoing board before replacing in-memory state.
      await get().flushNow();
      await initDB();
      const dbBoardId = storageBoardId(boardId);
      const [dbNodes, dbEdges] = await Promise.all([
        loadNodesByBoard(dbBoardId),
        loadEdgesByBoard(dbBoardId),
      ]);

      dirtyNodes.clear();
      deletedNodeIds.clear();
      dirtyEdges.clear();
      deletedEdgeIds.clear();
      dragStartSnapshot = null;
      if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = undefined;
      }

      const nextNodes = dbNodes as CanvasNode[];
      const nextEdges = dbEdges as CanvasEdge[];
      set({
        nodes: nextNodes,
        edges: nextEdges,
        selectedNodeIds: [],
        currentBoardId: boardId,
        persistenceStatus: "saved",
        lastSavedAt: Date.now(),
        lastSaveError: null,
        pendingChanges: 0,
      });
      useHistoryStore.getState().init({ nodes: nextNodes, edges: nextEdges });
      useBoardTreeStore.getState().setActiveBoard(boardId);
    },

    onNodesChange: (changes) => {
      const prev = get().nodes;
      let next = applyNodeChanges(changes, prev) as CanvasNode[];

      let touched = false;
      for (const c of changes) {
        if (c.type === "position") {
          // Capture snapshot at drag start (first position change with dragging: true).
          if (c.dragging && !dragStartSnapshot) {
            dragStartSnapshot = { nodes: get().nodes, edges: get().edges };
          }

          const node = next.find((n) => n.id === c.id);
          if (node) {
            // Group movement: propagate delta to siblings with same groupId.
            const gid = node.data.groupId as string | undefined;
            if (gid && c.dragging) {
              const oldNode = prev.find((n) => n.id === c.id);
              if (oldNode && c.position) {
                const dx = c.position.x - oldNode.position.x;
                const dy = c.position.y - oldNode.position.y;
                if (dx !== 0 || dy !== 0) {
                  next = next.map((n) =>
                    n.id !== c.id && n.data.groupId === gid
                      ? { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } }
                      : n,
                  ) as CanvasNode[];
                }
              }
            }
            // Container movement: move children with same parentId when container drags.
            const containerTypes = ["section", "frame", "column"];
            if (containerTypes.includes(node.type ?? "") && c.dragging) {
              const oldNode = prev.find((n) => n.id === c.id);
              if (oldNode && c.position) {
                const dx = c.position.x - oldNode.position.x;
                const dy = c.position.y - oldNode.position.y;
                if (dx !== 0 || dy !== 0) {
                  next = next.map((n) =>
                    n.data.parentId === c.id
                      ? { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } }
                      : n,
                  ) as CanvasNode[];
                  // Mark moved children dirty
                  for (const n of next) {
                    if (n.data.parentId === c.id) markNodeDirty(n);
                  }
                }
              }
            }

            // Snap-on-drop: apply grid snapping only at release, never during drag.
            if (c.dragging === false) {
              const doSnap = useSettingsStore.getState().snapToGrid;
              if (doSnap) {
                const snappedX = snapValue(node.position.x);
                const snappedY = snapValue(node.position.y);
                const dx = snappedX - node.position.x;
                const dy = snappedY - node.position.y;
                if (dx !== 0 || dy !== 0) {
                  // Snap the dragged node.
                  next = next.map((n) =>
                    n.id === c.id ? { ...n, position: { x: snappedX, y: snappedY } } : n,
                  ) as CanvasNode[];
                  // Apply same delta to all other selected nodes (preserves relative spacing).
                  next = next.map((n) =>
                    n.id !== c.id && n.selected
                      ? { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } }
                      : n,
                  ) as CanvasNode[];
                  // Also apply same delta to container children
                  next = next.map((n) =>
                    n.data.parentId === c.id
                      ? { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } }
                      : n,
                  ) as CanvasNode[];
                }
              }

              // Mark dirty with final (snapped) positions.
              // Last-touched wins: dragged item moves to the top of the stack.
              next = withTopZ(next, c.id);
              const finalNode = next.find((n) => n.id === c.id);
              if (finalNode) {
                markNodeDirty(finalNode);
                // Also mark dirty any selected siblings (they may have moved via snap delta).
                for (const n of next) {
                  if (n.id !== c.id && n.selected) markNodeDirty(n);
                }
                // Also mark container children dirty for snap
                for (const n of next) if (n.data.parentId === c.id) markNodeDirty(n);
                // Section containment: attach/detach
                if (!["section", "frame", "column"].includes(finalNode.type ?? "")) {
                  const containers = next.filter(
                    (n) =>
                      ["section", "frame", "column"].includes(n.type ?? "") &&
                      n.id !== finalNode.id,
                  );
                  let newParent: string | undefined;
                  for (const cont of containers) {
                    const cw = (cont.style?.width as number) ?? 560;
                    const ch = (cont.style?.minHeight as number) ?? 360;
                    const cx = cont.position.x;
                    const cy = cont.position.y;
                    const left = cx - cw / 2;
                    const right = cx + cw / 2;
                    const top = cy - ch / 2;
                    const bottom = cy + ch / 2;
                    if (
                      finalNode.position.x >= left &&
                      finalNode.position.x <= right &&
                      finalNode.position.y >= top &&
                      finalNode.position.y <= bottom
                    ) {
                      newParent = cont.id;
                      break;
                    }
                  }
                  const curParent = finalNode.data.parentId as string | undefined;
                  if (newParent !== curParent) {
                    next = next.map((n) =>
                      n.id === finalNode.id
                        ? { ...n, data: { ...n.data, parentId: newParent } }
                        : n,
                    ) as CanvasNode[];
                    const updated = next.find((n) => n.id === finalNode.id);
                    if (updated) markNodeDirty(updated);
                  }
                }
                touched = true;
              }

              // Push history entry for this drag operation.
              if (dragStartSnapshot) {
                pushHistoryAfterChange(dragStartSnapshot);
                dragStartSnapshot = null;
              }
            }
          }
        } else if (c.type === "dimensions") {
          const node = next.find((n) => n.id === c.id);
          if (node && c.dimensions) {
            next = next.map((n) =>
              n.id === c.id
                ? {
                    ...n,
                    style: {
                      ...n.style,
                      width: c.dimensions!.width ?? n.style?.width,
                      minHeight: c.dimensions!.height ?? n.style?.minHeight,
                    },
                  }
                : n,
            ) as CanvasNode[];
            // Coalesced into a single flush by the 500ms debounce (one save after resize stops).
            markNodeDirty(node);
            touched = true;
          }
        } else if (c.type === "remove") {
          markNodeDeleted(c.id);
          touched = true;
        }
      }

      commitNodes(next);
      if (touched) scheduleFlush();
    },

    onEdgesChange: (changes) => {
      const newEdges = applyEdgeChanges(changes, get().edges) as CanvasEdge[];
      set({ edges: newEdges });

      let touched = false;
      for (const c of changes) {
        if (c.type === "remove") {
          markEdgeDeleted(c.id);
          touched = true;
        } else if (c.type === "add") {
          markEdgeDirty(c.item as CanvasEdge);
          touched = true;
        }
      }
      if (touched) scheduleFlush();
    },

    onConnect: (connection) => {
      const newEdges = addEdge(connection, get().edges) as CanvasEdge[];
      set({ edges: newEdges });
      const edge = newEdges.find(
        (e) =>
          e.source === connection.source &&
          e.target === connection.target &&
          (e.sourceHandle ?? null) === (connection.sourceHandle ?? null) &&
          (e.targetHandle ?? null) === (connection.targetHandle ?? null),
      );
      if (edge) {
        markEdgeDirty(edge);
        scheduleFlush();
      }
    },

    addNode: (type, position) => {
      const maxZ = get().nodes.reduce((m, n) => Math.max(m, n.zIndex ?? 0), 0);
      const minZ = get().nodes.reduce(
        (m, n) => Math.min(m, n.zIndex ?? 0),
        Number.POSITIVE_INFINITY,
      );
      const def = getNodeDef(type);
      // Snap initial position to grid if setting enabled.
      const doSnap = useSettingsStore.getState().snapToGrid;
      const pos = doSnap ? { x: snapValue(position.x), y: snapValue(position.y) } : position;
      const containerTypes = ["section", "frame"];
      const zIndex = containerTypes.includes(type)
        ? Number.isFinite(minZ)
          ? minZ - 1
          : 0
        : maxZ + 1;
      const newNode: CanvasNode = {
        id: nanoid(),
        type,
        position: pos,
        zIndex,
        selected: true,
        data: {
          text: "",
          title: type === "text" ? "" : type === "todo" ? "To-do" : type === "link" ? "" : "",
          color: defaultColors[type] ?? "bg-note-yellow",
          rotation: type === "sticky" ? Number((Math.random() * 2 - 1).toFixed(2)) : 0,
          ...(type === "todo"
            ? {
                todos: [
                  { label: "Task 1", done: false },
                  { label: "Task 2", done: false },
                  { label: "Task 3", done: false },
                ],
              }
            : {}),
          ...(type === "image" ? { src: "", caption: "", assetId: "" } : {}),
          ...(type === "link" ? { url: "", description: "" } : {}),
          ...(type === "file" ? { filename: "", assetId: "", mime: "" } : {}),
          ...(type === "comment"
            ? {
                author: useSettingsStore.getState().displayName,
                resolved: false,
              }
            : {}),
          ...(type === "section" ? { title: "Section", opacity: 100 } : {}),
          ...(type === "frame" ? { title: "", showTitle: true, opacity: 100 } : {}),
          ...(type === "column" ? { title: "Column", collapsed: false } : {}),
          ...(type === "shape"
            ? {
                shape: "rectangle",
                fill: "transparent",
                stroke: "currentColor",
                strokeWidth: 2,
                cornerRadius: 12,
              }
            : {}),
          ...(type === "color_swatch" ? { color: "#6366f1", label: "" } : {}),
          ...(type === "board" ? { title: "Board", itemCount: 0 } : {}),
          ...(type === "folder"
            ? { title: "Folder", icon: "folder", iconColor: "", itemCount: 0 }
            : {}),
          ...(type === "code"
            ? { code: "", language: "plaintext", showLineNumbers: true, wrap: false }
            : {}),
          ...(type === "pdf" || type === "video"
            ? { filename: "", assetId: "", remoteUrl: "", sourceType: "local" }
            : {}),
          ...(type === "embed" ? { remoteUrl: "" } : {}),
          ...(type === "audio"
            ? { filename: "", assetId: "", remoteUrl: "", sourceType: "local" }
            : {}),
          ...(type === "table"
            ? {
                title: "Table",
                table: createDefaultTable(),
              }
            : {}),
          ...(type === "drawing" ? { points: [], strokeColor: "#ef4444", strokeWidth: 3 } : {}),
        },
        style: { width: def.defaultWidth, minHeight: def.defaultHeight },
      };
      const next = [...get().nodes.map((n) => ({ ...n, selected: false })), newNode];
      commitNodes(next);
      markNodeDirty(newNode);
      scheduleFlush();
      // History: baseline is the board before this node was added.
      pushHistoryAfterChange({
        nodes: get().nodes.filter((n) => n.id !== newNode.id),
        edges: get().edges,
      });
    },

    updateNodeData: (id, data) => {
      const next = withTopZ(
        get().nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
        id,
      ) as CanvasNode[];
      commitNodes(next);
      const node = next.find((n) => n.id === id);
      if (node) {
        markNodeDirty(node);
        scheduleFlush();
      }
    },

    updateNodeDataWithHistory: (id, data) => {
      pushHistoryAfterChange();
      const next = withTopZ(
        get().nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
        id,
      ) as CanvasNode[];
      commitNodes(next);
      const node = next.find((n) => n.id === id);
      if (node) {
        markNodeDirty(node);
        scheduleFlush();
      }
    },

    updateNodeSize: (id, width, height) => {
      const next = withTopZ(
        get().nodes.map((n) =>
          n.id === id ? { ...n, style: { ...n.style, width, minHeight: height } } : n,
        ),
        id,
      ) as CanvasNode[];
      commitNodes(next);
      const node = next.find((n) => n.id === id);
      if (node) {
        markNodeDirty(node);
        scheduleFlush();
      }
    },

    updateNodePosition: (id, x, y) => {
      const next = withTopZ(
        get().nodes.map((n) => (n.id === id ? { ...n, position: { x, y } } : n)),
        id,
      ) as CanvasNode[];
      commitNodes(next);
      const node = next.find((n) => n.id === id);
      if (node) {
        markNodeDirty(node);
        scheduleFlush();
      }
    },

    deleteNode: (id) => {
      // History: push state before deletion.
      pushHistoryAfterChange();
      const next = get().nodes.filter((n) => n.id !== id);
      commitNodes(next);
      markNodeDeleted(id);
      scheduleFlush();
    },

    setSelectedIds: (ids) => {
      const next = get().nodes.map((n) => ({ ...n, selected: ids.includes(n.id) }));
      commitNodes(next);
    },

    selectAll: () => {
      const next = get().nodes.map((n) => ({ ...n, selected: true }));
      commitNodes(next);
    },

    clearSelection: () => {
      const next = get().nodes.map((n) => (n.selected ? { ...n, selected: false } : n));
      commitNodes(next);
    },

    deleteSelected: () => {
      const ids = new Set(get().selectedNodeIds);
      if (ids.size === 0) return;
      // History: push state before deletion.
      pushHistoryAfterChange();
      const next = get().nodes.filter((n) => !ids.has(n.id));
      commitNodes(next);
      ids.forEach(markNodeDeleted);
      const remainingEdges = get().edges.filter((e) => !ids.has(e.source) && !ids.has(e.target));
      const removedEdges = get().edges.filter((e) => ids.has(e.source) || ids.has(e.target));
      set({ edges: remainingEdges });
      removedEdges.forEach((e) => markEdgeDeleted(e.id));
      scheduleFlush();
    },

    copySelected: () => {
      const sel = get().nodes.filter((n) => n.selected);
      clipboard = sel.map((n) => ({
        ...n,
        id: `${n.id}__copy`,
        selected: false,
        data: { ...n.data },
        style: { ...n.style },
      }));
    },

    cutSelected: () => {
      get().copySelected();
      get().deleteSelected();
    },

    duplicateSelected: () => {
      const sel = get().nodes.filter((n) => n.selected);
      if (sel.length === 0) return;
      const idMap = new Map<string, string>();
      const clones = sel.map((n) => {
        const newId = nanoid();
        idMap.set(n.id, newId);
        return {
          ...n,
          id: newId,
          selected: true,
          position: { x: n.position.x + 24, y: n.position.y + 24 },
          data: { ...n.data },
          style: { ...n.style },
        } as CanvasNode;
      });
      const others = get().nodes.map((n) => ({ ...n, selected: false }));
      const next = [...others, ...clones];
      commitNodes(next);
      const selIds = new Set(sel.map((n) => n.id));
      const newEdges = get()
        .edges.filter((e) => selIds.has(e.source) && selIds.has(e.target))
        .map((e) => ({
          ...e,
          id: nanoid(),
          source: idMap.get(e.source)!,
          target: idMap.get(e.target)!,
          selected: false,
        }));
      if (newEdges.length) set({ edges: [...get().edges, ...newEdges] });
      clones.forEach((n) => {
        markNodeDirty(n);
      });
      newEdges.forEach((e) => markEdgeDirty(e));
      scheduleFlush();
    },

    pasteAt: (position) => {
      if (clipboard.length === 0) return;
      const idMap = new Map<string, string>();
      const clones = clipboard.map((n) => {
        const newId = nanoid();
        idMap.set(n.id, newId);
        return {
          ...n,
          id: newId,
          selected: true,
          position: {
            x: position.x + (n.position.x - clipboard[0]!.position.x),
            y: position.y + (n.position.y - clipboard[0]!.position.y),
          },
          data: { ...n.data },
          style: { ...n.style },
        } as CanvasNode;
      });
      const others = get().nodes.map((n) => ({ ...n, selected: false }));
      const next = [...others, ...clones];
      commitNodes(next);
      const clipboardIds = new Set(clipboard.map((n) => n.id));
      const newEdges = get()
        .edges.filter((e) => clipboardIds.has(e.source) && clipboardIds.has(e.target))
        .map((e) => ({
          ...e,
          id: nanoid(),
          source: idMap.get(e.source)!,
          target: idMap.get(e.target)!,
          selected: false,
        }));
      if (newEdges.length) set({ edges: [...get().edges, ...newEdges] });
      clones.forEach((n) => markNodeDirty(n));
      newEdges.forEach((e) => markEdgeDirty(e));
      scheduleFlush();
    },

    bringToFront: (id) => {
      pushHistoryAfterChange();
      const maxZ = get().nodes.reduce((m, n) => Math.max(m, n.zIndex ?? 0), 0);
      const next = get().nodes.map((n) => (n.id === id ? { ...n, zIndex: maxZ + 1 } : n));
      commitNodes(next);
      const node = next.find((n) => n.id === id);
      if (node) {
        markNodeDirty(node);
        scheduleFlush();
      }
    },

    sendToBack: (id) => {
      pushHistoryAfterChange();
      const minZ = get().nodes.reduce(
        (m, n) => Math.min(m, n.zIndex ?? 0),
        Number.POSITIVE_INFINITY,
      );
      const base = Number.isFinite(minZ) ? minZ - 1 : -1;
      const next = get().nodes.map((n) => (n.id === id ? { ...n, zIndex: base } : n));
      commitNodes(next);
      const node = next.find((n) => n.id === id);
      if (node) {
        markNodeDirty(node);
        scheduleFlush();
      }
    },

    bringForward: (id) => {
      pushHistoryAfterChange();
      const sorted = [...get().nodes].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
      const idx = sorted.findIndex((n) => n.id === id);
      if (idx < 0 || idx === sorted.length - 1) return;
      const swap = sorted[idx + 1];
      if (!swap) return;
      const cur = sorted[idx]!;
      const next = get().nodes.map((n) => {
        if (n.id === id) return { ...n, zIndex: swap.zIndex ?? 0 };
        if (n.id === swap.id) return { ...n, zIndex: cur.zIndex ?? 0 };
        return n;
      }) as CanvasNode[];
      commitNodes(next);
      next
        .filter((n) => n.id === id || n.id === swap.id)
        .forEach((n) => {
          markNodeDirty(n);
          scheduleFlush();
        });
    },

    sendBackward: (id) => {
      pushHistoryAfterChange();
      const sorted = [...get().nodes].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
      const idx = sorted.findIndex((n) => n.id === id);
      if (idx <= 0) return;
      const swap = sorted[idx - 1];
      if (!swap) return;
      const cur = sorted[idx]!;
      const next = get().nodes.map((n) => {
        if (n.id === id) return { ...n, zIndex: swap.zIndex ?? 0 };
        if (n.id === swap.id) return { ...n, zIndex: cur.zIndex ?? 0 };
        return n;
      }) as CanvasNode[];
      commitNodes(next);
      next
        .filter((n) => n.id === id || n.id === swap.id)
        .forEach((n) => {
          markNodeDirty(n);
          scheduleFlush();
        });
    },

    alignSelected: (edge) => {
      pushHistoryAfterChange();
      const sel = get().nodes.filter((n) => n.selected);
      if (sel.length < 2) return;
      const left = (n: CanvasNode) => n.position.x - (n.style?.width as number) / 2;
      const right = (n: CanvasNode) => n.position.x + (n.style?.width as number) / 2;
      const top = (n: CanvasNode) => n.position.y - (n.style?.minHeight as number) / 2;
      const bottom = (n: CanvasNode) => n.position.y + (n.style?.minHeight as number) / 2;

      const targets = {
        left: Math.min(...sel.map(left)),
        right: Math.max(...sel.map(right)),
        top: Math.min(...sel.map(top)),
        bottom: Math.max(...sel.map(bottom)),
        centerX: (Math.min(...sel.map(left)) + Math.max(...sel.map(right))) / 2,
        centerY: (Math.min(...sel.map(top)) + Math.max(...sel.map(bottom))) / 2,
      }[edge];

      applyToSelected((n) => {
        let { x, y } = n.position;
        const w = n.style?.width as number;
        const h = n.style?.minHeight as number;
        if (edge === "left") x = (targets as number) + w / 2;
        else if (edge === "right") x = (targets as number) - w / 2;
        else if (edge === "centerX") x = targets as number;
        else if (edge === "top") y = (targets as number) + h / 2;
        else if (edge === "bottom") y = (targets as number) - h / 2;
        else if (edge === "centerY") y = targets as number;
        return { ...n, position: { x, y } };
      });
    },

    distributeSelected: (axis) => {
      pushHistoryAfterChange();
      const sel = get()
        .nodes.filter((n) => n.selected)
        .sort((a, b) =>
          axis === "horizontal" ? a.position.x - b.position.x : a.position.y - b.position.y,
        );
      if (sel.length < 3) return;
      const span =
        axis === "horizontal"
          ? sel[sel.length - 1]!.position.x - sel[0]!.position.x
          : sel[sel.length - 1]!.position.y - sel[0]!.position.y;
      const step = span / (sel.length - 1);
      const first = sel[0]!.position;
      applyToSelected((n) => {
        const i = sel.findIndex((s) => s.id === n.id);
        if (i <= 0 || i >= sel.length - 1) return n;
        if (axis === "horizontal") {
          return { ...n, position: { x: first.x + step * i, y: n.position.y } };
        }
        return { ...n, position: { x: n.position.x, y: first.y + step * i } };
      });
    },

    matchSizeSelected: (dim) => {
      pushHistoryAfterChange();
      const sel = get().nodes.filter((n) => n.selected);
      if (sel.length < 2) return;
      const ref =
        dim === "width" ? (sel[0]!.style?.width as number) : (sel[0]!.style?.minHeight as number);
      applyToSelected((n) => ({
        ...n,
        style: {
          ...n.style,
          ...(dim === "width" ? { width: ref } : { minHeight: ref }),
        },
      }));
    },

    setColorSelected: (color) => {
      pushHistoryAfterChange();
      applyToSelected((n) => ({ ...n, data: { ...n.data, color } }));
    },

    setBackgroundColorSelected: (hex) => {
      pushHistoryAfterChange();
      applyToSelected((n) => ({ ...n, data: { ...n.data, backgroundColor: hex } }));
    },

    patchSelectedData: (patch) => {
      pushHistoryAfterChange();
      applyToSelected((n) => ({ ...n, data: { ...n.data, ...patch } }));
    },

    setRotationSelected: (deg) => {
      pushHistoryAfterChange();
      applyToSelected((n) => ({ ...n, data: { ...n.data, rotation: deg } }));
    },

    setOpacitySelected: (opacity) => {
      pushHistoryAfterChange();
      applyToSelected((n) => ({ ...n, data: { ...n.data, opacity } }));
    },

    setPositionSelected: (id, x, y) => {
      pushHistoryAfterChange();
      const next = get().nodes.map((n) =>
        n.id === id ? { ...n, position: { x, y } } : n,
      ) as CanvasNode[];
      commitNodes(next);
      const node = next.find((n) => n.id === id);
      if (node) {
        markNodeDirty(node);
        scheduleFlush();
      }
    },

    setSizeSelected: (id, width, height) => {
      pushHistoryAfterChange();
      const next = get().nodes.map((n) =>
        n.id === id ? { ...n, style: { ...n.style, width, minHeight: height } } : n,
      ) as CanvasNode[];
      commitNodes(next);
      const node = next.find((n) => n.id === id);
      if (node) {
        markNodeDirty(node);
        scheduleFlush();
      }
    },

    setWidthSelected: (width) => {
      pushHistoryAfterChange();
      applyToSelected((n) => ({ ...n, style: { ...n.style, width } }));
    },

    setHeightSelected: (height) => {
      pushHistoryAfterChange();
      applyToSelected((n) => ({ ...n, style: { ...n.style, minHeight: height } }));
    },

    setLockedSelected: (locked) => {
      pushHistoryAfterChange();
      applyToSelected((n) => ({ ...n, data: { ...n.data, locked } }));
    },

    groupSelected: () => {
      pushHistoryAfterChange();
      const sel = get().nodes.filter((n) => n.selected);
      if (sel.length < 2) return;
      const groupId = nanoid();
      applyToSelected((n) => ({ ...n, data: { ...n.data, groupId } }));
    },

    ungroupSelected: () => {
      pushHistoryAfterChange();
      applyToSelected((n) => {
        const { groupId, ...rest } = n.data;
        return { ...n, data: rest as CanvasNodeData };
      });
    },

    pushHistory: () => {
      pushHistoryAfterChange();
    },

    undo: () => {
      flushPendingHistory();
      const snapshot = useHistoryStore.getState().undo();
      if (!snapshot) return;
      set({
        nodes: snapshot.nodes as CanvasNode[],
        edges: snapshot.edges as CanvasEdge[],
        selectedNodeIds: snapshot.nodes.filter((n) => n.selected).map((n) => n.id),
      });
      // Mark all restored nodes and edges dirty for persistence.
      snapshot.nodes.forEach((n) => {
        const store = get();
        store.onNodesChange([
          { id: n.id, type: "position", dragging: false, position: n.position },
        ]);
      });
      (snapshot.edges as CanvasEdge[]).forEach((e) => {
        markEdgeDirty(e);
      });
      scheduleFlush();
    },

    redo: () => {
      flushPendingHistory();
      const snapshot = useHistoryStore.getState().redo();
      if (!snapshot) return;
      set({
        nodes: snapshot.nodes as CanvasNode[],
        edges: snapshot.edges as CanvasEdge[],
        selectedNodeIds: snapshot.nodes.filter((n) => n.selected).map((n) => n.id),
      });
      snapshot.nodes.forEach((n) => {
        const store = get();
        store.onNodesChange([
          { id: n.id, type: "position", dragging: false, position: n.position },
        ]);
      });
      (snapshot.edges as CanvasEdge[]).forEach((e) => {
        markEdgeDirty(e);
      });
      scheduleFlush();
    },
  };
});

export const getSelectedNodes = () => useCanvasStore.getState().nodes.filter((n) => n.selected);

// Best-effort data safety: flush on hide and keep recovery snapshot for crash window
if (typeof window !== "undefined") {
  const onHide = () => {
    if (document.visibilityState === "hidden") {
      const s = useCanvasStore.getState();
      if (s.pendingChanges > 0) void s.flushNow();
      try {
        localStorage.setItem(
          "sutonote:recovery",
          JSON.stringify({ nodes: s.nodes, edges: s.edges, at: Date.now() }),
        );
      } catch {
        // Recovery is best-effort; persistence errors are surfaced by the
        // normal save status instead of interrupting page hide handling.
      }
    }
  };
  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("beforeunload", onHide);
}
