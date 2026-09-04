import { create } from "zustand";

export type CanvasTool =
  | "select"
  | "hand"
  | "text"
  | "sticky"
  | "todo"
  | "image"
  | "connector"
  | "pen"
  | "highlighter"
  | "eraser";

export type InteractionMode =
  "canvas" | "text-edit" | "embed-interact" | "media-interact" | "resize" | "connect" | "draw";

interface InteractionState {
  activeTool: CanvasTool;
  interactionMode: InteractionMode;
  editingNodeId: string | null;
  editingRegion: "title" | "body" | null;
  isPanning: boolean;
  isDragging: boolean;
  isResizing: boolean;
  spaceHeld: boolean;
  setActiveTool: (t: CanvasTool) => void;
  setInteractionMode: (m: InteractionMode) => void;
  setEditingNode: (id: string | null, region?: "title" | "body" | null) => void;
  setPanning: (v: boolean) => void;
  setDragging: (v: boolean) => void;
  setResizing: (v: boolean) => void;
  setSpaceHeld: (v: boolean) => void;
}

export const useInteractionStore = create<InteractionState>((set) => ({
  activeTool: "select",
  interactionMode: "canvas",
  editingNodeId: null,
  editingRegion: null,
  isPanning: false,
  isDragging: false,
  isResizing: false,
  spaceHeld: false,
  setActiveTool: (activeTool) => set({ activeTool }),
  setInteractionMode: (interactionMode) => set({ interactionMode }),
  setEditingNode: (editingNodeId, editingRegion = null) =>
    set({ editingNodeId, editingRegion, interactionMode: editingNodeId ? "text-edit" : "canvas" }),
  setPanning: (isPanning) => set({ isPanning }),
  setDragging: (isDragging) => set({ isDragging }),
  setResizing: (isResizing) => set({ isResizing }),
  setSpaceHeld: (spaceHeld) => set({ spaceHeld }),
}));

// Derived helper for backward compatibility
export const useIsEditingText = () => useInteractionStore((s) => s.editingNodeId !== null);
