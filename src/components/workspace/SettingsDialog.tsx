import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettingsStore, type ThemePreference } from "@/lib/settings-store";

const themes: ThemePreference[] = ["system", "light", "dark"];

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <Label className="text-sm">{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const gridVisible = useSettingsStore((s) => s.gridVisible);
  const setGridVisible = useSettingsStore((s) => s.setGridVisible);
  const snapToGrid = useSettingsStore((s) => s.snapToGrid);
  const setSnapToGrid = useSettingsStore((s) => s.setSnapToGrid);
  const leftSidebarOpen = useSettingsStore((s) => s.leftSidebarOpen);
  const setLeftSidebarOpen = useSettingsStore((s) => s.setLeftSidebarOpen);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Preferences are stored locally on this device.</DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          <h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
            Appearance
          </h4>
          <Row label="Theme">
            <div className="flex gap-1.5">
              {themes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`rounded-md border px-2.5 py-1 text-xs capitalize transition-colors ${
                    theme === t
                      ? "border-border-strong bg-surface-active text-foreground"
                      : "border-border text-muted-foreground hover:bg-surface-hover"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Row>
        </div>

        <div className="space-y-1 border-t border-border pt-2">
          <h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
            Canvas
          </h4>
          <Row label="Show grid">
            <Switch checked={gridVisible} onCheckedChange={setGridVisible} />
          </Row>
          <Row label="Snap to grid">
            <Switch checked={snapToGrid} onCheckedChange={setSnapToGrid} />
          </Row>
        </div>

        <div className="space-y-1 border-t border-border pt-2">
          <h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
            Interface
          </h4>
          <Row label="Left sidebar open by default">
            <Switch checked={leftSidebarOpen} onCheckedChange={setLeftSidebarOpen} />
          </Row>
        </div>
      </DialogContent>
    </Dialog>
  );
}
