import { memo, useState, useEffect } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { Copy } from "lucide-react";
import { ResizeControls } from "./ResizeControls";
import { SutonoteColorPicker } from "@/components/ui/SutonoteColorPicker";

function ColorSwatchNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;

  const color = (data.color as string) ?? "#6366f1";
  const label = (data.label as string) ?? "";
  const [hex, setHex] = useState(color);

  useEffect(() => {
    setHex(color);
  }, [color]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hex);
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
          transformOrigin: "center", padding: "16px", minHeight: 120 }}
      >
        <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Left} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Right} className="!h-0 !w-0 !opacity-0" />

        <div className="flex flex-col items-center gap-4">
          <div
            className="relative w-full aspect-square max-w-[160px] rounded-lg border border-border overflow-hidden bg-white"
            style={{ backgroundColor: color }}
          />

          {label && (
            <div className="w-full max-w-[160px]">
              <input
                value={label}
                onChange={(e) => updateNodeData(id, { label: e.target.value })}
                onBlur={() => updateNodeDataWithHistory(id, { label })}
                placeholder="Color name"
                className="w-full text-center text-sm font-medium text-foreground bg-transparent outline-none focus:ring-0 placeholder:text-muted-foreground/50"
              />
            </div>
          )}

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <SutonoteColorPicker
              value={color}
              onChange={(c) => {
                setHex(c);
                updateNodeDataWithHistory(id, { color: c });
              }}
              palette="object"
            />
            <span className="text-sm text-muted-foreground">Pick</span>
            <button
              type="button"
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-popover px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
              title="Copy hex"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-1 text-[12px] font-mono text-muted-foreground/70">
            <span>{hex.toUpperCase()}</span>
            <button
              type="button"
              onClick={copyToClipboard}
              className="hover:text-foreground transition-colors"
              title="Copy hex"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default memo(ColorSwatchNode);
