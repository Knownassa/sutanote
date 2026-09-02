import { useEffect, useState } from "react";
import { Download, ExternalLink, X } from "lucide-react";
import { useDocumentPreviewStore } from "@/lib/document-preview-store";
import { useCanvasStore } from "@/lib/store";
import { getAssetUrl } from "@/lib/asset-store";

export function DocumentPreview() {
  const { isOpen, nodeId, close } = useDocumentPreviewStore();
  const node = useCanvasStore((s) => s.nodes.find((item) => item.id === nodeId));
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!isOpen || !node) {
      setUrl(null);
      return () => {
        active = false;
      };
    }
    const remote = (node.data.remoteUrl as string) || "";
    const assetId = (node.data.assetId as string) || "";
    if (assetId) {
      getAssetUrl(assetId).then((value) => active && setUrl((value ?? remote) || null));
    } else {
      setUrl(remote || null);
    }
    return () => {
      active = false;
    };
  }, [isOpen, node]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!isOpen || !node) return null;
  const title = (node.data.filename as string) || (node.data.title as string) || "Document preview";
  const mime = (node.data.mime as string) || (node.type === "pdf" ? "application/pdf" : "");

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-6 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="flex h-[min(78dvh,720px)] w-[min(760px,92vw)] flex-col overflow-hidden rounded-[10px] border border-border bg-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-12 shrink-0 items-center gap-2 bg-foreground px-3 text-background">
          <button
            type="button"
            aria-label="Close preview"
            onClick={close}
            className="h-3 w-3 rounded-full bg-[#d35e53]"
          />
          <button
            type="button"
            aria-label="Close preview"
            onClick={close}
            className="h-3 w-3 rounded-full bg-[#e5c34b]"
          />
          <span className="ml-3 min-w-0 flex-1 truncate text-xs font-medium">{title}</span>
          {url && (
            <a href={url} target="_blank" rel="noreferrer" aria-label="Open document in new tab">
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <button type="button" onClick={close} aria-label="Close preview">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 bg-muted/30">
          {url ? (
            <iframe
              src={url}
              title={title}
              className="h-full w-full border-0"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No preview available
            </div>
          )}
        </div>
        <div className="flex h-11 shrink-0 items-center justify-end border-t border-border bg-card px-3">
          {url && (
            <a
              href={url}
              download={title}
              className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          )}
          <span className="ml-3 text-[10px] text-muted-foreground/60">{mime || "document"}</span>
        </div>
      </div>
    </div>
  );
}
