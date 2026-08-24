import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BoardTreeBoard {
  id: string;
  name: string;
}

export interface BoardTreeGroup {
  id: string;
  name: string;
  boards: BoardTreeBoard[];
}

interface BoardTreeState {
  groups: BoardTreeGroup[];
  activeBoardId: string;
  setActiveBoard: (id: string) => void;
  addBoard: (groupId: string, name?: string) => string;
  renameBoard: (id: string, name: string) => void;
  deleteBoard: (id: string) => void;
  addGroup: (name?: string) => string;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const initialGroups: BoardTreeGroup[] = [
  {
    id: "g-studio",
    name: "Studio Rebrand",
    boards: [
      { id: "b-moodboard", name: "Moodboard" },
      { id: "b-typography", name: "Typography" },
      { id: "b-logo", name: "Logo drafts" },
    ],
  },
  {
    id: "g-research",
    name: "Research",
    boards: [
      { id: "b-interviews", name: "Interviews" },
      { id: "b-competitors", name: "Competitors" },
    ],
  },
  {
    id: "g-personal",
    name: "Personal",
    boards: [{ id: "b-reading", name: "Reading list" }],
  },
];

export const useBoardTreeStore = create<BoardTreeState>()(
  persist(
    (set) => ({
      groups: initialGroups,
      activeBoardId: "b-moodboard",
      setActiveBoard: (activeBoardId) => set({ activeBoardId }),
      addBoard: (groupId, name) => {
        const id = `b-${uid()}`;
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  boards: [
                    ...g.boards,
                    { id, name: name?.trim() || `Untitled board ${g.boards.length + 1}` },
                  ],
                }
              : g,
          ),
          activeBoardId: id,
        }));
        return id;
      },
      renameBoard: (id, name) =>
        set((s) => ({
          groups: s.groups.map((g) => ({
            ...g,
            boards: g.boards.map((b) => (b.id === id ? { ...b, name: name.trim() || b.name } : b)),
          })),
        })),
      deleteBoard: (id) =>
        set((s) => ({
          groups: s.groups.map((g) => ({ ...g, boards: g.boards.filter((b) => b.id !== id) })),
        })),
      addGroup: (name) => {
        const id = `g-${uid()}`;
        set((s) => ({
          groups: [...s.groups, { id, name: name?.trim() || "New folder", boards: [] }],
        }));
        return id;
      },
    }),
    { name: "sutonote:board-tree" },
  ),
);
