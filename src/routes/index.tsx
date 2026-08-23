import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PanelLeftOpen } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { CanvasArea } from "@/components/workspace/CanvasArea";
import { RightPropertiesSidebar } from "@/components/workspace/RightPropertiesSidebar";
import { CommandPalette } from "@/components/workspace/CommandPalette";
import { useCanvasStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/settings-store";
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
  const sidebarOpen = useSettingsStore((s) => s.leftSidebarOpen);
  const toggleSidebar = useSettingsStore((s) => s.toggleLeftSidebar);
  const setSidebarOpen = useSettingsStore((s) => s.setLeftSidebarOpen);
  useThemeManager();

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

  const rightPanelOpen = selectedNodeIds.length > 0;

  return (
    <div
      className="grid h-screen w-screen overflow-hidden bg-background"
      style={{
        gridTemplateColumns: sidebarOpen ? "240px minmax(0, 1fr) 0px" : "0px minmax(0, 1fr) 0px",
        gridTemplateRows: "48px minmax(0, 1fr)",
        transition: "grid-template-columns 160ms ease",
      }}
    >
      {/* Left sidebar — row 1-2, col 1 */}
      <div
        className="col-start-1 row-span-2 overflow-hidden border-r border-sidebar-border bg-sidebar"
        style={{ minWidth: sidebarOpen ? 240 : 0 }}
      >
        <WorkspaceSidebar
          open={sidebarOpen}
          onToggle={toggleSidebar}
          onOpenPalette={() => setPaletteOpen(true)}
        />
      </div>

      {/* Header — row 1, col 2 */}
      <div className="col-start-2 row-start-1 min-w-0">
        <div className="flex h-12 items-center">
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
      </div>

      {/* Canvas — row 2, col 2 */}
      <div className="col-start-2 row-start-2 min-h-0 min-w-0">
        <CanvasArea />
      </div>

      {/* Right properties — row 1-2, col 3 (animated) */}
      <AnimatePresence initial={false}>
        {rightPanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="col-start-3 row-span-2 shrink-0 overflow-hidden border-l border-border bg-popover"
          >
            <RightPropertiesSidebar />
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
