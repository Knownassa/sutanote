import { useState } from "react";
import {
  ChevronRight,
  MoreHorizontal,
  Redo2,
  Settings,
  Undo2,
  AlertTriangle,
  Check,
  Loader2,
} from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import { useHistoryStore } from "@/lib/history-store";
import { useSettingsStore } from "@/lib/settings-store";
import { useBoardTreeStore } from "@/lib/board-tree-store";
import { SettingsDialog } from "./SettingsDialog";

function IconButton({
  label,
  children,
  onClick,
  disabled,
}: {
  label: string;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      title={disabled ? `${label} (coming soon)` : label}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

function SaveStatus() {
  const status = useCanvasStore((s) => s.persistenceStatus);
  const lastSaveError = useCanvasStore((s) => s.lastSaveError);

  const map = {
    clean: { label: "Saved locally", icon: Check, cls: "text-muted-foreground" },
    saved: { label: "Saved locally", icon: Check, cls: "text-muted-foreground" },
    dirty: { label: "Saving…", icon: Loader2, cls: "text-muted-foreground" },
    saving: { label: "Saving…", icon: Loader2, cls: "text-muted-foreground" },
    error: { label: "Save failed", icon: AlertTriangle, cls: "text-destructive" },
  } as const;

  const { label, icon: Icon, cls } = map[status];

  return (
    <span
      title={status === "error" ? (lastSaveError ?? "Save failed") : undefined}
      className={`flex items-center gap-1.5 rounded-full border border-border bg-popover/80 px-2.5 py-1 text-[11px] ${cls}`}
    >
      <Icon
        className={`h-3 w-3 ${status === "dirty" || status === "saving" ? "animate-spin" : ""}`}
      />
      {label}
    </span>
  );
}

export function WorkspaceHeader() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const canUndo = useHistoryStore((s) => s.canUndo);
  const canRedo = useHistoryStore((s) => s.canRedo);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const vaultName = useSettingsStore((s) => s.vaultName);
  const activeBoardId = useBoardTreeStore((s) => s.activeBoardId);
  const groups = useBoardTreeStore((s) => s.groups);
  const activeBoard = groups
    .flatMap((group) => group.boards)
    .find((board) => board.id === activeBoardId);
  const crumbs = [vaultName, activeBoard?.name ?? "Board"];

  return (
    <header className="flex items-start justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex h-[68px] items-center gap-3 rounded-[10px] border border-border bg-popover/95 px-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md">
          <span className="h-12 w-12 shrink-0 rounded-full border border-border-strong bg-card" />
          <div className="min-w-0">
            <p className="max-w-[190px] truncate text-base font-semibold text-foreground">
              {activeBoard?.name ?? "Project Name"}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">{vaultName}</p>
          </div>
          <MoreHorizontal className="ml-2 h-5 w-5 text-muted-foreground" />
        </div>
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 rounded-lg bg-popover/70 p-1 text-[11px] shadow-sm backdrop-blur-md"
        >
          {crumbs.map((crumb, i) => (
            <span
              key={`${crumb}-${i}`}
              className="flex items-center gap-1 rounded-md border border-border/70 bg-popover/90 px-2 py-1 text-muted-foreground"
            >
              {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/60" />}
              <span className={i === crumbs.length - 1 ? "font-medium text-foreground" : ""}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div className="flex h-[68px] items-center gap-1.5 rounded-[10px] border border-border bg-popover/95 px-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md">
        <SaveStatus />
        <IconButton label="Undo" disabled={!canUndo} onClick={undo}>
          <Undo2 className="h-4 w-4" />
        </IconButton>
        <IconButton label="Redo" disabled={!canRedo} onClick={redo}>
          <Redo2 className="h-4 w-4" />
        </IconButton>
        <span className="mx-1 h-4 w-px bg-border" />
        <IconButton label="Settings" onClick={() => setSettingsOpen(true)}>
          <Settings className="h-4 w-4" />
        </IconButton>
        <IconButton
          label="Menu"
          onClick={async () => {
            const { useNoticeStore } = await import("@/lib/notice-store");
            useNoticeStore.getState().show("Menu coming soon", "info");
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </IconButton>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}
