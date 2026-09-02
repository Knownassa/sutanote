import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { CanvasArea } from "@/components/workspace/CanvasArea";
import { RightPropertiesSidebar } from "@/components/workspace/RightPropertiesSidebar";
import { CommandPalette } from "@/components/workspace/CommandPalette";
import { NoticeBar } from "@/components/workspace/NoticeBar";
import { CanvasErrorBoundary } from "@/components/workspace/CanvasErrorBoundary";
import { LayersPanel } from "@/components/workspace/LayersPanel";
import { useCanvasStore } from "@/lib/store";
import { useThemeManager } from "@/lib/theme";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sutonote — Local-first visual workspace" },
      {
        name: "description",
        content:
          "Sutonote is a local-first, open-source infinite canvas for notes, boards and moodboards.",
      },
      { property: "og:title", content: "Sutonote — Local-first visual workspace" },
      {
        property: "og:description",
        content: "An open-source infinite canvas workspace that keeps your boards on your machine.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
  const lastSaveError = useCanvasStore((s) => s.lastSaveError);
  useThemeManager();

  // Show save-error notices.
  useEffect(() => {
    if (lastSaveError) {
      import("@/lib/notice-store").then(({ useNoticeStore }) =>
        useNoticeStore.getState().show(`Save failed: ${lastSaveError}`, "error"),
      );
    }
  }, [lastSaveError]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-background">
      {/* The board is the application. All chrome floats above it without
          changing the canvas viewport when opened or closed. */}
      <div className="absolute inset-0 z-0">
        <CanvasErrorBoundary>
          <CanvasArea />
        </CanvasErrorBoundary>
      </div>

      <div className="pointer-events-none absolute inset-0 z-30">
        <div className="pointer-events-auto absolute left-4 right-4 top-4">
          <WorkspaceHeader />
        </div>

        <div className="pointer-events-auto fixed bottom-4 right-4 flex max-h-[calc(100dvh-8rem)] w-[238px] flex-col justify-end overflow-y-auto overscroll-contain scrollbar-thin">
          <AnimatePresence initial={false}>
            {selectedNodeIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.96 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="mb-3 h-[275px] shrink-0 overflow-hidden rounded-[8px] border border-border bg-popover/95 shadow-xl backdrop-blur-md"
              >
                <RightPropertiesSidebar />
              </motion.div>
            )}
          </AnimatePresence>
          <LayersPanel />
        </div>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <NoticeBar />
    </div>
  );
}
