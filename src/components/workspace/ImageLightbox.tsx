import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useLightboxStore } from "@/lib/lightbox-store";
import { useCanvasStore } from "@/lib/store";
import { getAssetUrl } from "@/lib/asset-store";

export function ImageLightbox() {
  const { isOpen, currentId, imageIds, close, next, prev } = useLightboxStore();
  const nodes = useCanvasStore((s) => s.nodes);
  const [url, setUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");

  const currentNode = nodes.find((n) => n.id === currentId);
  const hasMultiple = imageIds.length > 1;

  useEffect(() => {
    if (!isOpen || !currentNode) {
      setUrl(null);
      return;
    }
    const assetId = currentNode.data.assetId as string | undefined;
    const remoteUrl = currentNode.data.remoteUrl as string | undefined;
    if (assetId) {
      getAssetUrl(assetId).then((u) => setUrl(u ?? remoteUrl ?? null));
    } else if (remoteUrl) {
      setUrl(remoteUrl);
    } else {
      setUrl(null);
    }
    setCaption((currentNode.data.caption as string) ?? "");
  }, [isOpen, currentId, currentNode]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft" && hasMultiple) {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight" && hasMultiple) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, hasMultiple, close, next, prev]);

  if (!isOpen || !currentNode) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <button
        type="button"
        onClick={close}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:right-16"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <div
        className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-[10px] bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {url ? (
          <img src={url} alt={caption || "image"} className="max-h-[75vh] w-auto max-w-[90vw] object-contain" />
        ) : (
          <div className="flex h-64 w-96 items-center justify-center text-muted-foreground">No image</div>
        )}
        {caption && (
          <div className="border-t border-border bg-card px-4 py-3 text-center text-sm text-foreground">
            {caption}
          </div>
        )}
        {hasMultiple && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
            {imageIds.indexOf(currentId ?? "") + 1} / {imageIds.length}
          </div>
        )}
      </div>
    </div>
  );
}
