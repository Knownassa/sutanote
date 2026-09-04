import { memo, useEffect, useRef, useState } from "react";
import { NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { useSettingsStore } from "@/lib/settings-store";
import { ResizeControls } from "./ResizeControls";
import { ConnectorPorts } from "./ConnectorPorts";

function CommentNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const { editingNodeId, setEditingNode } = useInteractionStore();
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;
  const isEditing = editingNodeId === id;
  const [text, setText] = useState((data.text as string) ?? "");
  const author = (data.author as string) ?? useSettingsStore.getState().displayName;
  const resolved = (data.resolved as boolean) ?? false;
  const createdAt = (data.createdAt as number) ?? 0;
  const updatedAt = (data.updatedAt as number) ?? 0;
  const initRef = useRef(false);

  useEffect(() => {
    setText((data.text as string) ?? "");
  }, [data.text]);

  // Auto-set createdAt on first render.
  useEffect(() => {
    if (!initRef.current && !createdAt) {
      initRef.current = true;
      updateNodeData(id, { createdAt: Date.now(), updatedAt: Date.now() });
    }
  }, [createdAt, id, updateNodeData]);

  // Update timestamp on text change.
  const handleTextChange = (value: string) => {
    setText(value);
    updateNodeData(id, { text: value, updatedAt: Date.now() });
  };
  const handleTextBlur = () => {
    updateNodeDataWithHistory(id, { text, updatedAt: Date.now() });
    if (editingNodeId === id) {
      setEditingNode(null);
    }
  };
  const toggleResolved = () => {
    updateNodeDataWithHistory(id, { resolved: !resolved });
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

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      (e.currentTarget as HTMLTextAreaElement).blur();
    }
  };

  const handleDoubleClick = () => {
    if (!isEditing) {
      useInteractionStore.getState().setEditingNode(id, "body");
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <ResizeControls {...props} />
      <motion.div
        data-node-surface
        initial={reduce ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
        className={`relative w-full select-none rounded-[7px] border transition-shadow bg-card ${
          resolved ? "opacity-60" : ""
        } ${
          selected
            ? "border-border-strong shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            : "border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
        }`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center",
          padding: "14px 18px",
        }}
        onDoubleClick={handleDoubleClick}
      >
        <ConnectorPorts />

        <div className="flex items-start gap-2">
          <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[11px] font-medium text-muted-foreground/70">{author}</p>
            <textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              onBlur={handleTextBlur}
              onKeyDown={handleTextKeyDown}
              onDoubleClick={handleDoubleClick}
              placeholder="Write a comment..."
              className="min-h-[40px] w-full cursor-text resize-none bg-transparent font-serif text-[13px] leading-[1.5] text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/40"
              aria-label="Comment"
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
            onClick={toggleResolved}
            className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border transition-colors ${
              resolved
                ? "border-status-success bg-status-success"
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
