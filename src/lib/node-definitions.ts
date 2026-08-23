export type ResizeMode = "none" | "width" | "both" | "width-content";

export interface NodeDefinition {
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  resizeMode: ResizeMode;
  preserveAspectRatio?: boolean;
  /** Which property controls the editable text body (for caret/editing rules). */
  editableText?: boolean;
}

export const NODE_DEFINITIONS: Record<string, NodeDefinition> = {
  text: {
    defaultWidth: 280,
    defaultHeight: 120,
    minWidth: 200,
    minHeight: 80,
    maxWidth: 520,
    resizeMode: "width-content",
    editableText: true,
  },
  sticky: {
    defaultWidth: 220,
    defaultHeight: 180,
    minWidth: 180,
    minHeight: 140,
    maxWidth: 420,
    resizeMode: "both",
  },
  todo: {
    defaultWidth: 300,
    defaultHeight: 160,
    minWidth: 240,
    minHeight: 120,
    maxWidth: 520,
    resizeMode: "both",
  },
  image: {
    defaultWidth: 280,
    defaultHeight: 220,
    minWidth: 120,
    minHeight: 120,
    maxWidth: 1200,
    maxHeight: 1200,
    resizeMode: "both",
    preserveAspectRatio: true,
  },
};

const FALLBACK: NodeDefinition = {
  defaultWidth: 180,
  defaultHeight: 120,
  minWidth: 140,
  minHeight: 90,
  resizeMode: "both",
};

export function getNodeDef(type: string): NodeDefinition {
  return NODE_DEFINITIONS[type] ?? FALLBACK;
}
