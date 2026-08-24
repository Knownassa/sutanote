import { create } from "zustand";

interface LightboxState {
  isOpen: boolean;
  currentId: string | null;
  imageIds: string[];
  open: (id: string, allIds: string[]) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
}

export const useLightboxStore = create<LightboxState>((set, get) => ({
  isOpen: false,
  currentId: null,
  imageIds: [],
  open: (id, allIds) => set({ isOpen: true, currentId: id, imageIds: allIds }),
  close: () => set({ isOpen: false, currentId: null }),
  next: () => {
    const { currentId, imageIds } = get();
    if (!currentId || imageIds.length === 0) return;
    const idx = imageIds.indexOf(currentId);
    const nextIdx = (idx + 1) % imageIds.length;
    const nid = imageIds[nextIdx];
    if (nid) set({ currentId: nid });
  },
  prev: () => {
    const { currentId, imageIds } = get();
    if (!currentId || imageIds.length === 0) return;
    const idx = imageIds.indexOf(currentId);
    const prevIdx = (idx - 1 + imageIds.length) % imageIds.length;
    const pid = imageIds[prevIdx];
    if (pid) set({ currentId: pid });
  },
}));
