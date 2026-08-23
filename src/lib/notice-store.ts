import { create } from "zustand";

export type NoticeKind = "info" | "success" | "error";

interface NoticeEntry {
  id: number;
  message: string;
  kind: NoticeKind;
}

interface NoticeState {
  notice: NoticeEntry | null;
  show: (message: string, kind?: NoticeKind) => void;
  dismiss: () => void;
}

let nextId = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

export const useNoticeStore = create<NoticeState>((set) => ({
  notice: null,

  show: (message, kind = "info") => {
    if (timer) clearTimeout(timer);
    const id = ++nextId;
    set({ notice: { id, message, kind } });
    timer = setTimeout(() => {
      set((s) => (s.notice?.id === id ? { notice: null } : {}));
    }, 2800);
  },

  dismiss: () => {
    if (timer) clearTimeout(timer);
    set({ notice: null });
  },
}));
