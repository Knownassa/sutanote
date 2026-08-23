import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PanelLeftOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { CanvasArea } from "@/components/workspace/CanvasArea";
import { RightPropertiesSidebar } from "@/components/workspace/RightPropertiesSidebar";
import { CommandPalette } from "@/components/workspace/CommandPalette";
import { useCanvasStore } from "@/lib/store";

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);

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
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <WorkspaceSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(false)}
        onOpenPalette={() => setPaletteOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center">
          {!sidebarOpen && (
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setSidebarOpen(true)}
              className="ml-3 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <WorkspaceHeader />
          </div>
        </div>

        <main className="flex min-h-0 flex-1 flex-col">
          <CanvasArea />
        </main>
      </div>

      <AnimatePresence initial={false}>
        {selectedNodeId && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-screen shrink-0 overflow-hidden border-l border-border bg-popover"
          >
            <RightPropertiesSidebar />
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
