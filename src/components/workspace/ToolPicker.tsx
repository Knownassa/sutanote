import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import { useReactFlow } from "reactflow";
import { motion, AnimatePresence } from "motion/react";
import { X, Search } from "lucide-react";
import {
  ITEM_REGISTRY,
  CATEGORY_LABELS,
  type ItemCategory,
  type ItemDefinition,
  type ItemStatus,
  ALL_CATEGORIES,
  STATUS_LABELS,
} from "@/lib/item-registry";
import {
  executeCanvasItem,
  setCanvasItemDragData,
  SUTONOTE_ITEM_MIME,
} from "@/lib/canvas-executor";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ToolPickerProps {
  open: boolean;
  onClose: () => void;
}

export function ToolPicker({ open, onClose }: ToolPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

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
      if (item.status === "coming-soon") return;
      const canvasEl = document.querySelector(".react-flow");
      const rect = canvasEl?.getBoundingClientRect();
      const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
      const pos = screenToFlowPosition({ x: cx, y: cy });
      if (executeCanvasItem(item.type, { position: pos })) onClose();
    },
    [onClose, screenToFlowPosition],
  );

  // Show all categories, not just available ones
  const categories = useMemo(() => ALL_CATEGORIES, []);

  const filteredItems = useMemo(
    () =>
      ITEM_REGISTRY.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.keywords?.some((k) => k.toLowerCase().includes(query.toLowerCase())),
      ),
    [query],
  );

  const getStatusColor = (status: ItemStatus) => {
    switch (status) {
      case "available":
        return "text-foreground";
      case "experimental":
        return "text-yellow-500";
      case "coming-soon":
        return "text-muted-foreground/40";
    }
  };

  const getStatusBg = (status: ItemStatus) => {
    switch (status) {
      case "available":
        return "bg-transparent";
      case "experimental":
        return "bg-yellow-500/10";
      case "coming-soon":
        return "bg-muted/30";
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-20 left-1/2 z-50 w-[360px] -translate-x-1/2 rounded-2xl border border-border bg-popover/95 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-md"
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

          <div className="mb-2 relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search items..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-8 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm text-foreground outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
            />
          </div>

          <ScrollArea className="max-h-[400px]">
            {categories.map((cat) => {
              const items = filteredItems.filter((i) => i.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} className="mb-3">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                      {CATEGORY_LABELS[cat]}
                    </p>
                    <span className="text-[9px] text-muted-foreground/50">
                      {items.length} items
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {items.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        draggable={item.status !== "coming-soon"}
                        onDragStart={(event) => {
                          if (item.status === "coming-soon") return;
                          event.stopPropagation();
                          setCanvasItemDragData(event.dataTransfer, item.type);
                        }}
                        onClick={() => pick(item)}
                        disabled={item.status === "coming-soon"}
                        className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-colors ${
                          item.status === "available"
                            ? "text-muted-foreground hover:bg-surface-hover hover:text-foreground active:scale-95"
                            : item.status === "experimental"
                              ? "text-yellow-600 bg-yellow-500/10 cursor-help"
                              : "text-muted-foreground/40 bg-muted/30 cursor-not-allowed"
                        }`}
                      >
                        <item.icon className="h-5 w-5" strokeWidth={1.5} />
                        <span className="text-[10px] font-medium truncate w-full text-center">
                          {item.label}
                        </span>
                        {item.status !== "available" && (
                          <span
                            className={`text-[8px] font-medium px-1.5 py-0.5 rounded ${getStatusBg(item.status)} ${getStatusColor(item.status)}`}
                          >
                            {STATUS_LABELS[item.status]}
                          </span>
                        )}
                      </button>
                    ))}
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
