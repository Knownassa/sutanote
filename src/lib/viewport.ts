import type { Viewport } from "reactflow";

const KEY = "sutonote:viewport";

export function loadViewport(): Viewport | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const vp = JSON.parse(raw) as Viewport;
    if (typeof vp.x === "number" && typeof vp.y === "number" && typeof vp.zoom === "number") {
      return vp;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveViewport(vp: Viewport): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(vp));
  } catch {
    // Ignore quota / availability errors — viewport is best-effort.
  }
}
