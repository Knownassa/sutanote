import { memo, useState, useMemo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { ChevronDown } from "lucide-react";
import { ResizeControls } from "./ResizeControls";

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

  const children = useMemo(
    () => allNodes.filter((n) => (n.data.parentId as string | undefined) === id),
    [allNodes, id],
  );

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
            <div className="space-y-2 border-t border-border/50 pt-2">
              {children.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground/50">Drop items here</p>
              ) : (
                <div className="space-y-1">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center gap-2 rounded-[5px] bg-card px-2 py-1 text-xs text-foreground border border-border/50"
                    >
                      <span className="flex-1 truncate">
                        {(child.data.title as string) ||
                          (child.data.text as string)?.slice(0, 24) ||
                          child.type}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">{child.type}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-center text-[10px] text-muted-foreground/40">
                {children.length} {children.length === 1 ? "item" : "items"} • move Column to move
                children
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default memo(ColumnNode);
