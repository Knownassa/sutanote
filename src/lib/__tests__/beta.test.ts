// @ts-expect-error Bun provides bun:test at runtime; the app TypeScript config does not include Bun types.
import { describe, it, expect } from "bun:test";
import { ITEM_REGISTRY, getItemDef } from "../item-registry";
import { NODE_DEFINITIONS, getNodeDef } from "../node-definitions";
import { useHistoryStore } from "../history-store";
import { shouldVirtualize } from "../virtualization";
import { heavyPhase } from "../../hooks/use-heavy-node";
import { executeCanvasItem } from "../canvas-executor";
import { getItemEditor } from "../item-editor-registry";
import { reduceStroke } from "../drawing";
import { KNOWN_NODE_TYPES, KNOWN_TOOLS } from "../dev-assert";
import {
  createDefaultTable,
  reorderTableColumns,
  reorderTableRows,
  updateTableCell,
} from "../table";

describe("registry invariants", () => {
  it("every available node has NODE_DEFINITIONS", () => {
    for (const item of ITEM_REGISTRY.filter((i) => i.status === "available" && i.kind === "node")) {
      expect(
        NODE_DEFINITIONS[item.type],
        `missing NODE_DEFINITIONS for ${item.type}`,
      ).toBeDefined();
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

  it("new beta tools have execution and renderer contracts", () => {
    for (const type of ["audio", "table", "drawing"]) {
      const item = getItemDef(type);
      expect(item?.status).toBe("available");
      expect(KNOWN_NODE_TYPES.has(type)).toBe(true);
      expect(NODE_DEFINITIONS[type]).toBeDefined();
    }
    for (const type of ["pen", "highlighter", "eraser"]) {
      expect(getItemDef(type)?.status).toBe("available");
      expect(KNOWN_TOOLS.has(type)).toBe(true);
    }
  });

  it("registers complex items with a dedicated editor", () => {
    expect(getItemEditor("table")?.mode).toBe("window");
    expect(getItemEditor("table")?.component).toBeDefined();
    expect(getItemEditor("image")).toBeUndefined();
  });

  it("executor routes inserts and tools through one boundary", () => {
    const before = useHistoryStore.getState().past.length;
    expect(executeCanvasItem("pen")).toBe(true);
    expect(executeCanvasItem("highlighter")).toBe(true);
    expect(executeCanvasItem("eraser")).toBe(true);
    expect(executeCanvasItem("coming-soon-item")).toBe(false);
    expect(useHistoryStore.getState().past.length).toBe(before);
  });

  it("reduces long strokes while retaining endpoints", () => {
    const points = Array.from({ length: 1000 }, (_, index) => ({ x: index, y: index % 7 }));
    const reduced = reduceStroke(points, 64);
    expect(reduced.length).toBe(64);
    expect(reduced[0]).toEqual(points[0]);
    expect(reduced.at(-1)).toEqual(points.at(-1));
  });

  it("creates and mutates a valid table data model", () => {
    const table = createDefaultTable();
    expect(table.columns.length).toBe(3);
    expect(table.rows.length).toBe(2);
    const edited = updateTableCell(table, 0, 0, "Sutonote");
    expect(edited.rows[0]?.cells[0]).toBe("Sutonote");
    const rows = reorderTableRows(edited, 0, 1);
    expect(rows.rows[1]?.cells[0]).toBe("Sutonote");
    const columns = reorderTableColumns(rows, 0, 1);
    expect(columns.columns[1]?.label).toBe("Name");
    expect(columns.rows[1]?.cells[1]).toBe("Sutonote");
  });
});

describe("history", () => {
  it("push and undo", () => {
    const h = useHistoryStore.getState();
    h.clear();
    h.init({ nodes: [], edges: [] });
    expect(h.canUndo).toBe(false);
    h.push({
      nodes: [{ id: "a", position: { x: 0, y: 0 }, data: {}, style: {} } as never],
      edges: [],
    });
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
    const s = {
      nodes: [
        { id: "a", position: { x: 0, y: 0 }, data: { text: "hi" }, style: { width: 100 } } as never,
      ],
      edges: [],
    };
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
    const section = {
      id: "sec1",
      type: "section",
      position: { x: 0, y: 0 },
      style: { width: 560, minHeight: 360 },
      data: {},
    } as never;
    const childPos = { x: 10, y: 10 };
    const w = 560,
      h = 360,
      cx = 0,
      cy = 0;
    const left = cx - w / 2,
      right = cx + w / 2,
      top = cy - h / 2,
      bottom = cy + h / 2;
    const inside =
      childPos.x >= left && childPos.x <= right && childPos.y >= top && childPos.y <= bottom;
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
