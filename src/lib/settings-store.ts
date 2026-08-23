import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePreference = "system" | "light" | "dark";

interface AppSettings {
  theme: ThemePreference;
  gridVisible: boolean;
  snapToGrid: boolean;
  leftSidebarOpen: boolean;
  setTheme: (theme: ThemePreference) => void;
  setGridVisible: (v: boolean) => void;
  setSnapToGrid: (v: boolean) => void;
  setLeftSidebarOpen: (v: boolean) => void;
  toggleLeftSidebar: () => void;
}

export const useSettingsStore = create<AppSettings>()(
  persist(
    (set) => ({
      theme: "system",
      gridVisible: true,
      snapToGrid: true,
      leftSidebarOpen: true,
      setTheme: (theme) => set({ theme }),
      setGridVisible: (gridVisible) => set({ gridVisible }),
      setSnapToGrid: (snapToGrid) => set({ snapToGrid }),
      setLeftSidebarOpen: (leftSidebarOpen) => set({ leftSidebarOpen }),
      toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
    }),
    { name: "sutonote:settings" },
  ),
);
