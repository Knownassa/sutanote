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
import { loadNodesByBoard } from "./persistence/node-repository";
import { loadEdgesByBoard } from "./persistence/edge-repository";
import { getNodeDef } from "./node-definitions";
import { flushBoard } from "./persistence/persistence-manager";
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
  selectedNodeId: string | null;
  isLoaded: boolean;
  persistenceStatus: PersistenceStatus;
  lastSavedAt: number | null;
  lastSaveError: string | null;
  pendingChanges: number;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<CanvasNodeData>) => void;
  updateNodeSize: (id: string, width: number, height: number) => void;
  deleteNode: (id: string) => void;
  setSelected: (id: string | null) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  flushNow: () => Promise<void>;
  initializeStore: () => Promise<void>;
}

const defaultColors: Record<string, string> = {
  text: "bg-card",
  sticky: "bg-note-yellow",
  todo: "bg-card",
  image: "bg-card",
};

const SAVE_DELAY = 500;

const queueSize = () =>
  dirtyNodes.size + dirtyEdges.size + deletedNodeIds.size + deletedEdgeIds.size;

// Entity-level persistence queue — lives outside React state so it is not
// recreated on every render and survives across store updates.
const dirtyNodes = new Map<string, CanvasNode>();
const deletedNodeIds = new Set<string>();
const dirtyEdges = new Map<string, CanvasEdge>();
const deletedEdgeIds = new Set<string>();

let flushTimer: ReturnType<typeof setTimeout> | undefined;
let flushing = false;

export const useCanvasStore = create<CanvasState>((set, get) => {
  const markNodeDirty = (node: CanvasNode) => {
    deletedNodeIds.delete(node.id);
    dirtyNodes.set(node.id, node);
  };

  const markNodeDeleted = (id: string) => {
    dirtyNodes.delete(id);
    deletedNodeIds.add(id);
    // Cascade: any edge touching this node must also go.
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
    // If a flush is already scheduled, let it run — do not stack timers.
    if (flushTimer) return;
    flushTimer = setTimeout(async () => {
      // Reset first so mutations during the flush can reschedule cleanly.
      flushTimer = undefined;
      await get().flushNow();
    }, SAVE_DELAY);
  };

  return {
    nodes: [],
    edges: [],
    selectedNodeId: null,
    isLoaded: false,
    persistenceStatus: "clean",
    lastSavedAt: null,
    lastSaveError: null,
    pendingChanges: 0,

    flushNow: async () => {
      if (flushing) return;
      // Snapshot the current queue. Mutations during the flush create NEW
      // entries/objects, so we must not clear anything that changed.
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
        await flushBoard(DEFAULT_BOARD_ID, dn, dd, de, dde);
        // Clear only entries that are still exactly what we flushed. Anything
        // replaced mid-flush (reference differs) stays dirty and re-flushes.
        for (const [id, snap] of dn) {
          if (dirtyNodes.get(id) === snap) dirtyNodes.delete(id);
        }
        for (const id of dd) {
          // Keep it deleted only if it wasn't re-created during the flush.
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
        // If new changes arrived during the flush, keep the cycle alive.
        if (queueSize() > 0 && !flushTimer) {
          flushTimer = setTimeout(() => void get().flushNow(), SAVE_DELAY);
        }
      }
    },

    initializeStore: async () => {
      if (get().isLoaded) return;
      await initDB();
      const dbNodes = await loadNodesByBoard(DEFAULT_BOARD_ID);
      const dbEdges = await loadEdgesByBoard(DEFAULT_BOARD_ID);

      if (dbNodes.length > 0) {
        set({
          nodes: dbNodes as CanvasNode[],
          edges: dbEdges as CanvasEdge[],
          isLoaded: true,
          persistenceStatus: "saved",
          lastSavedAt: Date.now(),
          pendingChanges: 0,
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
            text: "Press T to add a text note, S for a sticky, D for a todo list. Arrow keys nudge selected items.",
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
        isLoaded: true,
        persistenceStatus: "dirty",
        pendingChanges: seeded.length,
      });
      seeded.forEach(markNodeDirty);
      scheduleFlush();
    },

    onNodesChange: (changes) => {
      const newNodes = applyNodeChanges(changes, get().nodes) as CanvasNode[];
      set({ nodes: newNodes });

      let touched = false;
      for (const c of changes) {
        if (c.type === "position" || c.type === "dimensions") {
          const node = newNodes.find((n) => n.id === c.id);
          if (node) {
            markNodeDirty(node);
            touched = true;
          }
        } else if (c.type === "remove") {
          markNodeDeleted(c.id);
          touched = true;
        }
      }
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
      const def = getNodeDef(type);
      const newNode: CanvasNode = {
        id: nanoid(),
        type,
        position,
        zIndex: maxZ + 1,
        data: {
          text: "",
          title: type === "text" ? "" : type === "todo" ? "To-do" : "",
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
          ...(type === "image"
            ? {
                src: "",
                caption: "",
              }
            : {}),
        },
        style: { width: def.defaultWidth, minHeight: def.defaultHeight },
      };
      const next = [...get().nodes, newNode];
      set({ nodes: next, selectedNodeId: newNode.id });
      markNodeDirty(newNode);
      scheduleFlush();
    },

    updateNodeData: (id, data) => {
      const newNodes = get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
      ) as CanvasNode[];
      set({ nodes: newNodes });
      const node = newNodes.find((n) => n.id === id);
      if (node) {
        markNodeDirty(node);
        scheduleFlush();
      }
    },

    updateNodeSize: (id, width, height) => {
      const newNodes = get().nodes.map((n) =>
        n.id === id ? { ...n, style: { ...n.style, width, minHeight: height } } : n,
      ) as CanvasNode[];
      set({ nodes: newNodes });
      const node = newNodes.find((n) => n.id === id);
      if (node) {
        markNodeDirty(node);
        scheduleFlush();
      }
    },

    deleteNode: (id) => {
      const newNodes = get().nodes.filter((n) => n.id !== id);
      set({ nodes: newNodes, selectedNodeId: null });
      markNodeDeleted(id);
      scheduleFlush();
    },

    setSelected: (id) => set({ selectedNodeId: id }),

    bringToFront: (id) => {
      const maxZ = get().nodes.reduce((m, n) => Math.max(m, n.zIndex ?? 0), 0);
      const newNodes = get().nodes.map((n) =>
        n.id === id ? { ...n, zIndex: maxZ + 1 } : n,
      ) as CanvasNode[];
      set({ nodes: newNodes });
      const node = newNodes.find((n) => n.id === id);
      if (node) {
        markNodeDirty(node);
        scheduleFlush();
      }
    },

    sendToBack: (id) => {
      const minZ = get().nodes.reduce(
        (m, n) => Math.min(m, n.zIndex ?? 0),
        Number.POSITIVE_INFINITY,
      );
      const base = Number.isFinite(minZ) ? minZ - 1 : -1;
      const newNodes = get().nodes.map((n) =>
        n.id === id ? { ...n, zIndex: base } : n,
      ) as CanvasNode[];
      set({ nodes: newNodes });
      const node = newNodes.find((n) => n.id === id);
      if (node) {
        markNodeDirty(node);
        scheduleFlush();
      }
    },
  };
});
