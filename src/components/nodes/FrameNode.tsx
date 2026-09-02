import { memo, useState, useMemo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { ResizeControls } from "./ResizeControls";

function FrameNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;

  const title = (data.title as string) ?? "";
  const showTitle = (data.showTitle as boolean) ?? true;
  const opacity = (data.opacity as number) ?? 100;
  const allNodes = useCanvasStore((s) => s.nodes);
  const children = useMemo(
    () => allNodes.filter((n) => (n.data.parentId as string | undefined) === id),
    [allNodes, id],
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);

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
        className={`relative w-full select-none rounded-[6px] border transition-shadow ${selected ? "border-primary/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)]" : "border-border/60 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center",
          padding: showTitle ? "48px 16px 16px" : "16px",
          minHeight: 120,
          minWidth: 200,
          background: (data.backgroundColor as string) || "transparent",
          opacity: opacity / 100,
        }}
      >
        <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Left} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Right} className="!h-0 !w-0 !opacity-0" />

        {showTitle && (
          <div className="absolute -top-6 left-4 w-auto">
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
                className="bg-card px-2 py-1 rounded text-sm font-medium text-foreground outline-none focus:ring-0"
              />
            ) : (
              <span
                onDoubleClick={() => setIsEditingTitle(true)}
                className="bg-card px-2 py-1 rounded text-sm font-medium text-foreground cursor-pointer select-none"
              >
                {title || "Frame"}
              </span>
            )}
          </div>
        )}

        <div className="absolute bottom-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-muted-foreground/60">{children.length} items</span>
          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <input
              type="checkbox"
              checked={showTitle}
              onChange={(e) => updateNodeDataWithHistory(id, { showTitle: e.target.checked })}
              className="h-3 w-3 rounded border-border"
            />
            Title
          </label>
        </div>

        <div className="h-full w-full min-h-[80px]" />
      </motion.div>
    </div>
  );
}

export default memo(FrameNode);
