import { memo, useEffect, useRef } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { useSettingsStore } from "@/lib/settings-store";
import { ResizeControls } from "./ResizeControls";

function CommentNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;
  const text = (data.text as string) ?? "";
  const author = (data.author as string) ?? useSettingsStore.getState().displayName;
  const resolved = (data.resolved as boolean) ?? false;
  const createdAt = (data.createdAt as number) ?? 0;
  const updatedAt = (data.updatedAt as number) ?? 0;
  const initRef = useRef(false);

  // Auto-set createdAt on first render.
  useEffect(() => {
    if (!initRef.current && !createdAt) {
      initRef.current = true;
      updateNodeData(id, { createdAt: Date.now(), updatedAt: Date.now() });
    }
  }, []);

  // Update timestamp on text change.
  const handleTextChange = (value: string) => {
    updateNodeData(id, { text: value, updatedAt: Date.now() });
  };

  const formatTime = (ts: number) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

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
        className={`relative w-full select-none rounded-xl border transition-shadow bg-card ${
          resolved ? "opacity-60" : ""
        } ${
          selected
            ? "border-border-strong shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
        }`}
        style={{ padding: "14px 18px" }}
      >
        <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Left} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Right} className="!h-0 !w-0 !opacity-0" />

        <div className="flex items-start gap-2">
          <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[11px] font-medium text-muted-foreground/70">{author}</p>
            <textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              onFocus={() => useInteractionStore.getState().setEditingText(true)}
              onBlur={() => useInteractionStore.getState().setEditingText(false)}
              placeholder="Write a comment..."
              className="min-h-[40px] w-full cursor-text resize-none bg-transparent font-serif text-[13px] leading-[1.5] text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/40"
            />
            {(createdAt || updatedAt) && (
              <p className="mt-1 text-[10px] text-muted-foreground/40">
                {updatedAt && updatedAt !== createdAt
                  ? `edited ${formatTime(updatedAt)}`
                  : formatTime(createdAt)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => updateNodeData(id, { resolved: !resolved })}
            className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border transition-colors ${
              resolved
                ? "border-green-500 bg-green-500"
                : "border-muted-foreground/30 bg-transparent hover:border-muted-foreground/50"
            }`}
            aria-label={resolved ? "Unresolve" : "Resolve"}
          />
        </div>
      </motion.div>
    </div>
  );
}

export default memo(CommentNode);
