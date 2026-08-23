import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PanelLeftOpen } from "lucide-react";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { CanvasArea } from "@/components/workspace/CanvasArea";
import { CommandPalette } from "@/components/workspace/CommandPalette";

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

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
