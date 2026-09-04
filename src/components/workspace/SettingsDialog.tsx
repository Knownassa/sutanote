import { useEffect, useRef, useState } from "react";
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
import { useCanvasStore } from "@/lib/store";
import { getAssetUrl, storeImageAsset } from "@/lib/asset-store";
import { exportWorkspace, importWorkspace } from "@/lib/export";

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1 border-t border-border pt-3 first:border-t-0 first:pt-0">
      <h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
        {title}
      </h4>
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
  const displayName = useSettingsStore((s) => s.displayName);
  const setDisplayName = useSettingsStore((s) => s.setDisplayName);
  const avatarAssetId = useSettingsStore((s) => s.avatarAssetId);
  const setAvatarAssetId = useSettingsStore((s) => s.setAvatarAssetId);
  const vaultName = useSettingsStore((s) => s.vaultName);
  const setVaultName = useSettingsStore((s) => s.setVaultName);

  const [avatarUrl, setAvatarUrl] = useState("");
  const avatarInput = useRef<HTMLInputElement>(null);
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null);

  useEffect(() => {
    if (!avatarAssetId) {
      setAvatarUrl("");
      return;
    }
    let active = true;
    getAssetUrl(avatarAssetId).then((u) => active && setAvatarUrl(u ?? ""));
    return () => {
      active = false;
    };
  }, [avatarAssetId]);

  useEffect(() => {
    if (!open) return;
    if (navigator.storage?.estimate) {
      navigator.storage
        .estimate()
        .then((e) => setStorage({ usage: e.usage ?? 0, quota: e.quota ?? 0 }));
    }
    setLastSave(useCanvasStore.getState().lastSavedAt);
  }, [open]);

  const [lastSave, setLastSave] = useState<number | null>(null);

  const onAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const id = await storeImageAsset(file, file.name);
    setAvatarAssetId(id);
    e.target.value = "";
  };

  const exportData = () => {
    void exportWorkspace();
  };
  const importInput = useRef<HTMLInputElement>(null);
  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importWorkspace(file);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const { useNoticeStore } = await import("@/lib/notice-store");
      useNoticeStore.getState().show(`Import failed: ${msg}`, "error");
    }
    e.target.value = "";
  };

  const fmt = (n: number) =>
    n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Preferences are stored locally on this device. No account required.
          </DialogDescription>
        </DialogHeader>

        <Section title="Account">
          <div className="flex items-center gap-3 py-2">
            <div className="h-12 w-12 overflow-hidden rounded-full border border-border bg-surface">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name"
                className="rounded-md border border-border bg-surface px-2 py-1 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/20"
              />
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => avatarInput.current?.click()}
                >
                  Upload
                </button>
                {avatarAssetId && (
                  <button
                    type="button"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setAvatarAssetId("")}
                  >
                    Remove
                  </button>
                )}
                <input
                  ref={avatarInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onAvatar}
                />
              </div>
            </div>
          </div>
          <Row label="Local vault name">
            <input
              value={vaultName}
              onChange={(e) => setVaultName(e.target.value)}
              className="w-40 rounded-md border border-border bg-surface px-2 py-1 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/20"
            />
          </Row>
        </Section>

        <Section title="Appearance">
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
        </Section>

        <Section title="Canvas">
          <Row label="Show grid">
            <Switch checked={gridVisible} onCheckedChange={setGridVisible} />
          </Row>
          <Row label="Snap to grid">
            <Switch checked={snapToGrid} onCheckedChange={setSnapToGrid} />
          </Row>
        </Section>

        <Section title="Interface">
          <Row label="Left sidebar open by default">
            <Switch checked={leftSidebarOpen} onCheckedChange={setLeftSidebarOpen} />
          </Row>
        </Section>

        <Section title="Data & Storage">
          <Row label="Storage type">
            <span className="text-xs text-muted-foreground">Local (PGlite + IndexedDB)</span>
          </Row>
          <Row label="Approximate usage">
            <span className="text-xs text-muted-foreground">
              {storage
                ? `${fmt(storage.usage)}${storage.quota ? ` / ${fmt(storage.quota)}` : ""}`
                : "—"}
            </span>
          </Row>
          <Row label="Last successful save">
            <span className="text-xs text-muted-foreground">
              {lastSave ? new Date(lastSave).toLocaleTimeString() : "—"}
            </span>
          </Row>
          <Row label="Export workspace">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={exportData}
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover"
              >
                Export .sutonote
              </button>
              <button
                type="button"
                onClick={() => importInput.current?.click()}
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover"
              >
                Import
              </button>
              <input
                ref={importInput}
                type="file"
                accept=".sutonote,.json"
                className="hidden"
                onChange={onImport}
              />
            </div>
          </Row>
        </Section>

        <Section title="Keyboard">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>V — Select</span>
            <span>H — Hand / pan</span>
            <span>P — Pen</span>
            <span>L — Highlighter</span>
            <span>E — Eraser</span>
            <span>C — Connector</span>
            <span>T / S / D — Add note</span>
            <span>Space (hold) — Pan</span>
            <span>⌘/Ctrl + A — Select all</span>
            <span>⌘/Ctrl + C — Copy</span>
            <span>⌘/Ctrl + X — Cut</span>
            <span>⌘/Ctrl + V — Paste</span>
            <span>⌘/Ctrl + D — Duplicate</span>
            <span>Delete — Remove</span>
            <span>Arrows — Nudge</span>
            <span>Shift + Arrows — Nudge 10px</span>
            <span>Esc — Deselect / Cancel</span>
            <span>Shift/Ctrl + Click — Multi-select</span>
          </div>
        </Section>
      </DialogContent>
    </Dialog>
  );
}
