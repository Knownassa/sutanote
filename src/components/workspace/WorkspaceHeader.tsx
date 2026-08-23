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
import { SettingsDialog } from "./SettingsDialog";

const crumbs = ["Workspace", "Studio Rebrand", "Moodboard"];

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

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border pl-5 pr-3">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
        {crumbs.map((crumb, i) => (
          <span key={crumb} className="flex min-w-0 items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />}
            <span
              className={
                i === crumbs.length - 1
                  ? "truncate font-medium text-foreground"
                  : "truncate text-muted-foreground"
              }
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-1.5">
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
        <IconButton label="Menu">
          <MoreHorizontal className="h-4 w-4" />
        </IconButton>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}
