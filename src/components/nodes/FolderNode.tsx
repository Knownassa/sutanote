import { memo, useState } from "react";
import { NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { Edit2 } from "lucide-react";
import { getFolderIcon, DEFAULT_FOLDER_ICON } from "@/lib/folder-icons";
import { ResizeControls } from "./ResizeControls";
import { ConnectorPorts } from "./ConnectorPorts";

function FolderNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;

  const title = (data.title as string) ?? "Untitled Folder";
  const itemCount = (data.itemCount as number) ?? 0;
  const iconColor = (data.iconColor as string) || "";
  const Icon = getFolderIcon((data.icon as string) ?? DEFAULT_FOLDER_ICON);
  const [isEditing, setIsEditing] = useState(false);

  const handleTitleBlur = () => {
    setIsEditing(false);
    updateNodeDataWithHistory(id, { title });
  };

  return (
    <div style={{ width: "100%" }}>
      <ResizeControls {...props} />
      <motion.div
        data-node-surface
        initial={reduce ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
        className={`relative w-full select-none rounded-[7px] border transition-shadow ${
          (data.backgroundColor as string) || "bg-card"
        } ${
          selected
            ? "border-border-strong shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            : "border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
        }`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center",
          padding: "16px",
          minHeight: 100,
          cursor: "pointer",
        }}
        onDoubleClick={() => setIsEditing(true)}
      >
        <ConnectorPorts />

        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            style={iconColor ? { backgroundColor: `${iconColor}1f`, color: iconColor } : undefined}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <input
                value={title}
                onChange={(e) => updateNodeData(id, { title: e.target.value })}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                autoFocus
                className="w-full bg-transparent text-lg font-semibold text-foreground outline-none focus:ring-0"
              />
            ) : (
              <h3 className="truncate text-lg font-semibold text-foreground">{title}</h3>
            )}
            <p className="mt-1 text-sm text-muted-foreground/70">
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
          <span className="text-[11px] text-muted-foreground/50">Folder</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="flex items-center gap-1.5 rounded-[5px] border border-border bg-popover px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Rename
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default memo(FolderNode);
