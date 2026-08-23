import type { Node, Edge } from "reactflow";

export type PersistenceStatus = "clean" | "dirty" | "saving" | "saved" | "error";

export interface CanvasNodeData {
  text: string;
  color: string;
  rotation?: number;
  todos?: Array<{ label: string; done: boolean }>;
  [key: string]: unknown;
}

export type CanvasNode = Node<CanvasNodeData>;
export type CanvasEdge = Edge;

export const DEFAULT_BOARD_ID = "00000000-0000-0000-0000-000000000001";
