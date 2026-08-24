import { memo, useState, useEffect } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { ExternalLink } from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { ResizeControls } from "./ResizeControls";

function LinkNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const { editingNodeId, setEditingNode } = useInteractionStore();
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;
  const isEditing = editingNodeId === id;
  const [url, setUrl] = useState((data.url as string) ?? "");
  const [title, setTitle] = useState((data.title as string) ?? "");
  const [description, setDescription] = useState((data.description as string) ?? "");

  useEffect(() => {
    setUrl((data.url as string) ?? "");
    setTitle((data.title as string) ?? "");
    setDescription((data.description as string) ?? "");
  }, [data.url, data.title, data.description]);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    updateNodeData(id, { url: value });
  };
  const handleUrlBlur = () => {
    updateNodeDataWithHistory(id, { url });
    if (editingNodeId === id) setEditingNode(null);
  };
  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape") (e.currentTarget as HTMLInputElement).blur();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    updateNodeData(id, { title: value });
  };
  const handleTitleBlur = () => {
    updateNodeDataWithHistory(id, { title });
    if (editingNodeId === id) setEditingNode(null);
  };
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape") (e.currentTarget as HTMLInputElement).blur();
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    updateNodeData(id, { description: value });
  };
  const handleDescriptionBlur = () => {
    updateNodeDataWithHistory(id, { description });
    if (editingNodeId === id) setEditingNode(null);
  };
  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape") (e.currentTarget as HTMLInputElement).blur();
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
          selected
            ? "border-border-strong shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
        }`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center", padding: "14px 18px" }}
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
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              placeholder="Link title"
              className="mb-1 w-full cursor-text bg-transparent text-[14px] font-semibold tracking-tight text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50"
              aria-label="Link title"
            />
            <input
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              onBlur={handleUrlBlur}
              onKeyDown={handleUrlKeyDown}
              placeholder="https://..."
              className="mb-1 w-full cursor-text bg-transparent text-[12px] text-muted-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/40"
              aria-label="URL"
            />
            <input
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              onBlur={handleDescriptionBlur}
              onKeyDown={handleDescriptionKeyDown}
              placeholder="Optional description"
              className="w-full cursor-text bg-transparent text-[12px] text-muted-foreground/70 outline-none focus:ring-0 placeholder:text-muted-foreground/30"
              aria-label="Description"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default memo(LinkNode);
