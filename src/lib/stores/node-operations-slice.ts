/**
 * Node Operations Slice - Manages node CRUD operations
 * 
 * This slice handles all node creation, update, and deletion operations:
 * - addNode: Create new nodes with default data
 * - updateNodeData: Update node data fields
 * - updateNodeSize: Resize nodes
 * - updateNodePosition: Move nodes
 * - deleteNode: Remove nodes
 * 
 * All operations integrate with persistence and history systems
 */

import { StateCreator } from 'zustand';
import { nanoid } from 'nanoid';
import type { CanvasNode, CanvasNodeData } from '../persistence/types';
import { getNodeDef } from '../node-definitions';
import { createDefaultTable } from '../table';
import { useSettingsStore } from '../settings-store';
import { useBoardTreeStore } from '../board-tree-store';
import { DEFAULT_BOARD_ID } from '../persistence/types';

// Default colors for different node types
const defaultColors: Record<string, string> = {
  text: 'bg-card',
  sticky: 'bg-note-yellow',
  todo: 'bg-card',
  image: 'bg-card',
  link: 'bg-card',
  file: 'bg-card',
  comment: 'bg-card',
};

// Container types that stay behind regular items
const CONTAINER_TYPES = ['section', 'frame', 'column'];

export interface NodeOperationsState {}

export interface NodeOperationsActions {
  addNode: (type: string, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<CanvasNodeData>) => void;
  updateNodeDataWithHistory: (id: string, data: Partial<CanvasNodeData>) => void;
  updateNodeSize: (id: string, width: number, height: number) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  deleteNode: (id: string) => void;
}

export type NodeOperationsSlice = NodeOperationsState & NodeOperationsActions;

/**
 * Creates the node operations slice for Zustand store
 * 
 * Note: This slice requires access to other slices via get():
 * - persistence: markNodeDirty, markNodeDeleted, scheduleFlush
 * - history: pushHistoryAfterChange
 * - nodes: current nodes array
 */
export const createNodeOperationsSlice: StateCreator<
  NodeOperationsSlice,
  [['zustand/devtools', never]],
  [],
  NodeOperationsSlice
> = (set, get) => ({
  addNode: (type, position) => {
    const store = get() as {
      nodes: CanvasNode[];
      edges: any[];
      markNodeDirty: (node: CanvasNode) => void;
      scheduleFlush: () => void;
      pushHistoryAfterChange: (baseline?: any) => void;
    };
    
    const maxZ = store.nodes.reduce((m, n) => Math.max(m, n.zIndex ?? 0), 0);
    const def = getNodeDef(type);
    
    // Snap initial position to grid if setting enabled
    const snapToGrid = useSettingsStore.getState().snapToGrid;
    const GRID_SIZE = 16;
    const snapValue = (v: number) => Math.round(v / GRID_SIZE) * GRID_SIZE;
    const pos = snapToGrid 
      ? { x: snapValue(position.x), y: snapValue(position.y) } 
      : position;
    
    // Containers render as ordinary canvas nodes
    const zIndex = CONTAINER_TYPES.includes(type) ? 0 : maxZ + 1;
    
    const newNode: CanvasNode = {
      id: nanoid(),
      type,
      position: pos,
      zIndex,
      selected: true,
      data: {
        text: '',
        title: type === 'text' ? '' : type === 'todo' ? 'To-do' : type === 'link' ? '' : '',
        color: defaultColors[type] ?? 'bg-note-yellow',
        rotation: type === 'sticky' ? Number((Math.random() * 2 - 1).toFixed(2)) : 0,
        ...(type === 'todo'
          ? {
              todos: [
                { label: 'Task 1', done: false },
                { label: 'Task 2', done: false },
                { label: 'Task 3', done: false },
              ],
            }
          : {}),
        ...(type === 'image' ? { src: '', caption: '', assetId: '' } : {}),
        ...(type === 'link' ? { url: '', description: '' } : {}),
        ...(type === 'file' ? { filename: '', assetId: '', mime: '' } : {}),
        ...(type === 'comment'
          ? {
              author: useSettingsStore.getState().displayName,
              resolved: false,
            }
          : {}),
        ...(type === 'section'
          ? { title: 'Section', opacity: 100, showTitle: true, borderOpacity: 70 }
          : {}),
        ...(type === 'frame' ? { title: '', showTitle: true, opacity: 100 } : {}),
        ...(type === 'column'
          ? {
              title: 'Column',
              collapsed: false,
              childOrder: [],
              gap: 10,
              padding: 12,
              autoHeight: false,
            }
          : {}),
        ...(type === 'shape'
          ? {
              shape: 'rectangle',
              fill: 'transparent',
              stroke: 'currentColor',
              strokeWidth: 2,
              cornerRadius: 12,
            }
          : {}),
        ...(type === 'color_swatch' ? { color: '#6366f1', label: '' } : {}),
        ...(type === 'board' ? { title: 'Board', itemCount: 0 } : {}),
        ...(type === 'folder'
          ? { title: 'Folder', icon: 'folder', iconColor: '', itemCount: 0 }
          : {}),
        ...(type === 'code'
          ? { code: '', language: 'plaintext', showLineNumbers: true, wrap: false }
          : {}),
        ...(type === 'pdf' || type === 'video'
          ? { filename: '', assetId: '', remoteUrl: '', sourceType: 'local' }
          : {}),
        ...(type === 'embed' ? { remoteUrl: '' } : {}),
        ...(type === 'audio'
          ? { filename: '', assetId: '', remoteUrl: '', sourceType: 'local' }
          : {}),
        ...(type === 'table'
          ? {
              title: 'Table',
              table: createDefaultTable(),
            }
          : {}),
        ...(type === 'drawing' ? { points: [], strokeColor: '#ef4444', strokeWidth: 3 } : {}),
      },
      style: { width: def.defaultWidth, minHeight: def.defaultHeight },
    };
    
    const next = [...store.nodes.map((n) => ({ ...n, selected: false })), newNode];
    set({ nodes: next, selectedNodeIds: [newNode.id] });
    store.markNodeDirty(newNode);
    store.scheduleFlush();
    
    // History: baseline is the board before this node was added
    store.pushHistoryAfterChange({
      nodes: store.nodes.filter((n) => n.id !== newNode.id),
      edges: store.edges,
    });
  },

  updateNodeData: (id, data) => {
    const store = get() as {
      nodes: CanvasNode[];
      markNodeDirty: (node: CanvasNode) => void;
      scheduleFlush: () => void;
    };
    
    const next = store.nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
    ) as CanvasNode[];
    
    set({ nodes: next });
    const node = next.find((n) => n.id === id);
    if (node) {
      store.markNodeDirty(node);
      store.scheduleFlush();
    }
  },

  updateNodeDataWithHistory: (id, data) => {
    const store = get() as {
      nodes: CanvasNode[];
      markNodeDirty: (node: CanvasNode) => void;
      scheduleFlush: () => void;
      pushHistoryAfterChange: () => void;
    };
    
    store.pushHistoryAfterChange();
    const next = store.nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
    ) as CanvasNode[];
    
    set({ nodes: next });
    const node = next.find((n) => n.id === id);
    if (node) {
      store.markNodeDirty(node);
      store.scheduleFlush();
    }
  },

  updateNodeSize: (id, width, height) => {
    const store = get() as {
      nodes: CanvasNode[];
      markNodeDirty: (node: CanvasNode) => void;
      scheduleFlush: () => void;
    };
    
    const next = store.nodes.map((n) =>
      n.id === id ? { ...n, style: { ...n.style, width, minHeight: height } } : n,
    ) as CanvasNode[];
    
    set({ nodes: next });
    const node = next.find((n) => n.id === id);
    if (node) {
      store.markNodeDirty(node);
      store.scheduleFlush();
    }
  },

  updateNodePosition: (id, x, y) => {
    const store = get() as {
      nodes: CanvasNode[];
      markNodeDirty: (node: CanvasNode) => void;
      scheduleFlush: () => void;
    };
    
    const next = store.nodes.map((n) =>
      n.id === id ? { ...n, position: { x, y } } : n,
    ) as CanvasNode[];
    
    set({ nodes: next });
    const node = next.find((n) => n.id === id);
    if (node) {
      store.markNodeDirty(node);
      store.scheduleFlush();
    }
  },

  deleteNode: (id) => {
    const store = get() as {
      nodes: CanvasNode[];
      edges: any[];
      markNodeDeleted: (id: string) => void;
      scheduleFlush: () => void;
      pushHistoryAfterChange: () => void;
    };
    
    // History: push state before deletion
    store.pushHistoryAfterChange();
    
    const next = store.nodes
      .filter((n) => n.id !== id)
      .map((n) =>
        Array.isArray(n.data.childOrder)
          ? {
              ...n,
              data: {
                ...n.data,
                childOrder: (n.data.childOrder as string[]).filter(
                  (childId) => childId !== id,
                ),
              },
            }
          : n,
      ) as CanvasNode[];
    
    set({ nodes: next });
    store.markNodeDeleted(id);
    store.scheduleFlush();
  },
});
