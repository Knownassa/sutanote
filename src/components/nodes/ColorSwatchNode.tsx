import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { Copy, Edit2, Palette } from "lucide-react";
import { ResizeControls } from "./ResizeControls";

function ColorSwatchNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;

  const color = (data.color as string) ?? "#6366f1";
  const label = (data.label as string) ?? "";
  const [showPicker, setShowPicker] = useState(false);
  const [hex, setHex] = useState(color);

  const handleColorChange = (newColor: string) => {
    setHex(newColor);
    updateNodeData(id, { color: newColor });
  };

  const handleColorCommit = () => {
    updateNodeDataWithHistory(id, { color: hex });
    setShowPicker(false);
  };

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
          >
            {showPicker && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-lg">
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-12 w-12 rounded-lg border-2 border-white cursor-pointer"
                />
              </div>
            )}
          </div>

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
            <button
              type="button"
              onClick={() => setShowPicker(!showPicker)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-popover px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
            >
              <Palette className="h-3.5 w-3.5" />
              {showPicker ? "Done" : "Edit"}
            </button>
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
            <span>#{hex.toUpperCase()}</span>
            <button
              type="button"
              onClick={copyToClipboard}
              className="hover:text-foreground transition-colors"
              title="Copy hex"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap text-[11px] text-muted-foreground/60">
            <label className="flex items-center gap-1">
              <input
                type="color"
                value={hex}
                onChange={(e) => handleColorChange(e.target.value)}
                onBlur={handleColorCommit}
                className="h-6 w-6 rounded border border-border cursor-pointer"
              />
              Picker
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default memo(ColorSwatchNode);
