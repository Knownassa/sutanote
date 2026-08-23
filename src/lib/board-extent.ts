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
 * Full recompute from all nodes. Only call on load / board switch / bulk
 * operations — never on every drag frame.
 */
export function computeExtentForAllNodes(nodes: CanvasNode[]): BoardExtent {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    const w = (n.style?.width as number) ?? 200;
    const h = (n.style?.minHeight as number) ?? 120;
    minX = Math.min(minX, n.position.x - w / 2 - CONTENT_PADDING);
    minY = Math.min(minY, n.position.y - h / 2 - CONTENT_PADDING);
    maxX = Math.max(maxX, n.position.x + w / 2 + CONTENT_PADDING);
    maxY = Math.max(maxY, n.position.y + h / 2 + CONTENT_PADDING);
  }
  if (!Number.isFinite(minX)) {
    return [
      [-800, -600],
      [800, 600],
    ];
  }
  return [
    [minX, minY],
    [maxX, maxY],
  ];
}

/**
 * O(1) incremental expansion for a single node during drag/resize.
 * `x`/`y` are the node center (nodeOrigin 0.5). Returns the same reference
 * when no edge is approached, so React state updates stay no-ops.
 */
export function ensureExtentForNode(
  prev: BoardExtent,
  x: number,
  y: number,
  w: number,
  h: number,
): BoardExtent {
  const [min, max] = prev;
  let [minX, minY] = min;
  let [maxX, maxY] = max;
  let changed = false;

  const left = x - w / 2;
  const right = x + w / 2;
  const top = y - h / 2;
  const bottom = y + h / 2;

  if (left < minX + BOARD_EDGE_THRESHOLD) {
    minX -= BOARD_EXPAND_STEP;
    changed = true;
  }
  if (top < minY + BOARD_EDGE_THRESHOLD) {
    minY -= BOARD_EXPAND_STEP;
    changed = true;
  }
  if (right > maxX - BOARD_EDGE_THRESHOLD) {
    maxX += BOARD_EXPAND_STEP;
    changed = true;
  }
  if (bottom > maxY - BOARD_EDGE_THRESHOLD) {
    maxY += BOARD_EXPAND_STEP;
    changed = true;
  }

  return changed
    ? [
        [minX, minY],
        [maxX, maxY],
      ]
    : prev;
}
