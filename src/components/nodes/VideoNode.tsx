import { memo, useRef, useState, useEffect, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { useHeavyNode } from "@/hooks/use-heavy-node";
import { useInteractionStore } from "@/lib/interaction-store";
import { Video as VideoIcon, Download, Replace, ExternalLink, X, Play } from "lucide-react";
import { ResizeControls } from "./ResizeControls";
import { EmptyAssetState } from "./EmptyAssetState";
import { storeImageAsset, getAssetUrl } from "@/lib/asset-store";

function VideoNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;
  const opacity = (data.opacity as number) ?? 100;
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string>("");
  const { ref: heavyRef, phase, activate, deactivate } = useHeavyNode();

  const assetId = (data.assetId as string) ?? "";
  const remoteUrl = (data.remoteUrl as string) ?? "";
  const sourceType = (data.sourceType as "local" | "remote") ?? "local";
  const caption = (data.caption as string) ?? "";
  const filename = (data.filename as string) ?? "";

  useEffect(() => {
    let active = true;
    // Don't resolve object URLs for off-screen videos.
    if (phase === "idle") return;
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
  }, [assetId, remoteUrl, phase]);

  const handleAssetId = useCallback(
    async (newAssetId: string, newFilename: string, mime?: string) => {
      updateNodeDataWithHistory(id, {
        assetId: newAssetId,
        sourceType: "local",
        remoteUrl: "",
        filename: newFilename,
        caption: newFilename,
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
        const newId = await storeImageAsset(file, file.name);
        updateNodeDataWithHistory(id, {
          assetId: newId,
          sourceType: "local",
          remoteUrl: "",
          filename: file.name,
        });
      } else {
        const newId = await storeImageAsset(file, file.name);
        updateNodeDataWithHistory(id, {
          assetId: newId,
          sourceType: "local",
          remoteUrl: "",
          filename: file.name,
        });
      }
      e.target.value = "";
    },
    [assetId, id, updateNodeDataWithHistory],
  );

  const handleRemove = useCallback(() => {
    updateNodeDataWithHistory(id, {
      assetId: "",
      remoteUrl: "",
      sourceType: "local",
      filename: "",
      caption: "",
    });
    setUrl("");
  }, [id, updateNodeDataWithHistory]);

  const showEmpty = !assetId && !remoteUrl;
  const isRemote = sourceType === "remote" && remoteUrl;
  const hasPreview = !!url;

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
            ? "border-border-strong shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
        }`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center",
          opacity: opacity / 100, maxWidth: 400 }}
      >
        {showEmpty ? (
          <EmptyAssetState
            icon={<VideoIcon className="h-6 w-6" strokeWidth={1.5} />}
            title="Add a video"
            browseLabel="Browse"
            linkLabel="Add link"
            accept="video/*"
            onAssetId={handleAssetId}
            onRemoteUrl={handleRemoteUrl}
            onCancel={handleRemove}
          />
        ) : (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleReplace}
            />
            <div ref={heavyRef} className="relative aspect-video bg-black">
              {hasPreview && phase === "interactive" ? (
                <>
                  {/* Player mounts only after the user hits play (Esc unloads it). */}
                  <video src={url} controls autoPlay className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={deactivate}
                    className="absolute bottom-2 right-2 rounded-md border border-border bg-popover/90 px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-surface-hover"
                    aria-label="Unload video player"
                  >
                    Esc to unload
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={hasPreview ? activate : undefined}
                  className="group/poster h-full w-full flex items-center justify-center"
                  aria-label={hasPreview ? "Play video" : "No video"}
                >
                  {hasPreview ? (
                    <span className="h-16 w-16 rounded-full bg-black/50 flex items-center justify-center transition-transform group-hover/poster:scale-105">
                      <Play className="h-8 w-8 text-white ml-1" />
                    </span>
                  ) : (
                    <VideoIcon className="h-16 w-16 text-muted-foreground/30" />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileRef.current?.click();
                }}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-popover/90 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ opacity: selected ? 1 : undefined }}
                aria-label="Replace video"
              >
                <Replace className="h-4 w-4" />
              </button>
              {(assetId || isRemote) && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-popover/90 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ opacity: selected ? 1 : undefined }}
                  aria-label="Remove video"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="bg-card px-4 py-3 border-t border-border/50">
              <input
                value={caption}
                onChange={(e) => updateNodeData(id, { caption: e.target.value })}
                onBlur={() => updateNodeDataWithHistory(id, { caption })}
                placeholder="Add a caption..."
                className="w-full bg-transparent text-[13px] text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50"
                aria-label="Caption"
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {assetId && (
                    <button
                      type="button"
                      onClick={() => {
                        getAssetUrl(assetId).then((u) => {
                          if (u) {
                            const a = document.createElement("a");
                            a.href = u;
                            a.download = filename || "video";
                            a.click();
                          }
                        });
                      }}
                      className="flex items-center gap-1.5 rounded-md border border-border bg-popover px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-surface-hover"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </button>
                  )}
                  {isRemote && (
                    <a
                      href={remoteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-md border border-border bg-popover px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-surface-hover"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open
                    </a>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleReplace}
        />
      </motion.div>
    </div>
  );
}

export default memo(VideoNode);
