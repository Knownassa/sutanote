import React, { useEffect, useRef, useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  useReactFlow,
  NodeTypes,
  ReactFlowProvider,
  type Node,
  type Viewport,
} from "reactflow";
import { AnimatePresence, motion } from "motion/react";
import "reactflow/dist/style.css";
import { useCanvasStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/settings-store";
import { computeExtent, type BoardExtent } from "@/lib/board-extent";
import { loadViewport, saveViewport } from "@/lib/viewport";
import StickyNoteNode from "@/components/nodes/StickyNoteNode";
import TextNode from "@/components/nodes/TextNode";
import TodoNode from "@/components/nodes/TodoNode";

const nodeTypes: NodeTypes = {
  sticky: StickyNoteNode,
  text: TextNode,
  todo: TodoNode,
};

function centerViewport(): Viewport {
  if (typeof window === "undefined") return { x: 0, y: 0, zoom: 0.9 };
  return { x: window.innerWidth / 2, y: window.innerHeight / 2, zoom: 0.9 };
}

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
  const initializeStore = useCanvasStore((s) => s.initializeStore);
  const gridVisible = useSettingsStore((s) => s.gridVisible);
  const snapToGrid = useSettingsStore((s) => s.snapToGrid);
  const { getViewport } = useReactFlow();

  const containerRef = useRef<HTMLDivElement>(null);
  const [defaultViewport] = useState<Viewport>(() => loadViewport() ?? centerViewport());
  const [extent, setExtent] = useState<BoardExtent>(
    typeof window === "undefined"
      ? [
          [-800, -600],
          [800, 600],
        ]
      : [
          [-window.innerWidth, -window.innerHeight],
          [window.innerWidth, window.innerHeight],
        ],
  );

  useEffect(() => {
    let active = true;
    initializeStore();
    return () => {
      active = false;
    };
  }, [initializeStore]);

  // Establish a bounded working area from the visible viewport (+padding) once.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vp = getViewport();
    const z = vp.zoom || 1;
    const tlX = (0 - vp.x) / z;
    const tlY = (0 - vp.y) / z;
    const brX = (rect.width - vp.x) / z;
    const brY = (rect.height - vp.y) / z;
    const pad = 400;
    setExtent([
      [tlX - pad, tlY - pad],
      [brX + pad, brY + pad],
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Monotonic, seamless expansion as content approaches the working boundary.
  useEffect(() => {
    setExtent((prev) => computeExtent(prev, nodes));
  }, [nodes]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;

      const store = useCanvasStore.getState();
      const mod = e.metaKey || e.ctrlKey;

      if (!mod && (e.key === "t" || e.key === "T")) {
        e.preventDefault();
        addAtViewportCenter(getViewport, store.addNode, "text");
        return;
      }
      if (!mod && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        addAtViewportCenter(getViewport, store.addNode, "sticky");
        return;
      }
      if (!mod && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        addAtViewportCenter(getViewport, store.addNode, "todo");
        return;
      }

      if (store.selectedNodeId) {
        const node = store.nodes.find((n) => n.id === store.selectedNodeId);
        if (node) {
          const step = e.shiftKey ? 10 : 1;
          let dx = 0;
          let dy = 0;
          if (e.key === "ArrowUp") dy = -step;
          else if (e.key === "ArrowDown") dy = step;
          else if (e.key === "ArrowLeft") dx = -step;
          else if (e.key === "ArrowRight") dx = step;
          if (dx !== 0 || dy !== 0) {
            e.preventDefault();
            store.onNodesChange([
              {
                id: node.id,
                type: "position",
                position: { x: node.position.x + dx, y: node.position.y + dy },
                dragging: false,
              },
            ]);
            return;
          }
        }
      }

      if ((e.key === "Delete" || e.key === "Backspace") && store.selectedNodeId) {
        e.preventDefault();
        store.deleteNode(store.selectedNodeId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [getViewport]);

  const handleNodeClick = useCallback(
    (_e: React.MouseEvent, node: Node) => setSelected(node.id),
    [setSelected],
  );
  const handlePaneClick = useCallback(() => setSelected(null), [setSelected]);
  const handleMoveEnd = useCallback((_e: unknown, vp: Viewport) => saveViewport(vp), []);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onMoveEnd={handleMoveEnd}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        defaultViewport={defaultViewport}
        translateExtent={extent}
        className="bg-canvas"
        nodeOrigin={[0.5, 0.5]}
        minZoom={0.2}
        maxZoom={2}
        snapToGrid={snapToGrid}
        snapGrid={[16, 16]}
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode={["Meta", "Shift"]}
        selectionOnDrag={true}
        panOnDrag={[1, 2]}
        connectionRadius={30}
      >
        {gridVisible && <Background color="var(--canvas-dot)" gap={24} size={1.5} />}
        <Controls
          className="bg-popover border-border rounded-lg shadow-lg"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />
      </ReactFlow>
      {/* vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ boxShadow: "inset 0 0 80px rgba(0,0,0,0.03)" }}
      />
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

  return (
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
  );
}

const btnBase =
  "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-[transform,background-color,color,box-shadow] hover:bg-surface-hover hover:text-foreground active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent disabled:active:scale-100";

function BottomToolbar() {
  const addNode = useCanvasStore((state) => state.addNode);
  const { getViewport } = useReactFlow();

  const [activeTool, setActiveTool] = useState("select");

  const handleAdd = (type: string) => addAtViewportCenter(getViewport, addNode, type);

  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-border bg-popover/90 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
      <button
        type="button"
        aria-label="Select"
        className={`${btnBase} ${activeTool === "select" ? "bg-surface-active text-foreground" : ""}`}
      >
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
      <button
        type="button"
        onClick={() => {
          setActiveTool("text");
          handleAdd("text");
        }}
        aria-label="Text"
        className={`${btnBase} ${activeTool === "text" ? "bg-surface-active text-foreground" : ""}`}
      >
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
        onClick={() => {
          setActiveTool("sticky");
          handleAdd("sticky");
        }}
        aria-label="Sticky note"
        className={`${btnBase} ${activeTool === "sticky" ? "bg-surface-active text-foreground" : ""}`}
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
        onClick={() => {
          setActiveTool("todo");
          handleAdd("todo");
        }}
        aria-label="To-do list"
        className={`${btnBase} ${activeTool === "todo" ? "bg-surface-active text-foreground" : ""}`}
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
      <button
        type="button"
        disabled
        aria-label="Image (coming soon)"
        className={`${btnBase} ${activeTool === "image" ? "bg-surface-active text-foreground" : ""}`}
      >
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
