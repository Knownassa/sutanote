import { memo, useCallback, useEffect, useRef, useState } from "react";
import { NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { getAssetUrl, storeImageAsset, replaceImageAsset } from "@/lib/asset-store";
import { getNodeDef } from "@/lib/node-definitions";
import { ImageIcon, Replace, Link2, Download, X } from "lucide-react";
import { ResizeControls } from "./ResizeControls";
import { EmptyAssetState } from "./EmptyAssetState";
import { useLightboxStore } from "@/lib/lightbox-store";

function ImageNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;
  const opacity = (data.opacity as number) ?? 100;
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string>("");
  const def = getNodeDef("image");

  const assetId = (data.assetId as string) ?? "";
  const remoteUrl = (data.remoteUrl as string) ?? "";
  const sourceType = (data.sourceType as "local" | "remote") ?? "local";
  const caption = (data.caption as string) ?? "";
  const alt = (data.alt as string) ?? "";

  useEffect(() => {
    let active = true;
    if (assetId) {
      getAssetUrl(assetId).then((u) => {
        if (active && u) setUrl(u);
      });
    } else if (remoteUrl) {
      setUrl(remoteUrl);
    } else {
      setUrl("");
    }
    return () => {
      active = false;
    };
  }, [assetId, remoteUrl]);

  const handleAssetId = useCallback(
    async (newAssetId: string, filename: string, mime?: string) => {
      updateNodeDataWithHistory(id, {
        assetId: newAssetId,
        sourceType: "local",
        remoteUrl: "",
        caption: filename,
      });
      const u = await getAssetUrl(newAssetId);
      if (u) setUrl(u);
    },
    [id, updateNodeDataWithHistory],
  );

  const handleRemoteUrl = useCallback(
    (newRemoteUrl: string) => {
      updateNodeDataWithHistory(id, {
        remoteUrl: newRemoteUrl,
        sourceType: "remote",
        assetId: "",
      });
      setUrl(newRemoteUrl);
    },
    [id, updateNodeDataWithHistory],
  );

  const handleReplace = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (assetId) {
        await replaceImageAsset(assetId, file, file.name);
        const u = await getAssetUrl(assetId);
        if (u) setUrl(u);
        updateNodeDataWithHistory(id, { caption: file.name });
      } else {
        const newId = await storeImageAsset(file, file.name);
        updateNodeDataWithHistory(id, {
          assetId: newId,
          sourceType: "local",
          remoteUrl: "",
          caption: file.name,
        });
      }
      e.target.value = "";
    },
    [assetId, id, updateNodeDataWithHistory],
  );

  const handleRemove = useCallback(() => {
    updateNodeDataWithHistory(id, { assetId: "", remoteUrl: "", sourceType: "local", caption: "" });
    setUrl("");
  }, [id, updateNodeDataWithHistory]);

  const showEmpty = !assetId && !remoteUrl;
  const isRemote = sourceType === "remote" && remoteUrl;

  return (
    <div style={{ width: "100%" }}>
      <ResizeControls {...props} />
      <motion.div
        data-node-surface
        initial={reduce ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
        className={`relative w-full select-none overflow-hidden rounded-[7px] border transition-shadow ${
          (data.backgroundColor as string) || ""
        } ${
          selected
            ? "border-border-strong shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            : "border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
        }`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center",
          opacity: opacity / 100, maxWidth: 360 }}
      >
        {showEmpty ? (
          <EmptyAssetState
            icon={<ImageIcon className="h-6 w-6" strokeWidth={1.5} />}
            title="Add an image"
            browseLabel="Browse"
            linkLabel="Add link"
            accept="image/*"
            onAssetId={handleAssetId}
            onRemoteUrl={handleRemoteUrl}
            onCancel={handleRemove}
          />
        ) : (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleReplace}
            />
            <img
              src={url}
              alt={alt || caption || "image"}
              className="h-auto w-full object-cover cursor-zoom-in"
              style={{ maxHeight: 360 }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                const allIds = useCanvasStore
                  .getState()
                  .nodes.filter((n) => n.type === "image" && ((n.data.assetId as string) || (n.data.remoteUrl as string)))
                  .map((n) => n.id);
                useLightboxStore.getState().open(id, allIds);
              }}
            />
            <div
              className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ opacity: selected ? 1 : 0 }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileRef.current?.click();
                }}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-popover/90 text-muted-foreground hover:text-foreground"
                aria-label="Replace image"
              >
                <Replace className="h-4 w-4" />
              </button>
              {(assetId || isRemote) && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-popover/90 text-muted-foreground hover:text-foreground"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {assetId && (
                <button
                  type="button"
                  onClick={() => {
                    if (assetId) {
                      getAssetUrl(assetId).then((u) => {
                        if (u) {
                          const a = document.createElement("a");
                          a.href = u;
                          a.download = caption || "image";
                          a.click();
                        }
                      });
                    }
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-popover/90 text-muted-foreground hover:text-foreground"
                  aria-label="Download image"
                >
                  <Download className="h-4 w-4" />
                </button>
              )}
            </div>
          </>
        )}
        <div className="bg-card px-4 py-3 border-t border-border/50">
          <input
            value={caption}
            onChange={(e) => updateNodeData(id, { caption: e.target.value })}
            onBlur={() => updateNodeDataWithHistory(id, { caption })}
            placeholder="Add a caption..."
            className="w-full bg-transparent text-[13px] text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50"
            aria-label="Caption"
          />
          <input
            value={alt}
            onChange={(e) => updateNodeData(id, { alt: e.target.value })}
            onBlur={() => updateNodeDataWithHistory(id, { alt })}
            placeholder="Alt text..."
            className="mt-1 w-full bg-transparent text-[12px] text-muted-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50"
            aria-label="Alt text"
          />
          {isRemote && (
            <p className="mt-1 text-[11px] text-muted-foreground/60 flex items-center gap-1">
              <Link2 className="h-3 w-3" />
              Linked from URL
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default memo(ImageNode);
