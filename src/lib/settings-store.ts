import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePreference = "system" | "light" | "dark";

interface AppSettings {
  theme: ThemePreference;
  gridVisible: boolean;
  snapToGrid: boolean;
  leftSidebarOpen: boolean;
  displayName: string;
  avatarAssetId: string;
  vaultName: string;
  setTheme: (theme: ThemePreference) => void;
  setGridVisible: (v: boolean) => void;
  setSnapToGrid: (v: boolean) => void;
  setLeftSidebarOpen: (v: boolean) => void;
  toggleLeftSidebar: () => void;
  setDisplayName: (v: string) => void;
  setAvatarAssetId: (v: string) => void;
  setVaultName: (v: string) => void;
}

export const useSettingsStore = create<AppSettings>()(
  persist(
    (set) => ({
      theme: "system",
      gridVisible: true,
      snapToGrid: true,
      leftSidebarOpen: true,
      displayName: "Local user",
      avatarAssetId: "",
      vaultName: "My vault",
      setTheme: (theme) => set({ theme }),
      setGridVisible: (gridVisible) => set({ gridVisible }),
      setSnapToGrid: (snapToGrid) => set({ snapToGrid }),
      setLeftSidebarOpen: (leftSidebarOpen) => set({ leftSidebarOpen }),
      toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
      setDisplayName: (displayName) => set({ displayName }),
      setAvatarAssetId: (avatarAssetId) => set({ avatarAssetId }),
      setVaultName: (vaultName) => set({ vaultName }),
    }),
    { name: "sutonote:settings" },
  ),
);
