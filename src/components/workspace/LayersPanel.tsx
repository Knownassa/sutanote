import { Eye, EyeOff, Lock, Unlock } from "lucide-react";
import type { ReactNode } from "react";
import { useCanvasStore } from "@/lib/store";

const labels: Record<string, string> = {
  sticky: "Sticky note",
  text: "Text",
  todo: "To-do",
  image: "Image",
  link: "Link",
  section: "Section",
  frame: "Frame",
  column: "Column",
  board: "Board",
  folder: "Folder",
  audio: "Audio",
  table: "Table",
  drawing: "Drawing",
};

export function LayersPanel() {
  const nodes = useCanvasStore((s) => s.nodes);
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
  const setSelectedIds = useCanvasStore((s) => s.setSelectedIds);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);

  const childrenByParent = new Map<string, typeof nodes>();
  const nodeIds = new Set(nodes.map((node) => node.id));
  for (const node of nodes) {
    const parentId = node.data.parentId as string | undefined;
    if (!parentId || !nodeIds.has(parentId)) continue;
    const children = childrenByParent.get(parentId) ?? [];
    children.push(node);
    childrenByParent.set(parentId, children);
  }

  const ordered = (items: typeof nodes, parentId?: string) => {
    const order = parentId
      ? ((nodes.find((node) => node.id === parentId)?.data.childOrder as string[] | undefined) ??
        [])
      : [];
    return [...items].sort((a, b) => {
      const aIndex = order.indexOf(a.id);
      const bIndex = order.indexOf(b.id);
      if (aIndex !== -1 || bIndex !== -1) {
        return (
          (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
          (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex)
        );
      }
      return (b.zIndex ?? 0) - (a.zIndex ?? 0);
    });
  };

  const renderLayer = (
    node: (typeof nodes)[number],
    depth: number,
    ancestors: Set<string>,
  ): ReactNode[] => {
    if (ancestors.has(node.id)) return [];
    const nextAncestors = new Set(ancestors).add(node.id);
    const children = ordered(childrenByParent.get(node.id) ?? [], node.id);
    const selected = selectedNodeIds.includes(node.id);
    const hidden = node.data["hidden"] === true;
    const locked = node.data.locked === true;
    const label =
      (node.data.title as string) ||
      (node.data.text as string) ||
      labels[node.type ?? ""] ||
      "Layer";
    return [
      <div
        key={node.id}
        className={`group flex items-center gap-2 rounded-lg py-1.5 pr-2 text-xs ${selected ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"}`}
        style={{ paddingLeft: 8 + depth * 14 }}
      >
        <button
          type="button"
          className="min-w-0 flex-1 truncate text-left"
          onClick={() => setSelectedIds([node.id])}
          title={label}
        >
          {children.length > 0 && (
            <span className="mr-1 text-[9px] text-muted-foreground/60">▾</span>
          )}
          {label}
        </button>
        <button
          type="button"
          aria-label={hidden ? "Show layer" : "Hide layer"}
          className="rounded p-1 opacity-60 transition-colors hover:bg-surface-active hover:opacity-100"
          onClick={() => updateNodeDataWithHistory(node.id, { hidden: !hidden })}
        >
          {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          aria-label={locked ? "Unlock layer" : "Lock layer"}
          className="rounded p-1 opacity-60 transition-colors hover:bg-surface-active hover:opacity-100"
          onClick={() => updateNodeDataWithHistory(node.id, { locked: !locked })}
        >
          {locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
        </button>
      </div>,
      ...children.flatMap((child) => renderLayer(child, depth + 1, nextAncestors)),
    ];
  };

  const rootNodes = ordered(
    nodes.filter((node) => {
      const parentId = node.data.parentId as string | undefined;
      return !parentId || !nodeIds.has(parentId);
    }),
  );

  return (
    <section className="h-[275px] shrink-0 overflow-hidden rounded-[var(--radius-panel)] border border-border bg-popover/95 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-xs font-semibold tracking-wide text-foreground">Layers</h2>
        <span className="text-[10px] tabular-nums text-muted-foreground">{nodes.length}</span>
      </div>
      <div className="h-[calc(100%-49px)] overflow-y-auto overscroll-contain p-1.5">
        {nodes.length === 0 ? (
          <p className="px-3 py-4 text-xs text-muted-foreground">No layers yet</p>
        ) : (
          rootNodes.flatMap((node) => renderLayer(node, 0, new Set()))
        )}
      </div>
    </section>
  );
}
