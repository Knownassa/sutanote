import { memo } from "react";
import { Handle, Position, NodeResizer, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { ExternalLink } from "lucide-react";
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

function LinkNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;
  const locked = (data.locked as boolean) ?? false;
  const def = getNodeDef("link");
  const url = (data.url as string) ?? "";
  const title = (data.title as string) ?? "";
  const description = (data.description as string) ?? "";

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
        className={`relative w-full select-none rounded-xl border transition-shadow bg-card ${
          selected
            ? "border-border-strong shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
            : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
        }`}
        style={{ padding: "14px 18px" }}
      >
        <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Left} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Right} className="!h-0 !w-0 !opacity-0" />

        <div className="flex items-start gap-2">
          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <input
              value={title}
              onChange={(e) => updateNodeData(id, { title: e.target.value })}
              onFocus={() => useInteractionStore.getState().setEditingText(true)}
              onBlur={() => useInteractionStore.getState().setEditingText(false)}
              placeholder="Link title"
              className="mb-1 w-full cursor-text bg-transparent text-[14px] font-semibold tracking-tight text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50"
            />
            <input
              value={url}
              onChange={(e) => updateNodeData(id, { url: e.target.value })}
              onFocus={() => useInteractionStore.getState().setEditingText(true)}
              onBlur={() => useInteractionStore.getState().setEditingText(false)}
              placeholder="https://..."
              className="mb-1 w-full cursor-text bg-transparent text-[12px] text-muted-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/40"
            />
            <input
              value={description}
              onChange={(e) => updateNodeData(id, { description: e.target.value })}
              onFocus={() => useInteractionStore.getState().setEditingText(true)}
              onBlur={() => useInteractionStore.getState().setEditingText(false)}
              placeholder="Optional description"
              className="w-full cursor-text bg-transparent text-[12px] text-muted-foreground/70 outline-none focus:ring-0 placeholder:text-muted-foreground/30"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default memo(LinkNode);
