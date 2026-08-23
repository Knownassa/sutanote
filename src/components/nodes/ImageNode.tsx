import { memo, useRef } from "react";
import { NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { ImageIcon } from "lucide-react";

function ImageNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const reduce = useReducedMotion();
  const fileRef = useRef<HTMLInputElement>(null);
  const src = (data.src as string) ?? "";
  const caption = (data.caption as string) ?? "";

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateNodeData(id, { src: url, caption: file.name });
  };

  return (
    <motion.div
      initial={reduce ? false : { scale: 0.9, opacity: 0 }}
      animate={{ scale: selected ? 1.01 : 1, opacity: 1 }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
      className={`relative w-full select-none overflow-hidden rounded-xl border transition-all ${
        selected
          ? "border-border-strong shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
          : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
      }`}
      style={{ maxWidth: 360 }}
    >
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
      {src ? (
        <img
          src={src}
          alt={caption || "image"}
          className="h-auto w-full object-cover"
          style={{ maxHeight: 360 }}
        />
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 bg-surface py-12"
        >
          <ImageIcon className="h-8 w-8 text-muted-foreground/30" strokeWidth={1.5} />
          <span className="text-xs text-muted-foreground/50">Click to add an image</span>
        </button>
      )}
      <div className="bg-card px-4 py-3">
        <input
          value={caption}
          onChange={(e) => updateNodeData(id, { caption: e.target.value })}
          placeholder="Add a caption..."
          className="w-full bg-transparent text-[13px] text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50"
        />
      </div>
    </motion.div>
  );
}

export default memo(ImageNode);
