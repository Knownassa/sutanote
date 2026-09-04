import { Eye, EyeOff, Lock, Unlock } from "lucide-react";
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

  return (
    <section className="h-[275px] shrink-0 overflow-hidden rounded-[8px] border border-border bg-popover/95 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-xs font-semibold tracking-wide text-foreground">Layers</h2>
        <span className="text-[10px] tabular-nums text-muted-foreground">{nodes.length}</span>
      </div>
      <div className="h-[calc(100%-49px)] overflow-y-auto overscroll-contain p-1.5">
        {nodes.length === 0 ? (
          <p className="px-3 py-4 text-xs text-muted-foreground">No layers yet</p>
        ) : (
          [...nodes].reverse().map((node) => {
            const selected = selectedNodeIds.includes(node.id);
            const hidden = node.data["hidden"] === true;
            const locked = node.data.locked === true;
            return (
              <div
                key={node.id}
                className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${selected ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"}`}
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate text-left"
                  onClick={() => setSelectedIds([node.id])}
                  title={node.data.title || node.data.text || labels[node.type ?? ""] || "Layer"}
                >
                  {node.data.title || node.data.text || labels[node.type ?? ""] || "Layer"}
                </button>
                <button
                  type="button"
                  aria-label={hidden ? "Show layer" : "Hide layer"}
                  className="rounded p-1 opacity-60 hover:bg-surface-active hover:opacity-100"
                  onClick={() => updateNodeDataWithHistory(node.id, { hidden: !hidden })}
                >
                  {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  aria-label={locked ? "Unlock layer" : "Lock layer"}
                  className="rounded p-1 opacity-60 hover:bg-surface-active hover:opacity-100"
                  onClick={() => updateNodeDataWithHistory(node.id, { locked: !locked })}
                >
                  {locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
