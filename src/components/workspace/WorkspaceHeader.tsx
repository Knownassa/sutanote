import { ChevronRight, Download, Redo2, Settings, Undo2 } from "lucide-react";

const crumbs = ["Workspace", "Studio Rebrand", "Moodboard"];

function IconButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
    >
      {children}
    </button>
  );
}

export function WorkspaceHeader() {
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

      <div className="flex items-center gap-1">
        <IconButton label="Undo">
          <Undo2 className="h-4 w-4" />
        </IconButton>
        <IconButton label="Redo">
          <Redo2 className="h-4 w-4" />
        </IconButton>

        <div className="mx-2 flex items-center gap-2 rounded-lg border border-border px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-sync" />
          <span className="text-xs text-muted-foreground">Saved locally</span>
        </div>

        <IconButton label="Export">
          <Download className="h-4 w-4" />
        </IconButton>
        <IconButton label="Settings">
          <Settings className="h-4 w-4" />
        </IconButton>
      </div>
    </header>
  );
}
