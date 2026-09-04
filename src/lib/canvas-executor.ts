import type { XYPosition } from "reactflow";
import { getItemDef } from "./item-registry";
import { useCanvasStore } from "./store";
import { useInteractionStore, type CanvasTool } from "./interaction-store";

export const SUTONOTE_ITEM_MIME = "application/x-sutonote-item";

export function setCanvasItemDragData(dataTransfer: DataTransfer, type: string) {
  dataTransfer.effectAllowed = "copy";
  dataTransfer.setData(SUTONOTE_ITEM_MIME, type);
  dataTransfer.setData("text/plain", type);
}

export type CanvasExecutionContext = {
  position?: XYPosition;
  onAction?: (type: string) => void;
  preserveTool?: boolean;
};

const TOOL_TYPES = new Set<CanvasTool>([
  "select",
  "hand",
  "connector",
  "pen",
  "highlighter",
  "eraser",
]);

export function isCanvasTool(type: string): type is CanvasTool {
  return TOOL_TYPES.has(type as CanvasTool);
}

/** Single execution boundary shared by the dock, picker, palette, and shortcuts. */
export function executeCanvasItem(type: string, context: CanvasExecutionContext = {}): boolean {
  if (type === "select" || type === "hand") {
    useInteractionStore.getState().setActiveTool(type);
    return true;
  }
  const item = getItemDef(type);
  if (!item || item.status === "coming-soon") return false;

  if (item.kind === "tool") {
    if (!isCanvasTool(item.type)) return false;
    useInteractionStore.getState().setActiveTool(item.type);
    return true;
  }

  if (item.kind === "action") {
    context.onAction?.(item.type);
    return Boolean(context.onAction);
  }

  const nodes = useCanvasStore.getState().nodes;
  const position =
    context.position ??
    ({
      x: nodes.reduce((max, node) => Math.max(max, node.position.x), 0) + 300,
      y: 0,
    } satisfies XYPosition);
  useCanvasStore.getState().addNode(item.type, position);
  if (!context.preserveTool) useInteractionStore.getState().setActiveTool("select");
  return true;
}
