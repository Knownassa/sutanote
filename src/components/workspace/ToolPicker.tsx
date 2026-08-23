import { useCallback, useRef, useEffect } from "react";
import { useReactFlow } from "reactflow";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import {
  AVAILABLE_ITEMS,
  CATEGORY_LABELS,
  type ItemCategory,
  type ItemDefinition,
} from "@/lib/item-registry";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ToolPickerProps {
  open: boolean;
  onClose: () => void;
}

export function ToolPicker({ open, onClose }: ToolPickerProps) {
  const addNode = useCanvasStore((s) => s.addNode);
  const setActiveTool = useInteractionStore((s) => s.setActiveTool);
  const panelRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const pick = useCallback(
    (item: ItemDefinition) => {
      // Place at center of visible canvas area using viewport transform.
      const canvasEl = document.querySelector(".react-flow");
      const rect = canvasEl?.getBoundingClientRect();
      const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
      const pos = screenToFlowPosition({ x: cx, y: cy });
      addNode(item.type, pos);
      setActiveTool("select");
      onClose();
    },
    [addNode, setActiveTool, onClose, screenToFlowPosition],
  );

  // Derive categories dynamically from registry.
  const categories = Array.from(new Set(AVAILABLE_ITEMS.map((i) => i.category))) as ItemCategory[];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-20 left-1/2 z-50 w-[320px] -translate-x-1/2 rounded-2xl border border-border bg-popover/95 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-md"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-foreground">Add item</p>
            <button
              type="button"
              onClick={onClose}
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <ScrollArea className="max-h-[320px]">
            {categories.map((cat) => {
              const items = AVAILABLE_ITEMS.filter((i) => i.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} className="mb-2">
                  <p className="mb-1 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                    {CATEGORY_LABELS[cat]}
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    {items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => pick(item)}
                          className="flex flex-col items-center gap-1 rounded-xl p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground active:scale-95"
                        >
                          <Icon className="h-5 w-5" strokeWidth={1.5} />
                          <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
