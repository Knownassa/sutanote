import { memo, useEffect, useRef, useState } from "react";
import { NodeProps, NodeResizer } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { getAssetUrl, storeImageAsset, replaceImageAsset } from "@/lib/asset-store";
import { getNodeDef } from "@/lib/node-definitions";
import { ImageIcon, Replace } from "lucide-react";

const handleStyle = {
  width: 8,
  height: 8,
  borderRadius: "9999px",
  background: "var(--popover)",
  border: "1px solid var(--border-strong)",
};

const lineStyle = { border: "none" };

function ImageNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const reduce = useReducedMotion();
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string>("");
  const locked = (data.locked as boolean) ?? false;
  const def = getNodeDef("image");

  const assetId = (data.assetId as string) ?? "";
  const src = (data.src as string) ?? "";
  const caption = (data.caption as string) ?? "";

  useEffect(() => {
    let active = true;
    if (assetId) {
      getAssetUrl(assetId).then((u) => {
        if (active && u) setUrl(u);
      });
    } else {
      setUrl(src);
    }
    return () => {
      active = false;
    };
  }, [assetId, src]);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (assetId) {
      await replaceImageAsset(assetId, file, file.name);
      const u = await getAssetUrl(assetId);
      if (u) setUrl(u);
      updateNodeData(id, { caption: file.name });
    } else {
      const newId = await storeImageAsset(file, file.name);
      updateNodeData(id, { assetId: newId, caption: file.name });
    }
    e.target.value = "";
  };

  return (
    <>
      <NodeResizer
        isVisible={selected && !locked}
        minWidth={def.minWidth}
        minHeight={def.minHeight}
        {...(def.maxWidth ? { maxWidth: def.maxWidth } : {})}
        {...(def.maxHeight ? { maxHeight: def.maxHeight } : {})}
        keepAspectRatio
        handleStyle={handleStyle}
        lineStyle={lineStyle}
      />
      <motion.div
        data-node-surface
        initial={reduce ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: selected ? 1.01 : 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
        className={`relative w-full select-none overflow-hidden rounded-xl border transition-shadow ${
          selected
            ? "border-border-strong shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
            : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
        }`}
        style={{ maxWidth: 360 }}
      >
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
        {url ? (
          <>
            <img
              src={url}
              alt={caption || "image"}
              className="h-auto w-full object-cover"
              style={{ maxHeight: 360 }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileRef.current?.click();
              }}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-popover/90 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              style={{ opacity: selected ? 1 : undefined }}
              aria-label="Replace image"
            >
              <Replace className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileRef.current?.click();
            }}
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
    </>
  );
}

export default memo(ImageNode);
