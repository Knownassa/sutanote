import { memo } from "react";
import { Handle, Position, NodeResizer, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { getNodeDef } from "@/lib/node-definitions";

const handleStyle = {
  width: 8,
  height: 8,
  borderRadius: "9999px",
  background: "var(--popover)",
  border: "1px solid var(--border-strong)",
};

const lineStyle = { border: "none" };

function TextNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;
  const locked = (data.locked as boolean) ?? false;
  const def = getNodeDef("text");

  return (
    <div
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center",
        width: "100%",
      }}
    >
      <NodeResizer
        isVisible={selected && !locked}
        minWidth={def.minWidth}
        minHeight={def.minHeight}
        {...(def.maxWidth ? { maxWidth: def.maxWidth } : {})}
        handleStyle={handleStyle}
        lineStyle={lineStyle}
      />
      <motion.div
        data-node-surface
        initial={reduce ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: selected ? 1.01 : 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
        className={`relative w-full select-none rounded-xl border transition-shadow ${
          data.color ?? "bg-card"
        } ${
          selected
            ? "border-border-strong shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
            : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
        }`}
        style={{ padding: "20px 22px" }}
      >
        <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Left} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Right} className="!h-0 !w-0 !opacity-0" />
        <input
          value={(data.title as string) ?? ""}
          onChange={(e) => updateNodeData(id, { title: e.target.value })}
          onFocus={() => useInteractionStore.getState().setEditingText(true)}
          onBlur={() => useInteractionStore.getState().setEditingText(false)}
          placeholder="Title"
          className="mb-2 w-full cursor-text bg-transparent text-[15px] font-semibold tracking-tight text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50"
        />
        <textarea
          value={(data.text as string) ?? ""}
          onChange={(e) => updateNodeData(id, { text: e.target.value })}
          onFocus={() => useInteractionStore.getState().setEditingText(true)}
          onBlur={() => useInteractionStore.getState().setEditingText(false)}
          placeholder="Start writing..."
          className={`min-h-[80px] w-full cursor-text resize-none bg-transparent font-serif leading-[1.65] outline-none focus:ring-0 placeholder:text-muted-foreground/50 ${
            (data.bold as boolean) ? "font-bold" : ""
          } ${(data.italic as boolean) ? "italic" : ""}`}
          style={{
            fontSize: (data.fontSize as number) ?? 14,
            textAlign: (data.textAlign as "left" | "center" | "right") ?? "left",
            color: (data.textColor as string) || undefined,
          }}
        />
      </motion.div>
    </div>
  );
}

export default memo(TextNode);
