import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { ResizeControls } from "./ResizeControls";

type ShapeType = "rectangle" | "rounded-rectangle" | "circle" | "diamond";

const shapePaths: Record<ShapeType, string> = {
  rectangle: "M0 0 h1 v1 h-1 Z",
  "rounded-rectangle":
    "M0.1 0 h0.8 a0.1 0.1 0 0 1 0.1 0.1 v0.8 a0.1 0.1 0 0 1 -0.1 0.1 h-0.8 a0.1 0.1 0 0 1 -0.1 -0.1 v-0.8 a0.1 0.1 0 0 1 0.1 -0.1 Z",
  circle: "M0.5 0 a0.5 0.5 0 0 1 0 1 a0.5 0.5 0 0 1 0 -1 Z",
  diamond: "M0.5 0 L1 0.5 L0.5 1 L0 0.5 Z",
};

function ShapeNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;

  const shape = (data.shape as ShapeType) ?? "rectangle";
  const fill = (data.fill as string) ?? "transparent";
  const stroke = (data.stroke as string) ?? "currentColor";
  const strokeWidth = (data.strokeWidth as number) ?? 2;

  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const label = (data.label as string) ?? "";

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
          (data.backgroundColor as string) || "bg-transparent"
        } ${
          selected
            ? "border-border-strong shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
        }`}
        style={{ padding: "16px" }}
      >
        <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Left} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Right} className="!h-0 !w-0 !opacity-0" />

        <div className="flex items-center justify-center min-h-[80px]">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-auto max-w-[300px] max-h-[300px]"
            style={{
              transform: shape === "diamond" ? "rotate(45deg)" : undefined,
            }}
          >
            <path
              d={shapePaths[shape]}
              fill={fill === "transparent" ? "none" : fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {label && (
          <div className="mt-3 text-center">
            {isEditingLabel ? (
              <input
                value={label}
                onChange={(e) => updateNodeData(id, { label: e.target.value })}
                onBlur={() => {
                  setIsEditingLabel(false);
                  updateNodeDataWithHistory(id, { label });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                  if (e.key === "Escape") setIsEditingLabel(false);
                }}
                autoFocus
                className="w-full max-w-[200px] mx-auto bg-transparent text-center text-sm font-medium text-foreground outline-none focus:ring-0"
              />
            ) : (
              <span
                onDoubleClick={() => setIsEditingLabel(true)}
                className="text-sm font-medium text-foreground cursor-pointer select-none"
              >
                {label}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <select
              value={shape}
              onChange={(e) =>
                updateNodeDataWithHistory(id, { shape: e.target.value as ShapeType })
              }
              className="rounded-md border border-border bg-surface px-2 py-1 text-[12px] text-foreground outline-none focus:ring-0"
            >
              <option value="rectangle">Rectangle</option>
              <option value="rounded-rectangle">Rounded</option>
              <option value="circle">Circle</option>
              <option value="diamond">Diamond</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <input
              type="color"
              value={fill === "transparent" ? "#ffffff" : fill}
              onChange={(e) =>
                updateNodeDataWithHistory(id, {
                  fill: e.target.value === "#ffffff" ? "transparent" : e.target.value,
                })
              }
              className="h-6 w-6 rounded border border-border cursor-pointer"
              title="Fill color"
            />
          </label>
          <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <input
              type="color"
              value={stroke}
              onChange={(e) => updateNodeDataWithHistory(id, { stroke: e.target.value })}
              className="h-6 w-6 rounded border border-border cursor-pointer"
              title="Stroke color"
            />
          </label>
          <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <input
              type="number"
              min="1"
              max="10"
              value={strokeWidth}
              onChange={(e) =>
                updateNodeDataWithHistory(id, { strokeWidth: parseInt(e.target.value) || 2 })
              }
              className="w-16 rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-foreground outline-none focus:ring-0"
              title="Stroke width"
            />
          </label>
        </div>
      </motion.div>
    </div>
  );
}

export default memo(ShapeNode);
