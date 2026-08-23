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
import { initDB, loadNodesFromDB, saveNodesToDB, deleteNodeFromDB, type SavedNode } from "./db";

interface CanvasNodeData {
  text: string;
  color: string;
  todos?: Array<{ label: string; done: boolean }>;
  [key: string]: unknown;
}

interface CanvasNode extends Node {
  data: CanvasNodeData;
}

interface CanvasState {
  nodes: CanvasNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  isLoaded: boolean;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<CanvasNodeData>) => void;
  deleteNode: (id: string) => void;
  setSelected: (id: string | null) => void;
  setNodeZ: (id: string, z: number) => void;
  initializeStore: () => Promise<void>;
}

const toSaved = (n: CanvasNode): SavedNode => ({
  id: n.id,
  type: n.type ?? "sticky",
  position: n.position,
  width: (n.style?.width as number) ?? null,
  height: (n.style?.minHeight as number) ?? null,
  data: n.data,
});

// One shared timer saves the entire board 500ms after the last change.
let saveTimeout: ReturnType<typeof setTimeout> | undefined;
function debouncedSave(nodes: CanvasNode[]) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveNodesToDB(nodes.map(toSaved));
  }, 500);
}

const defaultColors: Record<string, string> = {
  text: "bg-card",
  sticky: "bg-note-yellow",
  todo: "bg-card",
};

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isLoaded: false,

  initializeStore: async () => {
    if (get().isLoaded) return;
    await initDB();
    const dbNodes = await loadNodesFromDB();
    set({ nodes: dbNodes as CanvasNode[], isLoaded: true });
  },

  onNodesChange: (changes) => {
    const newNodes = applyNodeChanges(changes, get().nodes) as CanvasNode[];
    set({ nodes: newNodes });
    const structural = changes.some((c) => c.type === "position" || c.type === "dimensions");
    if (structural) debouncedSave(newNodes);
  },

  onEdgesChange: (changes) => {
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) }));
  },

  onConnect: (connection) => {
    set((state) => ({ edges: addEdge(connection, state.edges) }));
  },

  addNode: (type, position) => {
    const newNode: CanvasNode = {
      id: nanoid(),
      type,
      position,
      data: {
        text: "",
        color: defaultColors[type] ?? "bg-note-yellow",
        ...(type === "todo"
          ? {
              todos: [
                { label: "Task 1", done: false },
                { label: "Task 2", done: false },
                { label: "Task 3", done: false },
              ],
            }
          : {}),
      },
      style: { width: 240, minHeight: 120 },
    };
    const next = [...get().nodes, newNode];
    set({ nodes: next, selectedNodeId: newNode.id });
    debouncedSave(next);
  },

  updateNodeData: (id, data) => {
    const newNodes = get().nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
    ) as CanvasNode[];
    set({ nodes: newNodes });
    debouncedSave(newNodes);
  },

  deleteNode: (id) => {
    const newNodes = get().nodes.filter((n) => n.id !== id);
    set({ nodes: newNodes, selectedNodeId: null });
    deleteNodeFromDB(id);
  },

  setSelected: (id) => set({ selectedNodeId: id }),

  setNodeZ: (id, z) => {
    const newNodes = get().nodes.map((n) => (n.id === id ? { ...n, zIndex: z } : n));
    set({ nodes: newNodes });
    debouncedSave(newNodes);
  },
}));
