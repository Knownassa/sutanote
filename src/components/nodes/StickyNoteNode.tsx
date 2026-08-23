import { Handle, Position, NodeProps } from "reactflow";
import { useCanvasStore } from "@/lib/store";

export default function StickyNoteNode({ id, data }: NodeProps) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const isSelected = selectedNodeId === id;

  return (
    <div
      className={`relative select-none rounded-lg border border-note-foreground/10 p-3 shadow-sm transition-all ${data.color ?? "bg-note-yellow"} ${
        isSelected ? "ring-2 ring-stone-400 ring-offset-2" : ""
      }`}
      style={{ minWidth: 200, maxWidth: 320, minHeight: 140 }}
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
        placeholder="Type something..."
        className="h-full min-h-[80px] w-full resize-none bg-transparent font-serif text-sm leading-relaxed text-note-foreground placeholder:text-note-foreground/50 outline-none focus:ring-0"
      />
    </div>
  );
}
