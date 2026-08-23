import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  Folder,
  PanelLeftClose,
  Plus,
  Search,
  FileText,
  UserRound,
} from "lucide-react";
import { useState } from "react";

type Board = { name: string };
type Group = { name: string; boards: Board[] };

const tree: Group[] = [
  {
    name: "Studio Rebrand",
    boards: [{ name: "Moodboard" }, { name: "Typography" }, { name: "Logo drafts" }],
  },
  {
    name: "Research",
    boards: [{ name: "Interviews" }, { name: "Competitors" }],
  },
  {
    name: "Personal",
    boards: [{ name: "Reading list" }],
  },
];

export function WorkspaceSidebar({
  open,
  onToggle,
  onOpenPalette,
}: {
  open: boolean;
  onToggle: () => void;
  onOpenPalette: () => void;
}) {
  const [active, setActive] = useState("Moodboard");
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const toggleGroup = (name: string) =>
    setCollapsed((c) => (c.includes(name) ? c.filter((n) => n !== name) : [...c, name]));

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 overflow-hidden border-r border-sidebar-border bg-sidebar"
        >
          <div className="flex h-full w-[260px] flex-col">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-sidebar-border pl-5 pr-3">
              <span className="text-sm font-medium tracking-tight">Sutonote</span>
              <button
                type="button"
                aria-label="Collapse sidebar"
                onClick={onToggle}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-active hover:text-foreground"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 p-4">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                New Board
              </button>
              <button
                type="button"
                onClick={onOpenPalette}
                className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-hover"
              >
                <Search className="h-4 w-4" />
                Search
                <span className="ml-auto font-mono text-[11px] text-muted-foreground/70">⌘K</span>
              </button>
            </div>

            <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
              {tree.map((group) => {
                const isCollapsed = collapsed.includes(group.name);
                return (
                  <div key={group.name} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.name)}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:bg-surface-hover"
                    >
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                      />
                      <Folder className="h-3.5 w-3.5" />
                      <span className="truncate normal-case tracking-normal">{group.name}</span>
                    </button>

                    {!isCollapsed && (
                      <ul className="space-y-0.5 pl-4">
                        {group.boards.map((board) => (
                          <li key={board.name}>
                            <button
                              type="button"
                              onClick={() => setActive(board.name)}
                              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                                active === board.name
                                  ? "bg-surface-active font-medium text-foreground"
                                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                              }`}
                            >
                              <FileText className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                              <span className="truncate">{board.name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="shrink-0 border-t border-sidebar-border p-3">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-hover"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-sidebar-border bg-surface">
                  <UserRound className="h-4 w-4 text-muted-foreground" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">Rifat Ahmed</span>
                  <span className="block truncate text-xs text-muted-foreground">Local vault</span>
                </span>
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
