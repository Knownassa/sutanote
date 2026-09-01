import { memo, useState, useEffect, lazy, Suspense } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { ResizeControls } from "./ResizeControls";
import { RichTextView } from "./RichTextView";

/** Tiptap is only downloaded/mounted while a node is actually being edited. */
const RichTextEditor = lazy(() =>
  import("./RichTextEditor").then((m) => ({ default: m.RichTextEditor })),
);

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
  const [contentJson, setContentJson] = useState<unknown>((data.richText as { json: unknown } | undefined)?.json ?? null);
  const [plainText, setPlainText] = useState((data.plainText as string) ?? "");

  useEffect(() => {
    setTitle((data.title as string) ?? "");
  }, [data.title]);

  useEffect(() => {
    const rich = (data.richText as { version: number; json: unknown } | undefined)?.json;
    if (rich) {
      setContentJson(rich);
      setPlainText((data.plainText as string) ?? "");
    } else if (!data.content && data.text) {
      setContent((data.text as string) ?? "");
      setContentJson(null);
      setPlainText((data.text as string) ?? "");
    } else {
      setContent((data.content as string) ?? "");
      setContentJson(null);
      setPlainText((data.plainText as string) ?? (data.content as string) ?? "");
    }
    if (((data as Record<string, unknown>)["bold"] || (data as Record<string, unknown>)["italic"] || (data as Record<string, unknown>)["highlight"]) && rich) {
      // will be cleared on next save via handleContentChange
    }
  }, [data.content, data.text, data.richText, data.plainText]);

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

  const handleContentChange = (html: string, json: unknown, plain: string) => {
    setContent(html);
    setContentJson(json);
    setPlainText(plain);
    const patch: Record<string, unknown> = { content: html, text: html, plainText: plain, richText: { version: 1, json } };
    const d = data as Record<string, unknown>;
    if (d["bold"] || d["italic"] || d["highlight"] || d["fontSize"] || d["textColor"]) {
      patch["bold"] = false;
      patch["italic"] = false;
      patch["highlight"] = "";
      patch["fontSize"] = undefined;
      patch["textColor"] = "";
      patch["textAlign"] = "left";
    }
    updateNodeData(id, patch);
  };

  const handleContentBlur = () => {
    const patch: Record<string, unknown> = { content, text: content, plainText };
    if (contentJson) {
      patch["richText"] = { version: 1, json: contentJson };
    }
    updateNodeDataWithHistory(id, patch as Partial<import("@/lib/persistence/types").CanvasNodeData>);
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
    <div style={{ width: "100%" }}>
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
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center",
          padding: "20px 22px",
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
          {isEditing ? (
            <Suspense
              fallback={<RichTextView html={content} plainText={plainText} placeholder="Start writing..." />}
            >
              <RichTextEditor
                id={id}
                content={content}
                contentJson={contentJson}
                onChange={handleContentChange}
                onBlur={handleContentBlur}
                placeholder="Start writing..."
                editable
              />
            </Suspense>
          ) : (
            <RichTextView html={content} plainText={plainText} placeholder="Start writing..." />
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default memo(TextNode);
