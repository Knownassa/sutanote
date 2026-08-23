import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { ResizeControls } from "./ResizeControls";

function StickyNoteNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;

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
        className={`relative w-full select-none rounded-lg transition-shadow ${
          (data.backgroundColor as string) || (data.color ?? "bg-note-yellow")
        } ${
          selected
            ? "shadow-[0_4px_14px_rgba(0,0,0,0.06)]"
            : "shadow-[0_3px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.09)]"
        }`}
        style={{
          minHeight: 160,
          padding: "18px",
          border: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Left} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Right} className="!h-0 !w-0 !opacity-0" />
        <textarea
          value={(data.text as string) ?? ""}
          onChange={(e) => updateNodeData(id, { text: e.target.value })}
          onFocus={() => useInteractionStore.getState().setEditingText(true)}
          onBlur={() => useInteractionStore.getState().setEditingText(false)}
          placeholder="Jot something down..."
          className="h-full min-h-[100px] w-full cursor-text resize-none bg-transparent font-serif leading-[1.6] text-note-foreground outline-none focus:ring-0 placeholder:text-note-foreground/40"
          style={{ fontSize: (data.fontSize as number) ?? 14 }}
        />
      </motion.div>
    </div>
  );
}

export default memo(StickyNoteNode);
