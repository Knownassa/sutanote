import { create } from "zustand";

export type ItemEditorMode = "inline" | "popover" | "window" | "viewer" | "none";

export interface ActiveItemEditor {
  nodeId: string;
  type: string;
  mode: Exclude<ItemEditorMode, "none">;
}

interface ItemEditorState {
  active: ActiveItemEditor | null;
  open: (nodeId: string, type: string, mode?: Exclude<ItemEditorMode, "none">) => void;
  close: () => void;
}

export const useItemEditorStore = create<ItemEditorState>((set) => ({
  active: null,
  open: (nodeId, type, mode = "window") => set({ active: { nodeId, type, mode } }),
  close: () => set({ active: null }),
}));
