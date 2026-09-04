import { useState, useRef, useCallback } from "react";
import { Upload, Link2, X, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";
import { storeImageAsset, getAssetUrl } from "@/lib/asset-store";

interface EmptyAssetStateProps {
  icon: React.ReactNode;
  title: string;
  browseLabel?: string;
  linkLabel?: string;
  accept?: string;
  onAssetId: (assetId: string, filename: string, mime?: string) => void;
  onRemoteUrl: (url: string) => void;
  onCancel?: () => void;
}

export function EmptyAssetState({
  icon,
  title,
  browseLabel = "Browse",
  linkLabel = "Add link",
  accept = "image/*",
  onAssetId,
  onRemoteUrl,
  onCancel,
}: EmptyAssetStateProps) {
  const [state, setState] = useState<"idle" | "entering-url" | "loading" | "error">("idle");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const isIdle = state === "idle";
  const isEnteringUrl = state === "entering-url";
  const isLoading = state === "loading";
  const isError = state === "error";

  const handleBrowse = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const handleFilePick = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setState("loading");
      try {
        const assetId = await storeImageAsset(file, file.name);
        const assetUrl = await getAssetUrl(assetId);
        onAssetId(assetId, file.name, file.type);
      } catch (err) {
        setError("Failed to upload");
        setState("error");
      }
      e.target.value = "";
    },
    [onAssetId],
  );

  const handleAddLink = useCallback(() => {
    setState("entering-url");
    setUrl("");
    setError("");
    setTimeout(() => urlInputRef.current?.focus(), 0);
  }, []);

  const handleUrlSubmit = useCallback(() => {
    try {
      new URL(url);
      if (
        !url.match(/\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|pdf)($|\?)/i) &&
        !url.includes("youtube.com") &&
        !url.includes("vimeo.com") &&
        !url.includes("figma.com")
      ) {
        setError("Enter a valid image, video, PDF, or embed URL");
        return;
      }
      setState("loading");
      onRemoteUrl(url);
    } catch {
      setError("Invalid URL");
    }
  }, [url, onRemoteUrl]);

  const handleCancel = useCallback(() => {
    if (isEnteringUrl) {
      setState("idle");
      setUrl("");
      setError("");
    } else if (onCancel) {
      onCancel();
    }
  }, [isEnteringUrl, onCancel]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && isEnteringUrl) {
        e.preventDefault();
        handleUrlSubmit();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    },
    [isEnteringUrl, handleUrlSubmit, handleCancel],
  );

  return (
    <div
      className="nodrag nowheel flex w-full flex-col items-center justify-center gap-3 bg-surface/50 py-12 px-4"
      onKeyDown={handleKeyDown}
    >
      {isIdle && (
        <>
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-muted/30 text-muted-foreground/50">
              {icon}
            </div>
            <p className="text-sm font-medium text-foreground">{title}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleBrowse}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-popover px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
            >
              <Upload className="h-3.5 w-3.5" />
              {browseLabel}
            </button>
            <button
              type="button"
              onClick={handleAddLink}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
            >
              <Link2 className="h-3.5 w-3.5" />
              {linkLabel}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground/50">Drop a file here</p>
        </>
      )}

      {isEnteringUrl && (
        <div className="w-full max-w-xs flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-[12px] text-muted-foreground">
            URL
            <input
              ref={urlInputRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
              onKeyDown={handleKeyDown}
            />
            {error && <span className="text-[11px] text-destructive">{error}</span>}
          </label>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!url.trim() || isLoading}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Adding...
                </>
              ) : (
                "Add"
              )}
            </button>
          </div>
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-5 w-5" />
          </div>
          <p className="text-sm text-destructive">{error || "Failed to add"}</p>
          <button
            type="button"
            onClick={() => setState("idle")}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-hover"
          >
            Try again
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Processing...</p>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFilePick}
      />
    </div>
  );
}
