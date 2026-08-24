export type ResizeMode = "none" | "width" | "both" | "width-content";

/** Canonical card width for all newly created standard items. */
export const DEFAULT_ITEM_WIDTH = 280;

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
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 120,
    minWidth: 200,
    minHeight: 80,
    maxWidth: 520,
    resizeMode: "width-content",
    editableText: true,
  },
  sticky: {
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 180,
    minWidth: 180,
    minHeight: 140,
    maxWidth: 420,
    resizeMode: "both",
  },
  todo: {
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 160,
    minWidth: 240,
    minHeight: 120,
    maxWidth: 520,
    resizeMode: "both",
  },
  image: {
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 220,
    minWidth: 120,
    minHeight: 120,
    maxWidth: 1200,
    maxHeight: 1200,
    resizeMode: "both",
    preserveAspectRatio: true,
  },
  link: {
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 100,
    minWidth: 200,
    minHeight: 60,
    maxWidth: 520,
    resizeMode: "width",
  },
  file: {
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 80,
    minWidth: 180,
    minHeight: 60,
    maxWidth: 520,
    resizeMode: "width",
  },
  comment: {
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 100,
    minWidth: 180,
    minHeight: 60,
    maxWidth: 420,
    resizeMode: "width",
    editableText: true,
  },
  section: {
    defaultWidth: 560,
    defaultHeight: 360,
    minWidth: 280,
    minHeight: 180,
    maxWidth: 1200,
    maxHeight: 900,
    resizeMode: "both",
  },
  shape: {
    defaultWidth: 120,
    defaultHeight: 120,
    minWidth: 60,
    minHeight: 60,
    maxWidth: 400,
    maxHeight: 400,
    resizeMode: "both",
  },
  color_swatch: {
    defaultWidth: 140,
    defaultHeight: 100,
    minWidth: 100,
    minHeight: 80,
    maxWidth: 280,
    maxHeight: 200,
    resizeMode: "width",
  },
  folder: {
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 100,
    minWidth: 220,
    minHeight: 80,
    maxWidth: 420,
    resizeMode: "width",
  },
  board: {
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 100,
    minWidth: 220,
    minHeight: 80,
    maxWidth: 420,
    resizeMode: "width",
  },
  column: {
    defaultWidth: 300,
    defaultHeight: 400,
    minWidth: 240,
    minHeight: 200,
    maxWidth: 600,
    maxHeight: 800,
    resizeMode: "both",
  },
  frame: {
    defaultWidth: 400,
    defaultHeight: 300,
    minWidth: 200,
    minHeight: 150,
    maxWidth: 1200,
    maxHeight: 900,
    resizeMode: "both",
  },
  pdf: {
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 100,
    minWidth: 200,
    minHeight: 80,
    maxWidth: 520,
    resizeMode: "width",
  },
  video: {
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 200,
    minWidth: 280,
    minHeight: 160,
    maxWidth: 800,
    maxHeight: 600,
    resizeMode: "both",
    preserveAspectRatio: true,
  },
  embed: {
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 200,
    minWidth: 280,
    minHeight: 160,
    maxWidth: 800,
    maxHeight: 600,
    resizeMode: "both",
  },
  code: {
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 200,
    minWidth: 280,
    minHeight: 140,
    maxWidth: 800,
    resizeMode: "both",
    editableText: true,
  },
};

const FALLBACK: NodeDefinition = {
  defaultWidth: DEFAULT_ITEM_WIDTH,
  defaultHeight: 120,
  minWidth: 140,
  minHeight: 90,
  resizeMode: "both",
};

export function getNodeDef(type: string): NodeDefinition {
  return NODE_DEFINITIONS[type] ?? FALLBACK;
}
