import { NodeResizeControl, type NodeProps } from "reactflow";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { getNodeDef } from "@/lib/node-definitions";

type CornerPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const cursors: Record<CornerPosition, string> = {
  "top-left": "nwse-resize",
  "top-right": "nesw-resize",
  "bottom-left": "nesw-resize",
  "bottom-right": "nwse-resize",
};

function ResizeDot({ position }: { position: CornerPosition }) {
  return (
    <span
      className="absolute h-[5px] w-[5px] rounded-full border border-border-strong bg-popover"
      style={{
        cursor: cursors[position],
        top: position.startsWith("top") ? -2.5 : undefined,
        bottom: position.startsWith("bottom") ? -2.5 : undefined,
        left: position.endsWith("left") ? -2.5 : undefined,
        right: position.endsWith("right") ? -2.5 : undefined,
      }}
    />
  );
}

const CORNERS: CornerPosition[] = ["top-left", "top-right", "bottom-left", "bottom-right"];

export function ResizeControls({ id, type, selected }: NodeProps) {
  const locked = useCanvasStore((s) => {
    const node = s.nodes.find((n) => n.id === id);
    return (node?.data?.locked as boolean) ?? false;
  });
  const def = getNodeDef(type ?? "text");

  if (!selected || locked) return null;

  return (
    <>
      {CORNERS.map((pos) => (
        <NodeResizeControl
          key={pos}
          position={pos}
          minWidth={def.minWidth}
          minHeight={def.minHeight}
          {...(def.maxWidth ? { maxWidth: def.maxWidth } : {})}
          {...(def.maxHeight ? { maxHeight: def.maxHeight } : {})}
          keepAspectRatio={type === "image"}
          className="!bg-transparent !border-none !w-[16px] !h-[16px] !min-w-[16px] !min-h-[16px]"
          onResizeStart={() => useInteractionStore.getState().setResizing(true)}
          onResizeEnd={() => useInteractionStore.getState().setResizing(false)}
        >
          <ResizeDot position={pos} />
        </NodeResizeControl>
      ))}
    </>
  );
}
