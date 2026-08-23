import { Handle, Position, NodeProps } from "reactflow";
import { useCanvasStore } from "@/lib/store";

export default function TextNode({ id, data }: NodeProps) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const isSelected = selectedNodeId === id;

  return (
    <div
      className={`relative select-none rounded-xl border p-5 transition-all ${data.color ?? "bg-card"} ${
        isSelected ? "ring-2 ring-stone-400 ring-offset-2" : ""
      }`}
      style={{ minWidth: 240, maxWidth: 400 }}
    >
      <Handle type="target" position={Position.Top} className="h-3 w-3 bg-transparent opacity-0" />
      <Handle
        type="source"
        position={Position.Bottom}
        className="h-3 w-3 bg-transparent opacity-0"
      />
      <Handle type="source" position={Position.Left} className="h-3 w-3 bg-transparent opacity-0" />
      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 bg-transparent opacity-0"
      />

      <textarea
        value={(data.text as string) ?? ""}
        onChange={(e) => updateNodeData(id, { text: e.target.value })}
        placeholder="Start writing..."
        className="min-h-[60px] w-full resize-none bg-transparent font-serif text-base leading-relaxed text-foreground placeholder:text-muted-foreground outline-none focus:ring-0"
      />
    </div>
  );
}
