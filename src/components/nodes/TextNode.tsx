import { memo, useState, useEffect } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { ResizeControls } from "./ResizeControls";
import { RichTextEditor } from "./RichTextEditor";

function TextNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const { editingNodeId, setEditingNode } = useInteractionStore();
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;
  const isEditing = editingNodeId === id;

  const [title, setTitle] = useState((data.title as string) ?? "");
  const [content, setContent] = useState((data.content as string) ?? (data.text as string) ?? "");

  useEffect(() => {
    setTitle((data.title as string) ?? "");
  }, [data.title]);

  useEffect(() => {
    // Migrate from legacy text field if content doesn't exist
    if (!data.content && data.text) {
      setContent((data.text as string) ?? "");
    } else {
      setContent((data.content as string) ?? "");
    }
  }, [data.content, data.text]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    updateNodeData(id, { title: value });
  };

  const handleTitleBlur = () => {
    updateNodeDataWithHistory(id, { title });
    if (editingNodeId === id) {
      setEditingNode(null);
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    updateNodeData(id, { content: value, text: value }); // Keep legacy text in sync
  };

  const handleContentBlur = () => {
    updateNodeDataWithHistory(id, { content, text: content });
    if (editingNodeId === id) {
      setEditingNode(null);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape") {
      (e.currentTarget as HTMLInputElement).blur();
    }
  };

  const handleDoubleClick = () => {
    if (!editingNodeId) {
      useInteractionStore.getState().setEditingNode(id, "body");
    }
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
        className={`relative w-full select-none rounded-[7px] border transition-shadow ${
          (data.backgroundColor as string) || (data.color ?? "bg-card")
        } ${
          selected
            ? "border-border-strong shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            : "border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
        }`}
        style={{
          padding: "20px 22px",
          borderLeftWidth: (data.highlight as string) ? "4px" : undefined,
          borderLeftColor: (data.highlight as string) || undefined,
        }}
        onDoubleClick={handleDoubleClick}
      >
        <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Left} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Right} className="!h-0 !w-0 !opacity-0" />
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onFocus={() => useInteractionStore.getState().setEditingNode(id, "title")}
          onBlur={handleTitleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape")
              (e.currentTarget as HTMLInputElement).blur();
          }}
          placeholder="Title"
          className={`mb-2 w-full bg-transparent text-[15px] font-semibold tracking-tight text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50 ${isEditing ? "cursor-text" : "cursor-default"}`}
          aria-label="Title"
          readOnly={!isEditing}
        />
        <div className={`nodrag nowheel ${isEditing ? "select-text cursor-text" : "select-none"}`}>
          <RichTextEditor
            id={id}
            content={content}
            onChange={handleContentChange}
            onBlur={handleContentBlur}
            placeholder="Start writing..."
            editable={isEditing}
            fontSize={(data.fontSize as number) ?? 14}
            textAlign={(data.textAlign as "left" | "center" | "right") ?? "left"}
            textColor={(data.textColor as string) || ""}
            bold={(data.bold as boolean) ?? false}
            italic={(data.italic as boolean) ?? false}
            highlightColor={(data.highlight as string) || ""}
          />
        </div>
      </motion.div>
    </div>
  );
}

export default memo(TextNode);
