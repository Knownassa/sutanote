import { n as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { n as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/history-store-CdXVlQO3.js
var history_store_CdXVlQO3_exports = /* @__PURE__ */ __exportAll({
	n: () => useHistoryStore,
	t: () => history_store_exports
});
var history_store_exports = /* @__PURE__ */ __exportAll$1({ useHistoryStore: () => useHistoryStore });
var MAX_HISTORY_BYTES = 50331648;
function cloneNode(n) {
	return {
		...n,
		data: { ...n.data }
	};
}
function cloneEdge(e) {
	return {
		...e,
		data: e.data ? { ...e.data } : void 0
	};
}
function cloneSnapshot(s) {
	return {
		nodes: s.nodes.map(cloneNode),
		edges: s.edges.map(cloneEdge)
	};
}
/** Identity of a node for change detection — cheap fields first. */
function nodeKey(n) {
	return JSON.stringify([
		n.type,
		n.position.x,
		n.position.y,
		n.style?.width ?? null,
		n.style?.minHeight ?? null,
		n.zIndex ?? null,
		n.data
	]);
}
function edgeKey(e) {
	return JSON.stringify([
		e.source,
		e.target,
		e.sourceHandle ?? null,
		e.targetHandle ?? null,
		e.type ?? null,
		e.data ?? null
	]);
}
function diffList(before, after, getId, keyOf, clone) {
	const beforeMap = new Map(before.map((v) => [getId(v), v]));
	const afterMap = new Map(after.map((v) => [getId(v), v]));
	const patches = [];
	for (const [id, a] of afterMap) {
		const b = beforeMap.get(id);
		if (!b) patches.push({
			id,
			after: clone(a)
		});
		else if (keyOf(b) !== keyOf(a)) patches.push({
			id,
			before: clone(b),
			after: clone(a)
		});
	}
	for (const [id, b] of beforeMap) if (!afterMap.has(id)) patches.push({
		id,
		before: clone(b)
	});
	return patches;
}
function estimateBytes(patch) {
	try {
		return JSON.stringify(patch).length * 2;
	} catch {
		return 0;
	}
}
function makePatch(before, after) {
	const nodes = diffList(before.nodes, after.nodes, (n) => n.id, nodeKey, cloneNode);
	const edges = diffList(before.edges, after.edges, (e) => e.id, edgeKey, cloneEdge);
	if (nodes.length === 0 && edges.length === 0) return null;
	return {
		nodes,
		edges,
		bytes: estimateBytes({
			nodes,
			edges
		})
	};
}
/** Apply a patch to a snapshot. `direction` -1 restores `before` (undo). */
function applyPatch(snapshot, patch, direction) {
	const applyTo = (list, patches, getId) => {
		if (patches.length === 0) return list;
		const target = /* @__PURE__ */ new Map();
		for (const p of patches) {
			const value = direction === -1 ? p.before : p.after;
			target.set(p.id, value ?? null);
		}
		const out = [];
		for (const item of list) {
			const id = getId(item);
			if (target.has(id)) {
				const replacement = target.get(id);
				if (replacement) out.push(replacement);
				target.delete(id);
				continue;
			}
			out.push(item);
		}
		for (const value of target.values()) if (value) out.push(value);
		return out;
	};
	return {
		nodes: applyTo(snapshot.nodes, patch.nodes, (n) => n.id),
		edges: applyTo(snapshot.edges, patch.edges, (e) => e.id)
	};
}
function trim(past, future) {
	let nextPast = past.slice(-200);
	let bytes = nextPast.reduce((sum, p) => sum + p.bytes, 0) + future.reduce((sum, p) => sum + p.bytes, 0);
	while (bytes > MAX_HISTORY_BYTES && nextPast.length > 1) {
		bytes -= nextPast[0].bytes;
		nextPast = nextPast.slice(1);
	}
	return {
		past: nextPast,
		bytes
	};
}
var useHistoryStore = create((set, get) => ({
	past: [],
	present: null,
	future: [],
	canUndo: false,
	canRedo: false,
	bytes: 0,
	push: (snapshot) => {
		const { present, past } = get();
		if (!present) {
			set({ present: cloneSnapshot(snapshot) });
			return;
		}
		const patch = makePatch(present, snapshot);
		if (!patch) return;
		const { past: nextPast, bytes } = trim([...past, patch], []);
		set({
			past: nextPast,
			present: cloneSnapshot(snapshot),
			future: [],
			canUndo: nextPast.length > 0,
			canRedo: false,
			bytes
		});
	},
	undo: () => {
		const { past, present, future } = get();
		if (past.length === 0 || !present) return null;
		const patch = past[past.length - 1];
		const restored = applyPatch(present, patch, -1);
		const nextPast = past.slice(0, -1);
		const nextFuture = [patch, ...future];
		const { bytes } = trim(nextPast, nextFuture);
		set({
			past: nextPast,
			present: restored,
			future: nextFuture,
			canUndo: nextPast.length > 0,
			canRedo: true,
			bytes
		});
		return cloneSnapshot(restored);
	},
	redo: () => {
		const { past, present, future } = get();
		if (future.length === 0 || !present) return null;
		const patch = future[0];
		const restored = applyPatch(present, patch, 1);
		const nextFuture = future.slice(1);
		const { past: trimmedPast, bytes } = trim([...past, patch], nextFuture);
		set({
			past: trimmedPast,
			present: restored,
			future: nextFuture,
			canUndo: trimmedPast.length > 0,
			canRedo: nextFuture.length > 0,
			bytes
		});
		return cloneSnapshot(restored);
	},
	replacePresent: (snapshot) => {
		set({ present: cloneSnapshot(snapshot) });
	},
	init: (snapshot) => {
		set({
			past: [],
			present: cloneSnapshot(snapshot),
			future: [],
			canUndo: false,
			canRedo: false,
			bytes: 0
		});
	},
	clear: () => {
		set({
			past: [],
			present: null,
			future: [],
			canUndo: false,
			canRedo: false,
			bytes: 0
		});
	}
}));
//#endregion
export { useHistoryStore as n, history_store_CdXVlQO3_exports as t };
