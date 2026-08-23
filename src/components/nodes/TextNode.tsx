import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";

function TextNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;

  return (
    <div style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "center" }}>
      <motion.div
        initial={reduce ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: selected ? 1.02 : 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
        className={`relative select-none rounded-xl border p-5 transition-[box-shadow,border-color] ${
          data.color ?? "bg-card"
        } ${
          selected
            ? "border-border-strong shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
            : "border-border hover:border-border-strong"
        }`}
        style={{ minWidth: 240, maxWidth: 400 }}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="h-3 w-3 bg-transparent opacity-0"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="h-3 w-3 bg-transparent opacity-0"
        />
        <Handle
          type="source"
          position={Position.Left}
          className="h-3 w-3 bg-transparent opacity-0"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="h-3 w-3 bg-transparent opacity-0"
        />

        <textarea
          value={(data.text as string) ?? ""}
          onChange={(e) => updateNodeData(id, { text: e.target.value })}
          placeholder="Start writing..."
          className="min-h-[60px] w-full resize-none bg-transparent font-serif text-base leading-[1.65] text-foreground placeholder:text-muted-foreground outline-none focus:ring-0"
        />
      </motion.div>
    </div>
  );
}

export default memo(TextNode);
