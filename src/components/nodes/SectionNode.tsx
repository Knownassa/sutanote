import { memo, useState, useEffect } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { ResizeControls } from "./ResizeControls";

function SectionNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const { editingNodeId, setEditingNode } = useInteractionStore();
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;
  const isEditing = editingNodeId === id;
  const [title, setTitle] = useState((data.title as string) ?? "Section");
  const opacity = (data.opacity as number) ?? 100;

  useEffect(() => setTitle((data.title as string) ?? "Section"), [data.title]);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    updateNodeData(id, { title: v });
  };
  const handleTitleBlur = () => {
    updateNodeDataWithHistory(id, { title });
    if (isEditing) setEditingNode(null);
  };

  return (
    <div
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center",
        width: "100%",
        zIndex: -1,
      }}
    >
      <ResizeControls {...props} />
      <motion.div
        data-node-surface
        initial={reduce ? false : { scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
        className={`relative w-full select-none border bg-surface/40 backdrop-blur-[0.5px] ${selected ? "border-primary/40" : "border-border/70"}`}
        style={{
          padding: "12px",
          minHeight: 120,
          borderRadius: "6px",
          opacity: opacity / 100,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Left} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Right} className="!h-0 !w-0 !opacity-0" />

        <div className="absolute -top-3 left-3">
          {isEditing ? (
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape")
                  (e.currentTarget as HTMLInputElement).blur();
              }}
              autoFocus
              className="rounded bg-card px-2 py-0.5 text-xs font-medium text-foreground shadow-sm border border-border outline-none focus:ring-0"
            />
          ) : (
            <span
              onDoubleClick={() => useInteractionStore.getState().setEditingNode(id, "title")}
              onClick={() => {
                // click title selects section
                const { selectedNodeIds } = useCanvasStore.getState();
                if (!selectedNodeIds.includes(id)) useCanvasStore.getState().setSelectedIds([id]);
              }}
              className="rounded bg-card px-2 py-0.5 text-xs font-medium text-foreground shadow-sm border border-border cursor-pointer select-none"
            >
              {title}
            </span>
          )}
        </div>

        <div className="h-full w-full min-h-[100px]" />
      </motion.div>
    </div>
  );
}

export default memo(SectionNode);
