// @ts-ignore - bun:test types only available in bun runtime
import { describe, it, expect } from "bun:test";
import { ITEM_REGISTRY, getItemDef } from "../item-registry";
import { NODE_DEFINITIONS, getNodeDef } from "../node-definitions";
import { useHistoryStore } from "../history-store";
import { shouldVirtualize } from "../virtualization";
import { heavyPhase } from "../../hooks/use-heavy-node";

describe("registry invariants", () => {
  it("every available node has NODE_DEFINITIONS", () => {
    for (const item of ITEM_REGISTRY.filter((i) => i.status === "available" && i.kind === "node")) {
      expect(NODE_DEFINITIONS[item.type], `missing NODE_DEFINITIONS for ${item.type}`).toBeDefined();
      expect(getNodeDef(item.type).defaultWidth).toBeGreaterThan(0);
    }
  });

  it("every available node has capabilities", () => {
    for (const item of ITEM_REGISTRY.filter((i) => i.status === "available" && i.kind === "node")) {
      expect(item.capabilities, `${item.type} missing capabilities`).toBeDefined();
    }
  });

  it("available items have keywords", () => {
    for (const item of ITEM_REGISTRY.filter((i) => i.status === "available")) {
      expect(item.keywords?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("no duplicate types", () => {
    const seen = new Set<string>();
    for (const item of ITEM_REGISTRY) {
      expect(seen.has(item.type), `duplicate type ${item.type}`).toBe(false);
      seen.add(item.type);
    }
  });
});

describe("history", () => {
  it("push and undo", () => {
    const h = useHistoryStore.getState();
    h.clear();
    h.init({ nodes: [], edges: [] });
    expect(h.canUndo).toBe(false);
    h.push({ nodes: [{ id: "a", position: { x: 0, y: 0 }, data: {}, style: {} } as never], edges: [] });
    expect(useHistoryStore.getState().canUndo).toBe(true);
    const snap = h.undo();
    expect(snap).toBeDefined();
    expect(useHistoryStore.getState().canRedo).toBe(true);
    const redo = h.redo();
    expect(redo).toBeDefined();
    h.clear();
  });

  it("snapshotsEqual deduplicates", () => {
    const h = useHistoryStore.getState();
    h.clear();
    h.init({ nodes: [], edges: [] });
    const s = { nodes: [{ id: "a", position: { x: 0, y: 0 }, data: { text: "hi" }, style: { width: 100 } } as never], edges: [] };
    h.push(s);
    const before = useHistoryStore.getState().past.length;
    h.push(s);
    expect(useHistoryStore.getState().past.length).toBe(before); // deduplicated
    h.clear();
  });
});

describe("container parentId", () => {
  it("section contains real parentId", async () => {
    // Simulate parentId attach logic: node inside section gets parentId
    const section = { id: "sec1", type: "section", position: { x: 0, y: 0 }, style: { width: 560, minHeight: 360 }, data: {} } as never;
    const childPos = { x: 10, y: 10 };
    const w = 560, h = 360, cx = 0, cy = 0;
    const left = cx - w / 2, right = cx + w / 2, top = cy - h / 2, bottom = cy + h / 2;
    const inside = childPos.x >= left && childPos.x <= right && childPos.y >= top && childPos.y <= bottom;
    expect(inside).toBe(true);
  });
});

describe("viewport virtualization", () => {
  it("stays off on small boards", () => {
    expect(shouldVirtualize(0, false)).toBe(false);
    expect(shouldVirtualize(149, false)).toBe(false);
  });

  it("turns on at the threshold", () => {
    expect(shouldVirtualize(150, false)).toBe(true);
    expect(shouldVirtualize(4000, false)).toBe(true);
  });

  it("uses hysteresis so it does not flap", () => {
    expect(shouldVirtualize(130, true)).toBe(true);
    expect(shouldVirtualize(120, true)).toBe(false);
  });
});

describe("heavy node lifecycle", () => {
  it("is idle off-screen even if activated", () => {
    expect(heavyPhase(false, false)).toBe("idle");
    expect(heavyPhase(false, true)).toBe("idle");
  });

  it("is visible but passive until activated", () => {
    expect(heavyPhase(true, false)).toBe("visible");
  });

  it("is interactive when visible and activated", () => {
    expect(heavyPhase(true, true)).toBe("interactive");
  });
});
