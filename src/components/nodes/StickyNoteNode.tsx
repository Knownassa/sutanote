import { memo, useState, useEffect } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { ResizeControls } from "./ResizeControls";

function StickyNoteNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;
  const { editingNodeId, setEditingNode } = useInteractionStore();

  const isEditing = editingNodeId === id;
  const [text, setText] = useState((data.text as string) ?? "");

  useEffect(() => {
    setText((data.text as string) ?? "");
  }, [data.text]);

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
        className={`relative w-full select-none rounded-[7px] transition-shadow ${
          (data.backgroundColor as string) || (data.color ?? "bg-note-yellow")
        } ${
          selected
            ? "shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            : "shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
        }`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center",
          minHeight: 160,
          padding: "18px",
          border: "1px solid rgba(0,0,0,0.04)",
          borderLeftWidth: (data.highlight as string) ? "4px" : undefined,
          borderLeftColor: (data.highlight as string) || undefined,
        }}
        onDoubleClick={handleDoubleClick}
      >
        <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Left} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Right} className="!h-0 !w-0 !opacity-0" />
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onBlur={handleTextBlur}
          onKeyDown={handleTextKeyDown}
          onDoubleClick={handleDoubleClick}
          placeholder="Jot something down..."
          className={`h-full min-h-[100px] w-full resize-none bg-transparent font-serif leading-[1.6] text-note-foreground outline-none focus:ring-0 placeholder:text-note-foreground/40 ${isEditing ? "nodrag nowheel select-text cursor-text" : "cursor-default"}`}
          style={{ fontSize: (data.fontSize as number) ?? 14 }}
          aria-label="Sticky note"
          readOnly={!isEditing}
        />
      </motion.div>
    </div>
  );
}

export default memo(StickyNoteNode);
