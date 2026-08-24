import { memo, useState, useRef, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { GripVertical, Plus, ChevronDown, Edit2, Trash2 } from "lucide-react";
import { ResizeControls } from "./ResizeControls";

interface ColumnItem {
  id: string;
  type: string;
  label: string;
}

function ColumnNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;

  const title = (data.title as string) ?? "Column";
  const items = (data.items as ColumnItem[]) ?? [];
  const collapsed = (data.collapsed as boolean) ?? false;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    updateNodeDataWithHistory(id, { title });
  };

  const addItem = (type: string) => {
    const newItem: ColumnItem = {
      id: crypto.randomUUID(),
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
    };
    updateNodeDataWithHistory(id, { items: [...items, newItem] });
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    updateNodeDataWithHistory(id, { items: next });
  };

  const reorderItems = (fromIndex: number, toIndex: number) => {
    const next = [...items];
    const removed = next.splice(fromIndex, 1)[0];
    if (removed) next.splice(toIndex, 0, removed);
    updateNodeDataWithHistory(id, { items: next });
  };

  const renderItem = (item: ColumnItem, index: number) => (
    <div
      key={item.id}
      className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-surface/50 hover:bg-surface transition-colors group"
      style={{ opacity: dragOverIndex === index ? 0.5 : 1 }}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab" />
      <span className="flex-1 text-sm text-foreground truncate">{item.label}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeItem(index);
          }}
          className="h-6 w-6 rounded hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive"
          aria-label="Remove"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );

  return (
    <div
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center",
        width: "100%",
      }}
    >
      <ResizeControls {...props} />
      <motion.div
        data-node-surface
        initial={reduce ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
        className={`relative w-full select-none rounded-xl border transition-shadow ${
          (data.backgroundColor as string) || "bg-card"
        } ${
          selected
            ? "border-border-strong shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
        }`}
        style={{ padding: "12px", minWidth: 240, maxWidth: 400 }}
      >
        <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Left} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Right} className="!h-0 !w-0 !opacity-0" />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            {isEditingTitle ? (
              <input
                value={title}
                onChange={(e) => updateNodeData(id, { title: e.target.value })}
                onBlur={() => {
                  setIsEditingTitle(false);
                  updateNodeDataWithHistory(id, { title });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                  if (e.key === "Escape") setIsEditingTitle(false);
                }}
                autoFocus
                className="flex-1 text-sm font-semibold text-foreground bg-transparent outline-none focus:ring-0"
              />
            ) : (
              <h3
                onDoubleClick={() => setIsEditingTitle(true)}
                className="flex-1 text-sm font-semibold text-foreground truncate cursor-pointer"
              >
                {title}
              </h3>
            )}
            <button
              type="button"
              onClick={() => updateNodeDataWithHistory(id, { collapsed: !collapsed })}
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-surface-hover text-muted-foreground"
              aria-label={collapsed ? "Expand" : "Collapse"}
            >
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${collapsed ? "-rotate-90" : ""}`}
              />
            </button>
          </div>

          {!collapsed && (
            <div className="space-y-1 border-t border-border/50 pt-2">
              {items.map((item, index) => renderItem(item, index))}
              <div className="flex gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => addItem("text")}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-1.5 text-[11px] text-muted-foreground/60 transition-colors hover:border-primary/40 hover:text-muted-foreground"
                >
                  <Plus className="h-3 w-3" />
                  Add Text
                </button>
                <button
                  type="button"
                  onClick={() => addItem("sticky")}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-1.5 text-[11px] text-muted-foreground/60 transition-colors hover:border-primary/40 hover:text-muted-foreground"
                >
                  <Plus className="h-3 w-3" />
                  Add Note
                </button>
                <button
                  type="button"
                  onClick={() => addItem("todo")}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-1.5 text-[11px] text-muted-foreground/60 transition-colors hover:border-primary/40 hover:text-muted-foreground"
                >
                  <Plus className="h-3 w-3" />
                  Add To-do
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default memo(ColumnNode);
