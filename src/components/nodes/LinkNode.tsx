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

  const getDomain = (u: string) => {
    try {
      const parsed = new URL(u);
      if (!["http:", "https:"].includes(parsed.protocol)) return null;
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  };
  const domain = getDomain(url);
  const isValidUrl = domain !== null || url === "";

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
            ? "border-border-strong shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            : "border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
        }`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center",
          padding: "14px 18px",
        }}
        onDoubleClick={() => {
          if (!isEditing) setEditingNode(id, "body");
        }}
      >
        <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Left} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Right} className="!h-0 !w-0 !opacity-0" />

        <div className="flex items-start gap-2">
          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                onFocus={() => setEditingNode(id, "body")}
                placeholder="Link title"
                className="mb-1 w-full cursor-text bg-transparent text-[14px] font-semibold tracking-tight text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50 nodrag nowheel select-text"
                aria-label="Link title"
              />
            ) : domain && title ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mb-1 block w-full cursor-pointer truncate text-[14px] font-semibold tracking-tight text-primary hover:underline"
              >
                {title}
              </a>
            ) : (
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                onFocus={() => setEditingNode(id, "body")}
                placeholder="Link title"
                className="mb-1 w-full cursor-text bg-transparent text-[14px] font-semibold tracking-tight text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50 nodrag nowheel select-text"
                aria-label="Link title"
                readOnly={!isEditing}
              />
            )}
            <input
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              onBlur={handleUrlBlur}
              onKeyDown={handleUrlKeyDown}
              onFocus={() => setEditingNode(id, "body")}
              placeholder="https://..."
              className={`mb-1 w-full bg-transparent text-[12px] outline-none focus:ring-0 placeholder:text-muted-foreground/40 nodrag nowheel ${isEditing ? "cursor-text select-text text-muted-foreground" : "cursor-default text-muted-foreground/70"}`}
              aria-label="URL"
              readOnly={!isEditing && !!url}
            />
            {!isValidUrl && url && (
              <p className="mb-1 text-[10px] text-destructive">
                Invalid URL — use http:// or https://
              </p>
            )}
            {domain && <p className="mb-1 text-[10px] text-muted-foreground/60">{domain}</p>}
            <input
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              onBlur={handleDescriptionBlur}
              onKeyDown={handleDescriptionKeyDown}
              onFocus={() => setEditingNode(id, "body")}
              placeholder="Optional description"
              className={`w-full bg-transparent text-[12px] outline-none focus:ring-0 placeholder:text-muted-foreground/30 nodrag nowheel ${isEditing ? "cursor-text select-text text-muted-foreground/70" : "cursor-default text-muted-foreground/50"}`}
              aria-label="Description"
              readOnly={!isEditing && !!description}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default memo(LinkNode);
