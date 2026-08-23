import type { CanvasNode } from "./persistence/types";

export type BoardExtent = [[number, number], [number, number]];

const BOARD_EDGE_THRESHOLD = 200;
const BOARD_EXPAND_STEP = 600;
const CONTENT_PADDING = 300;

function nodeBounds(nodes: CanvasNode[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    const w = (n.style?.width as number) ?? 200;
    const h = (n.style?.minHeight as number) ?? 120;
    minX = Math.min(minX, n.position.x - w / 2);
    minY = Math.min(minY, n.position.y - h / 2);
    maxX = Math.max(maxX, n.position.x + w / 2);
    maxY = Math.max(maxY, n.position.y + h / 2);
  }
  if (!Number.isFinite(minX)) {
    minX = 0;
    minY = 0;
    maxX = 0;
    maxY = 0;
  }
  return { minX, minY, maxX, maxY };
}

/**
 * Monotonic expansion. Returns the same reference when nothing needs to grow so
 * React state updates stay no-ops. Expansion never shrinks.
 */
export function computeExtent(prev: BoardExtent, nodes: CanvasNode[]): BoardExtent {
  const [min, max] = prev;
  let [minX, minY] = min;
  let [maxX, maxY] = max;
  let changed = false;

  // Content-bounds safety: always contain all nodes + padding.
  const b = nodeBounds(nodes);
  if (b.minX - CONTENT_PADDING < minX) {
    minX = b.minX - CONTENT_PADDING;
    changed = true;
  }
  if (b.minY - CONTENT_PADDING < minY) {
    minY = b.minY - CONTENT_PADDING;
    changed = true;
  }
  if (b.maxX + CONTENT_PADDING > maxX) {
    maxX = b.maxX + CONTENT_PADDING;
    changed = true;
  }
  if (b.maxY + CONTENT_PADDING > maxY) {
    maxY = b.maxY + CONTENT_PADDING;
    changed = true;
  }

  // Threshold-based chunked expansion as content approaches an edge.
  for (const n of nodes) {
    if (n.position.x < minX + BOARD_EDGE_THRESHOLD && minX > -Infinity) {
      minX -= BOARD_EXPAND_STEP;
      changed = true;
    }
    if (n.position.x > maxX - BOARD_EDGE_THRESHOLD) {
      maxX += BOARD_EXPAND_STEP;
      changed = true;
    }
    if (n.position.y < minY + BOARD_EDGE_THRESHOLD) {
      minY -= BOARD_EXPAND_STEP;
      changed = true;
    }
    if (n.position.y > maxY - BOARD_EDGE_THRESHOLD) {
      maxY += BOARD_EXPAND_STEP;
      changed = true;
    }
  }

  return changed
    ? [
        [minX, minY],
        [maxX, maxY],
      ]
    : prev;
}
