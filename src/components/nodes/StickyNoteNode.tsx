import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";

function StickyNoteNode({ id, data, selected }: NodeProps) {
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
      <motion.div
        initial={reduce ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: selected ? 1.02 : 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
        className={`relative w-full select-none rounded-lg transition-all ${
          data.color ?? "bg-note-yellow"
        } ${
          selected
            ? "shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
            : "shadow-[0_3px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.09)]"
        }`}
        style={{
          maxWidth: 300,
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
          placeholder="Jot something down..."
          className="h-full min-h-[100px] w-full resize-none bg-transparent font-serif text-[14px] leading-[1.6] text-note-foreground outline-none focus:ring-0 placeholder:text-note-foreground/40"
        />
      </motion.div>
    </div>
  );
}

export default memo(StickyNoteNode);
