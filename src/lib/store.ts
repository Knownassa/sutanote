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
  rotation?: number;
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
  isSaving: boolean;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<CanvasNodeData>) => void;
  updateNodeSize: (id: string, width: number, height: number) => void;
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

const defaultColors: Record<string, string> = {
  text: "bg-card",
  sticky: "bg-note-yellow",
  todo: "bg-card",
};

export const useCanvasStore = create<CanvasState>((set, get) => {
  // One shared timer saves the whole board 500ms after the last change.
  let saveTimer: ReturnType<typeof setTimeout> | undefined;

  const scheduleSave = (nodes: CanvasNode[]) => {
    if (saveTimer) clearTimeout(saveTimer);
    set({ isSaving: true });
    saveTimer = setTimeout(async () => {
      await saveNodesToDB(nodes.map(toSaved));
      set({ isSaving: false });
    }, 500);
  };

  return {
    nodes: [],
    edges: [],
    selectedNodeId: null,
    isLoaded: false,
    isSaving: false,

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
      if (structural) scheduleSave(newNodes);
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
        },
        style: { width: 240, minHeight: 120 },
      };
      const next = [...get().nodes, newNode];
      set({ nodes: next, selectedNodeId: newNode.id });
      scheduleSave(next);
    },

    updateNodeData: (id, data) => {
      const newNodes = get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
      ) as CanvasNode[];
      set({ nodes: newNodes });
      scheduleSave(newNodes);
    },

    updateNodeSize: (id, width, height) => {
      const newNodes = get().nodes.map((n) =>
        n.id === id ? { ...n, style: { ...n.style, width, minHeight: height } } : n,
      ) as CanvasNode[];
      set({ nodes: newNodes });
      scheduleSave(newNodes);
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
      scheduleSave(newNodes);
    },
  };
});
