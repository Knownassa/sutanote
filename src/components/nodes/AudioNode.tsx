import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { AudioLines, Download, ExternalLink, Pause, Play, Replace, X } from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import { useHeavyNode } from "@/hooks/use-heavy-node";
import { storeAsset, getAssetUrl } from "@/lib/asset-store";
import { ResizeControls } from "./ResizeControls";
import { EmptyAssetState } from "./EmptyAssetState";

function AudioNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const reduce = useReducedMotion();
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [url, setUrl] = useState("");
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const { ref: heavyRef, phase } = useHeavyNode();

  const assetId = (data.assetId as string) ?? "";
  const remoteUrl = (data.remoteUrl as string) ?? "";
  const sourceType = (data.sourceType as "local" | "remote") ?? "local";
  const filename = (data.filename as string) ?? "Audio file";
  const caption = (data.caption as string) ?? "";
  const opacity = (data.opacity as number) ?? 100;

  useEffect(() => {
    let active = true;
    if (phase === "idle") return;
    if (assetId) {
      getAssetUrl(assetId).then((next) => {
        if (active) setUrl(next ?? "");
      });
    } else {
      setUrl(remoteUrl);
    }
    return () => {
      active = false;
    };
  }, [assetId, remoteUrl, phase]);

  const setLocalAsset = useCallback(
    async (file: File) => {
      const nextId = await storeAsset(file, file.name);
      updateNodeDataWithHistory(id, {
        assetId: nextId,
        remoteUrl: "",
        sourceType: "local",
        filename: file.name,
        caption: file.name,
      });
      const nextUrl = await getAssetUrl(nextId);
      setUrl(nextUrl ?? "");
    },
    [id, updateNodeDataWithHistory],
  );

  const handleFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      await setLocalAsset(file);
    },
    [setLocalAsset],
  );

  const handleRemoteUrl = useCallback(
    (nextUrl: string) => {
      updateNodeDataWithHistory(id, {
        remoteUrl: nextUrl,
        assetId: "",
        sourceType: "remote",
        filename: nextUrl.split("/").pop() || "Audio link",
      });
      setUrl(nextUrl);
    },
    [id, updateNodeDataWithHistory],
  );

  const removeAudio = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
    updateNodeDataWithHistory(id, {
      assetId: "",
      remoteUrl: "",
      sourceType: "local",
      filename: "",
      caption: "",
    });
    setUrl("");
  }, [id, updateNodeDataWithHistory]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !url) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div style={{ width: "100%" }}>
      <ResizeControls id={id} type="audio" selected={selected} />
      <motion.div
        data-node-surface
        initial={reduce ? false : { scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: opacity / 100 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 18 }}
        className={`relative w-full overflow-hidden rounded-[8px] border bg-card transition-shadow ${selected ? "border-border-strong shadow-[0_4px_16px_rgba(0,0,0,0.08)]" : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]"}`}
        style={{ transform: `rotate(${(data.rotation as number) ?? 0}deg)` }}
      >
        <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Left} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Right} className="!h-0 !w-0 !opacity-0" />

        {!assetId && !remoteUrl ? (
          <EmptyAssetState
            icon={<AudioLines className="h-6 w-6" strokeWidth={1.5} />}
            title="Add audio"
            accept="audio/*"
            onAssetId={(nextId, name) =>
              updateNodeDataWithHistory(id, {
                assetId: nextId,
                filename: name,
                caption: name,
                remoteUrl: "",
                sourceType: "local",
              })
            }
            onRemoteUrl={handleRemoteUrl}
            onCancel={removeAudio}
          />
        ) : (
          <div ref={heavyRef} className="p-3">
            <audio
              ref={audioRef}
              src={phase === "idle" ? undefined : url}
              preload="metadata"
              onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
              onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={!url || phase === "idle"}
                onClick={togglePlay}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={playing ? "Pause audio" : "Play audio"}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{filename}</p>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={Math.min(currentTime, duration || 0)}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      if (audioRef.current) audioRef.current.currentTime = next;
                      setCurrentTime(next);
                    }}
                    className="min-w-0 flex-1 accent-primary"
                    aria-label="Audio progress"
                  />
                  <span className="w-16 text-right text-[10px] tabular-nums text-muted-foreground">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>
            <input
              value={caption}
              onChange={(event) => updateNodeData(id, { caption: event.target.value })}
              onBlur={() => updateNodeDataWithHistory(id, { caption })}
              placeholder="Add a caption..."
              className="mt-2 w-full bg-transparent text-[12px] text-muted-foreground outline-none placeholder:text-muted-foreground/40"
              aria-label="Audio caption"
            />
            <div className="mt-2 flex items-center gap-1.5">
              {assetId && (
                <button
                  type="button"
                  onClick={() => {
                    getAssetUrl(assetId).then((nextUrl) => {
                      if (!nextUrl) return;
                      const anchor = document.createElement("a");
                      anchor.href = nextUrl;
                      anchor.download = filename || "audio";
                      anchor.click();
                    });
                  }}
                  className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground hover:bg-surface-hover"
                >
                  <Download className="h-3 w-3" /> Download
                </button>
              )}
              {sourceType === "remote" && remoteUrl && (
                <a
                  href={remoteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground hover:bg-surface-hover"
                >
                  <ExternalLink className="h-3 w-3" /> Open
                </a>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="ml-auto flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground hover:bg-surface-hover"
              >
                <Replace className="h-3 w-3" /> Replace
              </button>
              <button
                type="button"
                onClick={removeAudio}
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                aria-label="Remove audio"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default memo(AudioNode);
