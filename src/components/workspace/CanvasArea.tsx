import React, { useEffect, useRef, useState, useCallback } from "react";
import ReactFlow, {
  Background,
  MiniMap,
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
  Hand,
  ZoomIn,
  ZoomOut,
  Type,
  StickyNote,
  CheckSquare,
  ImageIcon,
  MoreHorizontal,
  Link2,
} from "lucide-react";
import "reactflow/dist/style.css";
import { useCanvasStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/settings-store";
import { useInteractionStore } from "@/lib/interaction-store";
import { storeImageAsset } from "@/lib/asset-store";
import {
  computeExtentForAllNodes,
  ensureExtentForNode,
  type BoardExtent,
} from "@/lib/board-extent";
import { loadViewport, saveViewport } from "@/lib/viewport";
import { shouldVirtualize } from "@/lib/virtualization";
import StickyNoteNode from "@/components/nodes/StickyNoteNode";
import TextNode from "@/components/nodes/TextNode";
import TodoNode from "@/components/nodes/TodoNode";
import ImageNode from "@/components/nodes/ImageNode";
import LinkNode from "@/components/nodes/LinkNode";
import FileNode from "@/components/nodes/FileNode";
import CommentNode from "@/components/nodes/CommentNode";
import ShapeNode from "@/components/nodes/ShapeNode";
import ColorSwatchNode from "@/components/nodes/ColorSwatchNode";
import BoardNode from "@/components/nodes/BoardNode";
import FolderNode from "@/components/nodes/FolderNode";
import ColumnNode from "@/components/nodes/ColumnNode";
import FrameNode from "@/components/nodes/FrameNode";
import PDFNode from "@/components/nodes/PDFNode";
import VideoNode from "@/components/nodes/VideoNode";
import EmbedNode from "@/components/nodes/EmbedNode";
import CodeBlockNode from "@/components/nodes/CodeBlockNode";
import SectionNode from "@/components/nodes/SectionNode";
import { ToolPicker } from "@/components/workspace/ToolPicker";
import { ImageLightbox } from "@/components/workspace/ImageLightbox";

const nodeTypes: NodeTypes = {
  sticky: StickyNoteNode,
  text: TextNode,
  todo: TodoNode,
  image: ImageNode,
  link: LinkNode,
  file: FileNode,
  comment: CommentNode,
  shape: ShapeNode,
  color_swatch: ColorSwatchNode,
  board: BoardNode,
  folder: FolderNode,
  column: ColumnNode,
  frame: FrameNode,
  pdf: PDFNode,
  video: VideoNode,
  embed: EmbedNode,
  code: CodeBlockNode,
  section: SectionNode,
};

function centerViewport(): Viewport {
  if (typeof window === "undefined") return { x: 0, y: 0, zoom: 0.9 };
  return { x: window.innerWidth / 2, y: window.innerHeight / 2, zoom: 0.9 };
}

function getCanvasCenter(): { x: number; y: number } {
  if (typeof document === "undefined")
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const el = document.querySelector(".react-flow");
  const rect = el?.getBoundingClientRect();
  return {
    x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
    y: rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
  };
}

const addAtViewportCenter = (
  getViewport: () => { x: number; y: number; zoom: number },
  addNode: (type: string, position: { x: number; y: number }) => void,
  type: string,
) => {
  const vp = getViewport();
  const center = getCanvasCenter();
  const x = (center.x - vp.x) / vp.zoom;
  const y = (center.y - vp.y) / vp.zoom;
  addNode(type, {
    x: x + (Math.floor(Math.random() * 200) - 100),
    y: y + (Math.floor(Math.random() * 200) - 100),
  });
};

function CanvasInner() {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const isLoaded = useCanvasStore((s) => s.isLoaded);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const onConnect = useCanvasStore((s) => s.onConnect);
  const initializeStore = useCanvasStore((s) => s.initializeStore);
  const gridVisible = useSettingsStore((s) => s.gridVisible);
  const snapToGrid = useSettingsStore((s) => s.snapToGrid);
  const activeTool = useInteractionStore((s) => s.activeTool);
  const spaceHeld = useInteractionStore((s) => s.spaceHeld);
  const isDragging = useInteractionStore((s) => s.isDragging);
  const editingNodeId = useInteractionStore((s) => s.editingNodeId);
  const { getViewport, screenToFlowPosition } = useReactFlow();

  const containerRef = useRef<HTMLDivElement>(null);
  const [defaultViewport] = useState<Viewport>(() => loadViewport() ?? centerViewport());
  const extentRef = useRef<BoardExtent>(
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
  const [extent, setExtent] = useState<BoardExtent>(extentRef.current);

  // Adaptive viewport virtualization: only pay React Flow's visibility pass on
  // boards big enough to benefit from skipping off-screen nodes.
  const [virtualized, setVirtualized] = useState(false);
  useEffect(() => {
    setVirtualized((cur) => shouldVirtualize(nodes.length, cur));
  }, [nodes.length]);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Establish a bounded working area once content is known (no per-frame scan).
  useEffect(() => {
    if (!isLoaded) return;
    const full = computeExtentForAllNodes(useCanvasStore.getState().nodes);
    extentRef.current = full;
    setExtent(full);
  }, [isLoaded]);

  // Reset drag/resize interaction flags on any pointer release.
  useEffect(() => {
    const up = () => {
      useInteractionStore.getState().setDragging(false);
      useInteractionStore.getState().setResizing(false);
      useInteractionStore.getState().setPanning(false);
    };
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, []);

  const handMode = activeTool === "hand" || spaceHeld;

  const displayNodes = React.useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        hidden: n.data?.["hidden"] === true,
        draggable: !handMode && !n.data?.locked && editingNodeId !== n.id,
        className: n.data?.locked ? "locked" : "",
      })),
    [nodes, handMode, editingNodeId],
  );

  const handleNodeDragStart = useCallback(() => {
    useInteractionStore.getState().setDragging(true);
  }, []);

  const handleNodeDrag = useCallback((_e: unknown, _node: Node, dragged: Node[]) => {
    let nextExtent = extentRef.current;
    for (const n of dragged) {
      const w = (n.width as number) ?? (n.style?.width as number) ?? 200;
      const h = (n.height as number) ?? (n.style?.minHeight as number) ?? 120;
      nextExtent = ensureExtentForNode(nextExtent, n.position.x, n.position.y, w, h);
    }
    if (nextExtent !== extentRef.current) {
      extentRef.current = nextExtent;
      setExtent(nextExtent);
    }
  }, []);

  const handleNodeDragStop = useCallback(() => {
    useInteractionStore.getState().setDragging(false);
  }, []);

  const expandFor = useCallback(
    (x: number, y: number, w: number | undefined, h: number | undefined) => {
      const next = ensureExtentForNode(extentRef.current, x, y, w ?? 200, h ?? 120);
      if (next !== extentRef.current) {
        extentRef.current = next;
        setExtent(next);
      }
    },
    [],
  );

  // Expand the board only for the actively changed node (O(1)), never a full scan.
  const handleNodesChange: typeof onNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      const state = useCanvasStore.getState();
      for (const c of changes) {
        if (c.type === "position" && c.position) {
          const n = state.nodes.find((x) => x.id === c.id);
          if (n)
            expandFor(
              c.position.x,
              c.position.y,
              n.style?.width as number,
              n.style?.minHeight as number,
            );
        } else if (c.type === "dimensions" && c.dimensions) {
          const n = state.nodes.find((x) => x.id === c.id);
          if (n)
            expandFor(
              n.position.x,
              n.position.y,
              c.dimensions.width ?? (n.style?.width as number),
              c.dimensions.height ?? (n.style?.minHeight as number),
            );
        }
      }
    },
    [onNodesChange, expandFor],
  );

  // Keyboard interaction layer (tools, selection, clipboard, nudge, delete).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const isEditingInput =
        !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      const editingNode = useInteractionStore.getState().editingNodeId;

      if (e.code === "Space" && !isEditingInput && !editingNode) {
        e.preventDefault();
        if (!useInteractionStore.getState().spaceHeld)
          useInteractionStore.getState().setSpaceHeld(true);
        return;
      }

      const canvas = useCanvasStore.getState();
      const mod = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();
      const isEditing = isEditingInput || !!editingNode;

      if (mod && k === "a") {
        if (isEditing) return;
        e.preventDefault();
        canvas.selectAll();
        return;
      }
      if (mod && k === "z" && !e.shiftKey) {
        if (isEditing) return;
        e.preventDefault();
        canvas.undo();
        return;
      }
      if ((mod && k === "z" && e.shiftKey) || (mod && k === "y")) {
        if (isEditing) return;
        e.preventDefault();
        canvas.redo();
        return;
      }
      if (mod && k === "c") {
        if (isEditing) return;
        canvas.copySelected();
        return;
      }
      if (mod && k === "x") {
        if (isEditing) return;
        canvas.cutSelected();
        return;
      }
      if (mod && k === "v") {
        if (isEditing) return;
        e.preventDefault();
        const vp = getViewport();
        const center = getCanvasCenter();
        const pos = {
          x: (center.x - vp.x) / vp.zoom,
          y: (center.y - vp.y) / vp.zoom,
        };
        canvas.pasteAt(pos);
        return;
      }
      if (mod && k === "d") {
        if (isEditing) return;
        e.preventDefault();
        canvas.duplicateSelected();
        return;
      }
      if (mod) return;

      if (isEditing) return;

      if (e.key === "Enter" && !mod && !isEditing) {
        const selIds = canvas.selectedNodeIds;
        if (selIds.length === 1) {
          const nn = canvas.nodes.find((x) => x.id === selIds[0]);
          if (nn && (nn.type === "text" || nn.type === "sticky" || nn.type === "code")) {
            e.preventDefault();
            useInteractionStore.getState().setEditingNode(nn.id, "body");
            return;
          }
        }
      }

      if (k === "v") {
        useInteractionStore.getState().setActiveTool("select");
      } else if (k === "h") {
        useInteractionStore.getState().setActiveTool("hand");
      } else if (k === "c") {
        useInteractionStore.getState().setActiveTool("connector");
      } else if (k === "t") {
        addAtViewportCenter(getViewport, canvas.addNode, "text");
      } else if (k === "s") {
        addAtViewportCenter(getViewport, canvas.addNode, "sticky");
      } else if (k === "d") {
        addAtViewportCenter(getViewport, canvas.addNode, "todo");
      } else if (e.key === "Escape") {
        const { editingNodeId, setEditingNode } = useInteractionStore.getState();
        if (editingNodeId) {
          e.preventDefault();
          setEditingNode(null);
          return;
        }
        canvas.clearSelection();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (canvas.selectedNodeIds.length) {
          e.preventDefault();
          canvas.deleteSelected();
        }
      } else if (e.key.startsWith("Arrow")) {
        const step = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;
        if (e.key === "ArrowUp") dy = -step;
        else if (e.key === "ArrowDown") dy = step;
        else if (e.key === "ArrowLeft") dx = -step;
        else if (e.key === "ArrowRight") dx = step;
        if (dx !== 0 || dy !== 0) {
          e.preventDefault();
          canvas.nodes
            .filter((n) => n.selected)
            .forEach((n) => canvas.updateNodePosition(n.id, n.position.x + dx, n.position.y + dy));
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") useInteractionStore.getState().setSpaceHeld(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [getViewport]);

  const handlePaneClick = useCallback(() => useCanvasStore.getState().clearSelection(), []);
  const handleMoveEnd = useCallback((_e: unknown, vp: Viewport) => saveViewport(vp), []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const allNodes = useCanvasStore.getState().nodes;
      // Check if drop is onto an empty asset node (image/pdf/video/file/audio)
      const emptyAssetTypes = ["image", "pdf", "video", "audio", "file"];
      const hitEmpty = allNodes.find((n) => {
        if (!n.type || !emptyAssetTypes.includes(n.type)) return false;
        if ((n.data.assetId as string) || (n.data.remoteUrl as string)) return false;
        const w = (n.style?.width as number) ?? 280;
        const h = (n.style?.minHeight as number) ?? 120;
        const left = n.position.x - w / 2;
        const right = n.position.x + w / 2;
        const top = n.position.y - h / 2;
        const bottom = n.position.y + h / 2;
        return pos.x >= left && pos.x <= right && pos.y >= top && pos.y <= bottom;
      });
      if (hitEmpty) {
        const assetId = await storeImageAsset(file, file.name);
        useCanvasStore.getState().updateNodeDataWithHistory(hitEmpty.id, {
          assetId,
          caption: file.name,
          filename: file.name,
          sourceType: "local",
          remoteUrl: "",
        });
        useCanvasStore.getState().setSelectedIds([hitEmpty.id]);
        return;
      }
      // Otherwise create new node based on file type
      const typeMap: Record<string, string> = {
        "image/": "image",
        "video/": "video",
        "audio/": "audio",
        "application/pdf": "pdf",
      };
      let nodeType = "file";
      for (const [prefix, t] of Object.entries(typeMap)) {
        if (file.type.startsWith(prefix) || file.type === prefix) {
          nodeType = t;
          break;
        }
      }
      const canvas = useCanvasStore.getState();
      canvas.addNode(nodeType, pos);
      const id = useCanvasStore.getState().selectedNodeIds[0];
      if (id) {
        const assetId = await storeImageAsset(file, file.name);
        useCanvasStore.getState().updateNodeDataWithHistory(id, {
          assetId,
          caption: file.name,
          filename: file.name,
          sourceType: "local",
          remoteUrl: "",
        });
      }
    },
    [screenToFlowPosition],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const cursorClass =
    isDragging || useInteractionStore.getState().isPanning
      ? "sut-cursor-grabbing"
      : handMode
        ? "sut-cursor-grab"
        : activeTool === "select"
          ? "sut-cursor-default"
          : activeTool === "connector"
            ? "sut-cursor-crosshair"
            : "sut-cursor-crosshair";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={handlePaneClick}
        onMoveEnd={handleMoveEnd}
        onNodeDragStart={handleNodeDragStart}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        defaultViewport={defaultViewport}
        translateExtent={extent}
        onlyRenderVisibleElements={virtualized}
        className={`bg-canvas ${cursorClass}`}
        nodeOrigin={[0.5, 0.5]}
        minZoom={0.2}
        maxZoom={2}
        snapToGrid={false}
        snapGrid={[16, 16]}
        deleteKeyCode={null}
        multiSelectionKeyCode={["Meta", "Shift", "Control"]}
        selectionOnDrag={!handMode && activeTool !== "connector"}
        panOnDrag={handMode ? [0, 1, 2] : activeTool === "connector" ? [] : [1, 2]}
        nodesDraggable={!handMode && activeTool !== "connector"}
        connectionRadius={30}
        connectOnClick={activeTool === "connector"}
      >
        {gridVisible && <Background color="var(--canvas-dot)" gap={24} size={0.8} />}
        <MiniMap
          position="bottom-left"
          pannable
          zoomable
          nodeColor="var(--muted)"
          nodeBorderRadius={6}
          maskColor="rgba(0,0,0,0.08)"
          style={{
            width: 160,
            height: 120,
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
          }}
        />
      </ReactFlow>
    </div>
  );
}

export function CanvasArea() {
  return (
    <ReactFlowProvider>
      <div className="relative flex-1 overflow-hidden" style={{ width: "100%", height: "100%" }}>
        <CanvasInner />
        <CanvasOverlay />
        <BottomToolbar />
        <ImageLightbox />
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
  const activeTool = useInteractionStore((s) => s.activeTool);
  const setActiveTool = useInteractionStore((s) => s.setActiveTool);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pressed, setPressed] = useState<string | null>(null);

  const createWith = (type: string) => {
    setPressed(type);
    setTimeout(() => setPressed(null), 180);
    addAtViewportCenter(getViewport, addNode, type);
    setActiveTool("select");
  };

  const tools = [
    { type: "text", label: "Text", icon: Type },
    { type: "sticky", label: "Sticky", icon: StickyNote },
    { type: "todo", label: "To-do", icon: CheckSquare },
    { type: "image", label: "Image", icon: ImageIcon },
    { type: "connector", label: "Connector", icon: Link2 },
  ] as const;

  return (
    <>
      <div className="pointer-events-auto fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-border bg-popover/92 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
        <button
          type="button"
          onClick={() => setActiveTool("select")}
          className={toolBtn(activeTool === "select")}
          aria-label="Select (V)"
        >
          <MousePointer2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={() => setActiveTool("hand")}
          className={toolBtn(activeTool === "hand")}
          aria-label="Hand / pan (H)"
        >
          <Hand className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>

        <span className="mx-1 h-6 w-px bg-border" />

        {tools.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => createWith(type)}
            className={toolBtn(pressed === type)}
            aria-label={label}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
        ))}

        <button
          type="button"
          onClick={() => setPickerOpen(!pickerOpen)}
          className={toolBtn(pickerOpen)}
          aria-label="More items"
        >
          <MoreHorizontal className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>

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
      <ToolPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </>
  );
}
