import { memo, useState } from "react";
import { NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { ChevronRight, LayoutDashboard, Edit2 } from "lucide-react";
import { ResizeControls } from "./ResizeControls";
import { ConnectorPorts } from "./ConnectorPorts";

function BoardNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;

  const title = (data.title as string) ?? "Untitled Board";
  const itemCount = (data.itemCount as number) ?? 0;
  const targetBoardId = (data.targetBoardId as string) ?? "";
  const [isEditing, setIsEditing] = useState(false);

  const handleDoubleClick = () => {
    // In a real app, this would navigate to the target board
    // For now, just allow editing the title
    setIsEditing(true);
  };

  const handleTitleBlur = () => {
    setIsEditing(false);
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
        className={`relative w-full select-none rounded-[7px] border transition-shadow ${
          (data.backgroundColor as string) || "bg-card"
        } ${
          selected
            ? "border-border-strong shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            : "border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
        }`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center",
          padding: "16px",
          minHeight: 100,
          cursor: "pointer",
        }}
        onDoubleClick={handleDoubleClick}
      >
        <ConnectorPorts />

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <input
                value={title}
                onChange={(e) => updateNodeData(id, { title: e.target.value })}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                autoFocus
                className="w-full text-lg font-semibold text-foreground bg-transparent outline-none focus:ring-0"
              />
            ) : (
              <h3 className="text-lg font-semibold text-foreground truncate">{title}</h3>
            )}
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground/70">
              <span className="flex items-center gap-1">
                <LayoutDashboard className="h-3.5 w-3.5" />
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </span>
              {targetBoardId && (
                <span className="flex items-center gap-1">
                  <ChevronRight className="h-3.5 w-3.5" />
                  Board link
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground/50">
            Experimental • navigation soon
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="flex items-center gap-1.5 rounded-[5px] border border-border bg-popover px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Rename
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default memo(BoardNode);
