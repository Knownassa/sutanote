import React, { useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  useReactFlow,
  NodeTypes,
  ReactFlowProvider,
  type Node,
} from "reactflow";
import { AnimatePresence, motion } from "motion/react";
import "reactflow/dist/style.css";
import { useCanvasStore } from "@/lib/store";
import StickyNoteNode from "@/components/nodes/StickyNoteNode";
import TextNode from "@/components/nodes/TextNode";
import TodoNode from "@/components/nodes/TodoNode";

const nodeTypes: NodeTypes = {
  sticky: StickyNoteNode,
  text: TextNode,
  todo: TodoNode,
};

const addAtViewportCenter = (
  getViewport: () => { x: number; y: number; zoom: number },
  addNode: (type: string, position: { x: number; y: number }) => void,
  type: string,
) => {
  const vp = getViewport();
  const x = (window.innerWidth / 2 - vp.x) / vp.zoom;
  const y = (window.innerHeight / 2 - vp.y) / vp.zoom;
  addNode(type, {
    x: x + (Math.floor(Math.random() * 200) - 100),
    y: y + (Math.floor(Math.random() * 200) - 100),
  });
};

function CanvasInner() {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const onConnect = useCanvasStore((s) => s.onConnect);
  const setSelected = useCanvasStore((s) => s.setSelected);
  const addNode = useCanvasStore((s) => s.addNode);
  const initializeStore = useCanvasStore((s) => s.initializeStore);
  const { fitView, getViewport } = useReactFlow();

  useEffect(() => {
    let active = true;
    initializeStore().then(() => {
      if (active) setTimeout(() => fitView({ duration: 500 }), 100);
    });
    return () => {
      active = false;
    };
  }, [initializeStore, fitView]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if ((e.key === "t" || e.key === "T") && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        addAtViewportCenter(getViewport, addNode, "text");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [getViewport, addNode]);

  const handleNodeClick = useCallback(
    (_e: React.MouseEvent, node: Node) => setSelected(node.id),
    [setSelected],
  );
  const handlePaneClick = useCallback(() => setSelected(null), [setSelected]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-canvas"
        nodeOrigin={[0.5, 0.5]}
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        snapToGrid={true}
        snapGrid={[16, 16]}
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode={["Meta", "Shift"]}
        selectionOnDrag={true}
        panOnDrag={[1, 2]}
        connectionRadius={30}
      >
        <Background color="var(--canvas-dot)" gap={24} size={1.5} />
        <Controls
          className="bg-popover border-border rounded-lg shadow-lg"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />
      </ReactFlow>
    </div>
  );
}

export function CanvasArea() {
  return (
    <ReactFlowProvider>
      <div className="relative flex-1 overflow-hidden">
        <CanvasInner />
        <CanvasOverlay />
        <BottomToolbar />
      </div>
    </ReactFlowProvider>
  );
}

function CanvasOverlay() {
  const count = useCanvasStore((s) => s.nodes.length);
  const isSaving = useCanvasStore((s) => s.isSaving);

  return (
    <>
      <AnimatePresence>
        {count === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          >
            <p className="font-serif text-sm text-muted-foreground/70">
              Click a tool below to begin, or press{" "}
              <kbd className="rounded bg-surface px-1.5 py-0.5 font-mono text-[10px] text-foreground/70">
                T
              </kbd>{" "}
              for a text note
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute bottom-6 right-6 z-20 flex items-center gap-1.5 rounded-full border border-border bg-popover/85 px-3 py-1.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur-md">
        <span
          className={`h-1.5 w-1.5 rounded-full transition-colors ${
            isSaving ? "animate-pulse bg-amber-500" : "bg-sync"
          }`}
        />
        {isSaving ? "Saving…" : "Saved locally"}
      </div>
    </>
  );
}

const btnBase =
  "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-[transform,background-color,color,box-shadow] hover:bg-surface-hover hover:text-foreground active:scale-95";

function BottomToolbar() {
  const addNode = useCanvasStore((state) => state.addNode);
  const { getViewport } = useReactFlow();

  const handleAdd = (type: string) => addAtViewportCenter(getViewport, addNode, type);

  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-border bg-popover/90 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
      <button type="button" aria-label="Select" className={btnBase}>
        <svg
          className="h-[18px] w-[18px]"
          strokeWidth={1.75}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M13 13l6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="mx-1 h-6 w-px bg-border" />
      <button type="button" onClick={() => handleAdd("text")} aria-label="Text" className={btnBase}>
        <svg
          className="h-[18px] w-[18px]"
          strokeWidth={1.75}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <polyline points="4 7 4 4 20 4 20 7" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="9" y1="20" x2="15" y2="20" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="4" x2="12" y2="20" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => handleAdd("sticky")}
        aria-label="Sticky note"
        className={btnBase}
      >
        <svg
          className="h-[18px] w-[18px]"
          strokeWidth={1.75}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline points="15 3 15 9 21 9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => handleAdd("todo")}
        aria-label="To-do list"
        className={btnBase}
      >
        <svg
          className="h-[18px] w-[18px]"
          strokeWidth={1.75}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button type="button" aria-label="Image" className={btnBase}>
        <svg
          className="h-[18px] w-[18px]"
          strokeWidth={1.75}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="2"
            ry="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="8.5" cy="8.5" r="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="21 15 16 10 5 21" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
