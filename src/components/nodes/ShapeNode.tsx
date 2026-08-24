import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { ResizeControls } from "./ResizeControls";

type ShapeType = "rectangle" | "rounded-rectangle" | "circle" | "diamond";

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
  const opacity = (data.opacity as number) ?? 100;
  const cornerRadius = (data.cornerRadius as number) ?? 12;

  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const label = (data.label as string) ?? "";

  const fillValue = fill === "transparent" ? "none" : fill;

  return (
    <div style={{ width: "100%" }}>
      <ResizeControls {...props} />
      <motion.div
        data-node-surface
        initial={reduce ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
        className={`relative w-full select-none ${selected ? "" : ""}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center",
          opacity: opacity / 100,
          padding: "8px",
        }}
      >
        <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Left} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Right} className="!h-0 !w-0 !opacity-0" />

        <div className="flex items-center justify-center min-h-[80px]">
          <svg viewBox="0 0 100 100" className="w-full h-auto" preserveAspectRatio="none">
            {shape === "rectangle" && (
              <rect
                x={2}
                y={2}
                width={96}
                height={96}
                fill={fillValue}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {shape === "rounded-rectangle" && (
              <rect
                x={2}
                y={2}
                width={96}
                height={96}
                rx={cornerRadius}
                ry={cornerRadius}
                fill={fillValue}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {shape === "circle" && (
              <ellipse
                cx={50}
                cy={50}
                rx={48}
                ry={48}
                fill={fillValue}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {shape === "diamond" && (
              <polygon
                points="50,2 98,50 50,98 2,50"
                fill={fillValue}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
          </svg>
        </div>

        <div className="mt-2 text-center min-h-[1.2em]">
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
              placeholder="Label"
              className="w-full max-w-[200px] mx-auto bg-transparent text-center text-sm font-medium text-foreground outline-none focus:ring-0"
            />
          ) : (
            <span
              onDoubleClick={() => setIsEditingLabel(true)}
              className="text-sm font-medium text-foreground cursor-pointer select-none"
            >
              {label || (selected ? "Double-click to add label" : "")}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default memo(ShapeNode);
