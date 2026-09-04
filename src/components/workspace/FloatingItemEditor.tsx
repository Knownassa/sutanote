import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import { getItemDef } from "@/lib/item-registry";
import { getItemEditor } from "@/lib/item-editor-registry";
import { useItemEditorStore } from "@/lib/item-editor-store";

export function FloatingItemEditor() {
  const active = useItemEditorStore((state) => state.active);
  const close = useItemEditorStore((state) => state.close);
  const node = useCanvasStore((state) =>
    active ? state.nodes.find((item) => item.id === active.nodeId) : undefined,
  );
  const definition = active ? getItemEditor(active.type) : undefined;
  const item = active ? getItemDef(active.type) : undefined;

  return (
    <AnimatePresence initial={false}>
      {active && node && definition && (
        <motion.div
          key={active.nodeId}
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto fixed bottom-24 left-1/2 z-[70] flex h-[min(68dvh,560px)] w-[min(760px,calc(100vw-32px))] -translate-x-1/2 flex-col overflow-hidden rounded-[10px] border border-border bg-card shadow-2xl"
          role="dialog"
          aria-modal="false"
          aria-label={`${item?.label ?? active.type} editor`}
        >
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex gap-1.5">
            <button
              type="button"
              onClick={close}
              className="pointer-events-auto h-3 w-3 rounded-full bg-[#d35e53]"
              aria-label="Close editor"
            />
            <button
              type="button"
              onClick={close}
              className="pointer-events-auto h-3 w-3 rounded-full bg-[#e5c34b]"
              aria-label="Close editor"
            />
          </div>
          <div className="min-h-0 flex-1">
            <definition.component nodeId={node.id} onClose={close} />
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close editor"
            className="absolute right-3 top-2 z-10 rounded p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
