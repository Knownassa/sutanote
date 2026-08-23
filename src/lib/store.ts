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
import { saveNode, loadNodes, deleteNode } from "./db";

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
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<CanvasNodeData>) => void;
  setSelected: (id: string | null) => void;
  loadNodes: () => Promise<void>;
  removeNode: (id: string) => void;
  deleteNode: (id: string) => void;
  setNodeZ: (id: string, z: number) => void;
}

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

function debounceSave(node: CanvasNode) {
  const existingTimer = debounceTimers.get(node.id);
  if (existingTimer) clearTimeout(existingTimer);

  const timer = setTimeout(async () => {
    await saveNode({
      id: node.id,
      type: node.type ?? "sticky",
      position: node.position,
      data: node.data,
      width: node.width ?? null,
      height: node.height ?? null,
      z_index: (node.zIndex ?? 0) as number,
    });
    debounceTimers.delete(node.id);
  }, 500);
  debounceTimers.set(node.id, timer);
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

  onNodesChange: (changes) => {
    set((state) => {
      const newNodes = applyNodeChanges(changes, state.nodes) as CanvasNode[];
      changes.forEach((change) => {
        if (change.type === "position" && change.dragging === false) {
          const node = newNodes.find((n) => n.id === change.id);
          if (node) debounceSave(node);
        }
      });
      return { nodes: newNodes };
    });
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
        text: type === "sticky" ? "" : type === "todo" ? "" : "",
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

    set((state) => ({ nodes: [...state.nodes, newNode], selectedNodeId: newNode.id }));
    saveNode({
      id: newNode.id,
      type: newNode.type ?? "sticky",
      position: newNode.position,
      data: newNode.data,
      width: (newNode.style?.width as number) ?? null,
      height: (newNode.style?.minHeight as number) ?? null,
      z_index: 0,
    });
  },

  updateNodeData: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
      ) as CanvasNode[],
    }));
    const node = get().nodes.find((n) => n.id === id);
    if (node) debounceSave(node);
  },

  setSelected: (id) => set({ selectedNodeId: id }),

  loadNodes: async () => {
    const savedNodes = await loadNodes();
    const nodes: CanvasNode[] = savedNodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position as { x: number; y: number },
      data: n.data as CanvasNodeData,
      style: { width: n.width ?? 240, minHeight: n.height ?? 120 },
      zIndex: n.z_index,
    }));
    set({ nodes });
  },

  removeNode: (id) => {
    set((state) => ({ nodes: state.nodes.filter((n) => n.id !== id) }));
    deleteNode(id);
  },

  deleteNode: (id) => {
    set((state) => ({ nodes: state.nodes.filter((n) => n.id !== id) }));
    deleteNode(id);
  },

  setNodeZ: (id, z) => {
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, zIndex: z } : n)),
    }));
    const node = get().nodes.find((n) => n.id === id);
    if (node) debounceSave(node);
  },
}));
