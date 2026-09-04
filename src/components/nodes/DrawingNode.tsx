import { memo } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import type { DrawingPoint } from "@/lib/persistence/types";
import { ResizeControls } from "./ResizeControls";

function DrawingNode({ id, data, selected }: NodeProps) {
  const deleteNode = useCanvasStore((s) => s.deleteNode);
  const activeTool = useInteractionStore((s) => s.activeTool);
  const points = (data.points as DrawingPoint[] | undefined) ?? [];
  const width = Math.max(40, ...points.map((point) => point.x + 12));
  const height = Math.max(40, ...points.map((point) => point.y + 12));
  const stroke = (data.strokeColor as string) ?? "#ef4444";
  const strokeWidth = Number(data.strokeWidth ?? 3);
  const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div
      style={{ width: "100%", height: "100%", minHeight: 40 }}
      onClick={(event) => {
        if (activeTool === "eraser") {
          event.stopPropagation();
          deleteNode(id);
        }
      }}
      title={activeTool === "eraser" ? "Click to erase this stroke" : undefined}
    >
      <ResizeControls id={id} type="drawing" selected={selected} />
      <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="pointer-events-none overflow-visible"
        aria-label="Freehand drawing"
      >
        <polyline
          points={pointString}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          opacity={stroke.includes("rgba") ? undefined : 1}
        />
      </svg>
    </div>
  );
}

export default memo(DrawingNode);
