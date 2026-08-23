import type { Node, Edge } from "reactflow";

export type PersistenceStatus = "clean" | "dirty" | "saving" | "saved" | "error";

export interface CanvasNodeData {
  text: string;
  color: string;
  rotation?: number;
  todos?: Array<{ label: string; done: boolean }>;
  // Optional domain fields used by the workspace UI.
  title?: string;
  src?: string;
  caption?: string;
  captionVisible?: boolean;
  alt?: string;
  assetId?: string;
  locked?: boolean;
  groupId?: string;
  fontSize?: number;
  textAlign?: "left" | "center" | "right";
  bold?: boolean;
  italic?: boolean;
  textColor?: string;
  showCompleted?: boolean;
  // Link node fields.
  url?: string;
  description?: string;
  // File node fields.
  filename?: string;
  mime?: string;
  // Comment node fields.
  author?: string;
  resolved?: boolean;
  [key: string]: unknown;
}

export type CanvasNode = Node<CanvasNodeData>;
export type CanvasEdge = Edge;

export const DEFAULT_BOARD_ID = "00000000-0000-0000-0000-000000000001";
