/**
 * Alignment Slice - Manages alignment and distribution operations
 * 
 * This slice handles layout operations for selected nodes:
 * - alignSelected: Align nodes by edge (left, center, right, top, bottom)
 * - distributeSelected: Distribute nodes evenly along an axis
 * - matchSizeSelected: Match dimensions of selected nodes
 * 
 * All operations integrate with history system for undo/redo
 */

import { StateCreator } from 'zustand';
import type { CanvasNode } from '../persistence/types';

export interface AlignmentState {}

export interface AlignmentActions {
  alignSelected: (edge: 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom') => void;
  distributeSelected: (axis: 'horizontal' | 'vertical') => void;
  matchSizeSelected: (dim: 'width' | 'height') => void;
}

export type AlignmentSlice = AlignmentState & AlignmentActions;

/**
 * Creates the alignment slice for Zustand store
 * 
 * Note: This slice requires access to other slices via get():
 * - selection: selectedNodeIds
 * - persistence: applyToSelected helper
 * - history: pushHistoryAfterChange
 */
export const createAlignmentSlice: StateCreator<
  AlignmentSlice,
  [['zustand/devtools', never]],
  [],
  AlignmentSlice
> = (set, get) => ({
  alignSelected: (edge) => {
    const store = get() as {
      nodes: CanvasNode[];
      pushHistoryAfterChange: () => void;
      applyToSelected: (fn: (n: CanvasNode) => CanvasNode) => void;
    };
    
    store.pushHistoryAfterChange();
    const sel = store.nodes.filter((n) => n.selected);
    if (sel.length < 2) return;
    
    const left = (n: CanvasNode) => n.position.x - (n.style?.width as number) / 2;
    const right = (n: CanvasNode) => n.position.x + (n.style?.width as number) / 2;
    const top = (n: CanvasNode) => n.position.y - (n.style?.minHeight as number) / 2;
    const bottom = (n: CanvasNode) => n.position.y + (n.style?.minHeight as number) / 2;
    
    const targets: Record<string, number> = {
      left: Math.min(...sel.map(left)),
      right: Math.max(...sel.map(right)),
      top: Math.min(...sel.map(top)),
      bottom: Math.max(...sel.map(bottom)),
      centerX: (Math.min(...sel.map(left)) + Math.max(...sel.map(right))) / 2,
      centerY: (Math.min(...sel.map(top)) + Math.max(...sel.map(bottom))) / 2,
    };
    
    const targetValue = targets[edge];
    
    store.applyToSelected((n) => {
      let { x, y } = n.position;
      const w = n.style?.width as number;
      const h = n.style?.minHeight as number;
      
      if (edge === 'left') x = targetValue + w / 2;
      else if (edge === 'right') x = targetValue - w / 2;
      else if (edge === 'centerX') x = targetValue;
      else if (edge === 'top') y = targetValue + h / 2;
      else if (edge === 'bottom') y = targetValue - h / 2;
      else if (edge === 'centerY') y = targetValue;
      
      return { ...n, position: { x, y } };
    });
  },

  distributeSelected: (axis) => {
    const store = get() as {
      nodes: CanvasNode[];
      pushHistoryAfterChange: () => void;
      applyToSelected: (fn: (n: CanvasNode) => CanvasNode) => void;
    };
    
    store.pushHistoryAfterChange();
    const sel = store.nodes
      .filter((n) => n.selected)
      .sort((a, b) =>
        axis === 'horizontal' ? a.position.x - b.position.x : a.position.y - b.position.y,
      );
    
    if (sel.length < 3) return;
    
    const span =
      axis === 'horizontal'
        ? sel[sel.length - 1]!.position.x - sel[0]!.position.x
        : sel[sel.length - 1]!.position.y - sel[0]!.position.y;
    
    const step = span / (sel.length - 1);
    const first = sel[0]!.position;
    
    store.applyToSelected((n) => {
      const i = sel.findIndex((s) => s.id === n.id);
      if (i <= 0 || i >= sel.length - 1) return n;
      
      if (axis === 'horizontal') {
        return { ...n, position: { x: first.x + step * i, y: n.position.y } };
      }
      return { ...n, position: { x: n.position.x, y: first.y + step * i } };
    });
  },

  matchSizeSelected: (dim) => {
    const store = get() as {
      nodes: CanvasNode[];
      pushHistoryAfterChange: () => void;
      applyToSelected: (fn: (n: CanvasNode) => CanvasNode) => void;
    };
    
    store.pushHistoryAfterChange();
    const sel = store.nodes.filter((n) => n.selected);
    if (sel.length < 2) return;
    
    const ref =
      dim === 'width'
        ? (sel[0]!.style?.width as number)
        : (sel[0]!.style?.minHeight as number);
    
    store.applyToSelected((n) => ({
      ...n,
      style: {
        ...n.style,
        ...(dim === 'width' ? { width: ref } : { minHeight: ref }),
      },
    }));
  },
});
