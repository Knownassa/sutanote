import { ITEM_REGISTRY } from "./item-registry";
import { NODE_DEFINITIONS } from "./node-definitions";

// Known nodeTypes that have a renderer (central list, keep in sync with CanvasArea)
const KNOWN_NODE_TYPES = new Set([
  "text",
  "sticky",
  "todo",
  "code",
  "image",
  "link",
  "video",
  "audio",
  "embed",
  "file",
  "pdf",
  "section",
  "board",
  "column",
  "frame",
  "shape",
  "color_swatch",
  "table",
  "comment",
  "document",
  "document_file",
  "spreadsheet",
  "presentation",
  "mindmap",
  "flowchart",
  "kanban",
  "card",
  "wireframe",
  "group",
  "map",
  "webcapture",
]);

const KNOWN_TOOLS = new Set(["connector", "pen", "highlighter", "eraser", "lasso"]);
const KNOWN_ACTIONS = new Set(["presentation_mode"]);

export function assertRegistryInvariants(): void {
  if (import.meta.env.PROD) return;

  const errors: string[] = [];

  for (const item of ITEM_REGISTRY) {
    if (item.status !== "available") continue;

    if (item.kind === "node") {
      if (!KNOWN_NODE_TYPES.has(item.type)) {
        errors.push(`[registry] available node "${item.type}" has no renderer (missing in KNOWN_NODE_TYPES)`);
      }
      if (!NODE_DEFINITIONS[item.type]) {
        errors.push(`[registry] available node "${item.type}" missing in NODE_DEFINITIONS`);
      }
      if (!item.capabilities) {
        errors.push(`[registry] available node "${item.type}" missing capabilities`);
      }
      if (!item.defaultWidth || !item.defaultHeight) {
        errors.push(`[registry] available node "${item.type}" missing default dimensions`);
      }
    } else if (item.kind === "tool") {
      if (!KNOWN_TOOLS.has(item.type)) {
        errors.push(`[registry] available tool "${item.type}" has no activation handler (missing in KNOWN_TOOLS)`);
      }
    } else if (item.kind === "action") {
      if (!KNOWN_ACTIONS.has(item.type)) {
        errors.push(`[registry] available action "${item.type}" has no handler (missing in KNOWN_ACTIONS)`);
      }
    }
  }

  if (errors.length > 0) {
    console.error("❌ Registry invariant failed:\n" + errors.join("\n"));
    // In dev, throw to fail loudly
    throw new Error(`Registry invariant failed:\n${errors.join("\n")}`);
  } else {
    console.log("✅ Registry invariants: all available items have handlers");
  }
}
