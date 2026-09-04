import type { ComponentType } from "react";
import type { ItemEditorMode } from "./item-editor-store";
import TableEditor from "@/components/workspace/TableEditor";

export interface ItemEditorProps {
  nodeId: string;
  onClose: () => void;
}

export interface ItemEditorDefinition {
  type: string;
  mode: Exclude<ItemEditorMode, "none">;
  component: ComponentType<ItemEditorProps>;
}

// Keep complex object editors separate from the object-level Properties panel.
// New editors can be added here without turning the inspector into a switchboard.
export const ITEM_EDITOR_REGISTRY: ItemEditorDefinition[] = [
  { type: "table", mode: "window", component: TableEditor },
];

export function getItemEditor(type: string): ItemEditorDefinition | undefined {
  return ITEM_EDITOR_REGISTRY.find((definition) => definition.type === type);
}
