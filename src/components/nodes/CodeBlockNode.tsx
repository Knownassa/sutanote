import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { Copy, FileCode, ChevronDown } from "lucide-react";
import { ResizeControls } from "./ResizeControls";

const LANGUAGES = [
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "python", label: "Python" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "markdown", label: "Markdown" },
  { value: "yaml", label: "YAML" },
  { value: "dockerfile", label: "Dockerfile" },
] as const;

function CodeBlockNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const { editingNodeId, setEditingNode } = useInteractionStore();
  const isEditing = editingNodeId === id;
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;

  const code = (data.code as string) ?? "";
  const language = (data.language as string) ?? "plaintext";
  const showLineNumbers = (data.showLineNumbers as boolean) ?? true;
  const wrap = (data.wrap as boolean) ?? false;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            ? "border-border-strong shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            : "border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
        }`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center", padding: "0", minHeight: 160, maxWidth: 600 }}
        onDoubleClick={() => {
          if (!isEditing) setEditingNode(id, "body");
        }}
      >
        <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Left} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Right} className="!h-0 !w-0 !opacity-0" />

        <div className="flex items-center justify-between border-b border-border/50 px-3 py-2 bg-muted/30 rounded-t-xl">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-muted-foreground" />
            <select
              value={language}
              onChange={(e) => updateNodeDataWithHistory(id, { language: e.target.value })}
              className="rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-foreground outline-none focus:ring-0"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            {code && (
              <span className="text-[10px] text-muted-foreground/60 font-mono">
                {code.split("\n").length} lines
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) =>
                  updateNodeDataWithHistory(id, { showLineNumbers: e.target.checked })
                }
                className="h-3 w-3 rounded border-border"
              />
              Line numbers
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <input
                type="checkbox"
                checked={wrap}
                onChange={(e) => updateNodeDataWithHistory(id, { wrap: e.target.checked })}
                className="h-3 w-3 rounded border-border"
              />
              Wrap
            </label>
            <button
              type="button"
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-popover px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-surface-hover"
              title="Copy code"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div
          className={`font-mono text-[12px] leading-relaxed p-3 overflow-x-auto ${
            wrap ? "whitespace-pre-wrap" : "whitespace-pre"
          }`}
          style={{
            maxHeight: 400,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          }}
        >
          {showLineNumbers && (
            <div className="absolute left-3 top-3 bottom-3 w-8 text-right text-[10px] text-muted-foreground/40 select-none pointer-events-none">
              {code.split("\n").map((_, i) => (
                <div key={i} className="h-5 flex items-end">
                  {i + 1}
                </div>
              ))}
            </div>
          )}
          <pre className={showLineNumbers ? "pl-14" : ""} style={{ margin: 0 }}>
            <code>{code || "// Start coding..."}</code>
          </pre>
        </div>

        <div className="border-t border-border/50 px-3 py-2 bg-muted/30 rounded-b-[7px]">
          <textarea
            value={code}
            onChange={(e) => updateNodeData(id, { code: e.target.value })}
            onFocus={() => setEditingNode(id, "body")}
            onBlur={(e) => {
              if (editingNodeId === id) setEditingNode(null);
              updateNodeDataWithHistory(id, { code: e.currentTarget.value });
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") (e.target as HTMLTextAreaElement).blur();
            }}
            placeholder="// Start coding..."
            className={`w-full min-h-[120px] font-mono text-[12px] leading-relaxed bg-transparent text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/40 resize-none ${isEditing ? "nodrag nowheel select-text cursor-text" : "cursor-default"}`}
            spellCheck={false}
            style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
            readOnly={!isEditing}
          />
        </div>
      </motion.div>
    </div>
  );
}

export default memo(CodeBlockNode);
