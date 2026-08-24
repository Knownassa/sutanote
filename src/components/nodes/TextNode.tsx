import { memo, useState, useRef, useEffect } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { ResizeControls } from "./ResizeControls";

function TextNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;
  const { editingNodeId, setEditingNode } = useInteractionStore();

  const isEditing = editingNodeId === id;
  const [title, setTitle] = useState((data.title as string) ?? "");
  const [text, setText] = useState((data.text as string) ?? "");

  // Sync internal state with data prop changes
  useEffect(() => {
    setTitle((data.title as string) ?? "");
  }, [data.title]);

  useEffect(() => {
    setText((data.text as string) ?? "");
  }, [data.text]);

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

  const handleTextChange = (value: string) => {
    setText(value);
    updateNodeData(id, { text: value });
  };

  const handleTextBlur = () => {
    updateNodeDataWithHistory(id, { text });
    if (editingNodeId === id) {
      setEditingNode(null);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.currentTarget as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      (e.currentTarget as HTMLInputElement).blur();
    }
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      (e.currentTarget as HTMLTextAreaElement).blur();
    }
    // Allow Enter for newlines in textarea
  };

  const handleDoubleClick = () => {
    if (!isEditing) {
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
        className={`relative w-full select-none rounded-xl border transition-shadow ${
          (data.backgroundColor as string) || (data.color ?? "bg-card")
        } ${
          selected
            ? "border-border-strong shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
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
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          placeholder="Title"
          className="mb-2 w-full cursor-text bg-transparent text-[15px] font-semibold tracking-tight text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50"
          aria-label="Title"
        />
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onBlur={handleTextBlur}
          onKeyDown={handleTextKeyDown}
          onDoubleClick={handleDoubleClick}
          placeholder="Start writing..."
          className={`min-h-[80px] w-full cursor-text resize-none bg-transparent font-serif leading-[1.65] outline-none focus:ring-0 placeholder:text-muted-foreground/50 ${
            (data.bold as boolean) ? "font-bold" : ""
          } ${(data.italic as boolean) ? "italic" : ""}`}
          style={{
            fontSize: (data.fontSize as number) ?? 14,
            textAlign: (data.textAlign as "left" | "center" | "right") ?? "left",
            color: (data.textColor as string) || undefined,
          }}
          aria-label="Note content"
        />
      </motion.div>
    </div>
  );
}

export default memo(TextNode);
