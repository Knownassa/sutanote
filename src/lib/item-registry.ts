import {
  Type,
  StickyNote,
  CheckSquare,
  ImageIcon,
  Link,
  FileText,
  MessageCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DEFAULT_ITEM_WIDTH } from "./node-definitions";

export type ItemCategory = "basic" | "media" | "files" | "organize" | "visual" | "structured";

export interface ItemDefinition {
  type: string;
  label: string;
  icon: LucideIcon;
  category: ItemCategory;
  /** If false, do not show in picker yet (future type). */
  available: boolean;
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  resizeMode: "none" | "width" | "both" | "width-content";
  preserveAspectRatio?: boolean;
  editableText?: boolean;
}

export const ITEM_REGISTRY: ItemDefinition[] = [
  // ── Basic ───────────────────────────────────────────────────────
  {
    type: "text",
    label: "Text",
    icon: Type,
    category: "basic",
    available: true,
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 120,
    minWidth: 200,
    minHeight: 80,
    maxWidth: 520,
    resizeMode: "width-content",
    editableText: true,
  },
  {
    type: "sticky",
    label: "Note",
    icon: StickyNote,
    category: "basic",
    available: true,
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 180,
    minWidth: 180,
    minHeight: 140,
    maxWidth: 420,
    resizeMode: "both",
  },
  {
    type: "todo",
    label: "To-do",
    icon: CheckSquare,
    category: "basic",
    available: true,
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 160,
    minWidth: 240,
    minHeight: 120,
    maxWidth: 520,
    resizeMode: "both",
  },
  {
    type: "link",
    label: "Link",
    icon: Link,
    category: "basic",
    available: true,
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 100,
    minWidth: 200,
    minHeight: 60,
    maxWidth: 520,
    resizeMode: "width",
  },

  // ── Media ───────────────────────────────────────────────────────
  {
    type: "image",
    label: "Image",
    icon: ImageIcon,
    category: "media",
    available: true,
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 220,
    minWidth: 120,
    minHeight: 120,
    maxWidth: 1200,
    maxHeight: 1200,
    resizeMode: "both",
    preserveAspectRatio: true,
  },
  // Future: video, audio, embed, map — not available yet.

  // ── Files ───────────────────────────────────────────────────────
  {
    type: "file",
    label: "File",
    icon: FileText,
    category: "files",
    available: true,
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 80,
    minWidth: 180,
    minHeight: 60,
    maxWidth: 520,
    resizeMode: "width",
  },

  // ── Organize ────────────────────────────────────────────────────
  // Future: board-shortcut, column, frame, group — not available yet.

  // ── Visual ──────────────────────────────────────────────────────
  // Future: shape, connector, swatch — not available yet.

  // ── Structured ──────────────────────────────────────────────────
  // Future: table, card, kanban, mindmap — not available yet.

  // ── Collaboration ───────────────────────────────────────────────
  {
    type: "comment",
    label: "Comment",
    icon: MessageCircle,
    category: "basic",
    available: true,
    defaultWidth: DEFAULT_ITEM_WIDTH,
    defaultHeight: 100,
    minWidth: 180,
    minHeight: 60,
    maxWidth: 420,
    resizeMode: "width",
    editableText: true,
  },
];

export const AVAILABLE_ITEMS = ITEM_REGISTRY.filter((i) => i.available);

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  basic: "Basic",
  media: "Media",
  files: "Files",
  organize: "Organize",
  visual: "Visual",
  structured: "Structured",
};

export function getItemDef(type: string): ItemDefinition | undefined {
  return ITEM_REGISTRY.find((i) => i.type === type);
}
