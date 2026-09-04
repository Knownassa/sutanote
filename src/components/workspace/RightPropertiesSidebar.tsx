import { useMemo, useRef, useState } from "react";
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
  Table2,
} from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import { getNodeDef } from "@/lib/node-definitions";
import { getItemDef } from "@/lib/item-registry";
import { storeImageAsset } from "@/lib/asset-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SutonoteColorPicker } from "@/components/ui/SutonoteColorPicker";
import { FOLDER_ICONS, DEFAULT_FOLDER_ICON } from "@/lib/folder-icons";
import { useItemEditorStore } from "@/lib/item-editor-store";

const colors = [
  { name: "Yellow", class: "bg-note-yellow" },
  { name: "Rose", class: "bg-note-rose" },
  { name: "Sage", class: "bg-note-sage" },
  { name: "Lavender", class: "bg-note-lavender" },
  { name: "Blue", class: "bg-note-blue" },
  { name: "White", class: "bg-card" },
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
        className="w-full rounded-[5px] border border-border bg-surface px-2 py-1 text-foreground outline-none focus:ring-0"
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
      className="flex flex-1 items-center justify-center rounded-[5px] p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}

export function RightPropertiesSidebar() {
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
  const nodes = useCanvasStore((s) => s.nodes);
  const patchSelectedData = useCanvasStore((s) => s.patchSelectedData);
  const setPositionSelected = useCanvasStore((s) => s.setPositionSelected);
  const setSizeSelected = useCanvasStore((s) => s.setSizeSelected);
  const setWidthSelected = useCanvasStore((s) => s.setWidthSelected);
  const setHeightSelected = useCanvasStore((s) => s.setHeightSelected);
  const setRotationSelected = useCanvasStore((s) => s.setRotationSelected);
  const setOpacitySelected = useCanvasStore((s) => s.setOpacitySelected);
  const bringToFront = useCanvasStore((s) => s.bringToFront);
  const sendToBack = useCanvasStore((s) => s.sendToBack);
  const bringForward = useCanvasStore((s) => s.bringForward);
  const sendBackward = useCanvasStore((s) => s.sendBackward);
  const alignSelected = useCanvasStore((s) => s.alignSelected);
  const distributeSelected = useCanvasStore((s) => s.distributeSelected);
  const matchSizeSelected = useCanvasStore((s) => s.matchSizeSelected);
  const setColorSelected = useCanvasStore((s) => s.setColorSelected);
  const setBackgroundColorSelected = useCanvasStore((s) => s.setBackgroundColorSelected);
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
  const itemDef = getItemDef(node.type ?? "text");
  const capabilities = itemDef?.capabilities ?? {};
  const locked = (node.data.locked as boolean) ?? false;
  const hasGroup = selected.some((n) => n.data.groupId);

  const commonStyle = (key: "width" | "minHeight") => {
    const vals = selected.map((n) => n.style?.[key]);
    return vals.every((v) => v === vals[0]) ? (vals[0] as number) : null;
  };
  const commonData = (key: string) => {
    const vals = selected.map((n) => n.data[key]);
    return vals.every((v) => v === vals[0]) ? vals[0] : null;
  };

  const colorMatches =
    selected.every((n) => n.data.color === node.data.color) && node.data.color !== undefined;

  const rotationVal = commonData("rotation") as number | null;
  const opacityVal = commonData("opacity") as number | null;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border/50 p-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {multi ? `${selected.length} items selected` : "Properties"}
        </h3>
        <button
          onClick={deleteSelected}
          aria-label="Delete"
          className="rounded-[5px] p-1.5 text-destructive transition-colors hover:bg-destructive/10"
        >
          <Trash2 size={16} />
        </button>
      </div>
      {!multi && node.type === "table" && (
        <div className="border-b border-border/50 px-4 py-3">
          <button
            type="button"
            onClick={() => useItemEditorStore.getState().open(node.id, "table", "window")}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            <Table2 className="h-3.5 w-3.5" />
            Edit table
          </button>
        </div>
      )}
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-5">
          {/* TRANSFORM */}
          <div>
            <SectionLabel>Transform</SectionLabel>
            {!multi ? (
              <div className="grid grid-cols-2 gap-2">
                <Field
                  label="X"
                  value={Math.round(node.position.x)}
                  onCommit={(n) => setPositionSelected(node.id, n, node.position.y)}
                />
                <Field
                  label="Y"
                  value={Math.round(node.position.y)}
                  onCommit={(n) => setPositionSelected(node.id, node.position.x, n)}
                />
                <Field
                  label="W"
                  value={commonStyle("width")}
                  onCommit={(n) =>
                    setSizeSelected(
                      node.id,
                      Math.max(def.minWidth, n),
                      node.style?.minHeight as number,
                    )
                  }
                />
                <Field
                  label="H"
                  value={commonStyle("minHeight")}
                  onCommit={(n) =>
                    setSizeSelected(
                      node.id,
                      node.style?.width as number,
                      Math.max(def.minHeight, n),
                    )
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Field
                  label="W"
                  value={commonStyle("width")}
                  onCommit={(n) => setWidthSelected(n)}
                />
                <Field
                  label="H"
                  value={commonStyle("minHeight")}
                  onCommit={(n) => setHeightSelected(n)}
                />
              </div>
            )}
            <div className="mt-2 flex items-center gap-2">
              <Field
                label="R"
                value={rotationVal !== null ? Math.round(rotationVal as number) : null}
                onCommit={(n) => setRotationSelected(n)}
              />
              <button
                type="button"
                onClick={() => setRotationSelected(0)}
                className="rounded-[5px] border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
              >
                Reset
              </button>
            </div>
            <div className="mt-2">
              <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <span className="w-4 text-center">O</span>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={opacityVal ?? 100}
                  onChange={(e) => setOpacitySelected(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-8 text-right text-[11px] tabular-nums">
                  {opacityVal === null ? "Mixed" : `${opacityVal}%`}
                </span>
              </label>
            </div>
          </div>

          {/* APPEARANCE - capability gated */}
          {(capabilities.background ||
            node.type === "text" ||
            node.type === "sticky" ||
            node.type === "todo" ||
            node.type === "shape" ||
            node.type === "section" ||
            node.type === "frame" ||
            node.type === "column") && (
            <div>
              <SectionLabel>Appearance</SectionLabel>
              <div className="grid grid-cols-6 gap-2">
                {colors.map((color, i) => (
                  <button
                    key={`${color.name}-${i}`}
                    type="button"
                    onClick={() => setColorSelected(color.class)}
                    aria-label={color.name}
                    title={color.name}
                    className={`aspect-square rounded-[5px] border border-border-strong transition-all ${
                      colorMatches && node.data.color === color.class
                        ? "ring-2 ring-foreground/40 ring-offset-1"
                        : "hover:scale-105"
                    } ${color.class}`}
                  />
                ))}
                <SutonoteColorPicker
                  value={(node.data.backgroundColor as string) ?? ""}
                  onChange={(c) => setBackgroundColorSelected(c)}
                  palette="object"
                />
              </div>
            </div>
          )}

          {!multi &&
            (node.type === "section" || node.type === "frame" || node.type === "column") && (
              <div>
                <SectionLabel>Container</SectionLabel>
                <div className="space-y-2">
                  {node.type !== "column" && (
                    <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={(node.data["showTitle"] as boolean) ?? true}
                        onChange={(event) => patchSelectedData({ showTitle: event.target.checked })}
                      />
                      Show title
                    </label>
                  )}
                  {node.type === "column" && (
                    <>
                      <Field
                        label="G"
                        value={(node.data.gap as number) ?? 10}
                        onCommit={(value) => patchSelectedData({ gap: Math.max(0, value) })}
                      />
                      <Field
                        label="P"
                        value={(node.data.padding as number) ?? 12}
                        onCommit={(value) => patchSelectedData({ padding: Math.max(0, value) })}
                      />
                      <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={(node.data.autoHeight as boolean) ?? false}
                          onChange={(event) =>
                            patchSelectedData({ autoHeight: event.target.checked })
                          }
                        />
                        Auto height
                      </label>
                    </>
                  )}
                  {node.type === "section" && (
                    <Field
                      label="BO"
                      value={(node.data["borderOpacity"] as number) ?? 70}
                      onCommit={(value) =>
                        patchSelectedData({ borderOpacity: Math.max(0, Math.min(100, value)) })
                      }
                    />
                  )}
                </div>
              </div>
            )}

          {/* SHAPE specific */}
          {!multi && node.type === "shape" && (
            <div>
              <SectionLabel>Shape</SectionLabel>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <span className="w-12">Type</span>
                  <select
                    value={(node.data.shape as string) ?? "rectangle"}
                    onChange={(e) => patchSelectedData({ shape: e.target.value })}
                    className="flex-1 rounded-[5px] border border-border bg-surface px-2 py-1 text-foreground outline-none"
                  >
                    <option value="rectangle">Rectangle</option>
                    <option value="rounded-rectangle">Rounded</option>
                    <option value="circle">Circle</option>
                    <option value="diamond">Diamond</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <span className="w-12">Fill</span>
                  <SutonoteColorPicker
                    value={(node.data.fill as string) ?? "transparent"}
                    onChange={(c) => patchSelectedData({ fill: c })}
                    palette="object"
                  />
                  <span className="text-[11px]">{(node.data.fill as string) || "none"}</span>
                </label>
                <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <span className="w-12">Stroke</span>
                  <SutonoteColorPicker
                    value={(node.data.stroke as string) ?? "#000000"}
                    onChange={(c) => patchSelectedData({ stroke: c })}
                    palette="object"
                  />
                </label>
                <Field
                  label="W"
                  value={(node.data.strokeWidth as number) ?? 2}
                  onCommit={(n) => patchSelectedData({ strokeWidth: n })}
                  step={1}
                />
                <Field
                  label="R"
                  value={(node.data.rotation as number) ?? 0}
                  onCommit={(n) => patchSelectedData({ rotation: n })}
                  step={1}
                />
                <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <span className="w-12">Opacity</span>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    value={(node.data.opacity as number) ?? 100}
                    onChange={(e) => patchSelectedData({ opacity: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="w-8 text-right text-[11px] tabular-nums">
                    {`${(node.data.opacity as number) ?? 100}%`}
                  </span>
                </label>
                {(node.data.shape as string) === "rounded-rectangle" && (
                  <Field
                    label="CR"
                    value={(node.data.cornerRadius as number) ?? 12}
                    onCommit={(n) => patchSelectedData({ cornerRadius: n })}
                    step={1}
                  />
                )}
              </div>
            </div>
          )}

          {/* COLOR SWATCH */}
          {!multi && node.type === "color_swatch" && (
            <div>
              <SectionLabel>Swatch</SectionLabel>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <span className="w-12">Color</span>
                  <SutonoteColorPicker
                    value={(node.data.color as string) ?? "#6366f1"}
                    onChange={(c) => patchSelectedData({ color: c })}
                    palette="object"
                  />
                </label>
                <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <span className="w-12">Label</span>
                  <input
                    value={(node.data.label as string) ?? ""}
                    onChange={(e) => patchSelectedData({ label: e.target.value })}
                    placeholder="Color name"
                    className="flex-1 rounded-[5px] border border-border bg-surface px-2 py-1 text-foreground outline-none"
                  />
                </label>
              </div>
            </div>
          )}

          {/* FOLDER */}
          {!multi && node.type === "folder" && (
            <div>
              <SectionLabel>Folder</SectionLabel>
              <input
                value={(node.data.title as string) ?? ""}
                onChange={(e) => patchSelectedData({ title: e.target.value })}
                placeholder="Folder name"
                className="mb-2 w-full rounded-[5px] border border-border bg-surface px-2 py-1 text-[13px] text-foreground outline-none focus:ring-0"
              />
              <div className="mb-2 grid grid-cols-8 gap-1">
                {FOLDER_ICONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    title={opt.label}
                    aria-label={opt.label}
                    onClick={() => patchSelectedData({ icon: opt.id })}
                    className={`flex aspect-square items-center justify-center rounded-[5px] border transition-colors ${
                      ((node.data["icon"] as string) ?? DEFAULT_FOLDER_ICON) === opt.id
                        ? "border-border-strong bg-surface-active text-foreground"
                        : "border-border text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                    }`}
                  >
                    <opt.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <span className="w-12">Icon</span>
                <SutonoteColorPicker
                  value={(node.data["iconColor"] as string) ?? ""}
                  onChange={(c) => patchSelectedData({ iconColor: c })}
                  palette="object"
                />
                <button
                  type="button"
                  onClick={() => patchSelectedData({ iconColor: "" })}
                  className="rounded-[5px] border border-border px-2 py-1 text-[11px] hover:bg-surface-hover"
                >
                  Default
                </button>
              </div>
            </div>
          )}

          {/* BOARD */}
          {!multi && node.type === "board" && (
            <div>
              <SectionLabel>Board</SectionLabel>
              <input
                value={(node.data.title as string) ?? ""}
                onChange={(e) => patchSelectedData({ title: e.target.value })}
                placeholder="Board name"
                className="w-full rounded-[5px] border border-border bg-surface px-2 py-1 text-[13px] text-foreground outline-none focus:ring-0"
              />
            </div>
          )}

          {/* LINK */}
          {!multi && node.type === "link" && (
            <div>
              <SectionLabel>Link</SectionLabel>
              <input
                value={(node.data.url as string) ?? ""}
                onChange={(e) => patchSelectedData({ url: e.target.value })}
                placeholder="https://…"
                className="mb-2 w-full rounded-[5px] border border-border bg-surface px-2 py-1 text-[13px] text-foreground outline-none focus:ring-0"
              />
              <input
                value={(node.data.title as string) ?? ""}
                onChange={(e) => patchSelectedData({ title: e.target.value })}
                placeholder="Title"
                className="w-full rounded-[5px] border border-border bg-surface px-2 py-1 text-[13px] text-foreground outline-none focus:ring-0"
              />
            </div>
          )}

          {/* ARRANGE - single */}
          {!multi && (
            <div>
              <SectionLabel>Arrange</SectionLabel>
              <div className="flex w-full gap-1 rounded-lg border border-border p-1">
                <IconBtn
                  label="Bring forward"
                  icon={ArrowUp}
                  onClick={() => bringForward(node.id)}
                />
                <IconBtn
                  label="Send backward"
                  icon={ArrowDown}
                  onClick={() => sendBackward(node.id)}
                />
                <IconBtn
                  label="Bring to front"
                  icon={BringToFront}
                  onClick={() => bringToFront(node.id)}
                />
                <IconBtn
                  label="Send to back"
                  icon={SendToBack}
                  onClick={() => sendToBack(node.id)}
                />
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
                    className="rounded-[5px] border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
                    onClick={() => alignSelected("left")}
                  >
                    Left
                  </button>
                  <button
                    className="rounded-[5px] border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
                    onClick={() => alignSelected("centerX")}
                  >
                    Center
                  </button>
                  <button
                    className="rounded-[5px] border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
                    onClick={() => alignSelected("right")}
                  >
                    Right
                  </button>
                  <button
                    className="rounded-[5px] border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
                    onClick={() => alignSelected("top")}
                  >
                    Top
                  </button>
                  <button
                    className="rounded-[5px] border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
                    onClick={() => alignSelected("centerY")}
                  >
                    Middle
                  </button>
                  <button
                    className="rounded-[5px] border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
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
                    className="rounded-[5px] border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
                    onClick={() => distributeSelected("horizontal")}
                  >
                    Horizontally
                  </button>
                  <button
                    className="rounded-[5px] border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
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
                    className="rounded-[5px] border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
                    onClick={() => matchSizeSelected("width")}
                  >
                    Match width
                  </button>
                  <button
                    className="rounded-[5px] border border-border py-1 text-[11px] text-muted-foreground hover:bg-surface-hover"
                    onClick={() => matchSizeSelected("height")}
                  >
                    Match height
                  </button>
                </div>
              </div>
            </>
          )}

          {!multi && node.type === "todo" && (
            <div>
              <SectionLabel>To-do</SectionLabel>
              <input
                value={(node.data.title as string) ?? "To-do"}
                onChange={(e) => patchSelectedData({ title: e.target.value })}
                placeholder="Title"
                className="mb-2 w-full rounded-[5px] border border-border bg-surface px-2 py-1 text-[13px] text-foreground outline-none focus:ring-0"
              />
              <div className="flex items-center justify-between text-[12px] text-muted-foreground">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(node.data.showCompleted as boolean) ?? true}
                    onChange={(e) => patchSelectedData({ showCompleted: e.target.checked })}
                  />
                  Show completed
                </label>
                <button
                  type="button"
                  className="rounded-[5px] border border-border px-2 py-1 hover:bg-surface-hover"
                  onClick={() => {
                    const todos = Array.isArray(node.data.todos)
                      ? (node.data.todos as Array<{ label: string; done: boolean }>)
                      : [];
                    patchSelectedData({ todos: todos.filter((t) => !t.done) });
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
                  patchSelectedData({ assetId, caption: file.name });
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => imageRef.current?.click()}
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-[5px] border border-border py-1.5 text-[12px] text-muted-foreground hover:bg-surface-hover"
              >
                <Replace className="h-3.5 w-3.5" /> Replace image
              </button>
              <label className="mb-2 flex items-center gap-2 text-[12px] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={(node.data.captionVisible as boolean) ?? true}
                  onChange={(e) => patchSelectedData({ captionVisible: e.target.checked })}
                />
                Show caption
              </label>
              <input
                value={(node.data.alt as string) ?? ""}
                onChange={(e) => patchSelectedData({ alt: e.target.value })}
                placeholder="Alt text"
                className="w-full rounded-[5px] border border-border bg-surface px-2 py-1 text-[13px] text-foreground outline-none focus:ring-0"
              />
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
      </ScrollArea>
    </div>
  );
}

function CustomColorButton({
  currentColor,
  onPick,
}: {
  currentColor: string;
  onPick: (hex: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(currentColor || "#c79872");
  const pickerRef = useRef<HTMLDivElement>(null);

  const applyColor = (value: string) => {
    if (/^#[0-9a-f]{6}$/i.test(value)) {
      onPick(value);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="aspect-square rounded-[5px] border border-border-strong transition-all hover:scale-105"
        style={{
          background: currentColor || "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
        }}
        title="Custom color"
        aria-label="Custom color"
      />
      {open && (
        <div
          ref={pickerRef}
          className="absolute bottom-full left-0 z-50 mb-2 w-[200px] rounded-[10px] border border-border bg-popover p-3 shadow-lg"
        >
          <div
            className="mb-2 flex h-8 w-full items-center justify-center rounded border border-border"
            style={{ background: hex }}
          />
          <div className="flex gap-1">
            <span className="text-[12px] text-muted-foreground">#</span>
            <input
              value={hex.replace("#", "")}
              onChange={(e) => {
                const v = "#" + e.target.value.replace(/[^0-9a-f]/gi, "").slice(0, 6);
                setHex(v);
                if (/^#[0-9a-f]{6}$/i.test(v)) applyColor(v);
              }}
              className="flex-1 bg-transparent text-[12px] font-mono text-foreground outline-none"
              maxLength={6}
              placeholder="c79872"
            />
          </div>
        </div>
      )}
    </div>
  );
}
