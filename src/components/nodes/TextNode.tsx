import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";

function TextNode({ id, data, selected }: NodeProps) {
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
        animate={{ scale: selected ? 1.01 : 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
        className={`relative w-full select-none rounded-xl border transition-all ${
          data.color ?? "bg-card"
        } ${
          selected
            ? "border-border-strong shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
            : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
        }`}
        style={{ maxWidth: 380, padding: "20px 22px" }}
      >
        <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Left} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Right} className="!h-0 !w-0 !opacity-0" />
        <input
          value={(data.title as string) ?? ""}
          onChange={(e) => updateNodeData(id, { title: e.target.value })}
          placeholder="Title"
          className="mb-2 w-full bg-transparent text-[15px] font-semibold tracking-tight text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50"
        />
        <textarea
          value={(data.text as string) ?? ""}
          onChange={(e) => updateNodeData(id, { text: e.target.value })}
          placeholder="Start writing..."
          className="min-h-[80px] w-full resize-none bg-transparent font-serif text-[14px] leading-[1.65] text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50"
        />
      </motion.div>
    </div>
  );
}

export default memo(TextNode);
