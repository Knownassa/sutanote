import {
  AlignCenterHorizontal,
  AlignEndVertical,
  AlignStartVertical,
  BringToFront,
  SendToBack,
  Trash2,
} from "lucide-react";
import { useCanvasStore } from "@/lib/store";

const colors = [
  { name: "Yellow", class: "bg-note-yellow" },
  { name: "Rose", class: "bg-note-rose" },
  { name: "Sage", class: "bg-note-sage" },
  { name: "Lavender", class: "bg-note-lavender" },
  { name: "Blue", class: "bg-note-blue" },
  { name: "White", class: "bg-card" },
  { name: "Yellow", class: "bg-note-yellow" },
  { name: "Rose", class: "bg-note-rose" },
  { name: "Sage", class: "bg-note-sage" },
  { name: "Lavender", class: "bg-note-lavender" },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
      {children}
    </p>
  );
}

function ToolButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: typeof BringToFront;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex flex-1 items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}

export function RightPropertiesSidebar() {
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const nodes = useCanvasStore((s) => s.nodes);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const setNodeZ = useCanvasStore((s) => s.setNodeZ);
  const deleteNode = useCanvasStore((s) => s.deleteNode);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  if (!selectedNode) return null;

  return (
    <div className="flex h-full w-[260px] flex-col overflow-y-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Properties
        </h3>
        <button
          onClick={() => deleteNode(selectedNode.id)}
          aria-label="Delete node"
          className="rounded-md p-1.5 text-destructive transition-colors hover:bg-destructive/10"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mb-6">
        <SectionLabel>Arrange</SectionLabel>
        <div className="flex w-full gap-1 rounded-lg border border-border p-1">
          <ToolButton
            label="Bring to front"
            icon={BringToFront}
            onClick={() => setNodeZ(selectedNode.id, 9999)}
          />
          <ToolButton
            label="Send to back"
            icon={SendToBack}
            onClick={() => setNodeZ(selectedNode.id, -9999)}
          />
        </div>
      </div>

      <div className="mb-6">
        <SectionLabel>Align</SectionLabel>
        <div className="flex w-full gap-1 rounded-lg border border-border p-1">
          <ToolButton label="Align left" icon={AlignStartVertical} onClick={() => {}} />
          <ToolButton label="Align center" icon={AlignCenterHorizontal} onClick={() => {}} />
          <ToolButton label="Align right" icon={AlignEndVertical} onClick={() => {}} />
        </div>
      </div>

      <div className="mb-6">
        <SectionLabel>Style</SectionLabel>
        <div className="grid grid-cols-5 gap-2">
          {colors.map((color, i) => (
            <button
              key={`${color.name}-${i}`}
              type="button"
              onClick={() => updateNodeData(selectedNode.id, { color: color.class })}
              aria-label={color.name}
              title={color.name}
              className={`aspect-square rounded-md border border-border-strong transition-all ${
                selectedNode.data.color === color.class
                  ? "ring-2 ring-foreground/40 ring-offset-1"
                  : "hover:scale-105"
              } ${color.class}`}
            />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <SectionLabel>Size</SectionLabel>
        <div className="flex gap-2">
          <label className="flex flex-1 items-center gap-2 rounded-md border border-border px-2">
            <span className="text-xs text-muted-foreground">W</span>
            <input
              type="number"
              defaultValue={240}
              className="w-full bg-transparent py-2 text-sm text-foreground outline-none"
            />
          </label>
          <label className="flex flex-1 items-center gap-2 rounded-md border border-border px-2">
            <span className="text-xs text-muted-foreground">H</span>
            <input
              type="number"
              defaultValue={120}
              className="w-full bg-transparent py-2 text-sm text-foreground outline-none"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
