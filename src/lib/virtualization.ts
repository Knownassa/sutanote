/**
 * Viewport virtualization policy.
 *
 * React Flow's `onlyRenderVisibleElements` skips mounting nodes outside the
 * viewport. It costs an extra intersection pass per viewport change, so on
 * small boards it is a net loss — we enable it adaptively.
 *
 * Hysteresis avoids flapping (mount/unmount storms) when the node count sits
 * right at the threshold, e.g. while pasting or deleting a few items.
 */
export const VIRTUALIZE_ON_AT = 150;
export const VIRTUALIZE_OFF_AT = 120;

export function shouldVirtualize(nodeCount: number, currentlyVirtualized: boolean): boolean {
  if (currentlyVirtualized) return nodeCount > VIRTUALIZE_OFF_AT;
  return nodeCount >= VIRTUALIZE_ON_AT;
}
