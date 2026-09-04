import { memo, useState, useMemo } from "react";
import { NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { ChevronDown } from "lucide-react";
import { ResizeControls } from "./ResizeControls";
import { ConnectorPorts } from "./ConnectorPorts";

function ColumnNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const allNodes = useCanvasStore((s) => s.nodes);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;

  const title = (data.title as string) ?? "Column";
  const collapsed = (data.collapsed as boolean) ?? false;
  const opacity = (data.opacity as number) ?? 100;
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const children = useMemo(() => {
    const order = (data.childOrder as string[] | undefined) ?? [];
    return allNodes
      .filter((n) => (n.data.parentId as string | undefined) === id)
      .sort((a, b) => {
        const aIndex = order.indexOf(a.id);
        const bIndex = order.indexOf(b.id);
        return (
          (aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex) -
          (bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex)
        );
      });
  }, [allNodes, data.childOrder, id]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    updateNodeDataWithHistory(id, { title });
  };

  return (
    <div style={{ width: "100%" }}>
      <ResizeControls {...props} />
      <motion.div
        data-node-surface
        initial={reduce ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
        className={`relative w-full select-none rounded-[7px] border transition-shadow ${selected ? "border-primary/40 shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "border-border/70 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center",
          padding: "12px",
          minHeight: 120,
          background: (data.backgroundColor as string) || "var(--surface)",
          opacity: opacity / 100,
        }}
      >
        <ConnectorPorts />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            {isEditingTitle ? (
              <input
                value={title}
                onChange={(e) => updateNodeData(id, { title: e.target.value })}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
                  if (e.key === "Escape") setIsEditingTitle(false);
                }}
                autoFocus
                className="flex-1 bg-transparent text-sm font-semibold text-foreground outline-none"
              />
            ) : (
              <h3
                onDoubleClick={() => setIsEditingTitle(true)}
                className="flex-1 truncate text-sm font-semibold text-foreground cursor-pointer select-none"
              >
                {title}
              </h3>
            )}
            <span className="ml-2 text-xs tabular-nums text-muted-foreground/60">
              {children.length}
            </span>
            <button
              type="button"
              onClick={() => updateNodeDataWithHistory(id, { collapsed: !collapsed })}
              className="ml-1 flex h-6 w-6 items-center justify-center rounded-[5px] hover:bg-surface-hover text-muted-foreground"
              aria-label={collapsed ? "Expand" : "Collapse"}
            >
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${collapsed ? "-rotate-90" : ""}`}
              />
            </button>
          </div>

          {!collapsed && (
            <div
              className="flex min-h-[76px] flex-col border-t border-border/50 pt-2"
              style={{ gap: Number(data.gap ?? 10), padding: Number(data.padding ?? 0) }}
            >
              {children.length === 0 && (
                <p className="py-6 text-center text-xs text-muted-foreground/50">Drop items here</p>
              )}
              <p className="text-center text-[10px] text-muted-foreground/40">
                {children.length} {children.length === 1 ? "item" : "items"} · drag cards to reorder
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default memo(ColumnNode);
