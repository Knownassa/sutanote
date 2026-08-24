import { memo, useRef, useState, useEffect, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { Globe, ExternalLink, X } from "lucide-react";
import { ResizeControls } from "./ResizeControls";
import { EmptyAssetState } from "./EmptyAssetState";

function EmbedNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;
  const opacity = (data.opacity as number) ?? 100;

  const remoteUrl = (data.remoteUrl as string) ?? "";
  const caption = (data.caption as string) ?? "";
  const [url, setUrl] = useState(remoteUrl);

  useEffect(() => {
    setUrl(remoteUrl);
  }, [remoteUrl]);

  const handleRemoteUrl = useCallback(
    (newRemoteUrl: string) => {
      updateNodeDataWithHistory(id, { remoteUrl: newRemoteUrl });
      setUrl(newRemoteUrl);
    },
    [id, updateNodeDataWithHistory],
  );

  const handleRemove = useCallback(() => {
    updateNodeDataWithHistory(id, { remoteUrl: "", caption: "" });
    setUrl("");
  }, [id, updateNodeDataWithHistory]);

  const showEmpty = !remoteUrl;
  const hasPreview = !!remoteUrl;

  // Extract domain for display
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

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
          opacity: opacity / 100, maxWidth: 480 }}
      >
        {showEmpty ? (
          <EmptyAssetState
            icon={<Globe className="h-6 w-6" strokeWidth={1.5} />}
            title="Add an embed"
            browseLabel="Browse"
            linkLabel="Add link"
            accept=""
            onAssetId={() => {}}
            onRemoteUrl={handleRemoteUrl}
            onCancel={handleRemove}
          />
        ) : (
          <>
            <div className="relative aspect-video bg-muted/30 flex items-center justify-center">
              {hasPreview && (
                <iframe
                  src={url}
                  className="w-full h-full border-0"
                  title="Embedded content"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  loading="lazy"
                />
              )}
              <button
                type="button"
                onClick={handleRemove}
                className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-popover/90 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ opacity: selected ? 1 : undefined }}
                aria-label="Remove embed"
              >
                <X className="h-4 w-4" />
              </button>
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
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                  <Globe className="h-3 w-3" />
                  <span>{getDomain(url)}</span>
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-md border border-border bg-popover px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-surface-hover"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </a>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default memo(EmbedNode);
