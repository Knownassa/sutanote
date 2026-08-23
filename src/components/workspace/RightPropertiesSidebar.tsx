import { useMemo, useRef } from "react";
import {
  BringToFront,
  SendToBack,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Group,
  Ungroup,
  Replace,
} from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import { getNodeDef } from "@/lib/node-definitions";
import { storeImageAsset } from "@/lib/asset-store";

const colors = [
  { name: "Yellow", class: "bg-note-yellow" },
  { name: "Rose", class: "bg-note-rose" },
  { name: "Sage", class: "bg-note-sage" },
  { name: "Lavender", class: "bg-note-lavender" },
  { name: "Blue", class: "bg-note-blue" },
  { name: "White", class: "bg-card" },
];

const textColors = [
  { name: "Default", value: "" },
  { name: "Ink", value: "#0f172a" },
  { name: "Red", value: "#dc2626" },
  { name: "Blue", value: "#2563eb" },
  { name: "Green", value: "#16a34a" },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
      {children}
    </p>
  );
}

function Field({
  label,
  value,
  onCommit,
  step = 1,
}: {
  label: string;
  value: number | null;
  onCommit: (n: number) => void;
  step?: number;
}) {
  return (
    <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
      <span className="w-4 text-center">{label}</span>
      <input
        type="number"
        step={step}
        value={value ?? ""}
        placeholder={value === null ? "Mixed" : undefined}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          if (!Number.isNaN(n)) onCommit(n);
        }}
        className="w-full rounded-md border border-border bg-surface px-2 py-1 text-foreground outline-none focus:ring-0"
      />
    </label>
  );
}

function IconBtn({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: typeof BringToFront;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex flex-1 items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}

function Toolbar3({
  labels,
  onPick,
  active,
}: {
  labels: string[];
  onPick: (i: number) => void;
  active?: number;
}) {
  return (
    <div className="flex w-full gap-1 rounded-lg border border-border p-1">
      {labels.map((l, i) => (
        <button
          key={l}
          type="button"
          onClick={() => onPick(i)}
          className={`flex-1 rounded-md py-1 text-[11px] transition-colors hover:bg-surface-hover ${
            active === i ? "bg-surface-active text-foreground" : "text-muted-foreground"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function RightPropertiesSidebar() {
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
  const nodes = useCanvasStore((s) => s.nodes);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeSize = useCanvasStore((s) => s.updateNodeSize);
  const updateNodePosition = useCanvasStore((s) => s.updateNodePosition);
  const bringToFront = useCanvasStore((s) => s.bringToFront);
  const sendToBack = useCanvasStore((s) => s.sendToBack);
  const bringForward = useCanvasStore((s) => s.bringForward);
  const sendBackward = useCanvasStore((s) => s.sendBackward);
  const alignSelected = useCanvasStore((s) => s.alignSelected);
  const distributeSelected = useCanvasStore((s) => s.distributeSelected);
  const matchSizeSelected = useCanvasStore((s) => s.matchSizeSelected);
  const setColorSelected = useCanvasStore((s) => s.setColorSelected);
  const setLockedSelected = useCanvasStore((s) => s.setLockedSelected);
  const groupSelected = useCanvasStore((s) => s.groupSelected);
  const ungroupSelected = useCanvasStore((s) => s.ungroupSelected);
  const duplicateSelected = useCanvasStore((s) => s.duplicateSelected);
  const deleteSelected = useCanvasStore((s) => s.deleteSelected);
  const imageRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => nodes.filter((n) => selectedNodeIds.includes(n.id)),
    [nodes, selectedNodeIds],
  );
  if (selected.length === 0) return null;

  const node = selected[0];
  if (!node) return null;
  const multi = selected.length > 1;
  const def = getNodeDef(node.type ?? "text");
  const locked = (node.data.locked as boolean) ?? false;
  const hasGroup = selected.some((n) => n.data.groupId);

  const commonStyle = (key: "width" | "minHeight") => {
    const vals = selected.map((n) => n.style?.[key]);
    return vals.every((v) => v === vals[0]) ? (vals[0] as number) : null;
  };

  const colorMatches =
    selected.every((n) => n.data.color === node.data.color) && node.data.color !== undefined;

  return (
    <div className="flex h-full w-[260px] flex-col gap-5 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {multi ? `${selected.length} items selected` : "Properties"}
        </h3>
        <button
          onClick={deleteSelected}
          aria-label="Delete"
          className="rounded-md p-1.5 text-destructive transition-colors hover:bg-destructive/10"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {!multi && (
        <div>
          <SectionLabel>Position &amp; Size</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="X"
              value={Math.round(node.position.x)}
              onCommit={(n) => updateNodePosition(node.id, n, node.position.y)}
            />
            <Field
              label="Y"
              value={Math.round(node.position.y)}
              onCommit={(n) => updateNodePosition(node.id, node.position.x, n)}
            />
            <Field
              label="W"
              value={commonStyle("width")}
              onCommit={(n) =>
                updateNodeSize(node.id, Math.max(def.minWidth, n), node.style?.minHeight as number)
              }
            />
            <Field
              label="H"
              value={commonStyle("minHeight")}
              onCommit={(n) =>
                updateNodeSize(node.id, node.style?.width as number, Math.max(def.minHeight, n))
              }
            />
          </div>
        </div>
      )}

      {!multi && (
        <div>
          <SectionLabel>Arrange</SectionLabel>
          <div className="flex w-full gap-1 rounded-lg border border-border p-1">
            <IconBtn label="Bring forward" icon={ArrowUp} onClick={() => bringForward(node.id)} />
            <IconBtn label="Send backward" icon={ArrowDown} onClick={() => sendBackward(node.id)} />
            <IconBtn
              label="Bring to front"
              icon={BringToFront}
              onClick={() => bringToFront(node.id)}
            />
            <IconBtn label="Send to back" icon={SendToBack} onClick={() => sendToBack(node.id)} />
          </div>
        </div>
      )}

      {multi && (
        <div>
          <SectionLabel>Arrange</SectionLabel>
          <div className="flex w-full gap-1 rounded-lg border border-border p-1">
            <IconBtn
              label="Bring to front"
              icon={BringToFront}
              onClick={() => selected.forEach((n) => bringToFront(n.id))}
            />
            <IconBtn
              label="Send to back"
              icon={SendToBack}
              onClick={() => selected.forEach((n) => sendToBack(n.id))}
            />
          </div>
        </div>
      )}

      {multi && (
        <>
          <div>
            <SectionLabel>Align</SectionLabel>
            <div className="grid grid-cols-3 gap-1">
              <button
                className="rounded-md border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
                onClick={() => alignSelected("left")}
              >
                Left
              </button>
              <button
                className="rounded-md border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
                onClick={() => alignSelected("centerX")}
              >
                Center
              </button>
              <button
                className="rounded-md border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
                onClick={() => alignSelected("right")}
              >
                Right
              </button>
              <button
                className="rounded-md border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
                onClick={() => alignSelected("top")}
              >
                Top
              </button>
              <button
                className="rounded-md border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
                onClick={() => alignSelected("centerY")}
              >
                Middle
              </button>
              <button
                className="rounded-md border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
                onClick={() => alignSelected("bottom")}
              >
                Bottom
              </button>
            </div>
          </div>
          <div>
            <SectionLabel>Distribute</SectionLabel>
            <div className="grid grid-cols-2 gap-1">
              <button
                className="rounded-md border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
                onClick={() => distributeSelected("horizontal")}
              >
                Horizontally
              </button>
              <button
                className="rounded-md border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
                onClick={() => distributeSelected("vertical")}
              >
                Vertically
              </button>
            </div>
          </div>
          <div>
            <SectionLabel>Size</SectionLabel>
            <div className="grid grid-cols-2 gap-1">
              <button
                className="rounded-md border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
                onClick={() => matchSizeSelected("width")}
              >
                Match width
              </button>
              <button
                className="rounded-md border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
                onClick={() => matchSizeSelected("height")}
              >
                Match height
              </button>
            </div>
          </div>
        </>
      )}

      <div>
        <SectionLabel>Style</SectionLabel>
        <div className="grid grid-cols-6 gap-2">
          {colors.map((color, i) => (
            <button
              key={`${color.name}-${i}`}
              type="button"
              onClick={() => setColorSelected(color.class)}
              aria-label={color.name}
              title={color.name}
              className={`aspect-square rounded-md border border-border-strong transition-all ${
                colorMatches && node.data.color === color.class
                  ? "ring-2 ring-foreground/40 ring-offset-1"
                  : "hover:scale-105"
              } ${color.class}`}
            />
          ))}
        </div>
      </div>

      {!multi && node.type === "text" && (
        <div>
          <SectionLabel>Text</SectionLabel>
          <div className="space-y-2">
            <Toolbar3
              labels={["12", "14", "16", "20", "24"]}
              active={[12, 14, 16, 20, 24].indexOf((node.data.fontSize as number) ?? 14)}
              onPick={(i) =>
                updateNodeData(node.id, { fontSize: [12, 14, 16, 20, 24][i] as number })
              }
            />
            <Toolbar3
              labels={["L", "C", "R"]}
              active={["left", "center", "right"].indexOf(
                (node.data.textAlign as string) ?? "left",
              )}
              onPick={(i) =>
                updateNodeData(node.id, {
                  textAlign: ["left", "center", "right"][i] as "left" | "center" | "right",
                })
              }
            />
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => updateNodeData(node.id, { bold: !node.data.bold })}
                className={`flex-1 rounded-md border border-border py-1 text-[11px] ${node.data.bold ? "bg-surface-active text-foreground" : "text-muted-foreground"}`}
              >
                Bold
              </button>
              <button
                type="button"
                onClick={() => updateNodeData(node.id, { italic: !node.data.italic })}
                className={`flex-1 rounded-md border border-border py-1 text-[11px] italic ${node.data.italic ? "bg-surface-active text-foreground" : "text-muted-foreground"}`}
              >
                Italic
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {textColors.map((tc) => (
                <button
                  key={tc.name}
                  type="button"
                  onClick={() => updateNodeData(node.id, { textColor: tc.value })}
                  title={tc.name}
                  className={`aspect-square rounded-md border border-border-strong ${tc.value ? "" : "bg-gradient-to-br from-white to-black/10"}`}
                  style={tc.value ? { background: tc.value } : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {!multi && node.type === "sticky" && (
        <div>
          <SectionLabel>Text size</SectionLabel>
          <Toolbar3
            labels={["12", "14", "16", "18"]}
            active={[12, 14, 16, 18].indexOf((node.data.fontSize as number) ?? 14)}
            onPick={(i) => updateNodeData(node.id, { fontSize: [12, 14, 16, 18][i] as number })}
          />
        </div>
      )}

      {!multi && node.type === "todo" && (
        <div>
          <SectionLabel>To-do</SectionLabel>
          <input
            value={(node.data.title as string) ?? "To-do"}
            onChange={(e) => updateNodeData(node.id, { title: e.target.value })}
            placeholder="Title"
            className="mb-2 w-full rounded-md border border-border bg-surface px-2 py-1 text-[13px] text-foreground outline-none focus:ring-0"
          />
          <div className="flex items-center justify-between text-[12px] text-muted-foreground">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(node.data.showCompleted as boolean) ?? true}
                onChange={(e) => updateNodeData(node.id, { showCompleted: e.target.checked })}
              />
              Show completed
            </label>
            <button
              type="button"
              className="rounded-md border border-border px-2 py-1 hover:bg-surface-hover"
              onClick={() => {
                const todos = Array.isArray(node.data.todos)
                  ? (node.data.todos as Array<{ label: string; done: boolean }>)
                  : [];
                updateNodeData(node.id, { todos: todos.filter((t) => !t.done) });
              }}
            >
              Clear completed
            </button>
          </div>
        </div>
      )}

      {!multi && node.type === "image" && (
        <div>
          <SectionLabel>Image</SectionLabel>
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const assetId = await storeImageAsset(file, file.name);
              updateNodeData(node.id, { assetId, caption: file.name });
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => imageRef.current?.click()}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-md border border-border py-1.5 text-[12px] text-muted-foreground hover:bg-surface-hover"
          >
            <Replace className="h-3.5 w-3.5" /> Replace image
          </button>
          <label className="mb-2 flex items-center gap-2 text-[12px] text-muted-foreground">
            <input
              type="checkbox"
              checked={(node.data.captionVisible as boolean) ?? true}
              onChange={(e) => updateNodeData(node.id, { captionVisible: e.target.checked })}
            />
            Show caption
          </label>
          <input
            value={(node.data.alt as string) ?? ""}
            onChange={(e) => updateNodeData(node.id, { alt: e.target.value })}
            placeholder="Alt text"
            className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[13px] text-foreground outline-none focus:ring-0"
          />
        </div>
      )}

      {!multi && (
        <div>
          <SectionLabel>Transform</SectionLabel>
          <div className="flex items-center gap-2">
            <Field
              label="R"
              value={Math.round((node.data.rotation as number) ?? 0)}
              onCommit={(n) => updateNodeData(node.id, { rotation: n })}
            />
            <button
              type="button"
              onClick={() => updateNodeData(node.id, { rotation: 0 })}
              className="rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      <div>
        <SectionLabel>Actions</SectionLabel>
        <div className="flex w-full gap-1 rounded-lg border border-border p-1">
          <IconBtn label="Duplicate" icon={Copy} onClick={duplicateSelected} />
          <IconBtn
            label={locked ? "Unlock" : "Lock"}
            icon={locked ? Unlock : Lock}
            onClick={() => setLockedSelected(!locked)}
          />
          {multi && selected.length >= 2 && (
            <IconBtn
              label={hasGroup ? "Ungroup" : "Group"}
              icon={hasGroup ? Ungroup : Group}
              onClick={() => (hasGroup ? ungroupSelected() : groupSelected())}
            />
          )}
        </div>
      </div>
    </div>
  );
}
