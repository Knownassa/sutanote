import { Maximize, Minus, Plus } from "lucide-react";
import { BottomToolbar } from "./BottomToolbar";
import { PropertiesPanel } from "./PropertiesPanel";
import { StickyNote, TextCard, TodoCard } from "./CanvasCards";

export function CanvasArea({ selection = true }: { selection?: boolean }) {
  return (
    <div className="relative flex-1 overflow-hidden bg-canvas">
      <div className="canvas-dots absolute inset-0" />

      <div className="absolute inset-0">
        <TextCard />
        <StickyNote />
        <TodoCard />
      </div>

      {selection && <PropertiesPanel />}

      <BottomToolbar />

      <div className="absolute bottom-6 right-6 flex items-center gap-1 rounded-2xl border border-border bg-popover/85 p-1.5 shadow-lg backdrop-blur-md">
        <button
          type="button"
          aria-label="Zoom out"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-10 text-center text-xs text-muted-foreground">100%</span>
        <button
          type="button"
          aria-label="Zoom in"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button
          type="button"
          aria-label="Fit to screen"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
