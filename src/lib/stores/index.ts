/**
 * Sutonote Store Slices
 * 
 * This module combines all store slices into a single Zustand store.
 * Each slice handles a specific domain of functionality:
 * 
 * - selection-slice: Node selection state and operations
 * - history-slice: Undo/redo functionality
 * - persistence-slice: Data persistence with PGlite
 * - node-operations-slice: Node CRUD operations
 * - alignment-slice: Layout and alignment operations
 * - z-index-slice: Stacking order management
 * 
 * @module stores
 */

export { createSelectionSlice, computeSelectedIds, syncSelected } from './selection-slice';
export type { SelectionSlice, SelectionState, SelectionActions } from './selection-slice';

export { createHistorySlice } from './history-slice';
export type { HistorySlice, HistoryState, HistoryActions } from './history-slice';

export { createPersistenceSlice } from './persistence-slice';
export type { PersistenceSlice, PersistenceState, PersistenceActions } from './persistence-slice';

export { createNodeOperationsSlice } from './node-operations-slice';
export type { NodeOperationsSlice, NodeOperationsState, NodeOperationsActions } from './node-operations-slice';

export { createAlignmentSlice } from './alignment-slice';
export type { AlignmentSlice, AlignmentState, AlignmentActions } from './alignment-slice';

export { createZIndexSlice, withTopZ } from './z-index-slice';
export type { ZIndexSlice, ZIndexState, ZIndexActions } from './z-index-slice';
