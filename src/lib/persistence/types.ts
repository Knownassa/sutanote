import type { Node, Edge } from "reactflow";

export type PersistenceStatus = "clean" | "dirty" | "saving" | "saved" | "error";

export interface TableColumn {
  id: string;
  label: string;
  kind?: "text" | "number" | "checkbox" | "date";
  width?: number;
}

export interface TableRow {
  id: string;
  cells: string[];
}

export interface TableData {
  columns: TableColumn[];
  rows: TableRow[];
}

export interface DrawingPoint {
  x: number;
  y: number;
}

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
  // Custom color support.
  backgroundColor?: string;
  // Highlight color for text emphasis.
  highlight?: string;
  // Rich text
  content?: string;
  plainText?: string;
  richText?: { version: number; json: unknown };
  // Link node fields.
  url?: string;
  description?: string;
  // File node fields.
  filename?: string;
  mime?: string;
  // Comment node fields.
  author?: string;
  resolved?: boolean;
  createdAt?: number;
  updatedAt?: number;
  // Shared asset fields
  remoteUrl?: string;
  sourceType?: "local" | "remote";
  table?: TableData;
  points?: DrawingPoint[];
  strokeColor?: string;
  // Appearance
  opacity?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  shape?: string;
  cornerRadius?: number;
  label?: string;
  // Container / hierarchy
  parentId?: string;
  childOrder?: string[];
  gap?: number;
  padding?: number;
  autoHeight?: boolean;
  [key: string]: unknown;
}

export type CanvasNode = Node<CanvasNodeData>;
export type CanvasEdge = Edge;

export const DEFAULT_BOARD_ID = "00000000-0000-0000-0000-000000000001";
