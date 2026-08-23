import { create } from "zustand";

export type CanvasTool = "select" | "hand" | "text" | "sticky" | "todo" | "image" | "connector";

interface InteractionState {
  activeTool: CanvasTool;
  isPanning: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isEditingText: boolean;
  spaceHeld: boolean;
  setActiveTool: (t: CanvasTool) => void;
  setPanning: (v: boolean) => void;
  setDragging: (v: boolean) => void;
  setResizing: (v: boolean) => void;
  setEditingText: (v: boolean) => void;
  setSpaceHeld: (v: boolean) => void;
}

export const useInteractionStore = create<InteractionState>((set) => ({
  activeTool: "select",
  isPanning: false,
  isDragging: false,
  isResizing: false,
  isEditingText: false,
  spaceHeld: false,
  setActiveTool: (activeTool) => set({ activeTool }),
  setPanning: (isPanning) => set({ isPanning }),
  setDragging: (isDragging) => set({ isDragging }),
  setResizing: (isResizing) => set({ isResizing }),
  setEditingText: (isEditingText) => set({ isEditingText }),
  setSpaceHeld: (spaceHeld) => set({ spaceHeld }),
}));
