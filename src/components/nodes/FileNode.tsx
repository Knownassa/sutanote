import { memo, useRef } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { FileText, Upload } from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { storeImageAsset } from "@/lib/asset-store";
import { ResizeControls } from "./ResizeControls";

function FileNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;
  const filename = (data.filename as string) ?? "";
  const assetId = (data.assetId as string) ?? "";
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const aid = await storeImageAsset(file, file.name);
    updateNodeDataWithHistory(id, { assetId: aid, filename: file.name, mime: file.type });
    e.target.value = "";
  };

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
        className={`relative w-full select-none rounded-xl border transition-shadow bg-card ${
          selected
            ? "border-border-strong shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
        }`}
        style={{ padding: "14px 18px" }}
      >
        <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Left} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Right} className="!h-0 !w-0 !opacity-0" />

        <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />

        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={filename}
            onChange={(e) => updateNodeData(id, { filename: e.target.value })}
            onFocus={() => useInteractionStore.getState().setEditingText(true)}
            onBlur={() => {
              useInteractionStore.getState().setEditingText(false);
              updateNodeDataWithHistory(id, { filename });
            }}
            placeholder="File name"
            className="w-full cursor-text bg-transparent text-[13px] font-medium text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50"
            aria-label="File name"
          />
        </div>
        {assetId ? (
          <p className="mt-1 pl-6 text-[11px] text-muted-foreground/60">Attached file</p>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-1.5 text-[11px] text-muted-foreground/60 transition-colors hover:border-primary/40 hover:text-muted-foreground"
          >
            <Upload className="h-3 w-3" />
            Attach file
          </button>
        )}
      </motion.div>
    </div>
  );
}

export default memo(FileNode);
