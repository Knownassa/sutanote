import React, { useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  useReactFlow,
  NodeTypes,
  ReactFlowProvider,
  type Node,
} from "reactflow";
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

function CanvasInner() {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const onConnect = useCanvasStore((s) => s.onConnect);
  const setSelected = useCanvasStore((s) => s.setSelected);
  const initializeStore = useCanvasStore((s) => s.initializeStore);
  const { fitView } = useReactFlow();

  useEffect(() => {
    let active = true;
    initializeStore().then(() => {
      if (active) setTimeout(() => fitView({ duration: 500 }), 100);
    });
    return () => {
      active = false;
    };
  }, [initializeStore, fitView]);

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
        <BottomToolbar />
      </div>
    </ReactFlowProvider>
  );
}

function BottomToolbar() {
  const addNode = useCanvasStore((state) => state.addNode);
  const { getViewport } = useReactFlow();

  const handleAdd = (type: string) => {
    const viewport = getViewport();
    const centerX = (window.innerWidth / 2 - viewport.x) / viewport.zoom;
    const centerY = (window.innerHeight / 2 - viewport.y) / viewport.zoom;
    const randomX = Math.floor(Math.random() * 200) - 100;
    const randomY = Math.floor(Math.random() * 200) - 100;
    addNode(type, { x: centerX + randomX, y: centerY + randomY });
  };

  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-border bg-popover/85 p-2 shadow-lg backdrop-blur-md">
      <button
        type="button"
        aria-label="Select"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
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
        onClick={() => handleAdd("text")}
        aria-label="Text"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
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
        onClick={() => handleAdd("sticky")}
        aria-label="Sticky note"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
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
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
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
        aria-label="Image"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
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
