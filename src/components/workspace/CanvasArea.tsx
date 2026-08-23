import React, { useEffect, useRef, useState, useCallback } from "react";
import ReactFlow, {
  Background,
  useReactFlow,
  useViewport,
  NodeTypes,
  ReactFlowProvider,
  type Node,
  type Viewport,
} from "reactflow";
import { AnimatePresence, motion } from "motion/react";
import {
  MousePointer2,
  ZoomIn,
  ZoomOut,
  Type,
  StickyNote,
  CheckSquare,
  ImageIcon,
} from "lucide-react";
import "reactflow/dist/style.css";
import { useCanvasStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/settings-store";
import { computeExtent, type BoardExtent } from "@/lib/board-extent";
import { loadViewport, saveViewport } from "@/lib/viewport";
import StickyNoteNode from "@/components/nodes/StickyNoteNode";
import TextNode from "@/components/nodes/TextNode";
import TodoNode from "@/components/nodes/TodoNode";
import ImageNode from "@/components/nodes/ImageNode";

const nodeTypes: NodeTypes = {
  sticky: StickyNoteNode,
  text: TextNode,
  todo: TodoNode,
  image: ImageNode,
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
            Click a tool below to begin — or drag to explore the canvas.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const toolBtn = (active: boolean) =>
  `flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-surface-hover hover:text-foreground active:scale-95 ${
    active ? "bg-surface-active text-foreground" : ""
  }`;

function BottomToolbar() {
  const addNode = useCanvasStore((state) => state.addNode);
  const { getViewport, zoomIn, zoomOut } = useReactFlow();
  const { zoom } = useViewport();
  const [activeTool, setActiveTool] = useState("select");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAdd = (type: string) => addAtViewportCenter(getViewport, addNode, type);

  const onImagePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addAtViewportCenter(getViewport, addNode, "image");
    const id = useCanvasStore.getState().selectedNodeId;
    if (id) {
      useCanvasStore.getState().updateNodeData(id, {
        src: URL.createObjectURL(file),
        caption: file.name,
      });
    }
    e.target.value = "";
  };

  const tools = [
    { type: "text", label: "Text", icon: Type },
    { type: "sticky", label: "Sticky", icon: StickyNote },
    { type: "todo", label: "To-do", icon: CheckSquare },
  ];

  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-border bg-popover/92 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
      <button
        type="button"
        onClick={() => setActiveTool("select")}
        className={toolBtn(activeTool === "select")}
        aria-label="Select"
      >
        <MousePointer2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </button>

      <span className="mx-1 h-6 w-px bg-border" />

      {tools.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          type="button"
          onClick={() => {
            setActiveTool(type);
            handleAdd(type);
          }}
          className={toolBtn(activeTool === type)}
          aria-label={label}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
      ))}

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={toolBtn(activeTool === "image")}
        aria-label="Image"
      >
        <ImageIcon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImagePicked}
      />

      <span className="mx-1 h-6 w-px bg-border" />

      <button
        type="button"
        onClick={() => zoomOut()}
        className={toolBtn(false)}
        aria-label="Zoom out"
      >
        <ZoomOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </button>
      <span className="min-w-[40px] text-center text-[11px] font-mono tabular-nums text-muted-foreground">
        {Math.round(zoom * 100)}%
      </span>
      <button
        type="button"
        onClick={() => zoomIn()}
        className={toolBtn(false)}
        aria-label="Zoom in"
      >
        <ZoomIn className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </button>
    </div>
  );
}
