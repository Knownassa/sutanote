import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";

function StickyNoteNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;

  return (
    <div>
      <motion.div
        initial={reduce ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: selected ? 1.02 : 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
        className={`relative select-none rounded-lg border p-3 shadow-sm transition-[box-shadow,border-color] ${
          data.color ?? "bg-note-yellow"
        } ${
          selected ? "border-border-strong shadow-lg" : "border-note-foreground/10 hover:shadow-md"
        }`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center",
          minWidth: 200,
          maxWidth: 320,
          minHeight: 140,
        }}
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
          placeholder="Type something..."
          className="h-full min-h-[80px] w-full resize-none bg-transparent font-serif text-sm leading-relaxed text-note-foreground placeholder:text-note-foreground/50 outline-none focus:ring-0"
        />
      </motion.div>
    </div>
  );
}

export default memo(StickyNoteNode);
