import { create } from "zustand";

interface DocumentPreviewState {
  isOpen: boolean;
  nodeId: string | null;
  open: (nodeId: string) => void;
  close: () => void;
}

export const useDocumentPreviewStore = create<DocumentPreviewState>((set) => ({
  isOpen: false,
  nodeId: null,
  open: (nodeId) => set({ isOpen: true, nodeId }),
  close: () => set({ isOpen: false, nodeId: null }),
}));
