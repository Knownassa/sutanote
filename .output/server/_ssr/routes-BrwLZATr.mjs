import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as ReactFlow, c as applyEdgeChanges, g as useReactFlow, i as Position, l as applyNodeChanges, n as Handle$1, o as ReactFlowProvider, s as addEdge, t as Background$1, y as useViewport } from "../_libs/@reactflow/background+[...].mjs";
import { t as db } from "./database-zWc1BJtE.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { n as useHistoryStore } from "./history-store-CdXVlQO3.mjs";
import { n as loadEdgesByBoard } from "./edge-repository-BnTtDDTa.mjs";
import { n as loadNodesByBoard, t as getNodeDef } from "./node-repository-DCKHgWpL.mjs";
import { t as flushBoard } from "./persistence-manager-DKgXDaA_.mjs";
import { t as nanoid } from "../_libs/nanoid.mjs";
import { t as MiniMap$1 } from "../_libs/reactflow__minimap+zustand.mjs";
import { t as ResizeControl$1 } from "../_libs/reactflow__node-resizer.mjs";
import { r as AnimatePresence, t as useReducedMotion } from "../_libs/framer-motion+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { $ as Heart, A as Play, At as BringToFront, B as MapPin, C as Search, Ct as CircleAlert, D as Redo2, Dt as Check, E as RefreshCw, Et as ChevronDown, F as Palette, Ft as ArrowUp, G as Link2, H as LockOpen, I as Music, It as ArrowRight, J as Lasso, K as Lightbulb, L as MousePointer2, Lt as ArrowLeft, M as Pen, Mt as BookOpen, N as PenTool, Nt as AudioLines, O as Presentation, Ot as Camera, P as Pause, Pt as AudioWaveform, Q as Highlighter, R as Minus, Rt as ArrowDown, S as SendToBack, St as CircleCheck, T as Replace, Tt as ChevronLeft, U as LoaderCircle, V as Lock, W as Link, X as Info, Y as Kanban, Z as Image, _ as StickyNote, _t as Download, a as Vote, at as FolderOpen, b as SquareCheckBig, bt as Code, c as Upload, ct as FileSpreadsheet, d as Type, dt as FileCodeCorner, et as Hand, f as TriangleAlert, ft as Eye, g as Table2, gt as Ellipsis, h as Table, ht as Eraser, i as X, it as Folder, j as Pipette, jt as Bookmark, k as Plus, kt as Briefcase, l as Ungroup, lt as FileImage, m as Timer, mt as ExternalLink, n as ZoomIn, nt as Globe, o as Video, ot as File, p as Trash2, pt as EyeOff, q as LayoutDashboard, r as Zap, rt as GitBranch, s as Users, st as FileText, t as ZoomOut, tt as Group, u as Undo2, ut as FileCode, v as Star, vt as Copy, w as Rocket, wt as ChevronRight, x as Settings, xt as CircleX, y as Square, yt as Columns2, z as MessageCircle, zt as Archive } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { i as Trigger, n as Portal, r as Root2, t as Content2 } from "../_libs/@radix-ui/react-popover+[...].mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
import { a as Viewport, i as ScrollAreaThumb, n as Root$1, r as ScrollAreaScrollbar, t as Corner } from "../_libs/radix-ui__react-scroll-area.mjs";
import { t as _e } from "../_libs/cmdk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BrwLZATr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DB_NAME = "sutonote-assets";
var STORE = "blobs";
var idbReady = (() => {
	if (typeof indexedDB === "undefined") return Promise.resolve(null);
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, 1);
		req.onupgradeneeded = () => {
			const d = req.result;
			if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE);
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
})();
async function idbPut(id, blob) {
	const d = await idbReady;
	if (!d) return;
	await new Promise((resolve, reject) => {
		const tx = d.transaction(STORE, "readwrite");
		tx.objectStore(STORE).put(blob, id);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}
async function idbGet(id) {
	const d = await idbReady;
	if (!d) return null;
	return new Promise((resolve, reject) => {
		const req = d.transaction(STORE, "readonly").objectStore(STORE).get(id);
		req.onsuccess = () => resolve(req.result ?? null);
		req.onerror = () => reject(req.error);
	});
}
var urlCache = /* @__PURE__ */ new Map();
/** Persist a file locally and return a stable asset id. Generic for all file types. */
async function storeAsset(file, name) {
	return storeImageAsset(file, name);
}
/** Persist an image file locally and return a stable asset id. @deprecated use storeAsset */
async function storeImageAsset(file, name) {
	const assetId = nanoid();
	await idbPut(assetId, file);
	await db.query(`INSERT INTO canvas_assets (id, name, mime, size) VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, mime = EXCLUDED.mime, size = EXCLUDED.size`, [
		assetId,
		name ?? "image",
		file.type || "image/png",
		file.size ?? 0
	]);
	return assetId;
}
/** Replace the binary + metadata of an existing asset (keeps the same id). */
async function replaceImageAsset(assetId, file, name) {
	await idbPut(assetId, file);
	await db.query(`UPDATE canvas_assets SET name = $2, mime = $3, size = $4 WHERE id = $1`, [
		assetId,
		name ?? "image",
		file.type || "image/png",
		file.size ?? 0
	]);
	const old = urlCache.get(assetId);
	if (old) {
		URL.revokeObjectURL(old);
		urlCache.delete(assetId);
	}
}
/** Resolve an asset id to a usable object URL (cached for the session). */
async function getAssetUrl(assetId) {
	const cached = urlCache.get(assetId);
	if (cached) return cached;
	const blob = await idbGet(assetId);
	if (!blob) return null;
	const url = URL.createObjectURL(blob);
	urlCache.set(assetId, url);
	return url;
}
/** Generic binary blob storage (used by VaultStorage). Key is an arbitrary path/id. */
async function storeAssetBlob(key, data) {
	await idbPut(key, new Blob([data.buffer]));
}
/** Generic binary blob retrieval (used by VaultStorage). Returns null if not found. */
async function getAssetBlob(key) {
	const blob = await idbGet(key);
	if (!blob) return null;
	return new Uint8Array(await blob.arrayBuffer());
}
var nextId = 0;
var timer;
var useNoticeStore = create((set) => ({
	notice: null,
	show: (message, kind = "info") => {
		if (timer) clearTimeout(timer);
		const id = ++nextId;
		set({ notice: {
			id,
			message,
			kind
		} });
		timer = setTimeout(() => {
			set((s) => s.notice?.id === id ? { notice: null } : {});
		}, 2800);
	},
	dismiss: () => {
		if (timer) clearTimeout(timer);
		set({ notice: null });
	}
}));
var DEFAULT_BOARD_ID = "00000000-0000-0000-0000-000000000001";
/**
* SAFE LEGACY SCHEMA BOOTSTRAP
*
* Runs BEFORE versioned migrations. Detects whether old tables exist and
* adds any missing columns so that later migrations and indexes don't fail.
*
* This is idempotent — safe on both fresh and legacy databases.
*/
async function bootstrapLegacySchema() {
	await db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
	if ((await db.query(`SELECT relname FROM pg_class WHERE relname = 'canvas_nodes' AND relkind = 'r'`)).rows.length > 0) {
		await db.exec(`
      ALTER TABLE canvas_nodes ADD COLUMN IF NOT EXISTS board_id TEXT NOT NULL DEFAULT '${DEFAULT_BOARD_ID}';
      ALTER TABLE canvas_nodes ADD COLUMN IF NOT EXISTS z_index INT NOT NULL DEFAULT 0;
      ALTER TABLE canvas_nodes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
      ALTER TABLE canvas_nodes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
      ALTER TABLE canvas_nodes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
    `);
		await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_canvas_nodes_board ON canvas_nodes(board_id);
    `);
	} else await db.exec(`
      CREATE TABLE canvas_nodes (
        id TEXT PRIMARY KEY,
        board_id TEXT NOT NULL DEFAULT '${DEFAULT_BOARD_ID}',
        type TEXT,
        position_x FLOAT,
        position_y FLOAT,
        width DOUBLE PRECISION,
        height DOUBLE PRECISION,
        z_index INT NOT NULL DEFAULT 0,
        data JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_canvas_nodes_board ON canvas_nodes(board_id);
    `);
	if ((await db.query(`SELECT relname FROM pg_class WHERE relname = 'canvas_edges' AND relkind = 'r'`)).rows.length > 0) await db.exec(`
      ALTER TABLE canvas_edges ADD COLUMN IF NOT EXISTS board_id TEXT NOT NULL DEFAULT '${DEFAULT_BOARD_ID}';
      ALTER TABLE canvas_edges ADD COLUMN IF NOT EXISTS source_handle TEXT;
      ALTER TABLE canvas_edges ADD COLUMN IF NOT EXISTS target_handle TEXT;
      ALTER TABLE canvas_edges ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
      ALTER TABLE canvas_edges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
      CREATE INDEX IF NOT EXISTS idx_canvas_edges_board ON canvas_edges(board_id);
    `);
	else await db.exec(`
      CREATE TABLE canvas_edges (
        id TEXT PRIMARY KEY,
        board_id TEXT NOT NULL DEFAULT '${DEFAULT_BOARD_ID}',
        source_id TEXT NOT NULL,
        target_id TEXT NOT NULL,
        source_handle TEXT,
        target_handle TEXT,
        type TEXT,
        data JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_canvas_edges_board ON canvas_edges(board_id);
    `);
}
var migrations = [
	{
		version: 1,
		name: "001_initial",
		up: async () => {}
	},
	{
		version: 2,
		name: "002_alter_nodes_add_board_and_z",
		up: async () => {}
	},
	{
		version: 3,
		name: "003_asset_metadata",
		up: async () => {
			await db.exec(`
        CREATE TABLE IF NOT EXISTS canvas_assets (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          mime TEXT NOT NULL,
          size BIGINT NOT NULL DEFAULT 0,
          width DOUBLE PRECISION,
          height DOUBLE PRECISION,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
		}
	},
	{
		version: 4,
		name: "004_normalize_legacy_board_ids",
		up: async () => {
			const legacyIds = [
				"",
				"default-board",
				"default_board",
				"default"
			];
			const placeholders = legacyIds.map((_, i) => `$${i + 1}`).join(",");
			await db.query(`UPDATE canvas_nodes SET board_id = $${legacyIds.length + 1}
         WHERE board_id IS NULL OR board_id IN (${placeholders})`, [...legacyIds, DEFAULT_BOARD_ID]);
			await db.query(`UPDATE canvas_edges SET board_id = $${legacyIds.length + 1}
         WHERE board_id IS NULL OR board_id IN (${placeholders})`, [...legacyIds, DEFAULT_BOARD_ID]);
		}
	},
	{
		version: 5,
		name: "005_numeric_width_height",
		up: async () => {
			if ((await db.query(`SELECT relname FROM pg_class WHERE relname = 'canvas_nodes' AND relkind = 'r'`)).rows.length > 0) {
				const currentType = (await db.query(`SELECT data_type FROM information_schema.columns
           WHERE table_name = 'canvas_nodes' AND column_name = 'width'`)).rows[0]?.data_type;
				if (currentType && currentType !== "double precision") await db.exec(`
            ALTER TABLE canvas_nodes ALTER COLUMN width TYPE DOUBLE PRECISION USING width::DOUBLE PRECISION;
            ALTER TABLE canvas_nodes ALTER COLUMN height TYPE DOUBLE PRECISION USING height::DOUBLE PRECISION;
          `);
			}
		}
	},
	{
		version: 6,
		name: "006_vault_kv",
		up: async () => {
			await db.exec(`
        CREATE TABLE IF NOT EXISTS vault_kv (
          path TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
		}
	}
];
async function runMigrations() {
	await bootstrapLegacySchema();
	const res = await db.query(`SELECT version FROM schema_migrations ORDER BY version`);
	const applied = new Set(res.rows.map((r) => r.version));
	for (const m of migrations) {
		if (applied.has(m.version)) continue;
		await m.up();
		await db.query(`INSERT INTO schema_migrations (version, name) VALUES ($1, $2)`, [m.version, m.name]);
	}
}
async function initDB() {
	await runMigrations();
	console.log("Sutonote local database initialized.");
}
var useSettingsStore = create()(persist((set) => ({
	theme: "system",
	gridVisible: true,
	snapToGrid: true,
	leftSidebarOpen: true,
	displayName: "Local user",
	avatarAssetId: "",
	vaultName: "My vault",
	setTheme: (theme) => set({ theme }),
	setGridVisible: (gridVisible) => set({ gridVisible }),
	setSnapToGrid: (snapToGrid) => set({ snapToGrid }),
	setLeftSidebarOpen: (leftSidebarOpen) => set({ leftSidebarOpen }),
	toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
	setDisplayName: (displayName) => set({ displayName }),
	setAvatarAssetId: (avatarAssetId) => set({ avatarAssetId }),
	setVaultName: (vaultName) => set({ vaultName })
}), { name: "sutonote:settings" }));
var uid = () => Math.random().toString(36).slice(2, 10);
var initialGroups = [
	{
		id: "g-studio",
		name: "Studio Rebrand",
		boards: [
			{
				id: "b-moodboard",
				name: "Moodboard"
			},
			{
				id: "b-typography",
				name: "Typography"
			},
			{
				id: "b-logo",
				name: "Logo drafts"
			}
		]
	},
	{
		id: "g-research",
		name: "Research",
		boards: [{
			id: "b-interviews",
			name: "Interviews"
		}, {
			id: "b-competitors",
			name: "Competitors"
		}]
	},
	{
		id: "g-personal",
		name: "Personal",
		boards: [{
			id: "b-reading",
			name: "Reading list"
		}]
	}
];
var useBoardTreeStore = create()(persist((set) => ({
	groups: initialGroups,
	activeBoardId: "b-moodboard",
	setActiveBoard: (activeBoardId) => set({ activeBoardId }),
	addBoard: (groupId, name) => {
		const id = `b-${uid()}`;
		set((s) => ({
			groups: s.groups.map((g) => g.id === groupId ? {
				...g,
				boards: [...g.boards, {
					id,
					name: name?.trim() || `Untitled board ${g.boards.length + 1}`
				}]
			} : g),
			activeBoardId: id
		}));
		return id;
	},
	renameBoard: (id, name) => set((s) => ({ groups: s.groups.map((g) => ({
		...g,
		boards: g.boards.map((b) => b.id === id ? {
			...b,
			name: name.trim() || b.name
		} : b)
	})) })),
	deleteBoard: (id) => set((s) => ({ groups: s.groups.map((g) => ({
		...g,
		boards: g.boards.filter((b) => b.id !== id)
	})) })),
	addGroup: (name) => {
		const id = `g-${uid()}`;
		set((s) => ({ groups: [...s.groups, {
			id,
			name: name?.trim() || "New folder",
			boards: []
		}] }));
		return id;
	}
}), { name: "sutonote:board-tree" }));
function createDefaultTable() {
	return {
		columns: [
			{
				id: nanoid(6),
				label: "Name",
				kind: "text",
				width: 140
			},
			{
				id: nanoid(6),
				label: "Status",
				kind: "text",
				width: 140
			},
			{
				id: nanoid(6),
				label: "Done",
				kind: "checkbox",
				width: 100
			}
		],
		rows: [{
			id: nanoid(6),
			cells: [
				"",
				"In progress",
				"false"
			]
		}, {
			id: nanoid(6),
			cells: [
				"",
				"Not started",
				"false"
			]
		}]
	};
}
function updateTableCell(table, rowIndex, columnIndex, value) {
	return {
		...table,
		rows: table.rows.map((row, index) => {
			if (index !== rowIndex) return row;
			const cells = [...row.cells];
			cells[columnIndex] = value;
			return {
				...row,
				cells
			};
		})
	};
}
function reorderTableRows(table, rowIndex, direction) {
	const target = rowIndex + direction;
	if (target < 0 || target >= table.rows.length) return table;
	const rows = [...table.rows];
	[rows[rowIndex], rows[target]] = [rows[target], rows[rowIndex]];
	return {
		...table,
		rows
	};
}
function reorderTableColumns(table, columnIndex, direction) {
	const target = columnIndex + direction;
	if (target < 0 || target >= table.columns.length) return table;
	const columns = [...table.columns];
	[columns[columnIndex], columns[target]] = [columns[target], columns[columnIndex]];
	return {
		columns,
		rows: table.rows.map((row) => {
			const cells = [...row.cells];
			[cells[columnIndex], cells[target]] = [cells[target] ?? "", cells[columnIndex] ?? ""];
			return {
				...row,
				cells
			};
		})
	};
}
var defaultColors = {
	text: "bg-card",
	sticky: "bg-note-yellow",
	todo: "bg-card",
	image: "bg-card",
	link: "bg-card",
	file: "bg-card",
	comment: "bg-card"
};
var SAVE_DELAY = 500;
var queueSize = () => dirtyNodes.size + dirtyEdges.size + deletedNodeIds.size + deletedEdgeIds.size;
var GRID_SIZE = 16;
var snapValue = (v) => Math.round(v / GRID_SIZE) * GRID_SIZE;
/** Types that always stay behind regular items (backdrops / containers). */
var CONTAINER_TYPES = [
	"section",
	"frame",
	"column"
];
/**
* Stacking rule: the most recently edited item sits on top of the stack.
* Containers keep their z-order so they never cover their own children.
*/
function withTopZ(nodes, id) {
	const target = nodes.find((n) => n.id === id);
	if (!target || CONTAINER_TYPES.includes(target.type ?? "")) return nodes;
	const maxZ = nodes.reduce((m, n) => Math.max(m, n.zIndex ?? 0), 0);
	if ((target.zIndex ?? 0) >= maxZ) return nodes;
	return nodes.map((n) => n.id === id ? {
		...n,
		zIndex: maxZ + 1
	} : n);
}
var dirtyNodes = /* @__PURE__ */ new Map();
var deletedNodeIds = /* @__PURE__ */ new Set();
var dirtyEdges = /* @__PURE__ */ new Map();
var deletedEdgeIds = /* @__PURE__ */ new Set();
var clipboard = [];
var dragStartSnapshot = null;
function storageBoardId(boardId) {
	return boardId === "b-moodboard" ? DEFAULT_BOARD_ID : boardId;
}
var flushTimer;
var flushing = false;
function syncSelected(ids) {
	return { selectedNodeIds: ids };
}
function computeSelectedIds(nodes) {
	return nodes.filter((n) => n.selected).map((n) => n.id);
}
var useCanvasStore = create((set, get) => {
	/**
	* Diff history bridge: call this immediately BEFORE (or right after) a
	* mutation. It records the baseline, then on the next microtask — once the
	* mutation has landed — replaces `present` with the baseline and pushes the
	* live state, so the stored patch is baseline -> result.
	*/
	let pendingBaseline = null;
	const flushPendingHistory = () => {
		if (!pendingBaseline) return;
		const baseline = pendingBaseline;
		pendingBaseline = null;
		const history = useHistoryStore.getState();
		history.replacePresent(baseline);
		history.push({
			nodes: get().nodes,
			edges: get().edges
		});
	};
	const pushHistoryAfterChange = (baseline) => {
		if (pendingBaseline) flushPendingHistory();
		pendingBaseline = baseline ?? {
			nodes: get().nodes,
			edges: get().edges
		};
		queueMicrotask(flushPendingHistory);
	};
	const markNodeDirty = (node) => {
		deletedNodeIds.delete(node.id);
		dirtyNodes.set(node.id, node);
	};
	const markNodeDeleted = (id) => {
		dirtyNodes.delete(id);
		deletedNodeIds.add(id);
		const edges = get().edges;
		for (const e of edges) if (e.source === id || e.target === id) {
			dirtyEdges.delete(e.id);
			deletedEdgeIds.add(e.id);
		}
	};
	const markEdgeDirty = (edge) => {
		deletedEdgeIds.delete(edge.id);
		dirtyEdges.set(edge.id, edge);
	};
	const markEdgeDeleted = (id) => {
		dirtyEdges.delete(id);
		deletedEdgeIds.add(id);
	};
	const scheduleFlush = () => {
		set({
			persistenceStatus: "dirty",
			pendingChanges: queueSize()
		});
		if (flushTimer) return;
		flushTimer = setTimeout(async () => {
			flushTimer = void 0;
			await get().flushNow();
		}, SAVE_DELAY);
	};
	const commitNodes = (next) => {
		set({
			nodes: next,
			...syncSelected(computeSelectedIds(next))
		});
	};
	const applyToSelected = (fn) => {
		const next = get().nodes.map((n) => n.selected ? fn(n) : n);
		commitNodes(next);
		next.filter((n) => n.selected).forEach((n) => {
			markNodeDirty(n);
			scheduleFlush();
		});
	};
	return {
		nodes: [],
		edges: [],
		selectedNodeIds: [],
		isLoaded: false,
		persistenceStatus: "clean",
		lastSavedAt: null,
		lastSaveError: null,
		pendingChanges: 0,
		currentBoardId: useBoardTreeStore.getState().activeBoardId,
		flushNow: async () => {
			if (flushing) return;
			const dn = new Map(dirtyNodes);
			const dd = new Set(deletedNodeIds);
			const de = new Map(dirtyEdges);
			const dde = new Set(deletedEdgeIds);
			if (dn.size === 0 && dd.size === 0 && de.size === 0 && dde.size === 0) {
				set({
					persistenceStatus: "clean",
					pendingChanges: 0
				});
				return;
			}
			flushing = true;
			set({ persistenceStatus: "saving" });
			try {
				await flushBoard(storageBoardId(get().currentBoardId), dn, dd, de, dde);
				for (const [id, snap] of dn) if (dirtyNodes.get(id) === snap) dirtyNodes.delete(id);
				for (const id of dd) if (deletedNodeIds.has(id) && !dirtyNodes.has(id)) deletedNodeIds.delete(id);
				for (const [id, snap] of de) if (dirtyEdges.get(id) === snap) dirtyEdges.delete(id);
				for (const id of dde) if (deletedEdgeIds.has(id) && !dirtyEdges.has(id)) deletedEdgeIds.delete(id);
				set({
					persistenceStatus: queueSize() > 0 ? "dirty" : "saved",
					lastSavedAt: Date.now(),
					lastSaveError: null,
					pendingChanges: queueSize()
				});
			} catch (err) {
				set({
					persistenceStatus: "error",
					lastSaveError: err instanceof Error ? err.message : String(err),
					pendingChanges: queueSize()
				});
			} finally {
				flushing = false;
				if (queueSize() > 0) scheduleFlush();
			}
		},
		initializeStore: async () => {
			if (get().isLoaded) return;
			await initDB();
			const boardId = useBoardTreeStore.getState().activeBoardId;
			const dbBoardId = storageBoardId(boardId);
			const dbNodes = await loadNodesByBoard(dbBoardId);
			const dbEdges = await loadEdgesByBoard(dbBoardId);
			if (dbNodes.length > 0) {
				set({
					nodes: dbNodes,
					edges: dbEdges,
					selectedNodeIds: [],
					isLoaded: true,
					persistenceStatus: "saved",
					lastSavedAt: Date.now(),
					pendingChanges: 0,
					currentBoardId: boardId
				});
				useHistoryStore.getState().init({
					nodes: dbNodes,
					edges: dbEdges
				});
				return;
			}
			if (((await db.query(`SELECT COUNT(*)::int AS cnt FROM canvas_nodes WHERE deleted_at IS NULL`)).rows[0]?.cnt ?? 0) > 0) {
				set({
					nodes: [],
					edges: dbEdges,
					selectedNodeIds: [],
					isLoaded: true,
					persistenceStatus: "saved",
					lastSavedAt: Date.now(),
					pendingChanges: 0,
					currentBoardId: boardId
				});
				return;
			}
			const seeded = [
				{
					id: nanoid(),
					type: "sticky",
					position: {
						x: -120,
						y: -80
					},
					zIndex: 1,
					data: {
						text: "Welcome to Sutonote. This canvas is yours — infinite, private, and local.",
						color: "bg-note-yellow",
						rotation: -.8
					},
					style: {
						width: getNodeDef("sticky").defaultWidth,
						minHeight: getNodeDef("sticky").defaultHeight
					}
				},
				{
					id: nanoid(),
					type: "text",
					position: {
						x: 160,
						y: -60
					},
					zIndex: 2,
					data: {
						title: "",
						text: "Click a tool below to begin — or drag to explore the canvas.",
						color: "bg-card",
						rotation: 0
					},
					style: {
						width: getNodeDef("text").defaultWidth,
						minHeight: getNodeDef("text").defaultHeight
					}
				},
				{
					id: nanoid(),
					type: "todo",
					position: {
						x: -40,
						y: 120
					},
					zIndex: 3,
					data: {
						text: "",
						color: "bg-card",
						rotation: 0,
						todos: [
							{
								label: "Try dragging this card around",
								done: false
							},
							{
								label: "Click the canvas to deselect",
								done: false
							},
							{
								label: "Press Delete to remove a card",
								done: false
							}
						]
					},
					style: {
						width: getNodeDef("todo").defaultWidth,
						minHeight: getNodeDef("todo").defaultHeight
					}
				}
			];
			set({
				nodes: seeded,
				edges: dbEdges,
				selectedNodeIds: [],
				isLoaded: true,
				persistenceStatus: "dirty",
				pendingChanges: seeded.length,
				currentBoardId: boardId
			});
			seeded.forEach(markNodeDirty);
			scheduleFlush();
		},
		switchBoard: async (boardId) => {
			if (!boardId || boardId === get().currentBoardId) return;
			if (!get().isLoaded) {
				useBoardTreeStore.getState().setActiveBoard(boardId);
				return;
			}
			await get().flushNow();
			await initDB();
			const dbBoardId = storageBoardId(boardId);
			const [dbNodes, dbEdges] = await Promise.all([loadNodesByBoard(dbBoardId), loadEdgesByBoard(dbBoardId)]);
			dirtyNodes.clear();
			deletedNodeIds.clear();
			dirtyEdges.clear();
			deletedEdgeIds.clear();
			dragStartSnapshot = null;
			if (flushTimer) {
				clearTimeout(flushTimer);
				flushTimer = void 0;
			}
			const nextNodes = dbNodes;
			const nextEdges = dbEdges;
			set({
				nodes: nextNodes,
				edges: nextEdges,
				selectedNodeIds: [],
				currentBoardId: boardId,
				persistenceStatus: "saved",
				lastSavedAt: Date.now(),
				lastSaveError: null,
				pendingChanges: 0
			});
			useHistoryStore.getState().init({
				nodes: nextNodes,
				edges: nextEdges
			});
			useBoardTreeStore.getState().setActiveBoard(boardId);
		},
		onNodesChange: (changes) => {
			const prev = get().nodes;
			let next = applyNodeChanges(changes, prev);
			let touched = false;
			for (const c of changes) if (c.type === "position") {
				if (c.dragging && !dragStartSnapshot) dragStartSnapshot = {
					nodes: get().nodes,
					edges: get().edges
				};
				const node = next.find((n) => n.id === c.id);
				if (node) {
					const gid = node.data.groupId;
					if (gid && c.dragging) {
						const oldNode = prev.find((n) => n.id === c.id);
						if (oldNode && c.position) {
							const dx = c.position.x - oldNode.position.x;
							const dy = c.position.y - oldNode.position.y;
							if (dx !== 0 || dy !== 0) next = next.map((n) => n.id !== c.id && n.data.groupId === gid ? {
								...n,
								position: {
									x: n.position.x + dx,
									y: n.position.y + dy
								}
							} : n);
						}
					}
					if ([
						"section",
						"frame",
						"column"
					].includes(node.type ?? "") && c.dragging) {
						const oldNode = prev.find((n) => n.id === c.id);
						if (oldNode && c.position) {
							const dx = c.position.x - oldNode.position.x;
							const dy = c.position.y - oldNode.position.y;
							if (dx !== 0 || dy !== 0) {
								next = next.map((n) => n.data.parentId === c.id ? {
									...n,
									position: {
										x: n.position.x + dx,
										y: n.position.y + dy
									}
								} : n);
								for (const n of next) if (n.data.parentId === c.id) markNodeDirty(n);
							}
						}
					}
					if (c.dragging === false) {
						if (useSettingsStore.getState().snapToGrid) {
							const snappedX = snapValue(node.position.x);
							const snappedY = snapValue(node.position.y);
							const dx = snappedX - node.position.x;
							const dy = snappedY - node.position.y;
							if (dx !== 0 || dy !== 0) {
								next = next.map((n) => n.id === c.id ? {
									...n,
									position: {
										x: snappedX,
										y: snappedY
									}
								} : n);
								next = next.map((n) => n.id !== c.id && n.selected ? {
									...n,
									position: {
										x: n.position.x + dx,
										y: n.position.y + dy
									}
								} : n);
								next = next.map((n) => n.data.parentId === c.id ? {
									...n,
									position: {
										x: n.position.x + dx,
										y: n.position.y + dy
									}
								} : n);
							}
						}
						next = withTopZ(next, c.id);
						const finalNode = next.find((n) => n.id === c.id);
						if (finalNode) {
							markNodeDirty(finalNode);
							for (const n of next) if (n.id !== c.id && n.selected) markNodeDirty(n);
							for (const n of next) if (n.data.parentId === c.id) markNodeDirty(n);
							if (![
								"section",
								"frame",
								"column"
							].includes(finalNode.type ?? "")) {
								const containers = next.filter((n) => [
									"section",
									"frame",
									"column"
								].includes(n.type ?? "") && n.id !== finalNode.id);
								let newParent;
								for (const cont of containers) {
									const cw = cont.style?.width ?? 560;
									const ch = cont.style?.minHeight ?? 360;
									const cx = cont.position.x;
									const cy = cont.position.y;
									const left = cx - cw / 2;
									const right = cx + cw / 2;
									const top = cy - ch / 2;
									const bottom = cy + ch / 2;
									if (finalNode.position.x >= left && finalNode.position.x <= right && finalNode.position.y >= top && finalNode.position.y <= bottom) {
										newParent = cont.id;
										break;
									}
								}
								const curParent = finalNode.data.parentId;
								if (newParent !== curParent) {
									next = next.map((n) => n.id === finalNode.id ? {
										...n,
										data: {
											...n.data,
											parentId: newParent
										}
									} : n);
									if (curParent) next = next.map((n) => n.id === curParent ? {
										...n,
										data: {
											...n.data,
											childOrder: (n.data.childOrder ?? []).filter((childId) => childId !== finalNode.id)
										}
									} : n);
									if (newParent) next = next.map((n) => {
										if (n.id !== newParent) return n;
										const childOrder = n.data.childOrder ?? [];
										return {
											...n,
											data: {
												...n.data,
												childOrder: [...childOrder.filter((childId) => childId !== finalNode.id), finalNode.id]
											}
										};
									});
									const updated = next.find((n) => n.id === finalNode.id);
									if (updated) markNodeDirty(updated);
									for (const containerId of [curParent, newParent]) {
										if (!containerId) continue;
										const container = next.find((n) => n.id === containerId);
										if (container) markNodeDirty(container);
									}
								}
							}
							touched = true;
						}
						if (dragStartSnapshot) {
							pushHistoryAfterChange(dragStartSnapshot);
							dragStartSnapshot = null;
						}
					}
				}
			} else if (c.type === "dimensions") {
				const node = next.find((n) => n.id === c.id);
				if (node && c.dimensions) {
					next = next.map((n) => n.id === c.id ? {
						...n,
						style: {
							...n.style,
							width: c.dimensions.width ?? n.style?.width,
							minHeight: c.dimensions.height ?? n.style?.minHeight
						}
					} : n);
					markNodeDirty(node);
					touched = true;
				}
			} else if (c.type === "remove") {
				markNodeDeleted(c.id);
				touched = true;
			}
			commitNodes(next);
			if (touched) scheduleFlush();
		},
		onEdgesChange: (changes) => {
			set({ edges: applyEdgeChanges(changes, get().edges) });
			let touched = false;
			for (const c of changes) if (c.type === "remove") {
				markEdgeDeleted(c.id);
				touched = true;
			} else if (c.type === "add") {
				markEdgeDirty(c.item);
				touched = true;
			}
			if (touched) scheduleFlush();
		},
		onConnect: (connection) => {
			const newEdges = addEdge(connection, get().edges);
			set({ edges: newEdges });
			const edge = newEdges.find((e) => e.source === connection.source && e.target === connection.target && (e.sourceHandle ?? null) === (connection.sourceHandle ?? null) && (e.targetHandle ?? null) === (connection.targetHandle ?? null));
			if (edge) {
				markEdgeDirty(edge);
				scheduleFlush();
			}
		},
		addNode: (type, position) => {
			const maxZ = get().nodes.reduce((m, n) => Math.max(m, n.zIndex ?? 0), 0);
			const def = getNodeDef(type);
			const pos = useSettingsStore.getState().snapToGrid ? {
				x: snapValue(position.x),
				y: snapValue(position.y)
			} : position;
			const zIndex = CONTAINER_TYPES.includes(type) ? 0 : maxZ + 1;
			const newNode = {
				id: nanoid(),
				type,
				position: pos,
				zIndex,
				selected: true,
				data: {
					text: "",
					title: type === "text" ? "" : type === "todo" ? "To-do" : type === "link" ? "" : "",
					color: defaultColors[type] ?? "bg-note-yellow",
					rotation: type === "sticky" ? Number((Math.random() * 2 - 1).toFixed(2)) : 0,
					...type === "todo" ? { todos: [
						{
							label: "Task 1",
							done: false
						},
						{
							label: "Task 2",
							done: false
						},
						{
							label: "Task 3",
							done: false
						}
					] } : {},
					...type === "image" ? {
						src: "",
						caption: "",
						assetId: ""
					} : {},
					...type === "link" ? {
						url: "",
						description: ""
					} : {},
					...type === "file" ? {
						filename: "",
						assetId: "",
						mime: ""
					} : {},
					...type === "comment" ? {
						author: useSettingsStore.getState().displayName,
						resolved: false
					} : {},
					...type === "section" ? {
						title: "Section",
						opacity: 100,
						showTitle: true,
						borderOpacity: 70
					} : {},
					...type === "frame" ? {
						title: "",
						showTitle: true,
						opacity: 100
					} : {},
					...type === "column" ? {
						title: "Column",
						collapsed: false,
						childOrder: [],
						gap: 10,
						padding: 12,
						autoHeight: false
					} : {},
					...type === "shape" ? {
						shape: "rectangle",
						fill: "transparent",
						stroke: "currentColor",
						strokeWidth: 2,
						cornerRadius: 12
					} : {},
					...type === "color_swatch" ? {
						color: "#6366f1",
						label: ""
					} : {},
					...type === "board" ? {
						title: "Board",
						itemCount: 0
					} : {},
					...type === "folder" ? {
						title: "Folder",
						icon: "folder",
						iconColor: "",
						itemCount: 0
					} : {},
					...type === "code" ? {
						code: "",
						language: "plaintext",
						showLineNumbers: true,
						wrap: false
					} : {},
					...type === "pdf" || type === "video" ? {
						filename: "",
						assetId: "",
						remoteUrl: "",
						sourceType: "local"
					} : {},
					...type === "embed" ? { remoteUrl: "" } : {},
					...type === "audio" ? {
						filename: "",
						assetId: "",
						remoteUrl: "",
						sourceType: "local"
					} : {},
					...type === "table" ? {
						title: "Table",
						table: createDefaultTable()
					} : {},
					...type === "drawing" ? {
						points: [],
						strokeColor: "#ef4444",
						strokeWidth: 3
					} : {}
				},
				style: {
					width: def.defaultWidth,
					minHeight: def.defaultHeight
				}
			};
			const next = [...get().nodes.map((n) => ({
				...n,
				selected: false
			})), newNode];
			commitNodes(next);
			markNodeDirty(newNode);
			scheduleFlush();
			pushHistoryAfterChange({
				nodes: get().nodes.filter((n) => n.id !== newNode.id),
				edges: get().edges
			});
		},
		updateNodeData: (id, data) => {
			const next = withTopZ(get().nodes.map((n) => n.id === id ? {
				...n,
				data: {
					...n.data,
					...data
				}
			} : n), id);
			commitNodes(next);
			const node = next.find((n) => n.id === id);
			if (node) {
				markNodeDirty(node);
				scheduleFlush();
			}
		},
		updateNodeDataWithHistory: (id, data) => {
			pushHistoryAfterChange();
			const next = withTopZ(get().nodes.map((n) => n.id === id ? {
				...n,
				data: {
					...n.data,
					...data
				}
			} : n), id);
			commitNodes(next);
			const node = next.find((n) => n.id === id);
			if (node) {
				markNodeDirty(node);
				scheduleFlush();
			}
		},
		updateNodeSize: (id, width, height) => {
			const next = withTopZ(get().nodes.map((n) => n.id === id ? {
				...n,
				style: {
					...n.style,
					width,
					minHeight: height
				}
			} : n), id);
			commitNodes(next);
			const node = next.find((n) => n.id === id);
			if (node) {
				markNodeDirty(node);
				scheduleFlush();
			}
		},
		updateNodePosition: (id, x, y) => {
			const next = withTopZ(get().nodes.map((n) => n.id === id ? {
				...n,
				position: {
					x,
					y
				}
			} : n), id);
			commitNodes(next);
			const node = next.find((n) => n.id === id);
			if (node) {
				markNodeDirty(node);
				scheduleFlush();
			}
		},
		deleteNode: (id) => {
			pushHistoryAfterChange();
			const next = get().nodes.filter((n) => n.id !== id).map((n) => Array.isArray(n.data.childOrder) ? {
				...n,
				data: {
					...n.data,
					childOrder: n.data.childOrder.filter((childId) => childId !== id)
				}
			} : n);
			commitNodes(next);
			markNodeDeleted(id);
			scheduleFlush();
		},
		setSelectedIds: (ids) => {
			const next = get().nodes.map((n) => ({
				...n,
				selected: ids.includes(n.id)
			}));
			commitNodes(next);
		},
		selectAll: () => {
			const next = get().nodes.map((n) => ({
				...n,
				selected: true
			}));
			commitNodes(next);
		},
		clearSelection: () => {
			const next = get().nodes.map((n) => n.selected ? {
				...n,
				selected: false
			} : n);
			commitNodes(next);
		},
		deleteSelected: () => {
			const ids = new Set(get().selectedNodeIds);
			if (ids.size === 0) return;
			pushHistoryAfterChange();
			const next = get().nodes.filter((n) => !ids.has(n.id)).map((n) => Array.isArray(n.data.childOrder) ? {
				...n,
				data: {
					...n.data,
					childOrder: n.data.childOrder.filter((childId) => !ids.has(childId))
				}
			} : n);
			commitNodes(next);
			ids.forEach(markNodeDeleted);
			const remainingEdges = get().edges.filter((e) => !ids.has(e.source) && !ids.has(e.target));
			const removedEdges = get().edges.filter((e) => ids.has(e.source) || ids.has(e.target));
			set({ edges: remainingEdges });
			removedEdges.forEach((e) => markEdgeDeleted(e.id));
			scheduleFlush();
		},
		copySelected: () => {
			clipboard = get().nodes.filter((n) => n.selected).map((n) => ({
				...n,
				id: `${n.id}__copy`,
				selected: false,
				data: { ...n.data },
				style: { ...n.style }
			}));
		},
		cutSelected: () => {
			get().copySelected();
			get().deleteSelected();
		},
		duplicateSelected: () => {
			const sel = get().nodes.filter((n) => n.selected);
			if (sel.length === 0) return;
			const idMap = /* @__PURE__ */ new Map();
			const clones = sel.map((n) => {
				const newId = nanoid();
				idMap.set(n.id, newId);
				return {
					...n,
					id: newId,
					selected: true,
					position: {
						x: n.position.x + 24,
						y: n.position.y + 24
					},
					data: { ...n.data },
					style: { ...n.style }
				};
			});
			const next = [...get().nodes.map((n) => ({
				...n,
				selected: false
			})), ...clones];
			commitNodes(next);
			const selIds = new Set(sel.map((n) => n.id));
			const newEdges = get().edges.filter((e) => selIds.has(e.source) && selIds.has(e.target)).map((e) => ({
				...e,
				id: nanoid(),
				source: idMap.get(e.source),
				target: idMap.get(e.target),
				selected: false
			}));
			if (newEdges.length) set({ edges: [...get().edges, ...newEdges] });
			clones.forEach((n) => {
				markNodeDirty(n);
			});
			newEdges.forEach((e) => markEdgeDirty(e));
			scheduleFlush();
		},
		pasteAt: (position) => {
			if (clipboard.length === 0) return;
			const idMap = /* @__PURE__ */ new Map();
			const clones = clipboard.map((n) => {
				const newId = nanoid();
				idMap.set(n.id, newId);
				return {
					...n,
					id: newId,
					selected: true,
					position: {
						x: position.x + (n.position.x - clipboard[0].position.x),
						y: position.y + (n.position.y - clipboard[0].position.y)
					},
					data: { ...n.data },
					style: { ...n.style }
				};
			});
			const next = [...get().nodes.map((n) => ({
				...n,
				selected: false
			})), ...clones];
			commitNodes(next);
			const clipboardIds = new Set(clipboard.map((n) => n.id));
			const newEdges = get().edges.filter((e) => clipboardIds.has(e.source) && clipboardIds.has(e.target)).map((e) => ({
				...e,
				id: nanoid(),
				source: idMap.get(e.source),
				target: idMap.get(e.target),
				selected: false
			}));
			if (newEdges.length) set({ edges: [...get().edges, ...newEdges] });
			clones.forEach((n) => markNodeDirty(n));
			newEdges.forEach((e) => markEdgeDirty(e));
			scheduleFlush();
		},
		bringToFront: (id) => {
			pushHistoryAfterChange();
			const maxZ = get().nodes.reduce((m, n) => Math.max(m, n.zIndex ?? 0), 0);
			const next = get().nodes.map((n) => n.id === id ? {
				...n,
				zIndex: maxZ + 1
			} : n);
			commitNodes(next);
			const node = next.find((n) => n.id === id);
			if (node) {
				markNodeDirty(node);
				scheduleFlush();
			}
		},
		sendToBack: (id) => {
			pushHistoryAfterChange();
			const minZ = get().nodes.reduce((m, n) => Math.min(m, n.zIndex ?? 0), Number.POSITIVE_INFINITY);
			const base = Number.isFinite(minZ) ? minZ - 1 : -1;
			const next = get().nodes.map((n) => n.id === id ? {
				...n,
				zIndex: base
			} : n);
			commitNodes(next);
			const node = next.find((n) => n.id === id);
			if (node) {
				markNodeDirty(node);
				scheduleFlush();
			}
		},
		bringForward: (id) => {
			pushHistoryAfterChange();
			const sorted = [...get().nodes].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
			const idx = sorted.findIndex((n) => n.id === id);
			if (idx < 0 || idx === sorted.length - 1) return;
			const swap = sorted[idx + 1];
			if (!swap) return;
			const cur = sorted[idx];
			const next = get().nodes.map((n) => {
				if (n.id === id) return {
					...n,
					zIndex: swap.zIndex ?? 0
				};
				if (n.id === swap.id) return {
					...n,
					zIndex: cur.zIndex ?? 0
				};
				return n;
			});
			commitNodes(next);
			next.filter((n) => n.id === id || n.id === swap.id).forEach((n) => {
				markNodeDirty(n);
				scheduleFlush();
			});
		},
		sendBackward: (id) => {
			pushHistoryAfterChange();
			const sorted = [...get().nodes].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
			const idx = sorted.findIndex((n) => n.id === id);
			if (idx <= 0) return;
			const swap = sorted[idx - 1];
			if (!swap) return;
			const cur = sorted[idx];
			const next = get().nodes.map((n) => {
				if (n.id === id) return {
					...n,
					zIndex: swap.zIndex ?? 0
				};
				if (n.id === swap.id) return {
					...n,
					zIndex: cur.zIndex ?? 0
				};
				return n;
			});
			commitNodes(next);
			next.filter((n) => n.id === id || n.id === swap.id).forEach((n) => {
				markNodeDirty(n);
				scheduleFlush();
			});
		},
		alignSelected: (edge) => {
			pushHistoryAfterChange();
			const sel = get().nodes.filter((n) => n.selected);
			if (sel.length < 2) return;
			const left = (n) => n.position.x - n.style?.width / 2;
			const right = (n) => n.position.x + n.style?.width / 2;
			const top = (n) => n.position.y - n.style?.minHeight / 2;
			const bottom = (n) => n.position.y + n.style?.minHeight / 2;
			const targets = {
				left: Math.min(...sel.map(left)),
				right: Math.max(...sel.map(right)),
				top: Math.min(...sel.map(top)),
				bottom: Math.max(...sel.map(bottom)),
				centerX: (Math.min(...sel.map(left)) + Math.max(...sel.map(right))) / 2,
				centerY: (Math.min(...sel.map(top)) + Math.max(...sel.map(bottom))) / 2
			}[edge];
			applyToSelected((n) => {
				let { x, y } = n.position;
				const w = n.style?.width;
				const h = n.style?.minHeight;
				if (edge === "left") x = targets + w / 2;
				else if (edge === "right") x = targets - w / 2;
				else if (edge === "centerX") x = targets;
				else if (edge === "top") y = targets + h / 2;
				else if (edge === "bottom") y = targets - h / 2;
				else if (edge === "centerY") y = targets;
				return {
					...n,
					position: {
						x,
						y
					}
				};
			});
		},
		distributeSelected: (axis) => {
			pushHistoryAfterChange();
			const sel = get().nodes.filter((n) => n.selected).sort((a, b) => axis === "horizontal" ? a.position.x - b.position.x : a.position.y - b.position.y);
			if (sel.length < 3) return;
			const step = (axis === "horizontal" ? sel[sel.length - 1].position.x - sel[0].position.x : sel[sel.length - 1].position.y - sel[0].position.y) / (sel.length - 1);
			const first = sel[0].position;
			applyToSelected((n) => {
				const i = sel.findIndex((s) => s.id === n.id);
				if (i <= 0 || i >= sel.length - 1) return n;
				if (axis === "horizontal") return {
					...n,
					position: {
						x: first.x + step * i,
						y: n.position.y
					}
				};
				return {
					...n,
					position: {
						x: n.position.x,
						y: first.y + step * i
					}
				};
			});
		},
		matchSizeSelected: (dim) => {
			pushHistoryAfterChange();
			const sel = get().nodes.filter((n) => n.selected);
			if (sel.length < 2) return;
			const ref = dim === "width" ? sel[0].style?.width : sel[0].style?.minHeight;
			applyToSelected((n) => ({
				...n,
				style: {
					...n.style,
					...dim === "width" ? { width: ref } : { minHeight: ref }
				}
			}));
		},
		setColorSelected: (color) => {
			pushHistoryAfterChange();
			applyToSelected((n) => ({
				...n,
				data: {
					...n.data,
					color
				}
			}));
		},
		setBackgroundColorSelected: (hex) => {
			pushHistoryAfterChange();
			applyToSelected((n) => ({
				...n,
				data: {
					...n.data,
					backgroundColor: hex
				}
			}));
		},
		patchSelectedData: (patch) => {
			pushHistoryAfterChange();
			applyToSelected((n) => ({
				...n,
				data: {
					...n.data,
					...patch
				}
			}));
		},
		setRotationSelected: (deg) => {
			pushHistoryAfterChange();
			applyToSelected((n) => ({
				...n,
				data: {
					...n.data,
					rotation: deg
				}
			}));
		},
		setOpacitySelected: (opacity) => {
			pushHistoryAfterChange();
			applyToSelected((n) => ({
				...n,
				data: {
					...n.data,
					opacity
				}
			}));
		},
		setPositionSelected: (id, x, y) => {
			pushHistoryAfterChange();
			const next = get().nodes.map((n) => n.id === id ? {
				...n,
				position: {
					x,
					y
				}
			} : n);
			commitNodes(next);
			const node = next.find((n) => n.id === id);
			if (node) {
				markNodeDirty(node);
				scheduleFlush();
			}
		},
		setSizeSelected: (id, width, height) => {
			pushHistoryAfterChange();
			const next = get().nodes.map((n) => n.id === id ? {
				...n,
				style: {
					...n.style,
					width,
					minHeight: height
				}
			} : n);
			commitNodes(next);
			const node = next.find((n) => n.id === id);
			if (node) {
				markNodeDirty(node);
				scheduleFlush();
			}
		},
		setWidthSelected: (width) => {
			pushHistoryAfterChange();
			applyToSelected((n) => ({
				...n,
				style: {
					...n.style,
					width
				}
			}));
		},
		setHeightSelected: (height) => {
			pushHistoryAfterChange();
			applyToSelected((n) => ({
				...n,
				style: {
					...n.style,
					minHeight: height
				}
			}));
		},
		setLockedSelected: (locked) => {
			pushHistoryAfterChange();
			applyToSelected((n) => ({
				...n,
				data: {
					...n.data,
					locked
				}
			}));
		},
		groupSelected: () => {
			pushHistoryAfterChange();
			if (get().nodes.filter((n) => n.selected).length < 2) return;
			const groupId = nanoid();
			applyToSelected((n) => ({
				...n,
				data: {
					...n.data,
					groupId
				}
			}));
		},
		ungroupSelected: () => {
			pushHistoryAfterChange();
			applyToSelected((n) => {
				const { groupId, ...rest } = n.data;
				return {
					...n,
					data: rest
				};
			});
		},
		pushHistory: () => {
			pushHistoryAfterChange();
		},
		undo: () => {
			flushPendingHistory();
			const snapshot = useHistoryStore.getState().undo();
			if (!snapshot) return;
			set({
				nodes: snapshot.nodes,
				edges: snapshot.edges,
				selectedNodeIds: snapshot.nodes.filter((n) => n.selected).map((n) => n.id)
			});
			snapshot.nodes.forEach((n) => {
				get().onNodesChange([{
					id: n.id,
					type: "position",
					dragging: false,
					position: n.position
				}]);
			});
			snapshot.edges.forEach((e) => {
				markEdgeDirty(e);
			});
			scheduleFlush();
		},
		redo: () => {
			flushPendingHistory();
			const snapshot = useHistoryStore.getState().redo();
			if (!snapshot) return;
			set({
				nodes: snapshot.nodes,
				edges: snapshot.edges,
				selectedNodeIds: snapshot.nodes.filter((n) => n.selected).map((n) => n.id)
			});
			snapshot.nodes.forEach((n) => {
				get().onNodesChange([{
					id: n.id,
					type: "position",
					dragging: false,
					position: n.position
				}]);
			});
			snapshot.edges.forEach((e) => {
				markEdgeDirty(e);
			});
			scheduleFlush();
		}
	};
});
if (typeof window !== "undefined") {
	const onHide = () => {
		if (document.visibilityState === "hidden") {
			const s = useCanvasStore.getState();
			if (s.pendingChanges > 0) s.flushNow();
			try {
				localStorage.setItem("sutonote:recovery", JSON.stringify({
					nodes: s.nodes,
					edges: s.edges,
					at: Date.now()
				}));
			} catch {}
		}
	};
	document.addEventListener("visibilitychange", onHide);
	window.addEventListener("beforeunload", onHide);
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
var labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn(labelVariants(), className),
	...props
}));
Label.displayName = Root.displayName;
async function getAllAssetsForNodes(nodes) {
	const assetIds = /* @__PURE__ */ new Set();
	for (const n of nodes) {
		const aid = n.data["assetId"];
		if (aid) assetIds.add(aid);
		const avatar = n.data["avatarAssetId"];
		if (avatar) assetIds.add(avatar);
	}
	const settingsAvatar = useSettingsStore.getState().avatarAssetId;
	if (settingsAvatar) assetIds.add(settingsAvatar);
	const assets = [];
	const { getAssetBlob } = await import("./asset-store-DaI5ULfg.mjs");
	for (const id of assetIds) try {
		const row = (await db.query(`SELECT name, mime, size FROM canvas_assets WHERE id = $1`, [id])).rows[0];
		const blob = await getAssetBlob(id);
		if (!blob) continue;
		let binary = "";
		for (let i = 0; i < blob.length; i++) binary += String.fromCharCode(blob[i]);
		const b64 = btoa(binary);
		assets.push({
			id,
			name: row?.name ?? "file",
			mime: row?.mime ?? "application/octet-stream",
			size: row?.size ?? blob.length,
			data: b64
		});
	} catch {}
	return assets;
}
async function exportWorkspace() {
	const state = useCanvasStore.getState();
	const settings = useSettingsStore.getState();
	const assets = await getAllAssetsForNodes(state.nodes);
	const payload = {
		manifest: {
			version: 1,
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			appVersion: "0.1.0-beta",
			boards: [DEFAULT_BOARD_ID]
		},
		boards: [{
			id: DEFAULT_BOARD_ID,
			name: settings.vaultName
		}],
		nodes: state.nodes,
		edges: state.edges,
		assets,
		settings: {
			vaultName: settings.vaultName,
			displayName: settings.displayName
		}
	};
	const json = JSON.stringify(payload, null, 2);
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${settings.vaultName.replace(/[^a-z0-9-_]/gi, "_") || "sutonote"}.sutonote`;
	a.click();
	URL.revokeObjectURL(url);
	const { useNoticeStore } = await import("./notice-store-Do7Ncs7S.mjs");
	useNoticeStore.getState().show("Workspace exported", "success");
}
async function importWorkspace(file) {
	const text = await file.text();
	let payload;
	try {
		payload = JSON.parse(text);
	} catch {
		throw new Error("Invalid file: not JSON");
	}
	if (!payload.manifest || payload.manifest.version !== 1) throw new Error("Invalid or unsupported .sutonote version");
	if (!Array.isArray(payload.nodes) || !Array.isArray(payload.edges)) throw new Error("Invalid file: missing nodes/edges");
	if (!Array.isArray(payload.assets)) payload.assets = [];
	if (!window.confirm(`Import "${file.name}"? This will replace your current board (${payload.nodes.length} nodes, ${payload.edges.length} edges). This cannot be undone without your own backup. Continue?`)) return;
	const { storeAssetBlob } = await import("./asset-store-DaI5ULfg.mjs");
	for (const a of payload.assets ?? []) try {
		const binaryStr = atob(a.data);
		const bytes = new Uint8Array(binaryStr.length);
		for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
		await storeAssetBlob(a.id, bytes);
		await db.query(`INSERT INTO canvas_assets (id, name, mime, size) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, mime=EXCLUDED.mime, size=EXCLUDED.size`, [
			a.id,
			a.name,
			a.mime,
			a.size
		]);
	} catch {}
	const { useHistoryStore } = await import("./history-store-CdXVlQO3.mjs").then((n) => n.t).then((n) => n.t);
	await db.query(`DELETE FROM canvas_nodes WHERE board_id = $1`, [DEFAULT_BOARD_ID]);
	await db.query(`DELETE FROM canvas_edges WHERE board_id = $1`, [DEFAULT_BOARD_ID]);
	const { flushBoard } = await import("./persistence-manager-DKgXDaA_.mjs").then((n) => n.n).then((n) => n.n);
	const { useCanvasStore: store } = await import("./store-DLIztaDS.mjs");
	store.setState({
		nodes: [],
		edges: [],
		selectedNodeIds: []
	});
	await db.transaction(async (tx) => {
		for (const n of payload.nodes) await tx.query(`INSERT INTO canvas_nodes (id, board_id, type, position_x, position_y, width, height, z_index, data) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [
			n.id,
			DEFAULT_BOARD_ID,
			n.type ?? "text",
			n.position.x,
			n.position.y,
			n.style?.width ?? 280,
			n.style?.minHeight ?? 120,
			n.zIndex ?? 0,
			JSON.stringify(n.data ?? {})
		]);
		for (const e of payload.edges) await tx.query(`INSERT INTO canvas_edges (id, board_id, source_id, target_id, source_handle, target_handle, type, data) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [
			e.id,
			DEFAULT_BOARD_ID,
			e.source,
			e.target,
			e.sourceHandle ?? null,
			e.targetHandle ?? null,
			e.type ?? null,
			e.data ? JSON.stringify(e.data) : null
		]);
	});
	if (payload.settings?.vaultName) useSettingsStore.getState().setVaultName(payload.settings.vaultName);
	if (payload.settings?.displayName) useSettingsStore.getState().setDisplayName(payload.settings.displayName);
	const { loadNodesByBoard } = await import("./node-repository-DCKHgWpL.mjs").then((n) => n.r).then((n) => n.n);
	const { loadEdgesByBoard } = await import("./edge-repository-BnTtDDTa.mjs").then((n) => n.t).then((n) => n.t);
	const nodes = await loadNodesByBoard(DEFAULT_BOARD_ID);
	const edges = await loadEdgesByBoard(DEFAULT_BOARD_ID);
	store.setState({
		nodes,
		edges,
		selectedNodeIds: [],
		isLoaded: true
	});
	useHistoryStore.getState().init({
		nodes,
		edges
	});
	const { useNoticeStore } = await import("./notice-store-Do7Ncs7S.mjs");
	useNoticeStore.getState().show("Workspace imported", "success");
}
var themes = [
	"system",
	"light",
	"dark"
];
function Row({ label, hint, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-4 py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				className: "text-sm",
				children: label
			}), hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: hint
			})]
		}), children]
	});
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1 border-t border-border pt-3 first:border-t-0 first:pt-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
			className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80",
			children: title
		}), children]
	});
}
function SettingsDialog({ open, onOpenChange }) {
	const theme = useSettingsStore((s) => s.theme);
	const setTheme = useSettingsStore((s) => s.setTheme);
	const gridVisible = useSettingsStore((s) => s.gridVisible);
	const setGridVisible = useSettingsStore((s) => s.setGridVisible);
	const snapToGrid = useSettingsStore((s) => s.snapToGrid);
	const setSnapToGrid = useSettingsStore((s) => s.setSnapToGrid);
	const leftSidebarOpen = useSettingsStore((s) => s.leftSidebarOpen);
	const setLeftSidebarOpen = useSettingsStore((s) => s.setLeftSidebarOpen);
	const displayName = useSettingsStore((s) => s.displayName);
	const setDisplayName = useSettingsStore((s) => s.setDisplayName);
	const avatarAssetId = useSettingsStore((s) => s.avatarAssetId);
	const setAvatarAssetId = useSettingsStore((s) => s.setAvatarAssetId);
	const vaultName = useSettingsStore((s) => s.vaultName);
	const setVaultName = useSettingsStore((s) => s.setVaultName);
	const [avatarUrl, setAvatarUrl] = (0, import_react.useState)("");
	const avatarInput = (0, import_react.useRef)(null);
	const [storage, setStorage] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!avatarAssetId) {
			setAvatarUrl("");
			return;
		}
		let active = true;
		getAssetUrl(avatarAssetId).then((u) => active && setAvatarUrl(u ?? ""));
		return () => {
			active = false;
		};
	}, [avatarAssetId]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		if (navigator.storage?.estimate) navigator.storage.estimate().then((e) => setStorage({
			usage: e.usage ?? 0,
			quota: e.quota ?? 0
		}));
		setLastSave(useCanvasStore.getState().lastSavedAt);
	}, [open]);
	const [lastSave, setLastSave] = (0, import_react.useState)(null);
	const onAvatar = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const id = await storeImageAsset(file, file.name);
		setAvatarAssetId(id);
		e.target.value = "";
	};
	const exportData = () => {
		exportWorkspace();
	};
	const importInput = (0, import_react.useRef)(null);
	const onImport = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			await importWorkspace(file);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			const { useNoticeStore } = await import("./notice-store-Do7Ncs7S.mjs");
			useNoticeStore.getState().show(`Import failed: ${msg}`, "error");
		}
		e.target.value = "";
	};
	const fmt = (n) => n < 1048576 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md max-h-[80vh] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Settings" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Preferences are stored locally on this device. No account required." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "Account",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-12 w-12 overflow-hidden rounded-full border border-border bg-surface",
							children: avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: avatarUrl,
								alt: "avatar",
								className: "h-full w-full object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-full w-full items-center justify-center text-muted-foreground",
								children: displayName.slice(0, 1).toUpperCase()
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: displayName,
								onChange: (e) => setDisplayName(e.target.value),
								placeholder: "Display name",
								className: "rounded-md border border-border bg-surface px-2 py-1 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/20"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-muted-foreground transition-colors hover:text-foreground",
										onClick: () => avatarInput.current?.click(),
										children: "Upload"
									}),
									avatarAssetId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-muted-foreground transition-colors hover:text-foreground",
										onClick: () => setAvatarAssetId(""),
										children: "Remove"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										ref: avatarInput,
										type: "file",
										accept: "image/*",
										className: "hidden",
										onChange: onAvatar
									})
								]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Local vault name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: vaultName,
							onChange: (e) => setVaultName(e.target.value),
							className: "w-40 rounded-md border border-border bg-surface px-2 py-1 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/20"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Appearance",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Theme",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-1.5",
							children: themes.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setTheme(t),
								className: `rounded-md border px-2.5 py-1 text-xs capitalize transition-colors ${theme === t ? "border-border-strong bg-surface-active text-foreground" : "border-border text-muted-foreground hover:bg-surface-hover"}`,
								children: t
							}, t))
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "Canvas",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Show grid",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: gridVisible,
							onCheckedChange: setGridVisible
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Snap to grid",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: snapToGrid,
							onCheckedChange: setSnapToGrid
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Interface",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Left sidebar open by default",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: leftSidebarOpen,
							onCheckedChange: setLeftSidebarOpen
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "Data & Storage",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Storage type",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "Local (PGlite + IndexedDB)"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Approximate usage",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: storage ? `${fmt(storage.usage)}${storage.quota ? ` / ${fmt(storage.quota)}` : ""}` : "—"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Last successful save",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: lastSave ? new Date(lastSave).toLocaleTimeString() : "—"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Export workspace",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: exportData,
										className: "rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover",
										children: "Export .sutonote"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => importInput.current?.click(),
										className: "rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover",
										children: "Import"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										ref: importInput,
										type: "file",
										accept: ".sutonote,.json",
										className: "hidden",
										onChange: onImport
									})
								]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Keyboard",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "V — Select" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "H — Hand / pan" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "P — Pen" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "L — Highlighter" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "E — Eraser" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "C — Connector" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "T / S / D — Add note" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Space (hold) — Pan" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⌘/Ctrl + A — Select all" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⌘/Ctrl + C — Copy" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⌘/Ctrl + X — Cut" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⌘/Ctrl + V — Paste" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⌘/Ctrl + D — Duplicate" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Delete — Remove" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Arrows — Nudge" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Shift + Arrows — Nudge 10px" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Esc — Deselect / Cancel" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Shift/Ctrl + Click — Multi-select" })
						]
					})
				})
			]
		})
	});
}
function IconButton({ label, children, onClick, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick,
		disabled,
		title: disabled ? `${label} (coming soon)` : label,
		className: "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
		children
	});
}
function SaveStatus() {
	const status = useCanvasStore((s) => s.persistenceStatus);
	const lastSaveError = useCanvasStore((s) => s.lastSaveError);
	const { label, icon: Icon, cls } = {
		clean: {
			label: "Saved locally",
			icon: Check,
			cls: "text-muted-foreground"
		},
		saved: {
			label: "Saved locally",
			icon: Check,
			cls: "text-muted-foreground"
		},
		dirty: {
			label: "Saving…",
			icon: LoaderCircle,
			cls: "text-muted-foreground"
		},
		saving: {
			label: "Saving…",
			icon: LoaderCircle,
			cls: "text-muted-foreground"
		},
		error: {
			label: "Save failed",
			icon: TriangleAlert,
			cls: "text-destructive"
		}
	}[status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		title: status === "error" ? lastSaveError ?? "Save failed" : void 0,
		className: `flex items-center gap-1.5 rounded-full border border-border bg-popover/80 px-2.5 py-1 text-[11px] ${cls}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `h-3 w-3 ${status === "dirty" || status === "saving" ? "animate-spin" : ""}` }), label]
	});
}
function WorkspaceHeader() {
	const [settingsOpen, setSettingsOpen] = (0, import_react.useState)(false);
	const canUndo = useHistoryStore((s) => s.canUndo);
	const canRedo = useHistoryStore((s) => s.canRedo);
	const undo = useCanvasStore((s) => s.undo);
	const redo = useCanvasStore((s) => s.redo);
	const vaultName = useSettingsStore((s) => s.vaultName);
	const activeBoardId = useBoardTreeStore((s) => s.activeBoardId);
	const activeBoard = useBoardTreeStore((s) => s.groups).flatMap((group) => group.boards).find((board) => board.id === activeBoardId);
	const crumbs = [vaultName, activeBoard?.name ?? "Board"];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex items-start justify-between",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-[68px] items-center gap-3 rounded-[10px] border border-border bg-popover/95 px-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-12 w-12 shrink-0 rounded-full border border-border-strong bg-card" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "max-w-[190px] truncate text-base font-semibold text-foreground",
								children: activeBoard?.name ?? "Project Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-[10px] text-muted-foreground",
								children: vaultName
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "ml-2 h-5 w-5 text-muted-foreground" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					"aria-label": "Breadcrumb",
					className: "flex items-center gap-1 rounded-lg bg-popover/70 p-1 text-[11px] shadow-sm backdrop-blur-md",
					children: crumbs.map((crumb, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1 rounded-md border border-border/70 bg-popover/90 px-2 py-1 text-muted-foreground",
						children: [i > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3 w-3 text-muted-foreground/60" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: i === crumbs.length - 1 ? "font-medium text-foreground" : "",
							children: crumb
						})]
					}, `${crumb}-${i}`))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-[68px] items-center gap-1.5 rounded-[10px] border border-border bg-popover/95 px-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SaveStatus, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
						label: "Undo",
						disabled: !canUndo,
						onClick: undo,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
						label: "Redo",
						disabled: !canRedo,
						onClick: redo,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Redo2, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 h-4 w-px bg-border" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
						label: "Settings",
						onClick: () => setSettingsOpen(true),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
						label: "Menu",
						onClick: async () => {
							const { useNoticeStore } = await import("./notice-store-Do7Ncs7S.mjs");
							useNoticeStore.getState().show("Menu coming soon", "info");
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-4 w-4" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsDialog, {
				open: settingsOpen,
				onOpenChange: setSettingsOpen
			})
		]
	});
}
var useInteractionStore = create((set) => ({
	activeTool: "select",
	interactionMode: "canvas",
	editingNodeId: null,
	editingRegion: null,
	isPanning: false,
	isDragging: false,
	isResizing: false,
	spaceHeld: false,
	setActiveTool: (activeTool) => set({ activeTool }),
	setInteractionMode: (interactionMode) => set({ interactionMode }),
	setEditingNode: (editingNodeId, editingRegion = null) => set({
		editingNodeId,
		editingRegion,
		interactionMode: editingNodeId ? "text-edit" : "canvas"
	}),
	setPanning: (isPanning) => set({ isPanning }),
	setDragging: (isDragging) => set({ isDragging }),
	setResizing: (isResizing) => set({ isResizing }),
	setSpaceHeld: (spaceHeld) => set({ spaceHeld })
}));
var BOARD_EDGE_THRESHOLD = 200;
var BOARD_EXPAND_STEP = 600;
var CONTENT_PADDING = 300;
/**
* Full recompute from all nodes. Only call on load / board switch / bulk
* operations — never on every drag frame.
*/
function computeExtentForAllNodes(nodes) {
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	for (const n of nodes) {
		const w = n.style?.width ?? 200;
		const h = n.style?.minHeight ?? 120;
		minX = Math.min(minX, n.position.x - w / 2 - CONTENT_PADDING);
		minY = Math.min(minY, n.position.y - h / 2 - CONTENT_PADDING);
		maxX = Math.max(maxX, n.position.x + w / 2 + CONTENT_PADDING);
		maxY = Math.max(maxY, n.position.y + h / 2 + CONTENT_PADDING);
	}
	if (!Number.isFinite(minX)) return [[-800, -600], [800, 600]];
	return [[minX, minY], [maxX, maxY]];
}
/**
* O(1) incremental expansion for a single node during drag/resize.
* `x`/`y` are the node center (nodeOrigin 0.5). Returns the same reference
* when no edge is approached, so React state updates stay no-ops.
*/
function ensureExtentForNode(prev, x, y, w, h) {
	const [min, max] = prev;
	let [minX, minY] = min;
	let [maxX, maxY] = max;
	let changed = false;
	const left = x - w / 2;
	const right = x + w / 2;
	const top = y - h / 2;
	const bottom = y + h / 2;
	if (left < minX + BOARD_EDGE_THRESHOLD) {
		minX -= BOARD_EXPAND_STEP;
		changed = true;
	}
	if (top < minY + BOARD_EDGE_THRESHOLD) {
		minY -= BOARD_EXPAND_STEP;
		changed = true;
	}
	if (right > maxX - BOARD_EDGE_THRESHOLD) {
		maxX += BOARD_EXPAND_STEP;
		changed = true;
	}
	if (bottom > maxY - BOARD_EDGE_THRESHOLD) {
		maxY += BOARD_EXPAND_STEP;
		changed = true;
	}
	return changed ? [[minX, minY], [maxX, maxY]] : prev;
}
var KEY = "sutonote:viewport";
function loadViewport() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		const vp = JSON.parse(raw);
		if (typeof vp.x === "number" && typeof vp.y === "number" && typeof vp.zoom === "number") return vp;
		return null;
	} catch {
		return null;
	}
}
function saveViewport(vp) {
	try {
		localStorage.setItem(KEY, JSON.stringify(vp));
	} catch {}
}
function shouldVirtualize(nodeCount, currentlyVirtualized) {
	if (currentlyVirtualized) return nodeCount > 120;
	return nodeCount >= 150;
}
var cursors = {
	"top-left": "nwse-resize",
	"top-right": "nesw-resize",
	"bottom-left": "nesw-resize",
	"bottom-right": "nwse-resize"
};
function ResizeDot({ position }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute h-[5px] w-[5px] rounded-full border border-border-strong bg-popover",
		style: {
			cursor: cursors[position],
			top: position.startsWith("top") ? -2.5 : void 0,
			bottom: position.startsWith("bottom") ? -2.5 : void 0,
			left: position.endsWith("left") ? -2.5 : void 0,
			right: position.endsWith("right") ? -2.5 : void 0
		}
	});
}
var CORNERS = [
	"top-left",
	"top-right",
	"bottom-left",
	"bottom-right"
];
function ResizeControls({ id, type, selected }) {
	const locked = useCanvasStore((s) => {
		return s.nodes.find((n) => n.id === id)?.data?.locked ?? false;
	});
	const def = getNodeDef(type ?? "text");
	if (!selected || locked) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: CORNERS.map((pos) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControl$1, {
		position: pos,
		minWidth: def.minWidth,
		minHeight: def.minHeight,
		...def.maxWidth ? { maxWidth: def.maxWidth } : {},
		...def.maxHeight ? { maxHeight: def.maxHeight } : {},
		keepAspectRatio: type === "image",
		className: "!bg-transparent !border-none !w-[16px] !h-[16px] !min-w-[16px] !min-h-[16px]",
		onResizeStart: () => useInteractionStore.getState().setResizing(true),
		onResizeEnd: () => useInteractionStore.getState().setResizing(false),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeDot, { position: pos })
	}, pos)) });
}
var ports = [
	{
		position: Position.Top,
		type: "target",
		label: "top"
	},
	{
		position: Position.Right,
		type: "source",
		label: "right"
	},
	{
		position: Position.Bottom,
		type: "source",
		label: "bottom"
	},
	{
		position: Position.Left,
		type: "source",
		label: "left"
	}
];
/** Shared ports: invisible in normal mode, discoverable and easy to hit while connecting. */
function ConnectorPorts() {
	const active = useInteractionStore((state) => state.activeTool === "connector");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: ports.map(({ position, type, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Handle$1, {
		type,
		position,
		"aria-label": `${label} connector port`,
		className: active ? "!z-20 !h-5 !w-5 !border-0 !bg-transparent !pointer-events-auto" : "!h-0 !w-0 !border-0 !bg-transparent !opacity-0 !pointer-events-none",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: active ? "pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-primary/20" : "hidden" })
	}, label)) });
}
function StickyNoteNode(props) {
	const { id, data, selected } = props;
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const reduce = useReducedMotion();
	const rotation = data.rotation ?? 0;
	const { editingNodeId, setEditingNode } = useInteractionStore();
	const isEditing = editingNodeId === id;
	const [text, setText] = (0, import_react.useState)(data.text ?? "");
	(0, import_react.useEffect)(() => {
		setText(data.text ?? "");
	}, [data.text]);
	const handleTextChange = (value) => {
		setText(value);
		updateNodeData(id, { text: value });
	};
	const handleTextBlur = () => {
		updateNodeDataWithHistory(id, { text });
		if (editingNodeId === id) setEditingNode(null);
	};
	const handleTextKeyDown = (e) => {
		if (e.key === "Escape") e.currentTarget.blur();
	};
	const handleDoubleClick = () => {
		if (!isEditing) useInteractionStore.getState().setEditingNode(id, "body");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, { ...props }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .9,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 15
			},
			className: `relative w-full select-none rounded-[7px] transition-shadow ${data.backgroundColor || (data.color ?? "bg-note-yellow")} ${selected ? "shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"}`,
			style: {
				transform: `rotate(${rotation}deg)`,
				transformOrigin: "center",
				minHeight: 160,
				padding: "18px",
				border: "1px solid rgba(0,0,0,0.04)",
				borderLeftWidth: data.highlight ? "4px" : void 0,
				borderLeftColor: data.highlight || void 0
			},
			onDoubleClick: handleDoubleClick,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				value: text,
				onChange: (e) => handleTextChange(e.target.value),
				onBlur: handleTextBlur,
				onKeyDown: handleTextKeyDown,
				onDoubleClick: handleDoubleClick,
				placeholder: "Jot something down...",
				className: `h-full min-h-[100px] w-full resize-none bg-transparent font-serif leading-[1.6] text-note-foreground outline-none focus:ring-0 placeholder:text-note-foreground/40 ${isEditing ? "nodrag nowheel select-text cursor-text" : "cursor-default"}`,
				style: { fontSize: data.fontSize ?? 14 },
				"aria-label": "Sticky note",
				readOnly: !isEditing
			})]
		})]
	});
}
var StickyNoteNode_default = (0, import_react.memo)(StickyNoteNode);
/**
* Lightweight, read-only renderer for rich text content.
*
* Renders stored HTML directly — no Tiptap/ProseMirror instance.
* Text nodes use this whenever they are NOT being edited, so a note-heavy
* board mounts 0 editors instead of one per card.
*/
function sanitize(html) {
	return html.replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\s*\/\s*\1\s*>/gi, "").replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "").replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, "$1=\"#\"");
}
function RichTextViewImpl({ html, plainText, placeholder = "Start writing..." }) {
	const safe = (0, import_react.useMemo)(() => sanitize(html ?? ""), [html]);
	if (!plainText?.trim() && !safe.replace(/<[^>]*>/g, "").trim()) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "prose prose-sm max-w-none min-h-[80px] text-muted-foreground/50",
		children: placeholder
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "prose prose-sm max-w-none min-h-[80px]",
		dangerouslySetInnerHTML: { __html: safe }
	});
}
var RichTextView = (0, import_react.memo)(RichTextViewImpl);
/** Tiptap is only downloaded/mounted while a node is actually being edited. */
var RichTextEditor = (0, import_react.lazy)(() => import("./RichTextEditor-wQMbP8BR.mjs").then((m) => ({ default: m.RichTextEditor })));
function TextNode(props) {
	const { id, data, selected } = props;
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const { editingNodeId, setEditingNode } = useInteractionStore();
	const reduce = useReducedMotion();
	const rotation = data.rotation ?? 0;
	const isEditing = editingNodeId === id;
	const [title, setTitle] = (0, import_react.useState)(data.title ?? "");
	const [content, setContent] = (0, import_react.useState)(data.content ?? data.text ?? "");
	const [contentJson, setContentJson] = (0, import_react.useState)(data.richText?.json ?? null);
	const [plainText, setPlainText] = (0, import_react.useState)(data.plainText ?? "");
	(0, import_react.useEffect)(() => {
		setTitle(data.title ?? "");
	}, [data.title]);
	(0, import_react.useEffect)(() => {
		const rich = data.richText?.json;
		if (rich) {
			setContentJson(rich);
			setPlainText(data.plainText ?? "");
		} else if (!data.content && data.text) {
			setContent(data.text ?? "");
			setContentJson(null);
			setPlainText(data.text ?? "");
		} else {
			setContent(data.content ?? "");
			setContentJson(null);
			setPlainText(data.plainText ?? data.content ?? "");
		}
		if ((data["bold"] || data["italic"] || data["highlight"]) && rich) {}
	}, [
		data,
		data.content,
		data.text,
		data.richText,
		data.plainText
	]);
	const handleTitleChange = (value) => {
		setTitle(value);
		updateNodeData(id, { title: value });
	};
	const handleTitleBlur = () => {
		updateNodeDataWithHistory(id, { title });
		if (editingNodeId === id) setEditingNode(null);
	};
	const handleContentChange = (html, json, plain) => {
		setContent(html);
		setContentJson(json);
		setPlainText(plain);
		const patch = {
			content: html,
			text: html,
			plainText: plain,
			richText: {
				version: 1,
				json
			}
		};
		const d = data;
		if (d["bold"] || d["italic"] || d["highlight"] || d["fontSize"] || d["textColor"]) {
			patch["bold"] = false;
			patch["italic"] = false;
			patch["highlight"] = "";
			patch["fontSize"] = void 0;
			patch["textColor"] = "";
			patch["textAlign"] = "left";
		}
		updateNodeData(id, patch);
	};
	const handleContentBlur = () => {
		const patch = {
			content,
			text: content,
			plainText
		};
		if (contentJson) patch["richText"] = {
			version: 1,
			json: contentJson
		};
		updateNodeDataWithHistory(id, patch);
		if (editingNodeId === id) setEditingNode(null);
	};
	const handleDoubleClick = () => {
		if (!editingNodeId) useInteractionStore.getState().setEditingNode(id, "body");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, { ...props }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .9,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 15
			},
			className: `relative w-full select-none rounded-[7px] border transition-shadow ${data.backgroundColor || (data.color ?? "bg-card")} ${selected ? "border-border-strong shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"}`,
			style: {
				transform: `rotate(${rotation}deg)`,
				transformOrigin: "center",
				padding: "20px 22px"
			},
			onDoubleClick: handleDoubleClick,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: title,
					onChange: (e) => handleTitleChange(e.target.value),
					onFocus: () => useInteractionStore.getState().setEditingNode(id, "title"),
					onBlur: handleTitleBlur,
					onKeyDown: (e) => {
						if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
					},
					placeholder: "Title",
					className: `mb-2 w-full bg-transparent text-[15px] font-semibold tracking-tight text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50 ${isEditing ? "cursor-text" : "cursor-default"}`,
					"aria-label": "Title",
					readOnly: !isEditing
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `nodrag nowheel ${isEditing ? "select-text cursor-text" : "select-none"}`,
					children: isEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
						fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichTextView, {
							html: content,
							plainText,
							placeholder: "Start writing..."
						}),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichTextEditor, {
							id,
							content,
							contentJson,
							onChange: handleContentChange,
							onBlur: handleContentBlur,
							placeholder: "Start writing...",
							editable: true
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichTextView, {
						html: content,
						plainText,
						placeholder: "Start writing..."
					})
				})
			]
		})]
	});
}
var TextNode_default = (0, import_react.memo)(TextNode);
function TodoNode(props) {
	const { id, data, selected } = props;
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const reduce = useReducedMotion();
	const rotation = data.rotation ?? 0;
	const { editingNodeId, setEditingNode } = useInteractionStore();
	const showCompleted = data.showCompleted ?? true;
	const allTodos = Array.isArray(data.todos) ? data.todos : [
		{
			label: "Task 1",
			done: false
		},
		{
			label: "Task 2",
			done: false
		},
		{
			label: "Task 3",
			done: false
		}
	];
	const todos = allTodos.filter((t) => showCompleted || !t.done);
	const doneCount = allTodos.filter((t) => t.done).length;
	const totalCount = allTodos.length;
	const progress = totalCount > 0 ? doneCount / totalCount * 100 : 0;
	const [title, setTitle] = (0, import_react.useState)(data.title ?? "To-do");
	(0, import_react.useEffect)(() => {
		setTitle(data.title ?? "To-do");
	}, [data.title]);
	const handleTitleChange = (value) => {
		setTitle(value);
		updateNodeData(id, { title: value });
	};
	const handleTitleBlur = () => {
		updateNodeDataWithHistory(id, { title });
		if (editingNodeId === id) setEditingNode(null);
	};
	const setTodosWithHistory = (next) => updateNodeDataWithHistory(id, { todos: next });
	const toggle = (i) => setTodosWithHistory(todos.map((t, idx) => idx === i ? {
		...t,
		done: !t.done
	} : t));
	const add = (label) => setTodosWithHistory([...todos, {
		label,
		done: false
	}]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, { ...props }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .9,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 15
			},
			className: `relative w-full select-none rounded-[7px] border transition-shadow ${data.backgroundColor || (data.color ?? "bg-card")} ${selected ? "border-border-strong shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"}`,
			style: {
				transform: `rotate(${rotation}deg)`,
				transformOrigin: "center",
				padding: "18px 20px"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: title,
					onChange: (e) => handleTitleChange(e.target.value),
					onBlur: handleTitleBlur,
					onKeyDown: (e) => {
						if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
					},
					className: "mb-3 w-full cursor-text bg-transparent text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80 outline-none focus:ring-0",
					"aria-label": "To-do list title"
				}),
				totalCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-1 flex-1 overflow-hidden rounded-full bg-border/60",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full rounded-full bg-primary transition-[width] duration-300",
							style: { width: `${progress}%` }
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[10px] tabular-nums text-muted-foreground/70",
						children: [
							doneCount,
							"/",
							totalCount
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: todos.map((todo, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `flex items-center gap-3 text-[13px] transition-all ${todo.done ? "scale-[0.98] opacity-50" : ""}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => toggle(i),
							className: `flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors ${todo.done ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/60"}`,
							"aria-label": todo.done ? "Mark incomplete" : "Mark complete",
							children: todo.done && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
								className: "h-3 w-3",
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: 3,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "20 6 9 17 4 12" })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `flex-1 truncate ${todo.done ? "text-muted-foreground line-through" : "text-foreground"}`,
							children: todo.label
						})]
					}, i))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-3 flex items-center gap-2 border-t border-border/60 pt-3",
					onSubmit: (e) => {
						e.preventDefault();
						const input = e.currentTarget.elements.namedItem("task");
						if (input.value.trim()) {
							add(input.value.trim());
							input.value = "";
						}
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5 text-muted-foreground/50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "task",
						type: "text",
						placeholder: "Add a task",
						className: "flex-1 cursor-text bg-transparent text-[13px] text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50"
					})]
				})
			]
		})]
	});
}
var TodoNode_default = (0, import_react.memo)(TodoNode);
function EmptyAssetState({ icon, title, browseLabel = "Browse", linkLabel = "Add link", accept = "image/*", onAssetId, onRemoteUrl, onCancel }) {
	const [state, setState] = (0, import_react.useState)("idle");
	const [url, setUrl] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const fileRef = (0, import_react.useRef)(null);
	const urlInputRef = (0, import_react.useRef)(null);
	const isIdle = state === "idle";
	const isEnteringUrl = state === "entering-url";
	const isLoading = state === "loading";
	const isError = state === "error";
	const handleBrowse = (0, import_react.useCallback)(() => {
		fileRef.current?.click();
	}, []);
	const handleFilePick = (0, import_react.useCallback)(async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setState("loading");
		try {
			const assetId = await storeImageAsset(file, file.name);
			await getAssetUrl(assetId);
			onAssetId(assetId, file.name, file.type);
		} catch (err) {
			setError("Failed to upload");
			setState("error");
		}
		e.target.value = "";
	}, [onAssetId]);
	const handleAddLink = (0, import_react.useCallback)(() => {
		setState("entering-url");
		setUrl("");
		setError("");
		setTimeout(() => urlInputRef.current?.focus(), 0);
	}, []);
	const handleUrlSubmit = (0, import_react.useCallback)(() => {
		try {
			new URL(url);
			if (!url.match(/\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|pdf)($|\?)/i) && !url.includes("youtube.com") && !url.includes("vimeo.com") && !url.includes("figma.com")) {
				setError("Enter a valid image, video, PDF, or embed URL");
				return;
			}
			setState("loading");
			onRemoteUrl(url);
		} catch {
			setError("Invalid URL");
		}
	}, [url, onRemoteUrl]);
	const handleCancel = (0, import_react.useCallback)(() => {
		if (isEnteringUrl) {
			setState("idle");
			setUrl("");
			setError("");
		} else if (onCancel) onCancel();
	}, [isEnteringUrl, onCancel]);
	const handleKeyDown = (0, import_react.useCallback)((e) => {
		if (e.key === "Enter" && isEnteringUrl) {
			e.preventDefault();
			handleUrlSubmit();
		} else if (e.key === "Escape") handleCancel();
	}, [
		isEnteringUrl,
		handleUrlSubmit,
		handleCancel
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "nodrag nowheel flex w-full flex-col items-center justify-center gap-3 bg-surface/50 py-12 px-4",
		onKeyDown: handleKeyDown,
		children: [
			isIdle && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-12 w-12 flex items-center justify-center rounded-full bg-muted/30 text-muted-foreground/50",
						children: icon
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-foreground",
						children: title
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleBrowse,
						className: "flex items-center gap-1.5 rounded-lg border border-border bg-popover px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3.5 w-3.5" }), browseLabel]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleAddLink,
						className: "flex items-center gap-1.5 rounded-lg border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "h-3.5 w-3.5" }), linkLabel]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground/50",
					children: "Drop a file here"
				})
			] }),
			isEnteringUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-xs flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1 text-[12px] text-muted-foreground",
					children: [
						"URL",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: urlInputRef,
							type: "url",
							value: url,
							onChange: (e) => setUrl(e.target.value),
							placeholder: "https://...",
							className: "w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary",
							onKeyDown: handleKeyDown
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] text-destructive",
							children: error
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 justify-end",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleCancel,
						className: "rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-hover",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleUrlSubmit,
						disabled: !url.trim() || isLoading,
						className: "rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed",
						children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin mr-1.5" }), "Adding..."] }) : "Add"
					})]
				})]
			}),
			isError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-2 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-destructive",
						children: error || "Failed to add"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setState("idle"),
						className: "rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-hover",
						children: "Try again"
					})
				]
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Processing..."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileRef,
				type: "file",
				accept,
				className: "hidden",
				onChange: handleFilePick
			})
		]
	});
}
var useLightboxStore = create((set, get) => ({
	isOpen: false,
	currentId: null,
	imageIds: [],
	open: (id, allIds) => set({
		isOpen: true,
		currentId: id,
		imageIds: allIds
	}),
	close: () => set({
		isOpen: false,
		currentId: null
	}),
	next: () => {
		const { currentId, imageIds } = get();
		if (!currentId || imageIds.length === 0) return;
		const nid = imageIds[(imageIds.indexOf(currentId) + 1) % imageIds.length];
		if (nid) set({ currentId: nid });
	},
	prev: () => {
		const { currentId, imageIds } = get();
		if (!currentId || imageIds.length === 0) return;
		const pid = imageIds[(imageIds.indexOf(currentId) - 1 + imageIds.length) % imageIds.length];
		if (pid) set({ currentId: pid });
	}
}));
function ImageNode(props) {
	const { id, data, selected } = props;
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const reduce = useReducedMotion();
	const rotation = data.rotation ?? 0;
	const opacity = data.opacity ?? 100;
	const fileRef = (0, import_react.useRef)(null);
	const [url, setUrl] = (0, import_react.useState)("");
	getNodeDef("image");
	const assetId = data.assetId ?? "";
	const remoteUrl = data.remoteUrl ?? "";
	const sourceType = data.sourceType ?? "local";
	const caption = data.caption ?? "";
	const alt = data.alt ?? "";
	(0, import_react.useEffect)(() => {
		let active = true;
		if (assetId) getAssetUrl(assetId).then((u) => {
			if (active && u) setUrl(u);
		});
		else if (remoteUrl) setUrl(remoteUrl);
		else setUrl("");
		return () => {
			active = false;
		};
	}, [assetId, remoteUrl]);
	const handleAssetId = (0, import_react.useCallback)(async (newAssetId, filename, mime) => {
		updateNodeDataWithHistory(id, {
			assetId: newAssetId,
			sourceType: "local",
			remoteUrl: "",
			caption: filename
		});
		const u = await getAssetUrl(newAssetId);
		if (u) setUrl(u);
	}, [id, updateNodeDataWithHistory]);
	const handleRemoteUrl = (0, import_react.useCallback)((newRemoteUrl) => {
		updateNodeDataWithHistory(id, {
			remoteUrl: newRemoteUrl,
			sourceType: "remote",
			assetId: ""
		});
		setUrl(newRemoteUrl);
	}, [id, updateNodeDataWithHistory]);
	const handleReplace = (0, import_react.useCallback)(async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (assetId) {
			await replaceImageAsset(assetId, file, file.name);
			const u = await getAssetUrl(assetId);
			if (u) setUrl(u);
			updateNodeDataWithHistory(id, { caption: file.name });
		} else {
			const newId = await storeImageAsset(file, file.name);
			updateNodeDataWithHistory(id, {
				assetId: newId,
				sourceType: "local",
				remoteUrl: "",
				caption: file.name
			});
		}
		e.target.value = "";
	}, [
		assetId,
		id,
		updateNodeDataWithHistory
	]);
	const handleRemove = (0, import_react.useCallback)(() => {
		updateNodeDataWithHistory(id, {
			assetId: "",
			remoteUrl: "",
			sourceType: "local",
			caption: ""
		});
		setUrl("");
	}, [id, updateNodeDataWithHistory]);
	const showEmpty = !assetId && !remoteUrl;
	const isRemote = sourceType === "remote" && remoteUrl;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, { ...props }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .9,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 15
			},
			className: `relative w-full select-none overflow-hidden rounded-[7px] border transition-shadow ${data.backgroundColor || ""} ${selected ? "border-border-strong shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"}`,
			style: {
				transform: `rotate(${rotation}deg)`,
				transformOrigin: "center",
				opacity: opacity / 100,
				maxWidth: 360
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}),
				showEmpty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyAssetState, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
						className: "h-6 w-6",
						strokeWidth: 1.5
					}),
					title: "Add an image",
					browseLabel: "Browse",
					linkLabel: "Add link",
					accept: "image/*",
					onAssetId: handleAssetId,
					onRemoteUrl: handleRemoteUrl,
					onCancel: handleRemove
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileRef,
						type: "file",
						accept: "image/*",
						className: "hidden",
						onChange: handleReplace
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: url,
						alt: alt || caption || "image",
						className: "h-auto w-full object-cover cursor-zoom-in",
						style: { maxHeight: 360 },
						onDoubleClick: (e) => {
							e.stopPropagation();
							const allIds = useCanvasStore.getState().nodes.filter((n) => n.type === "image" && (n.data.assetId || n.data.remoteUrl)).map((n) => n.id);
							useLightboxStore.getState().open(id, allIds);
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
						style: { opacity: selected ? 1 : 0 },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: (e) => {
									e.stopPropagation();
									fileRef.current?.click();
								},
								className: "flex h-7 w-7 items-center justify-center rounded-md bg-popover/90 text-muted-foreground hover:text-foreground",
								"aria-label": "Replace image",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Replace, { className: "h-4 w-4" })
							}),
							(assetId || isRemote) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: handleRemove,
								className: "flex h-7 w-7 items-center justify-center rounded-md bg-popover/90 text-muted-foreground hover:text-foreground",
								"aria-label": "Remove image",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
							}),
							assetId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									if (assetId) getAssetUrl(assetId).then((u) => {
										if (u) {
											const a = document.createElement("a");
											a.href = u;
											a.download = caption || "image";
											a.click();
										}
									});
								},
								className: "flex h-7 w-7 items-center justify-center rounded-md bg-popover/90 text-muted-foreground hover:text-foreground",
								"aria-label": "Download image",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" })
							})
						]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-card px-4 py-3 border-t border-border/50",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: caption,
							onChange: (e) => updateNodeData(id, { caption: e.target.value }),
							onBlur: () => updateNodeDataWithHistory(id, { caption }),
							placeholder: "Add a caption...",
							className: "w-full bg-transparent text-[13px] text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50",
							"aria-label": "Caption"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: alt,
							onChange: (e) => updateNodeData(id, { alt: e.target.value }),
							onBlur: () => updateNodeDataWithHistory(id, { alt }),
							placeholder: "Alt text...",
							className: "mt-1 w-full bg-transparent text-[12px] text-muted-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50",
							"aria-label": "Alt text"
						}),
						isRemote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-[11px] text-muted-foreground/60 flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "h-3 w-3" }), "Linked from URL"]
						})
					]
				})
			]
		})]
	});
}
var ImageNode_default = (0, import_react.memo)(ImageNode);
function LinkNode(props) {
	const { id, data, selected } = props;
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const { editingNodeId, setEditingNode } = useInteractionStore();
	const reduce = useReducedMotion();
	const rotation = data.rotation ?? 0;
	const isEditing = editingNodeId === id;
	const [url, setUrl] = (0, import_react.useState)(data.url ?? "");
	const [title, setTitle] = (0, import_react.useState)(data.title ?? "");
	const [description, setDescription] = (0, import_react.useState)(data.description ?? "");
	(0, import_react.useEffect)(() => {
		setUrl(data.url ?? "");
		setTitle(data.title ?? "");
		setDescription(data.description ?? "");
	}, [
		data.url,
		data.title,
		data.description
	]);
	const handleUrlChange = (value) => {
		setUrl(value);
		updateNodeData(id, { url: value });
	};
	const handleUrlBlur = () => {
		updateNodeDataWithHistory(id, { url });
		if (editingNodeId === id) setEditingNode(null);
	};
	const handleUrlKeyDown = (e) => {
		if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
	};
	const handleTitleChange = (value) => {
		setTitle(value);
		updateNodeData(id, { title: value });
	};
	const handleTitleBlur = () => {
		updateNodeDataWithHistory(id, { title });
		if (editingNodeId === id) setEditingNode(null);
	};
	const handleTitleKeyDown = (e) => {
		if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
	};
	const handleDescriptionChange = (value) => {
		setDescription(value);
		updateNodeData(id, { description: value });
	};
	const handleDescriptionBlur = () => {
		updateNodeDataWithHistory(id, { description });
		if (editingNodeId === id) setEditingNode(null);
	};
	const handleDescriptionKeyDown = (e) => {
		if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
	};
	const getDomain = (u) => {
		try {
			const parsed = new URL(u);
			if (!["http:", "https:"].includes(parsed.protocol)) return null;
			return parsed.hostname.replace(/^www\./, "");
		} catch {
			return null;
		}
	};
	const domain = getDomain(url);
	const isValidUrl = domain !== null || url === "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, { ...props }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .9,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 15
			},
			className: `relative w-full select-none rounded-[7px] border transition-shadow bg-card ${selected ? "border-border-strong shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"}`,
			style: {
				transform: `rotate(${rotation}deg)`,
				transformOrigin: "center",
				padding: "14px 18px"
			},
			onDoubleClick: () => {
				if (!isEditing) setEditingNode(id, "body");
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						isEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: title,
							onChange: (e) => handleTitleChange(e.target.value),
							onBlur: handleTitleBlur,
							onKeyDown: handleTitleKeyDown,
							onFocus: () => setEditingNode(id, "body"),
							placeholder: "Link title",
							className: "mb-1 w-full cursor-text bg-transparent text-[14px] font-semibold tracking-tight text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50 nodrag nowheel select-text",
							"aria-label": "Link title"
						}) : domain && title ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: url,
							target: "_blank",
							rel: "noopener noreferrer",
							onClick: (e) => e.stopPropagation(),
							className: "mb-1 block w-full cursor-pointer truncate text-[14px] font-semibold tracking-tight text-primary hover:underline",
							children: title
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: title,
							onChange: (e) => handleTitleChange(e.target.value),
							onBlur: handleTitleBlur,
							onKeyDown: handleTitleKeyDown,
							onFocus: () => setEditingNode(id, "body"),
							placeholder: "Link title",
							className: "mb-1 w-full cursor-text bg-transparent text-[14px] font-semibold tracking-tight text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50 nodrag nowheel select-text",
							"aria-label": "Link title",
							readOnly: !isEditing
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: url,
							onChange: (e) => handleUrlChange(e.target.value),
							onBlur: handleUrlBlur,
							onKeyDown: handleUrlKeyDown,
							onFocus: () => setEditingNode(id, "body"),
							placeholder: "https://...",
							className: `mb-1 w-full bg-transparent text-[12px] outline-none focus:ring-0 placeholder:text-muted-foreground/40 nodrag nowheel ${isEditing ? "cursor-text select-text text-muted-foreground" : "cursor-default text-muted-foreground/70"}`,
							"aria-label": "URL",
							readOnly: !isEditing && !!url
						}),
						!isValidUrl && url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-1 text-[10px] text-destructive",
							children: "Invalid URL — use http:// or https://"
						}),
						domain && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-1 text-[10px] text-muted-foreground/60",
							children: domain
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: description,
							onChange: (e) => handleDescriptionChange(e.target.value),
							onBlur: handleDescriptionBlur,
							onKeyDown: handleDescriptionKeyDown,
							onFocus: () => setEditingNode(id, "body"),
							placeholder: "Optional description",
							className: `w-full bg-transparent text-[12px] outline-none focus:ring-0 placeholder:text-muted-foreground/30 nodrag nowheel ${isEditing ? "cursor-text select-text text-muted-foreground/70" : "cursor-default text-muted-foreground/50"}`,
							"aria-label": "Description",
							readOnly: !isEditing && !!description
						})
					]
				})]
			})]
		})]
	});
}
var LinkNode_default = (0, import_react.memo)(LinkNode);
var useDocumentPreviewStore = create((set) => ({
	isOpen: false,
	nodeId: null,
	open: (nodeId) => set({
		isOpen: true,
		nodeId
	}),
	close: () => set({
		isOpen: false,
		nodeId: null
	})
}));
function FileNode(props) {
	const { id, data, selected } = props;
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const openPreview = useDocumentPreviewStore((s) => s.open);
	const { editingNodeId, setEditingNode } = useInteractionStore();
	const reduce = useReducedMotion();
	const rotation = data.rotation ?? 0;
	const [filename, setFilename] = (0, import_react.useState)(data.filename ?? "");
	const assetId = data.assetId ?? "";
	const fileRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setFilename(data.filename ?? "");
	}, [data.filename]);
	const handleUpload = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const aid = await storeAsset(file, file.name);
		updateNodeDataWithHistory(id, {
			assetId: aid,
			filename: file.name,
			mime: file.type
		});
		e.target.value = "";
	};
	const handleFilenameChange = (value) => {
		setFilename(value);
		updateNodeData(id, { filename: value });
	};
	const handleFilenameBlur = () => {
		updateNodeDataWithHistory(id, { filename });
		if (editingNodeId === id) setEditingNode(null);
	};
	const handleFilenameKeyDown = (e) => {
		if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, { ...props }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .9,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 15
			},
			className: `relative w-full select-none rounded-[7px] border transition-shadow bg-card ${selected ? "border-border-strong shadow-[0_4px_16px_rgba(0,0,0,0.06)]" : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]"}`,
			onDoubleClick: (event) => {
				event.stopPropagation();
				if (assetId) openPreview(id);
			},
			style: {
				transform: `rotate(${rotation}deg)`,
				transformOrigin: "center",
				padding: "14px 18px"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: fileRef,
					type: "file",
					className: "hidden",
					onChange: handleUpload
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: filename,
						onChange: (e) => handleFilenameChange(e.target.value),
						onBlur: handleFilenameBlur,
						onKeyDown: handleFilenameKeyDown,
						placeholder: "File name",
						className: "w-full cursor-text bg-transparent text-[13px] font-medium text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50",
						"aria-label": "File name"
					})]
				}),
				assetId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 pl-6 text-[11px] text-muted-foreground/60",
					children: "Attached file"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => fileRef.current?.click(),
					className: "mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-1.5 text-[11px] text-muted-foreground/60 transition-colors hover:border-primary/40 hover:text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3 w-3" }), "Attach file"]
				})
			]
		})]
	});
}
var FileNode_default = (0, import_react.memo)(FileNode);
function CommentNode(props) {
	const { id, data, selected } = props;
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const { editingNodeId, setEditingNode } = useInteractionStore();
	const reduce = useReducedMotion();
	const rotation = data.rotation ?? 0;
	const isEditing = editingNodeId === id;
	const [text, setText] = (0, import_react.useState)(data.text ?? "");
	const author = data.author ?? useSettingsStore.getState().displayName;
	const resolved = data.resolved ?? false;
	const createdAt = data.createdAt ?? 0;
	const updatedAt = data.updatedAt ?? 0;
	const initRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		setText(data.text ?? "");
	}, [data.text]);
	(0, import_react.useEffect)(() => {
		if (!initRef.current && !createdAt) {
			initRef.current = true;
			updateNodeData(id, {
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
		}
	}, [
		createdAt,
		id,
		updateNodeData
	]);
	const handleTextChange = (value) => {
		setText(value);
		updateNodeData(id, {
			text: value,
			updatedAt: Date.now()
		});
	};
	const handleTextBlur = () => {
		updateNodeDataWithHistory(id, {
			text,
			updatedAt: Date.now()
		});
		if (editingNodeId === id) setEditingNode(null);
	};
	const toggleResolved = () => {
		updateNodeDataWithHistory(id, { resolved: !resolved });
	};
	const formatTime = (ts) => {
		if (!ts) return "";
		const d = new Date(ts);
		const diffMs = (/* @__PURE__ */ new Date()).getTime() - d.getTime();
		const diffMin = Math.floor(diffMs / 6e4);
		if (diffMin < 1) return "just now";
		if (diffMin < 60) return `${diffMin}m ago`;
		const diffH = Math.floor(diffMin / 60);
		if (diffH < 24) return `${diffH}h ago`;
		return d.toLocaleDateString(void 0, {
			month: "short",
			day: "numeric"
		});
	};
	const handleTextKeyDown = (e) => {
		if (e.key === "Escape") e.currentTarget.blur();
	};
	const handleDoubleClick = () => {
		if (!isEditing) useInteractionStore.getState().setEditingNode(id, "body");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, { ...props }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .9,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 15
			},
			className: `relative w-full select-none rounded-[7px] border transition-shadow bg-card ${resolved ? "opacity-60" : ""} ${selected ? "border-border-strong shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"}`,
			style: {
				transform: `rotate(${rotation}deg)`,
				transformOrigin: "center",
				padding: "14px 18px"
			},
			onDoubleClick: handleDoubleClick,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-1 text-[11px] font-medium text-muted-foreground/70",
								children: author
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: text,
								onChange: (e) => handleTextChange(e.target.value),
								onBlur: handleTextBlur,
								onKeyDown: handleTextKeyDown,
								onDoubleClick: handleDoubleClick,
								placeholder: "Write a comment...",
								className: "min-h-[40px] w-full cursor-text resize-none bg-transparent font-serif text-[13px] leading-[1.5] text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/40",
								"aria-label": "Comment"
							}),
							(createdAt || updatedAt) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[10px] text-muted-foreground/40",
								children: updatedAt && updatedAt !== createdAt ? `edited ${formatTime(updatedAt)}` : formatTime(createdAt)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: toggleResolved,
						className: `mt-0.5 h-4 w-4 shrink-0 rounded-full border transition-colors ${resolved ? "border-status-success bg-status-success" : "border-muted-foreground/30 bg-transparent hover:border-muted-foreground/50"}`,
						"aria-label": resolved ? "Unresolve" : "Resolve"
					})
				]
			})]
		})]
	});
}
var CommentNode_default = (0, import_react.memo)(CommentNode);
function ShapeNode(props) {
	const { id, data, selected } = props;
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const reduce = useReducedMotion();
	const rotation = data.rotation ?? 0;
	const shape = data.shape ?? "rectangle";
	const fill = data.fill ?? "transparent";
	const stroke = data.stroke ?? "currentColor";
	const strokeWidth = data.strokeWidth ?? 2;
	const opacity = data.opacity ?? 100;
	const cornerRadius = data.cornerRadius ?? 12;
	const [isEditingLabel, setIsEditingLabel] = (0, import_react.useState)(false);
	const label = data.label ?? "";
	const fillValue = fill === "transparent" ? "none" : fill;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, { ...props }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .9,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 15
			},
			className: `relative w-full select-none ${selected ? "" : ""}`,
			style: {
				transform: `rotate(${rotation}deg)`,
				transformOrigin: "center",
				opacity: opacity / 100,
				padding: "8px"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-center min-h-[80px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						viewBox: "0 0 100 100",
						className: "w-full h-auto",
						preserveAspectRatio: "none",
						children: [
							shape === "rectangle" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
								x: 2,
								y: 2,
								width: 96,
								height: 96,
								fill: fillValue,
								stroke,
								strokeWidth,
								strokeLinejoin: "round",
								strokeLinecap: "round"
							}),
							shape === "rounded-rectangle" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
								x: 2,
								y: 2,
								width: 96,
								height: 96,
								rx: cornerRadius,
								ry: cornerRadius,
								fill: fillValue,
								stroke,
								strokeWidth,
								strokeLinejoin: "round",
								strokeLinecap: "round"
							}),
							shape === "circle" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
								cx: 50,
								cy: 50,
								rx: 48,
								ry: 48,
								fill: fillValue,
								stroke,
								strokeWidth,
								strokeLinejoin: "round",
								strokeLinecap: "round"
							}),
							shape === "diamond" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
								points: "50,2 98,50 50,98 2,50",
								fill: fillValue,
								stroke,
								strokeWidth,
								strokeLinejoin: "round",
								strokeLinecap: "round"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 text-center min-h-[1.2em]",
					children: isEditingLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: label,
						onChange: (e) => updateNodeData(id, { label: e.target.value }),
						onBlur: () => {
							setIsEditingLabel(false);
							updateNodeDataWithHistory(id, { label });
						},
						onKeyDown: (e) => {
							if (e.key === "Enter") e.currentTarget.blur();
							if (e.key === "Escape") setIsEditingLabel(false);
						},
						autoFocus: true,
						placeholder: "Label",
						className: "w-full max-w-[200px] mx-auto bg-transparent text-center text-sm font-medium text-foreground outline-none focus:ring-0"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						onDoubleClick: () => setIsEditingLabel(true),
						className: "text-sm font-medium text-foreground cursor-pointer select-none",
						children: label || (selected ? "Double-click to add label" : "")
					})
				})
			]
		})]
	});
}
var ShapeNode_default = (0, import_react.memo)(ShapeNode);
var Popover = Root2;
var PopoverTrigger = Trigger;
var PopoverContent = import_react.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	align,
	sideOffset,
	className: cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)", className),
	...props
}) }));
PopoverContent.displayName = Content2.displayName;
var OBJECT_PALETTE = [
	{
		name: "Neutral",
		value: "transparent",
		display: "var(--card)"
	},
	{
		name: "Sand",
		value: "var(--sut-highlight-sand)",
		display: "var(--sut-highlight-sand)"
	},
	{
		name: "Clay",
		value: "#a0522d",
		display: "#a0522d"
	},
	{
		name: "Rose",
		value: "#be123c",
		display: "#be123c"
	},
	{
		name: "Sage",
		value: "#15803d",
		display: "#15803d"
	},
	{
		name: "Sky",
		value: "#0284c7",
		display: "#0284c7"
	},
	{
		name: "Lavender",
		value: "#7c3aed",
		display: "#7c3aed"
	}
];
var PALETTES = {
	object: OBJECT_PALETTE,
	text: [
		{
			name: "Default",
			value: "",
			display: "linear-gradient(90deg, #0f172a, #7c3aed)"
		},
		{
			name: "Muted",
			value: "#6b7280",
			display: "#6b7280"
		},
		{
			name: "Clay",
			value: "#78350f",
			display: "#78350f"
		},
		{
			name: "Rose",
			value: "#be123c",
			display: "#be123c"
		},
		{
			name: "Sage",
			value: "#15803d",
			display: "#15803d"
		},
		{
			name: "Sky",
			value: "#0284c7",
			display: "#0284c7"
		},
		{
			name: "Lavender",
			value: "#7c3aed",
			display: "#7c3aed"
		}
	],
	highlight: [
		{
			name: "Sand",
			value: "var(--sut-highlight-sand)",
			display: "var(--sut-highlight-sand)"
		},
		{
			name: "Apricot",
			value: "var(--sut-highlight-apricot)",
			display: "var(--sut-highlight-apricot)"
		},
		{
			name: "Rose",
			value: "var(--sut-highlight-rose)",
			display: "var(--sut-highlight-rose)"
		},
		{
			name: "Sage",
			value: "var(--sut-highlight-sage)",
			display: "var(--sut-highlight-sage)"
		},
		{
			name: "Sky",
			value: "var(--sut-highlight-sky)",
			display: "var(--sut-highlight-sky)"
		},
		{
			name: "Lavender",
			value: "var(--sut-highlight-lavender)",
			display: "var(--sut-highlight-lavender)"
		}
	]
};
function getRecentColors() {
	try {
		const raw = localStorage.getItem("sutonote:recent-colors");
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
function pushRecentColor(color) {
	if (!color || color.startsWith("var(")) return;
	try {
		const recent = getRecentColors().filter((c) => c !== color);
		recent.unshift(color);
		localStorage.setItem("sutonote:recent-colors", JSON.stringify(recent.slice(0, 8)));
	} catch {}
}
function SutonoteColorPicker({ value, onChange, palette = "object", allowCustom = true, triggerClassName, align = "start" }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [hex, setHex] = (0, import_react.useState)(value.startsWith("#") ? value : "#6366f1");
	const [recent, setRecent] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (open) setRecent(getRecentColors());
	}, [open]);
	(0, import_react.useEffect)(() => {
		if (value.startsWith("#")) setHex(value);
	}, [value]);
	const options = PALETTES[palette] ?? OBJECT_PALETTE;
	const handleSelect = (color) => {
		onChange(color);
		if (color.startsWith("#")) pushRecentColor(color);
		setOpen(false);
	};
	const handleCustomChange = (newHex) => {
		setHex(newHex);
		if (/^#[0-9a-f]{6}$/i.test(newHex)) {
			onChange(newHex);
			pushRecentColor(newHex);
		}
	};
	const handleHexInput = (raw) => {
		const v = "#" + raw.replace(/[^0-9a-f]/gi, "").slice(0, 6);
		setHex(v);
		if (/^#[0-9a-f]{6}$/i.test(v)) {
			onChange(v);
			pushRecentColor(v);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: cn("flex h-7 w-7 items-center justify-center rounded-[5px] border border-border shadow-sm transition-colors hover:scale-105", triggerClassName),
				style: { background: value || "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)" },
				"aria-label": "Pick color",
				children: !value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pipette, { className: "h-3 w-3 text-white drop-shadow" })
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
			align,
			className: "w-[220px] p-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-1.5 text-[11px] font-medium text-muted-foreground",
						children: "Palette"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-7 gap-1.5",
						children: options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => handleSelect(opt.value),
							title: opt.name,
							className: cn("h-7 w-7 rounded-[5px] border border-border transition-all hover:scale-105", value === opt.value && "ring-2 ring-primary ring-offset-1"),
							style: { background: opt.display },
							children: value === opt.value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3 mx-auto text-white drop-shadow" })
						}, opt.name))
					})] }),
					recent.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-1.5 text-[11px] font-medium text-muted-foreground",
						children: "Recent"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-1.5 flex-wrap",
						children: recent.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => handleSelect(c),
							title: c,
							className: cn("h-6 w-6 rounded-[5px] border border-border transition-all hover:scale-105", value === c && "ring-2 ring-primary ring-offset-1"),
							style: { background: c }
						}, c))
					})] }),
					allowCustom && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-1.5 text-[11px] font-medium text-muted-foreground",
						children: "Custom"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative h-8 w-8 shrink-0 overflow-hidden rounded-[5px] border border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "color",
								value: hex,
								onChange: (e) => handleCustomChange(e.target.value),
								className: "absolute inset-0 h-[150%] w-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-0 p-0"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-1 items-center gap-1 rounded-[5px] border border-border bg-surface px-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[12px] text-muted-foreground",
								children: "#"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: hex.replace("#", ""),
								onChange: (e) => handleHexInput(e.target.value),
								className: "flex-1 bg-transparent text-[12px] font-mono text-foreground outline-none",
								maxLength: 6,
								placeholder: "6366f1"
							})]
						})]
					})] })
				]
			})
		})]
	});
}
function ColorSwatchNode(props) {
	const { id, data, selected } = props;
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const reduce = useReducedMotion();
	const rotation = data.rotation ?? 0;
	const color = data.color ?? "#6366f1";
	const label = data.label ?? "";
	const [hex, setHex] = (0, import_react.useState)(color);
	(0, import_react.useEffect)(() => {
		setHex(color);
	}, [color]);
	const copyToClipboard = () => {
		navigator.clipboard.writeText(hex);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, { ...props }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .9,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 15
			},
			className: `relative w-full select-none rounded-[7px] border transition-shadow bg-card ${selected ? "border-border-strong shadow-[0_4px_16px_rgba(0,0,0,0.06)]" : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]"}`,
			style: {
				transform: `rotate(${rotation}deg)`,
				transformOrigin: "center",
				padding: "16px",
				minHeight: 120
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative w-full aspect-square max-w-[160px] rounded-lg border border-border overflow-hidden bg-white",
						style: { backgroundColor: color }
					}),
					label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-full max-w-[160px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: label,
							onChange: (e) => updateNodeData(id, { label: e.target.value }),
							onBlur: () => updateNodeDataWithHistory(id, { label }),
							placeholder: "Color name",
							className: "w-full text-center text-sm font-medium text-foreground bg-transparent outline-none focus:ring-0 placeholder:text-muted-foreground/50"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-center gap-2 flex-wrap",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SutonoteColorPicker, {
								value: color,
								onChange: (c) => {
									setHex(c);
									updateNodeDataWithHistory(id, { color: c });
								},
								palette: "object"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm text-muted-foreground",
								children: "Pick"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: copyToClipboard,
								className: "flex items-center gap-1.5 rounded-lg border border-border bg-popover px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover",
								title: "Copy hex",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-3.5 w-3.5" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-center gap-1 text-[12px] font-mono text-muted-foreground/70",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: hex.toUpperCase() }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: copyToClipboard,
							className: "hover:text-foreground transition-colors",
							title: "Copy hex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-3 w-3" })
						})]
					})
				]
			})]
		})]
	});
}
var ColorSwatchNode_default = (0, import_react.memo)(ColorSwatchNode);
function BoardNode(props) {
	const { id, data, selected } = props;
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const reduce = useReducedMotion();
	const rotation = data.rotation ?? 0;
	const title = data.title ?? "Untitled Board";
	const itemCount = data.itemCount ?? 0;
	const targetBoardId = data.targetBoardId ?? "";
	const [isEditing, setIsEditing] = (0, import_react.useState)(false);
	const handleDoubleClick = () => {
		setIsEditing(true);
	};
	const handleTitleBlur = () => {
		setIsEditing(false);
		updateNodeDataWithHistory(id, { title });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, { ...props }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .9,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 15
			},
			className: `relative w-full select-none rounded-[7px] border transition-shadow ${data.backgroundColor || "bg-card"} ${selected ? "border-border-strong shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"}`,
			style: {
				transform: `rotate(${rotation}deg)`,
				transformOrigin: "center",
				padding: "16px",
				minHeight: 100,
				cursor: "pointer"
			},
			onDoubleClick: handleDoubleClick,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-5 w-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [isEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: title,
							onChange: (e) => updateNodeData(id, { title: e.target.value }),
							onBlur: handleTitleBlur,
							onKeyDown: (e) => {
								if (e.key === "Enter") e.currentTarget.blur();
								if (e.key === "Escape") setIsEditing(false);
							},
							autoFocus: true,
							className: "w-full text-lg font-semibold text-foreground bg-transparent outline-none focus:ring-0"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-lg font-semibold text-foreground truncate",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 flex items-center gap-2 text-sm text-muted-foreground/70",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-3.5 w-3.5" }),
									itemCount,
									" item",
									itemCount !== 1 ? "s" : ""
								]
							}), targetBoardId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5" }), "Board link"]
							})]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 pt-4 border-t border-border/50 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] text-muted-foreground/50",
						children: "Experimental • navigation soon"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: (e) => {
							e.stopPropagation();
							setIsEditing(true);
						},
						className: "flex items-center gap-1.5 rounded-[5px] border border-border bg-popover px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, { className: "h-3.5 w-3.5" }), "Rename"]
					})]
				})
			]
		})]
	});
}
var BoardNode_default = (0, import_react.memo)(BoardNode);
/** Icon choices for folder items. `id` is what gets persisted in node data. */
var FOLDER_ICONS = [
	{
		id: "folder",
		label: "Folder",
		icon: Folder
	},
	{
		id: "folder-open",
		label: "Open folder",
		icon: FolderOpen
	},
	{
		id: "star",
		label: "Star",
		icon: Star
	},
	{
		id: "heart",
		label: "Heart",
		icon: Heart
	},
	{
		id: "briefcase",
		label: "Work",
		icon: Briefcase
	},
	{
		id: "palette",
		label: "Design",
		icon: Palette
	},
	{
		id: "image",
		label: "Images",
		icon: Image
	},
	{
		id: "camera",
		label: "Photos",
		icon: Camera
	},
	{
		id: "music",
		label: "Music",
		icon: Music
	},
	{
		id: "code",
		label: "Code",
		icon: Code
	},
	{
		id: "bookmark",
		label: "Bookmark",
		icon: Bookmark
	},
	{
		id: "rocket",
		label: "Launch",
		icon: Rocket
	},
	{
		id: "lightbulb",
		label: "Ideas",
		icon: Lightbulb
	},
	{
		id: "book",
		label: "Reading",
		icon: BookOpen
	},
	{
		id: "archive",
		label: "Archive",
		icon: Archive
	},
	{
		id: "users",
		label: "Team",
		icon: Users
	}
];
function getFolderIcon(id) {
	return (FOLDER_ICONS.find((i) => i.id === id) ?? FOLDER_ICONS[0]).icon;
}
function FolderNode(props) {
	const { id, data, selected } = props;
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const reduce = useReducedMotion();
	const rotation = data.rotation ?? 0;
	const title = data.title ?? "Untitled Folder";
	const itemCount = data.itemCount ?? 0;
	const iconColor = data.iconColor || "";
	const Icon = getFolderIcon(data.icon ?? "folder");
	const [isEditing, setIsEditing] = (0, import_react.useState)(false);
	const handleTitleBlur = () => {
		setIsEditing(false);
		updateNodeDataWithHistory(id, { title });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, { ...props }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .9,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 15
			},
			className: `relative w-full select-none rounded-[7px] border transition-shadow ${data.backgroundColor || "bg-card"} ${selected ? "border-border-strong shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"}`,
			style: {
				transform: `rotate(${rotation}deg)`,
				transformOrigin: "center",
				padding: "16px",
				minHeight: 100,
				cursor: "pointer"
			},
			onDoubleClick: () => setIsEditing(true),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
						style: iconColor ? {
							backgroundColor: `${iconColor}1f`,
							color: iconColor
						} : void 0,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "h-5 w-5",
							strokeWidth: 1.75
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [isEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: title,
							onChange: (e) => updateNodeData(id, { title: e.target.value }),
							onBlur: handleTitleBlur,
							onKeyDown: (e) => {
								if (e.key === "Enter") e.currentTarget.blur();
								if (e.key === "Escape") setIsEditing(false);
							},
							autoFocus: true,
							className: "w-full bg-transparent text-lg font-semibold text-foreground outline-none focus:ring-0"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "truncate text-lg font-semibold text-foreground",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted-foreground/70",
							children: [
								itemCount,
								" item",
								itemCount !== 1 ? "s" : ""
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex items-center justify-between border-t border-border/50 pt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] text-muted-foreground/50",
						children: "Folder"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: (e) => {
							e.stopPropagation();
							setIsEditing(true);
						},
						className: "flex items-center gap-1.5 rounded-[5px] border border-border bg-popover px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, { className: "h-3.5 w-3.5" }), "Rename"]
					})]
				})
			]
		})]
	});
}
var FolderNode_default = (0, import_react.memo)(FolderNode);
function ColumnNode(props) {
	const { id, data, selected } = props;
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const allNodes = useCanvasStore((s) => s.nodes);
	const reduce = useReducedMotion();
	const rotation = data.rotation ?? 0;
	const title = data.title ?? "Column";
	const collapsed = data.collapsed ?? false;
	const opacity = data.opacity ?? 100;
	const [isEditingTitle, setIsEditingTitle] = (0, import_react.useState)(false);
	const children = (0, import_react.useMemo)(() => {
		const order = data.childOrder ?? [];
		return allNodes.filter((n) => n.data.parentId === id).sort((a, b) => {
			const aIndex = order.indexOf(a.id);
			const bIndex = order.indexOf(b.id);
			return (aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex);
		});
	}, [
		allNodes,
		data.childOrder,
		id
	]);
	const handleTitleBlur = () => {
		setIsEditingTitle(false);
		updateNodeDataWithHistory(id, { title });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, { ...props }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .9,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 15
			},
			className: `relative w-full select-none rounded-[7px] border transition-shadow ${selected ? "border-primary/40 shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "border-border/70 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"}`,
			style: {
				transform: `rotate(${rotation}deg)`,
				transformOrigin: "center",
				padding: "12px",
				minHeight: 120,
				background: data.backgroundColor || "var(--surface)",
				opacity: opacity / 100
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [
						isEditingTitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: title,
							onChange: (e) => updateNodeData(id, { title: e.target.value }),
							onBlur: handleTitleBlur,
							onKeyDown: (e) => {
								if (e.key === "Enter") e.currentTarget.blur();
								if (e.key === "Escape") setIsEditingTitle(false);
							},
							autoFocus: true,
							className: "flex-1 bg-transparent text-sm font-semibold text-foreground outline-none"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							onDoubleClick: () => setIsEditingTitle(true),
							className: "flex-1 truncate text-sm font-semibold text-foreground cursor-pointer select-none",
							children: title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 text-xs tabular-nums text-muted-foreground/60",
							children: children.length
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => updateNodeDataWithHistory(id, { collapsed: !collapsed }),
							className: "ml-1 flex h-6 w-6 items-center justify-center rounded-[5px] hover:bg-surface-hover text-muted-foreground",
							"aria-label": collapsed ? "Expand" : "Collapse",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `h-3.5 w-3.5 transition-transform ${collapsed ? "-rotate-90" : ""}` })
						})
					]
				}), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-h-[76px] flex-col border-t border-border/50 pt-2",
					style: {
						gap: Number(data.gap ?? 10),
						padding: Number(data.padding ?? 0)
					},
					children: [children.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-6 text-center text-xs text-muted-foreground/50",
						children: "Drop items here"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-center text-[10px] text-muted-foreground/40",
						children: [
							children.length,
							" ",
							children.length === 1 ? "item" : "items",
							" · drag cards to reorder"
						]
					})]
				})]
			})]
		})]
	});
}
var ColumnNode_default = (0, import_react.memo)(ColumnNode);
function FrameNode(props) {
	const { id, data, selected } = props;
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const reduce = useReducedMotion();
	const rotation = data.rotation ?? 0;
	const title = data.title ?? "";
	const showTitle = data.showTitle ?? true;
	const opacity = data.opacity ?? 100;
	const allNodes = useCanvasStore((s) => s.nodes);
	const children = (0, import_react.useMemo)(() => allNodes.filter((n) => n.data.parentId === id), [allNodes, id]);
	const [isEditingTitle, setIsEditingTitle] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, { ...props }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .9,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 15
			},
			className: `relative w-full select-none rounded-[6px] border transition-shadow ${selected ? "border-primary/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)]" : "border-border/60 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"}`,
			style: {
				transform: `rotate(${rotation}deg)`,
				transformOrigin: "center",
				padding: "16px",
				minHeight: 120,
				minWidth: 200,
				background: data.backgroundColor || "transparent",
				opacity: opacity / 100
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}),
				showTitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 w-auto",
					children: isEditingTitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: title,
						onChange: (e) => updateNodeData(id, { title: e.target.value }),
						onBlur: () => {
							setIsEditingTitle(false);
							updateNodeDataWithHistory(id, { title });
						},
						onKeyDown: (e) => {
							if (e.key === "Enter") e.currentTarget.blur();
							if (e.key === "Escape") setIsEditingTitle(false);
						},
						autoFocus: true,
						className: "bg-card px-2 py-1 rounded text-sm font-medium text-foreground outline-none focus:ring-0"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						onDoubleClick: () => setIsEditingTitle(true),
						className: "bg-card px-2 py-1 rounded text-sm font-medium text-foreground cursor-pointer select-none",
						children: title || "Frame"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute bottom-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[10px] text-muted-foreground/60",
						children: [children.length, " items"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-1.5 text-[11px] text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: showTitle,
							onChange: (e) => updateNodeDataWithHistory(id, { showTitle: e.target.checked }),
							className: "h-3 w-3 rounded border-border"
						}), "Title"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-full min-h-[80px]" })
			]
		})]
	});
}
var FrameNode_default = (0, import_react.memo)(FrameNode);
function PDFNode(props) {
	const { id, data, selected } = props;
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const openPreview = useDocumentPreviewStore((s) => s.open);
	const reduce = useReducedMotion();
	const rotation = data.rotation ?? 0;
	const opacity = data.opacity ?? 100;
	const fileRef = (0, import_react.useRef)(null);
	const [url, setUrl] = (0, import_react.useState)("");
	const [pageCount, setPageCount] = (0, import_react.useState)(null);
	const assetId = data.assetId ?? "";
	const remoteUrl = data.remoteUrl ?? "";
	const sourceType = data.sourceType ?? "local";
	const caption = data.caption ?? "";
	const filename = data.filename ?? "";
	(0, import_react.useEffect)(() => {
		let active = true;
		if (assetId) getAssetUrl(assetId).then((u) => {
			if (active && u) setUrl(u);
		});
		else if (remoteUrl) setUrl(remoteUrl);
		else setUrl("");
		return () => {
			active = false;
		};
	}, [assetId, remoteUrl]);
	const handleAssetId = (0, import_react.useCallback)(async (newAssetId, newFilename, mime) => {
		updateNodeDataWithHistory(id, {
			assetId: newAssetId,
			sourceType: "local",
			remoteUrl: "",
			filename: newFilename,
			caption: newFilename
		});
		const u = await getAssetUrl(newAssetId);
		if (u) setUrl(u);
	}, [id, updateNodeDataWithHistory]);
	const handleRemoteUrl = (0, import_react.useCallback)((newRemoteUrl) => {
		updateNodeDataWithHistory(id, {
			remoteUrl: newRemoteUrl,
			sourceType: "remote",
			assetId: ""
		});
		setUrl(newRemoteUrl);
	}, [id, updateNodeDataWithHistory]);
	const handleReplace = (0, import_react.useCallback)(async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (assetId) {
			const newId = await storeImageAsset(file, file.name);
			updateNodeDataWithHistory(id, {
				assetId: newId,
				sourceType: "local",
				remoteUrl: "",
				filename: file.name
			});
		} else {
			const newId = await storeImageAsset(file, file.name);
			updateNodeDataWithHistory(id, {
				assetId: newId,
				sourceType: "local",
				remoteUrl: "",
				filename: file.name
			});
		}
		e.target.value = "";
	}, [
		assetId,
		id,
		updateNodeDataWithHistory
	]);
	const handleRemove = (0, import_react.useCallback)(() => {
		updateNodeDataWithHistory(id, {
			assetId: "",
			remoteUrl: "",
			sourceType: "local",
			filename: "",
			caption: ""
		});
		setUrl("");
	}, [id, updateNodeDataWithHistory]);
	const showEmpty = !assetId && !remoteUrl;
	const isRemote = sourceType === "remote" && remoteUrl;
	const hasPreview = !!url;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, { ...props }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .9,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 15
			},
			className: `relative w-full select-none overflow-hidden rounded-[7px] border transition-shadow ${data.backgroundColor || ""} ${selected ? "border-border-strong shadow-[0_4px_16px_rgba(0,0,0,0.06)]" : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"}`,
			onDoubleClick: (event) => {
				event.stopPropagation();
				if (!showEmpty) openPreview(id);
			},
			style: {
				transform: `rotate(${rotation}deg)`,
				transformOrigin: "center",
				opacity: opacity / 100,
				maxWidth: 320
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}), showEmpty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyAssetState, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
					className: "h-6 w-6",
					strokeWidth: 1.5
				}),
				title: "Add a PDF",
				browseLabel: "Browse",
				linkLabel: "Add link",
				accept: "application/pdf",
				onAssetId: handleAssetId,
				onRemoteUrl: handleRemoteUrl,
				onCancel: handleRemove
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: fileRef,
					type: "file",
					accept: "application/pdf",
					className: "hidden",
					onChange: handleReplace
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative aspect-[4/3] bg-muted/30 flex items-center justify-center",
					children: [
						hasPreview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
							src: url,
							className: "w-full h-full border-0",
							title: filename || "PDF preview",
							sandbox: "allow-scripts allow-same-origin"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-16 w-16 text-muted-foreground/30" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: (e) => {
								e.stopPropagation();
								fileRef.current?.click();
							},
							className: "absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-popover/90 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity",
							style: { opacity: selected ? 1 : void 0 },
							"aria-label": "Replace PDF",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Replace, { className: "h-4 w-4" })
						}),
						(assetId || isRemote) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: handleRemove,
							className: "absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-popover/90 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity",
							style: { opacity: selected ? 1 : void 0 },
							"aria-label": "Remove PDF",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-card px-4 py-3 border-t border-border/50",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: caption,
						onChange: (e) => updateNodeData(id, { caption: e.target.value }),
						onBlur: () => updateNodeDataWithHistory(id, { caption }),
						placeholder: "Add a caption...",
						className: "w-full bg-transparent text-[13px] text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50",
						"aria-label": "Caption"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [assetId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									getAssetUrl(assetId).then((u) => {
										if (u) {
											const a = document.createElement("a");
											a.href = u;
											a.download = filename || "document.pdf";
											a.click();
										}
									});
								},
								className: "flex items-center gap-1.5 rounded-md border border-border bg-popover px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-surface-hover",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3 w-3" }), "Download"]
							}), isRemote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: remoteUrl,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "flex items-center gap-1.5 rounded-md border border-border bg-popover px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-surface-hover",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" }), "Open"]
							})]
						}), pageCount && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[11px] text-muted-foreground/60",
							children: [pageCount, " pages"]
						})]
					})]
				})
			] })]
		})]
	});
}
var PDFNode_default = (0, import_react.memo)(PDFNode);
function heavyPhase(visible, interactive) {
	if (interactive && visible) return "interactive";
	return visible ? "visible" : "idle";
}
function useHeavyNode() {
	const ref = (0, import_react.useRef)(null);
	const [visible, setVisible] = (0, import_react.useState)(false);
	const [interactive, setInteractive] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el || typeof IntersectionObserver === "undefined") {
			setVisible(true);
			return;
		}
		const io = new IntersectionObserver((entries) => {
			for (const entry of entries) setVisible(entry.isIntersecting);
		}, { rootMargin: "300px" });
		io.observe(el);
		return () => io.disconnect();
	}, []);
	(0, import_react.useEffect)(() => {
		if (!visible && interactive) setInteractive(false);
	}, [visible, interactive]);
	(0, import_react.useEffect)(() => {
		if (!interactive) return;
		const onKey = (e) => {
			if (e.key === "Escape") setInteractive(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [interactive]);
	const activate = (0, import_react.useCallback)(() => setInteractive(true), []);
	const deactivate = (0, import_react.useCallback)(() => setInteractive(false), []);
	return {
		ref,
		phase: heavyPhase(visible, interactive),
		activate,
		deactivate
	};
}
function VideoNode(props) {
	const { id, data, selected } = props;
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const reduce = useReducedMotion();
	const rotation = data.rotation ?? 0;
	const opacity = data.opacity ?? 100;
	const fileRef = (0, import_react.useRef)(null);
	const [url, setUrl] = (0, import_react.useState)("");
	const { ref: heavyRef, phase, activate, deactivate } = useHeavyNode();
	const assetId = data.assetId ?? "";
	const remoteUrl = data.remoteUrl ?? "";
	const sourceType = data.sourceType ?? "local";
	const caption = data.caption ?? "";
	const filename = data.filename ?? "";
	(0, import_react.useEffect)(() => {
		let active = true;
		if (phase === "idle") return;
		if (assetId) getAssetUrl(assetId).then((u) => {
			if (active && u) setUrl(u);
		});
		else if (remoteUrl) setUrl(remoteUrl);
		else setUrl("");
		return () => {
			active = false;
		};
	}, [
		assetId,
		remoteUrl,
		phase
	]);
	const handleAssetId = (0, import_react.useCallback)(async (newAssetId, newFilename, mime) => {
		updateNodeDataWithHistory(id, {
			assetId: newAssetId,
			sourceType: "local",
			remoteUrl: "",
			filename: newFilename,
			caption: newFilename
		});
		const u = await getAssetUrl(newAssetId);
		if (u) setUrl(u);
	}, [id, updateNodeDataWithHistory]);
	const handleRemoteUrl = (0, import_react.useCallback)((newRemoteUrl) => {
		updateNodeDataWithHistory(id, {
			remoteUrl: newRemoteUrl,
			sourceType: "remote",
			assetId: ""
		});
		setUrl(newRemoteUrl);
	}, [id, updateNodeDataWithHistory]);
	const handleReplace = (0, import_react.useCallback)(async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (assetId) {
			const newId = await storeImageAsset(file, file.name);
			updateNodeDataWithHistory(id, {
				assetId: newId,
				sourceType: "local",
				remoteUrl: "",
				filename: file.name
			});
		} else {
			const newId = await storeImageAsset(file, file.name);
			updateNodeDataWithHistory(id, {
				assetId: newId,
				sourceType: "local",
				remoteUrl: "",
				filename: file.name
			});
		}
		e.target.value = "";
	}, [
		assetId,
		id,
		updateNodeDataWithHistory
	]);
	const handleRemove = (0, import_react.useCallback)(() => {
		updateNodeDataWithHistory(id, {
			assetId: "",
			remoteUrl: "",
			sourceType: "local",
			filename: "",
			caption: ""
		});
		setUrl("");
	}, [id, updateNodeDataWithHistory]);
	const showEmpty = !assetId && !remoteUrl;
	const isRemote = sourceType === "remote" && remoteUrl;
	const hasPreview = !!url;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, { ...props }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .9,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 15
			},
			className: `relative w-full select-none overflow-hidden rounded-[7px] border transition-shadow ${data.backgroundColor || ""} ${selected ? "border-border-strong shadow-[0_4px_16px_rgba(0,0,0,0.06)]" : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"}`,
			style: {
				transform: `rotate(${rotation}deg)`,
				transformOrigin: "center",
				opacity: opacity / 100,
				maxWidth: 400
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}),
				showEmpty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyAssetState, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, {
						className: "h-6 w-6",
						strokeWidth: 1.5
					}),
					title: "Add a video",
					browseLabel: "Browse",
					linkLabel: "Add link",
					accept: "video/*",
					onAssetId: handleAssetId,
					onRemoteUrl: handleRemoteUrl,
					onCancel: handleRemove
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileRef,
						type: "file",
						accept: "video/*",
						className: "hidden",
						onChange: handleReplace
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						ref: heavyRef,
						className: "relative aspect-video bg-black",
						children: [
							hasPreview && phase === "interactive" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
								src: url,
								controls: true,
								autoPlay: true,
								className: "w-full h-full object-contain"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: deactivate,
								className: "absolute bottom-2 right-2 rounded-md border border-border bg-popover/90 px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-surface-hover",
								"aria-label": "Unload video player",
								children: "Esc to unload"
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: hasPreview ? activate : void 0,
								className: "group/poster h-full w-full flex items-center justify-center",
								"aria-label": hasPreview ? "Play video" : "No video",
								children: hasPreview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "h-16 w-16 rounded-full bg-black/50 flex items-center justify-center transition-transform group-hover/poster:scale-105",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-8 w-8 text-white ml-1" })
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "h-16 w-16 text-muted-foreground/30" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: (e) => {
									e.stopPropagation();
									fileRef.current?.click();
								},
								className: "absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-popover/90 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity",
								style: { opacity: selected ? 1 : void 0 },
								"aria-label": "Replace video",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Replace, { className: "h-4 w-4" })
							}),
							(assetId || isRemote) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: handleRemove,
								className: "absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-popover/90 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity",
								style: { opacity: selected ? 1 : void 0 },
								"aria-label": "Remove video",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-card px-4 py-3 border-t border-border/50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: caption,
							onChange: (e) => updateNodeData(id, { caption: e.target.value }),
							onBlur: () => updateNodeDataWithHistory(id, { caption }),
							placeholder: "Add a caption...",
							className: "w-full bg-transparent text-[13px] text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50",
							"aria-label": "Caption"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex items-center justify-between",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [assetId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										getAssetUrl(assetId).then((u) => {
											if (u) {
												const a = document.createElement("a");
												a.href = u;
												a.download = filename || "video";
												a.click();
											}
										});
									},
									className: "flex items-center gap-1.5 rounded-md border border-border bg-popover px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-surface-hover",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3 w-3" }), "Download"]
								}), isRemote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: remoteUrl,
									target: "_blank",
									rel: "noopener noreferrer",
									className: "flex items-center gap-1.5 rounded-md border border-border bg-popover px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-surface-hover",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" }), "Open"]
								})]
							})
						})]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: fileRef,
					type: "file",
					accept: "video/*",
					className: "hidden",
					onChange: handleReplace
				})
			]
		})]
	});
}
var VideoNode_default = (0, import_react.memo)(VideoNode);
function EmbedNode(props) {
	const { id, data, selected } = props;
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const reduce = useReducedMotion();
	const rotation = data.rotation ?? 0;
	const opacity = data.opacity ?? 100;
	const { ref: heavyRef, phase, activate, deactivate } = useHeavyNode();
	const remoteUrl = data.remoteUrl ?? "";
	const caption = data.caption ?? "";
	const [url, setUrl] = (0, import_react.useState)(remoteUrl);
	(0, import_react.useEffect)(() => {
		setUrl(remoteUrl);
	}, [remoteUrl]);
	const handleRemoteUrl = (0, import_react.useCallback)((newRemoteUrl) => {
		updateNodeDataWithHistory(id, { remoteUrl: newRemoteUrl });
		setUrl(newRemoteUrl);
	}, [id, updateNodeDataWithHistory]);
	const handleRemove = (0, import_react.useCallback)(() => {
		updateNodeDataWithHistory(id, {
			remoteUrl: "",
			caption: ""
		});
		setUrl("");
	}, [id, updateNodeDataWithHistory]);
	const showEmpty = !remoteUrl;
	const hasPreview = !!remoteUrl;
	const getDomain = (url) => {
		try {
			return new URL(url).hostname.replace("www.", "");
		} catch {
			return url;
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, { ...props }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .9,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 15
			},
			className: `relative w-full select-none overflow-hidden rounded-[7px] border transition-shadow ${data.backgroundColor || ""} ${selected ? "border-border-strong shadow-[0_4px_16px_rgba(0,0,0,0.06)]" : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"}`,
			style: {
				transform: `rotate(${rotation}deg)`,
				transformOrigin: "center",
				opacity: opacity / 100,
				maxWidth: 480
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}), showEmpty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyAssetState, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, {
					className: "h-6 w-6",
					strokeWidth: 1.5
				}),
				title: "Add an embed",
				browseLabel: "Browse",
				linkLabel: "Add link",
				accept: "",
				onAssetId: () => {},
				onRemoteUrl: handleRemoteUrl,
				onCancel: handleRemove
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: heavyRef,
				className: "relative aspect-video bg-muted/30 flex items-center justify-center",
				children: [
					hasPreview && phase === "interactive" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
						src: url,
						className: "w-full h-full border-0",
						title: "Embedded content",
						sandbox: "allow-scripts allow-same-origin allow-forms allow-popups",
						loading: "lazy"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: activate,
						className: "group/poster flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground transition-colors hover:bg-muted/50",
						"aria-label": `Load embed from ${getDomain(url)}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-popover shadow-sm transition-transform group-hover/poster:scale-105",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
								className: "ml-0.5 h-4 w-4",
								strokeWidth: 1.75
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px]",
							children: getDomain(url)
						})]
					}),
					phase === "interactive" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: deactivate,
						className: "absolute bottom-2 right-2 rounded-md border border-border bg-popover/90 px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-surface-hover",
						"aria-label": "Unload embed",
						children: "Esc to unload"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleRemove,
						className: "absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-popover/90 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity",
						style: { opacity: selected ? 1 : void 0 },
						"aria-label": "Remove embed",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card px-4 py-3 border-t border-border/50",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: caption,
					onChange: (e) => updateNodeData(id, { caption: e.target.value }),
					onBlur: () => updateNodeDataWithHistory(id, { caption }),
					placeholder: "Add a caption...",
					className: "w-full bg-transparent text-[13px] text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50",
					"aria-label": "Caption"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 text-[11px] text-muted-foreground/60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: getDomain(url) })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: url,
						target: "_blank",
						rel: "noopener noreferrer",
						className: "flex items-center gap-1.5 rounded-md border border-border bg-popover px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-surface-hover",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" }), "Open"]
					})]
				})]
			})] })]
		})]
	});
}
var EmbedNode_default = (0, import_react.memo)(EmbedNode);
var LANGUAGES = [
	{
		value: "plaintext",
		label: "Plain Text"
	},
	{
		value: "javascript",
		label: "JavaScript"
	},
	{
		value: "typescript",
		label: "TypeScript"
	},
	{
		value: "html",
		label: "HTML"
	},
	{
		value: "css",
		label: "CSS"
	},
	{
		value: "json",
		label: "JSON"
	},
	{
		value: "python",
		label: "Python"
	},
	{
		value: "sql",
		label: "SQL"
	},
	{
		value: "bash",
		label: "Bash"
	},
	{
		value: "rust",
		label: "Rust"
	},
	{
		value: "go",
		label: "Go"
	},
	{
		value: "jsx",
		label: "JSX"
	},
	{
		value: "tsx",
		label: "TSX"
	},
	{
		value: "markdown",
		label: "Markdown"
	},
	{
		value: "yaml",
		label: "YAML"
	},
	{
		value: "dockerfile",
		label: "Dockerfile"
	}
];
function CodeBlockNode(props) {
	const { id, data, selected } = props;
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const { editingNodeId, setEditingNode } = useInteractionStore();
	const isEditing = editingNodeId === id;
	const reduce = useReducedMotion();
	const rotation = data.rotation ?? 0;
	const code = data.code ?? "";
	const language = data.language ?? "plaintext";
	const showLineNumbers = data.showLineNumbers ?? true;
	const wrap = data.wrap ?? false;
	const [copied, setCopied] = (0, import_react.useState)(false);
	const copyToClipboard = () => {
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2e3);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, { ...props }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .9,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 15
			},
			className: `relative w-full select-none rounded-[7px] border transition-shadow bg-card ${selected ? "border-border-strong shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"}`,
			style: {
				transform: `rotate(${rotation}deg)`,
				transformOrigin: "center",
				padding: "0",
				minHeight: 160,
				maxWidth: 600
			},
			onDoubleClick: () => {
				if (!isEditing) setEditingNode(id, "body");
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border/50 px-3 py-2 bg-muted/30 rounded-t-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCode, { className: "h-4 w-4 text-muted-foreground" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: language,
								onChange: (e) => updateNodeDataWithHistory(id, { language: e.target.value }),
								className: "rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-foreground outline-none focus:ring-0",
								children: LANGUAGES.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: l.value,
									children: l.label
								}, l.value))
							}),
							code && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[10px] text-muted-foreground/60 font-mono",
								children: [code.split("\n").length, " lines"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-1.5 text-[11px] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: showLineNumbers,
									onChange: (e) => updateNodeDataWithHistory(id, { showLineNumbers: e.target.checked }),
									className: "h-3 w-3 rounded border-border"
								}), "Line numbers"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-1.5 text-[11px] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: wrap,
									onChange: (e) => updateNodeDataWithHistory(id, { wrap: e.target.checked }),
									className: "h-3 w-3 rounded border-border"
								}), "Wrap"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: copyToClipboard,
								className: "flex items-center gap-1.5 rounded-lg border border-border bg-popover px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-surface-hover",
								title: "Copy code",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-3.5 w-3.5" }), copied ? "Copied!" : "Copy"]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `font-mono text-[12px] leading-relaxed p-3 overflow-x-auto ${wrap ? "whitespace-pre-wrap" : "whitespace-pre"}`,
					style: {
						maxHeight: 400,
						fontFamily: "\"JetBrains Mono\", \"Fira Code\", monospace"
					},
					children: [showLineNumbers && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute left-3 top-3 bottom-3 w-8 text-right text-[10px] text-muted-foreground/40 select-none pointer-events-none",
						children: code.split("\n").map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-5 flex items-end",
							children: i + 1
						}, i))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: showLineNumbers ? "pl-14" : "",
						style: { margin: 0 },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: code || "// Start coding..." })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-border/50 px-3 py-2 bg-muted/30 rounded-b-[7px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: code,
						onChange: (e) => updateNodeData(id, { code: e.target.value }),
						onFocus: () => setEditingNode(id, "body"),
						onBlur: (e) => {
							if (editingNodeId === id) setEditingNode(null);
							updateNodeDataWithHistory(id, { code: e.currentTarget.value });
						},
						onKeyDown: (e) => {
							if (e.key === "Escape") e.target.blur();
						},
						placeholder: "// Start coding...",
						className: `w-full min-h-[120px] font-mono text-[12px] leading-relaxed bg-transparent text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/40 resize-none ${isEditing ? "nodrag nowheel select-text cursor-text" : "cursor-default"}`,
						spellCheck: false,
						style: { fontFamily: "\"JetBrains Mono\", \"Fira Code\", monospace" },
						readOnly: !isEditing
					})
				})
			]
		})]
	});
}
var CodeBlockNode_default = (0, import_react.memo)(CodeBlockNode);
function SectionNode(props) {
	const { id, data, selected } = props;
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const { editingNodeId, setEditingNode } = useInteractionStore();
	const reduce = useReducedMotion();
	const allNodes = useCanvasStore((s) => s.nodes);
	const rotation = data.rotation ?? 0;
	const isEditing = editingNodeId === id;
	const [title, setTitle] = (0, import_react.useState)(data.title ?? "Section");
	const opacity = data.opacity ?? 100;
	const showTitle = data.showTitle ?? true;
	const childCount = allNodes.reduce((count, node) => count + (node.data.parentId === id ? 1 : 0), 0);
	(0, import_react.useEffect)(() => setTitle(data.title ?? "Section"), [data.title]);
	const handleTitleChange = (v) => {
		setTitle(v);
		updateNodeData(id, { title: v });
	};
	const handleTitleBlur = () => {
		updateNodeDataWithHistory(id, { title });
		if (isEditing) setEditingNode(null);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, { ...props }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .98,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 15
			},
			className: `relative w-full select-none border bg-surface/40 backdrop-blur-[0.5px] ${selected ? "border-primary/40" : "border-border/70"}`,
			style: {
				transform: `rotate(${rotation}deg)`,
				transformOrigin: "center",
				padding: "12px",
				minHeight: 120,
				borderRadius: "6px",
				opacity: opacity / 100,
				background: data.backgroundColor || "color-mix(in srgb, var(--surface) 70%, transparent)",
				borderColor: data.borderColor || void 0
			},
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}),
				showTitle && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [isEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: title,
						onChange: (e) => handleTitleChange(e.target.value),
						onBlur: handleTitleBlur,
						onKeyDown: (e) => {
							if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
						},
						autoFocus: true,
						className: "rounded bg-card px-2 py-0.5 text-xs font-medium text-foreground shadow-sm border border-border outline-none focus:ring-0"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						onDoubleClick: () => useInteractionStore.getState().setEditingNode(id, "title"),
						onClick: () => {
							const { selectedNodeIds } = useCanvasStore.getState();
							if (!selectedNodeIds.includes(id)) useCanvasStore.getState().setSelectedIds([id]);
						},
						className: "rounded bg-card px-2 py-0.5 text-xs font-medium text-foreground shadow-sm border border-border cursor-pointer select-none",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[10px] tabular-nums text-muted-foreground/60",
						children: [
							childCount,
							" ",
							childCount === 1 ? "item" : "items"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-full min-h-[100px]" })
			]
		})]
	});
}
var SectionNode_default = (0, import_react.memo)(SectionNode);
function AudioNode({ id, data, selected }) {
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const reduce = useReducedMotion();
	const fileRef = (0, import_react.useRef)(null);
	const audioRef = (0, import_react.useRef)(null);
	const [url, setUrl] = (0, import_react.useState)("");
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [duration, setDuration] = (0, import_react.useState)(0);
	const [currentTime, setCurrentTime] = (0, import_react.useState)(0);
	const { ref: heavyRef, phase } = useHeavyNode();
	const assetId = data.assetId ?? "";
	const remoteUrl = data.remoteUrl ?? "";
	const sourceType = data.sourceType ?? "local";
	const filename = data.filename ?? "Audio file";
	const caption = data.caption ?? "";
	const opacity = data.opacity ?? 100;
	(0, import_react.useEffect)(() => {
		let active = true;
		if (phase === "idle") return;
		if (assetId) getAssetUrl(assetId).then((next) => {
			if (active) setUrl(next ?? "");
		});
		else setUrl(remoteUrl);
		return () => {
			active = false;
		};
	}, [
		assetId,
		remoteUrl,
		phase
	]);
	const setLocalAsset = (0, import_react.useCallback)(async (file) => {
		const nextId = await storeAsset(file, file.name);
		updateNodeDataWithHistory(id, {
			assetId: nextId,
			remoteUrl: "",
			sourceType: "local",
			filename: file.name,
			caption: file.name
		});
		const nextUrl = await getAssetUrl(nextId);
		setUrl(nextUrl ?? "");
	}, [id, updateNodeDataWithHistory]);
	const handleFile = (0, import_react.useCallback)(async (event) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;
		await setLocalAsset(file);
	}, [setLocalAsset]);
	const handleRemoteUrl = (0, import_react.useCallback)((nextUrl) => {
		updateNodeDataWithHistory(id, {
			remoteUrl: nextUrl,
			assetId: "",
			sourceType: "remote",
			filename: nextUrl.split("/").pop() || "Audio link"
		});
		setUrl(nextUrl);
	}, [id, updateNodeDataWithHistory]);
	const removeAudio = (0, import_react.useCallback)(() => {
		audioRef.current?.pause();
		setPlaying(false);
		updateNodeDataWithHistory(id, {
			assetId: "",
			remoteUrl: "",
			sourceType: "local",
			filename: "",
			caption: ""
		});
		setUrl("");
	}, [id, updateNodeDataWithHistory]);
	const togglePlay = () => {
		const audio = audioRef.current;
		if (!audio || !url) return;
		if (audio.paused) audio.play();
		else audio.pause();
	};
	const formatTime = (seconds) => {
		if (!Number.isFinite(seconds)) return "0:00";
		return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, {
			id,
			type: "audio",
			selected
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .96,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: opacity / 100
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 18
			},
			className: `nodrag nowheel relative w-full overflow-hidden rounded-[8px] border bg-card transition-shadow ${selected ? "border-border-strong shadow-[0_4px_16px_rgba(0,0,0,0.08)]" : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]"}`,
			style: { transform: `rotate(${data.rotation ?? 0}deg)` },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}), !assetId && !remoteUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyAssetState, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudioLines, {
					className: "h-6 w-6",
					strokeWidth: 1.5
				}),
				title: "Add audio",
				accept: "audio/*",
				onAssetId: (nextId, name) => updateNodeDataWithHistory(id, {
					assetId: nextId,
					filename: name,
					caption: name,
					remoteUrl: "",
					sourceType: "local"
				}),
				onRemoteUrl: handleRemoteUrl,
				onCancel: removeAudio
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: heavyRef,
				className: "nodrag nowheel p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
						ref: audioRef,
						src: phase === "idle" ? void 0 : url,
						preload: "metadata",
						onLoadedMetadata: (event) => setDuration(event.currentTarget.duration),
						onTimeUpdate: (event) => setCurrentTime(event.currentTarget.currentTime),
						onPlay: () => setPlaying(true),
						onPause: () => setPlaying(false),
						onEnded: () => setPlaying(false),
						className: "hidden"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: !url || phase === "idle",
							onClick: togglePlay,
							className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50",
							"aria-label": playing ? "Pause audio" : "Play audio",
							children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-[13px] font-medium text-foreground",
								children: filename
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: 0,
									max: duration || 0,
									step: .1,
									value: Math.min(currentTime, duration || 0),
									onChange: (event) => {
										const next = Number(event.target.value);
										if (audioRef.current) audioRef.current.currentTime = next;
										setCurrentTime(next);
									},
									className: "min-w-0 flex-1 accent-primary",
									"aria-label": "Audio progress"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "w-16 text-right text-[10px] tabular-nums text-muted-foreground",
									children: [
										formatTime(currentTime),
										" / ",
										formatTime(duration)
									]
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: caption,
						onChange: (event) => updateNodeData(id, { caption: event.target.value }),
						onBlur: () => updateNodeDataWithHistory(id, { caption }),
						placeholder: "Add a caption...",
						className: "mt-2 w-full bg-transparent text-[12px] text-muted-foreground outline-none placeholder:text-muted-foreground/40",
						"aria-label": "Audio caption"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-center gap-1.5",
						children: [
							assetId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									getAssetUrl(assetId).then((nextUrl) => {
										if (!nextUrl) return;
										const anchor = document.createElement("a");
										anchor.href = nextUrl;
										anchor.download = filename || "audio";
										anchor.click();
									});
								},
								className: "flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground hover:bg-surface-hover",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3 w-3" }), " Download"]
							}),
							sourceType === "remote" && remoteUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: remoteUrl,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground hover:bg-surface-hover",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" }), " Open"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => fileRef.current?.click(),
								className: "ml-auto flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground hover:bg-surface-hover",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Replace, { className: "h-3 w-3" }), " Replace"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: removeAudio,
								className: "flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground",
								"aria-label": "Remove audio",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileRef,
						type: "file",
						accept: "audio/*",
						className: "hidden",
						onChange: handleFile
					})
				]
			})]
		})]
	});
}
var AudioNode_default = (0, import_react.memo)(AudioNode);
var useItemEditorStore = create((set) => ({
	active: null,
	open: (nodeId, type, mode = "window") => set({ active: {
		nodeId,
		type,
		mode
	} }),
	close: () => set({ active: null })
}));
function TableNode({ id, data, selected }) {
	const updateNodeData = useCanvasStore((s) => s.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const reduce = useReducedMotion();
	const persistedTable = (0, import_react.useMemo)(() => data.table ?? createDefaultTable(), [data.table]);
	const [draftTable, setDraftTable] = (0, import_react.useState)(persistedTable);
	(0, import_react.useEffect)(() => setDraftTable(persistedTable), [persistedTable]);
	const table = draftTable;
	const commitTable = (next, withHistory = false) => {
		setDraftTable(next);
		if (withHistory) updateNodeDataWithHistory(id, { table: next });
	};
	const updateCell = (rowIndex, columnIndex, value) => {
		setDraftTable(updateTableCell(table, rowIndex, columnIndex, value));
	};
	const updateColumn = (columnIndex, patch) => {
		const columns = table.columns.map((column, index) => index === columnIndex ? {
			...column,
			...patch
		} : column);
		setDraftTable({
			...table,
			columns
		});
	};
	const addRow = () => commitTable({
		...table,
		rows: [...table.rows, {
			id: nanoid(6),
			cells: table.columns.map(() => "")
		}]
	}, true);
	const addColumn = () => commitTable({
		...table,
		columns: [...table.columns, {
			id: nanoid(6),
			label: `Column ${table.columns.length + 1}`
		}],
		rows: table.rows.map((row) => ({
			...row,
			cells: [...row.cells, ""]
		}))
	}, true);
	const removeColumn = (columnIndex) => {
		if (table.columns.length <= 1) return;
		commitTable({
			...table,
			columns: table.columns.filter((_, index) => index !== columnIndex),
			rows: table.rows.map((row) => ({
				...row,
				cells: row.cells.filter((_, index) => index !== columnIndex)
			}))
		}, true);
	};
	const removeRow = (rowIndex) => {
		if (table.rows.length <= 1) return;
		commitTable({
			...table,
			rows: table.rows.filter((_, index) => index !== rowIndex)
		}, true);
	};
	const moveRow = (rowIndex, direction) => {
		commitTable(reorderTableRows(table, rowIndex, direction), true);
	};
	const moveColumn = (columnIndex, direction) => {
		commitTable(reorderTableColumns(table, columnIndex, direction), true);
	};
	const pasteCells = (rowIndex, columnIndex, raw) => {
		const pasted = raw.trimEnd().split(/\r?\n/).map((row) => row.split("	"));
		const rows = table.rows.map((row) => ({
			...row,
			cells: [...row.cells]
		}));
		pasted.forEach((values, pastedRow) => {
			const targetRow = rows[rowIndex + pastedRow];
			if (!targetRow) return;
			values.forEach((value, pastedColumn) => {
				const targetColumn = columnIndex + pastedColumn;
				if (targetColumn < table.columns.length) targetRow.cells[targetColumn] = value;
			});
		});
		commitTable({
			...table,
			rows
		}, true);
	};
	const handleCellKeyDown = (event) => {
		if (event.key === "Escape" || event.key === "Enter") {
			event.preventDefault();
			event.currentTarget.blur();
			return;
		}
		if (event.key !== "Tab") return;
		event.preventDefault();
		const cells = Array.from(event.currentTarget.closest("[data-table-node]")?.querySelectorAll("[data-table-cell]") ?? []);
		cells[cells.indexOf(event.currentTarget) + (event.shiftKey ? -1 : 1)]?.focus();
	};
	const cellValue = (row, columnIndex) => row.cells[columnIndex] ?? "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { width: "100%" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, {
			id,
			type: "table",
			selected
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			"data-table-node": true,
			"data-node-surface": true,
			initial: reduce ? false : {
				scale: .96,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: reduce ? { duration: 0 } : {
				type: "spring",
				stiffness: 400,
				damping: 18
			},
			className: `nodrag nowheel relative w-full overflow-hidden rounded-[8px] border bg-card transition-shadow ${selected ? "border-border-strong shadow-[0_4px_16px_rgba(0,0,0,0.08)]" : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]"}`,
			onDoubleClick: (event) => {
				event.stopPropagation();
				useItemEditorStore.getState().open(id, "table", "window");
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border/60 bg-muted/25 px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table2, { className: "h-4 w-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: data.title ?? "Table",
							onChange: (event) => updateNodeData(id, { title: event.target.value }),
							onBlur: (event) => updateNodeDataWithHistory(id, { title: event.currentTarget.value }),
							className: "min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-foreground outline-none",
							"aria-label": "Table title"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[10px] text-muted-foreground",
						children: [
							table.rows.length,
							" × ",
							table.columns.length
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "max-h-[360px] overflow-auto p-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full border-collapse text-[11px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [table.columns.map((column, columnIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
							className: "min-w-[110px] border border-border/70 bg-muted/30 p-0 text-left font-medium",
							style: { width: column.width ?? 140 },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "group flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										"data-table-column": true,
										value: column.label,
										onChange: (event) => updateColumn(columnIndex, { label: event.target.value }),
										onBlur: () => updateNodeDataWithHistory(id, { table }),
										className: "nodrag nowheel select-text min-w-0 flex-1 bg-transparent px-2 py-1.5 font-medium text-foreground outline-none",
										"aria-label": `${column.label} column name`
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => removeColumn(columnIndex),
										className: "nodrag mr-1 rounded p-0.5 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100",
										"aria-label": `Remove ${column.label} column`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-3 w-3" })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: column.kind ?? "text",
									onChange: (event) => updateColumn(columnIndex, { kind: event.target.value }),
									onBlur: () => updateNodeDataWithHistory(id, { table }),
									className: "nodrag nowheel mx-2 mb-1 w-[calc(100%-16px)] rounded border border-border/60 bg-surface px-1 py-0.5 text-[9px] text-muted-foreground outline-none",
									"aria-label": `${column.label} column type`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "text",
											children: "Text"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "number",
											children: "Number"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "checkbox",
											children: "Checkbox"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "date",
											children: "Date"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: 90,
									max: 320,
									value: column.width ?? 140,
									onChange: (event) => updateColumn(columnIndex, { width: Number(event.target.value) }),
									onMouseUp: () => updateNodeDataWithHistory(id, { table }),
									className: "nodrag nowheel mx-2 mb-1 h-1 w-[calc(100%-16px)] accent-primary",
									"aria-label": `${column.label} column width`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-center gap-1 pb-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => moveColumn(columnIndex, -1),
										className: "nodrag rounded p-0.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground",
										"aria-label": `Move ${column.label} left`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3 w-3" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => moveColumn(columnIndex, 1),
										className: "nodrag rounded p-0.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground",
										"aria-label": `Move ${column.label} right`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3 w-3" })
									})]
								})
							]
						}, column.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-8 border border-border/70 bg-muted/20",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: addColumn,
								className: "nodrag p-2 text-muted-foreground hover:text-foreground",
								"aria-label": "Add column",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" })
							})
						})] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: table.rows.map((row, rowIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [table.columns.map((column, columnIndex) => {
							const value = cellValue(row, columnIndex);
							if (column.kind === "checkbox") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "border border-border/70 p-2 text-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "nodrag nowheel",
									"data-table-cell": true,
									type: "checkbox",
									checked: value === "true",
									onChange: (event) => commitTable(updateTableCell(table, rowIndex, columnIndex, String(event.target.checked)), true),
									onKeyDown: handleCellKeyDown,
									"aria-label": `${column.label}, row ${rowIndex + 1}`
								})
							}, column.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "border border-border/70 p-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: column.kind === "number" ? "number" : column.kind === "date" ? "date" : "text",
									value,
									onChange: (event) => updateCell(rowIndex, columnIndex, event.target.value),
									onBlur: () => updateNodeDataWithHistory(id, { table }),
									className: "w-full bg-transparent px-2 py-2 text-foreground outline-none placeholder:text-muted-foreground/30",
									onKeyDown: handleCellKeyDown,
									onCopy: (event) => {
										event.preventDefault();
										event.clipboardData.setData("text/plain", value);
									},
									onPaste: (event) => {
										event.preventDefault();
										pasteCells(rowIndex, columnIndex, event.clipboardData.getData("text"));
									},
									"data-table-cell": true,
									"aria-label": `${column.label}, row ${rowIndex + 1}`
								})
							}, column.id);
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "border border-border/70 p-0 text-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => moveRow(rowIndex, -1),
										className: "nodrag p-1 text-muted-foreground hover:text-foreground",
										"aria-label": `Move row ${rowIndex + 1} up`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-3 w-3" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => moveRow(rowIndex, 1),
										className: "nodrag p-1 text-muted-foreground hover:text-foreground",
										"aria-label": `Move row ${rowIndex + 1} down`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "h-3 w-3" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => removeRow(rowIndex),
										className: "nodrag p-2 text-muted-foreground hover:text-destructive",
										"aria-label": `Remove row ${rowIndex + 1}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
									})
								]
							})
						})] }, row.id)) })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 border-t border-border/60 bg-muted/20 px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: addRow,
						className: "flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground hover:bg-surface-hover hover:text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }), " Row"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-muted-foreground/60",
						children: "Tab between cells · changes save locally"
					})]
				})
			]
		})]
	});
}
var TableNode_default = (0, import_react.memo)(TableNode);
function DrawingNode({ id, data, selected }) {
	const deleteNode = useCanvasStore((s) => s.deleteNode);
	const activeTool = useInteractionStore((s) => s.activeTool);
	const points = data.points ?? [];
	const width = Math.max(40, ...points.map((point) => point.x + 12));
	const height = Math.max(40, ...points.map((point) => point.y + 12));
	const stroke = data.strokeColor ?? "#ef4444";
	const strokeWidth = Number(data.strokeWidth ?? 3);
	const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			width: "100%",
			height: "100%",
			minHeight: 40
		},
		onClick: (event) => {
			if (activeTool === "eraser") {
				event.stopPropagation();
				deleteNode(id);
			}
		},
		title: activeTool === "eraser" ? "Click to erase this stroke" : void 0,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeControls, {
				id,
				type: "drawing",
				selected
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectorPorts, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
				width: "100%",
				height: "100%",
				viewBox: `0 0 ${width} ${height}`,
				preserveAspectRatio: "none",
				className: "pointer-events-none overflow-visible",
				"aria-label": "Freehand drawing",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
					points: pointString,
					fill: "none",
					stroke,
					strokeWidth,
					strokeLinecap: "round",
					strokeLinejoin: "round",
					vectorEffect: "non-scaling-stroke",
					opacity: stroke.includes("rgba") ? void 0 : 1
				})
			})
		]
	});
}
var DrawingNode_default = (0, import_react.memo)(DrawingNode);
var ITEM_REGISTRY = [
	{
		type: "text",
		label: "Rich Text",
		icon: Type,
		category: "text",
		status: "available",
		kind: "node",
		keywords: [
			"note",
			"document",
			"writing",
			"rich text"
		],
		defaultWidth: 280,
		defaultHeight: 120,
		minWidth: 200,
		minHeight: 80,
		maxWidth: 520,
		resizeMode: "width-content",
		editableText: true,
		capabilities: {
			background: true,
			richText: true,
			rotation: true,
			opacity: true
		}
	},
	{
		type: "sticky",
		label: "Sticky Note",
		icon: StickyNote,
		category: "text",
		status: "available",
		kind: "node",
		keywords: [
			"note",
			"sticky",
			"post-it",
			"quick"
		],
		defaultWidth: 280,
		defaultHeight: 180,
		minWidth: 180,
		minHeight: 140,
		maxWidth: 420,
		resizeMode: "both",
		capabilities: {
			background: true,
			rotation: true,
			opacity: true
		}
	},
	{
		type: "todo",
		label: "To-do",
		icon: SquareCheckBig,
		category: "text",
		status: "available",
		kind: "node",
		keywords: [
			"task",
			"tasks",
			"checklist",
			"check"
		],
		defaultWidth: 280,
		defaultHeight: 160,
		minWidth: 240,
		minHeight: 120,
		maxWidth: 520,
		resizeMode: "both",
		capabilities: {
			background: true,
			rotation: true,
			opacity: true
		}
	},
	{
		type: "code",
		label: "Code Block",
		icon: FileCodeCorner,
		category: "text",
		status: "available",
		kind: "node",
		keywords: [
			"code",
			"snippet",
			"programming",
			"developer"
		],
		defaultWidth: 280,
		defaultHeight: 200,
		minWidth: 280,
		minHeight: 140,
		maxWidth: 800,
		resizeMode: "both",
		editableText: true,
		capabilities: {
			background: true,
			rotation: true,
			opacity: true,
			editableText: true
		}
	},
	{
		type: "document",
		label: "Document Card",
		icon: FileText,
		category: "text",
		status: "coming-soon",
		kind: "node",
		keywords: [
			"document",
			"card",
			"page",
			"link"
		],
		defaultWidth: 280,
		defaultHeight: 140,
		minWidth: 240,
		minHeight: 100,
		maxWidth: 520,
		resizeMode: "width",
		capabilities: {
			background: true,
			asset: true,
			remoteUrl: true
		}
	},
	{
		type: "image",
		label: "Image",
		icon: Image,
		category: "media",
		status: "available",
		kind: "node",
		keywords: [
			"image",
			"photo",
			"picture",
			"img"
		],
		defaultWidth: 280,
		defaultHeight: 220,
		minWidth: 120,
		minHeight: 120,
		maxWidth: 1200,
		maxHeight: 1200,
		resizeMode: "both",
		preserveAspectRatio: true,
		capabilities: {
			background: true,
			asset: true,
			remoteUrl: true,
			rotation: true,
			opacity: true,
			preserveAspectRatio: true
		}
	},
	{
		type: "link",
		label: "Link",
		icon: Link,
		category: "media",
		status: "available",
		kind: "node",
		keywords: [
			"url",
			"website",
			"bookmark",
			"link"
		],
		defaultWidth: 280,
		defaultHeight: 100,
		minWidth: 200,
		minHeight: 60,
		maxWidth: 520,
		resizeMode: "width",
		capabilities: {
			background: true,
			remoteUrl: true,
			rotation: true,
			opacity: true
		}
	},
	{
		type: "video",
		label: "Video",
		icon: Video,
		category: "media",
		status: "available",
		kind: "node",
		keywords: [
			"video",
			"movie",
			"film",
			"mp4",
			"youtube",
			"vimeo"
		],
		defaultWidth: 280,
		defaultHeight: 200,
		minWidth: 280,
		minHeight: 160,
		maxWidth: 800,
		maxHeight: 600,
		resizeMode: "both",
		preserveAspectRatio: true,
		capabilities: {
			background: true,
			asset: true,
			remoteUrl: true,
			rotation: true,
			opacity: true,
			preserveAspectRatio: true
		}
	},
	{
		type: "audio",
		label: "Audio",
		icon: AudioWaveform,
		category: "media",
		status: "available",
		kind: "node",
		keywords: [
			"audio",
			"sound",
			"music",
			"podcast",
			"mp3"
		],
		defaultWidth: 280,
		defaultHeight: 112,
		minWidth: 280,
		minHeight: 80,
		maxWidth: 520,
		resizeMode: "width",
		capabilities: {
			background: true,
			asset: true,
			remoteUrl: true,
			rotation: true,
			opacity: true
		}
	},
	{
		type: "embed",
		label: "Embed",
		icon: Globe,
		category: "media",
		status: "available",
		kind: "node",
		keywords: [
			"embed",
			"iframe",
			"youtube",
			"figma",
			"slides"
		],
		defaultWidth: 280,
		defaultHeight: 200,
		minWidth: 280,
		minHeight: 160,
		maxWidth: 800,
		maxHeight: 600,
		resizeMode: "both",
		capabilities: {
			background: true,
			embed: true,
			remoteUrl: true,
			rotation: true,
			opacity: true
		}
	},
	{
		type: "map",
		label: "Map",
		icon: MapPin,
		category: "media",
		status: "coming-soon",
		kind: "node",
		keywords: [
			"map",
			"location",
			"address",
			"coordinates"
		],
		defaultWidth: 280,
		defaultHeight: 200,
		minWidth: 280,
		minHeight: 160,
		maxWidth: 800,
		maxHeight: 600,
		resizeMode: "both",
		capabilities: {
			background: true,
			remoteUrl: true,
			rotation: true,
			opacity: true
		}
	},
	{
		type: "webcapture",
		label: "Web Capture",
		icon: Camera,
		category: "media",
		status: "coming-soon",
		kind: "node",
		keywords: [
			"capture",
			"screenshot",
			"web",
			"page"
		],
		defaultWidth: 280,
		defaultHeight: 200,
		minWidth: 280,
		minHeight: 160,
		maxWidth: 800,
		maxHeight: 600,
		resizeMode: "both",
		capabilities: {
			background: true,
			asset: true,
			rotation: true,
			opacity: true
		}
	},
	{
		type: "file",
		label: "File",
		icon: File,
		category: "files",
		status: "available",
		kind: "node",
		keywords: [
			"file",
			"upload",
			"document",
			"attachment"
		],
		defaultWidth: 280,
		defaultHeight: 80,
		minWidth: 180,
		minHeight: 60,
		maxWidth: 520,
		resizeMode: "width",
		capabilities: {
			background: true,
			asset: true,
			remoteUrl: true,
			rotation: true,
			opacity: true
		}
	},
	{
		type: "pdf",
		label: "PDF",
		icon: FileImage,
		category: "files",
		status: "available",
		kind: "node",
		keywords: [
			"pdf",
			"document",
			"pages",
			"print"
		],
		defaultWidth: 280,
		defaultHeight: 100,
		minWidth: 200,
		minHeight: 80,
		maxWidth: 520,
		resizeMode: "width",
		capabilities: {
			background: true,
			asset: true,
			remoteUrl: true,
			rotation: true,
			opacity: true
		}
	},
	{
		type: "document_file",
		label: "Document",
		icon: FileText,
		category: "files",
		status: "coming-soon",
		kind: "node",
		keywords: [
			"doc",
			"docx",
			"word",
			"pages"
		],
		defaultWidth: 280,
		defaultHeight: 100,
		minWidth: 200,
		minHeight: 80,
		maxWidth: 520,
		resizeMode: "width",
		capabilities: {
			background: true,
			asset: true,
			remoteUrl: true,
			rotation: true,
			opacity: true
		}
	},
	{
		type: "spreadsheet",
		label: "Spreadsheet",
		icon: FileSpreadsheet,
		category: "files",
		status: "coming-soon",
		kind: "node",
		keywords: [
			"excel",
			"csv",
			"sheets",
			"numbers"
		],
		defaultWidth: 280,
		defaultHeight: 100,
		minWidth: 200,
		minHeight: 80,
		maxWidth: 520,
		resizeMode: "width",
		capabilities: {
			background: true,
			asset: true,
			remoteUrl: true,
			rotation: true,
			opacity: true
		}
	},
	{
		type: "presentation",
		label: "Presentation",
		icon: FileImage,
		category: "files",
		status: "coming-soon",
		kind: "node",
		keywords: [
			"ppt",
			"powerpoint",
			"slides",
			"keynote"
		],
		defaultWidth: 280,
		defaultHeight: 100,
		minWidth: 200,
		minHeight: 80,
		maxWidth: 520,
		resizeMode: "width",
		capabilities: {
			background: true,
			asset: true,
			remoteUrl: true,
			rotation: true,
			opacity: true
		}
	},
	{
		type: "section",
		label: "Section",
		icon: Square,
		category: "organize",
		status: "available",
		kind: "node",
		keywords: [
			"section",
			"region",
			"group",
			"organize",
			"area"
		],
		defaultWidth: 560,
		defaultHeight: 360,
		minWidth: 280,
		minHeight: 180,
		maxWidth: 1200,
		maxHeight: 900,
		resizeMode: "both",
		capabilities: {
			background: true,
			container: true,
			children: true,
			stroke: true,
			opacity: true,
			rotation: false
		}
	},
	{
		type: "folder",
		label: "Folder",
		icon: Folder,
		category: "organize",
		status: "available",
		kind: "node",
		keywords: [
			"folder",
			"group",
			"collection",
			"directory"
		],
		defaultWidth: 280,
		defaultHeight: 100,
		minWidth: 220,
		minHeight: 80,
		maxWidth: 420,
		resizeMode: "width",
		capabilities: {
			background: true,
			rotation: true,
			opacity: true,
			connectable: true
		}
	},
	{
		type: "board",
		label: "Board",
		icon: LayoutDashboard,
		category: "organize",
		status: "experimental",
		kind: "node",
		keywords: [
			"board",
			"sub-board",
			"navigate",
			"link"
		],
		defaultWidth: 280,
		defaultHeight: 100,
		minWidth: 220,
		minHeight: 80,
		maxWidth: 420,
		resizeMode: "width",
		capabilities: {
			background: true,
			container: true,
			children: true,
			rotation: true,
			opacity: true,
			connectable: true
		}
	},
	{
		type: "column",
		label: "Column",
		icon: Columns2,
		category: "organize",
		status: "available",
		kind: "node",
		keywords: [
			"column",
			"list",
			"kanban",
			"organize",
			"container"
		],
		defaultWidth: 300,
		defaultHeight: 400,
		minWidth: 240,
		minHeight: 200,
		maxWidth: 600,
		maxHeight: 800,
		resizeMode: "both",
		capabilities: {
			background: true,
			container: true,
			children: true,
			rotation: false,
			opacity: true
		}
	},
	{
		type: "frame",
		label: "Frame",
		icon: Square,
		category: "organize",
		status: "available",
		kind: "node",
		keywords: [
			"frame",
			"group",
			"container",
			"section"
		],
		defaultWidth: 400,
		defaultHeight: 300,
		minWidth: 200,
		minHeight: 150,
		maxWidth: 1200,
		maxHeight: 900,
		resizeMode: "both",
		capabilities: {
			background: true,
			container: true,
			children: true,
			rotation: true,
			opacity: true,
			stroke: true
		}
	},
	{
		type: "group",
		label: "Group",
		icon: Archive,
		category: "organize",
		status: "coming-soon",
		kind: "node",
		keywords: [
			"group",
			"collection",
			"organize"
		],
		defaultWidth: 280,
		defaultHeight: 140,
		minWidth: 220,
		minHeight: 100,
		maxWidth: 420,
		resizeMode: "width",
		capabilities: {
			background: true,
			container: true,
			children: true,
			rotation: true,
			opacity: true
		}
	},
	{
		type: "connector",
		label: "Connector",
		icon: Link2,
		category: "visual",
		status: "available",
		kind: "tool",
		keywords: [
			"connector",
			"arrow",
			"line",
			"connect",
			"edge"
		],
		defaultWidth: 1,
		defaultHeight: 1,
		minWidth: 1,
		minHeight: 1,
		resizeMode: "none",
		capabilities: {
			stroke: true,
			connectable: true,
			opacity: true
		}
	},
	{
		type: "shape",
		label: "Shape",
		icon: Square,
		category: "visual",
		status: "available",
		kind: "node",
		keywords: [
			"shape",
			"rectangle",
			"circle",
			"diamond",
			"geometry"
		],
		defaultWidth: 120,
		defaultHeight: 120,
		minWidth: 60,
		minHeight: 60,
		maxWidth: 400,
		maxHeight: 400,
		resizeMode: "both",
		capabilities: {
			background: true,
			stroke: true,
			opacity: true,
			rotation: true
		}
	},
	{
		type: "color_swatch",
		label: "Color Swatch",
		icon: Palette,
		category: "visual",
		status: "available",
		kind: "node",
		keywords: [
			"color",
			"swatch",
			"palette",
			"hex",
			"design"
		],
		defaultWidth: 140,
		defaultHeight: 100,
		minWidth: 100,
		minHeight: 80,
		maxWidth: 280,
		maxHeight: 200,
		resizeMode: "width",
		capabilities: {
			background: true,
			opacity: true,
			rotation: true
		}
	},
	{
		type: "pen",
		label: "Pen",
		icon: PenTool,
		category: "drawing",
		status: "available",
		kind: "tool",
		keywords: [
			"pen",
			"draw",
			"ink",
			"freehand"
		],
		defaultWidth: 1,
		defaultHeight: 1,
		minWidth: 1,
		minHeight: 1,
		resizeMode: "none",
		capabilities: {
			drawing: true,
			stroke: true,
			opacity: true
		}
	},
	{
		type: "highlighter",
		label: "Highlighter",
		icon: Highlighter,
		category: "drawing",
		status: "available",
		kind: "tool",
		keywords: [
			"highlight",
			"marker",
			"draw"
		],
		defaultWidth: 1,
		defaultHeight: 1,
		minWidth: 1,
		minHeight: 1,
		resizeMode: "none",
		capabilities: {
			drawing: true,
			stroke: true,
			opacity: true
		}
	},
	{
		type: "eraser",
		label: "Eraser",
		icon: Eraser,
		category: "drawing",
		status: "available",
		kind: "tool",
		keywords: [
			"erase",
			"remove",
			"drawing"
		],
		defaultWidth: 1,
		defaultHeight: 1,
		minWidth: 1,
		minHeight: 1,
		resizeMode: "none",
		capabilities: {
			drawing: true,
			opacity: true
		}
	},
	{
		type: "lasso",
		label: "Lasso",
		icon: Lasso,
		category: "drawing",
		status: "coming-soon",
		kind: "tool",
		keywords: [
			"select",
			"lasso",
			"area"
		],
		defaultWidth: 1,
		defaultHeight: 1,
		minWidth: 1,
		minHeight: 1,
		resizeMode: "none",
		capabilities: {
			drawing: true,
			opacity: true
		}
	},
	{
		type: "drawing",
		label: "Drawing",
		icon: PenTool,
		category: "drawing",
		status: "available",
		kind: "node",
		keywords: [
			"drawing",
			"stroke",
			"ink",
			"freehand"
		],
		defaultWidth: 160,
		defaultHeight: 120,
		minWidth: 40,
		minHeight: 40,
		maxWidth: 1600,
		maxHeight: 1200,
		resizeMode: "both",
		capabilities: {
			drawing: true,
			stroke: true,
			opacity: true
		}
	},
	{
		type: "table",
		label: "Table",
		icon: Table,
		category: "structured",
		status: "available",
		kind: "node",
		keywords: [
			"table",
			"grid",
			"rows",
			"columns",
			"data"
		],
		defaultWidth: 480,
		defaultHeight: 280,
		minWidth: 320,
		minHeight: 160,
		maxWidth: 1200,
		maxHeight: 800,
		resizeMode: "both",
		capabilities: {
			background: true,
			stroke: true,
			opacity: true,
			rotation: true,
			children: true,
			editableText: true
		}
	},
	{
		type: "mindmap",
		label: "Mind Map",
		icon: GitBranch,
		category: "structured",
		status: "coming-soon",
		kind: "node",
		keywords: [
			"mindmap",
			"mind map",
			"brainstorm",
			"tree"
		],
		defaultWidth: 400,
		defaultHeight: 300,
		minWidth: 300,
		minHeight: 200,
		maxWidth: 1200,
		maxHeight: 900,
		resizeMode: "both",
		capabilities: {
			background: true,
			container: true,
			children: true,
			connectable: true,
			rotation: true,
			opacity: true
		}
	},
	{
		type: "flowchart",
		label: "Flowchart",
		icon: GitBranch,
		category: "structured",
		status: "coming-soon",
		kind: "node",
		keywords: [
			"flowchart",
			"flow",
			"diagram",
			"process"
		],
		defaultWidth: 400,
		defaultHeight: 300,
		minWidth: 300,
		minHeight: 200,
		maxWidth: 1200,
		maxHeight: 900,
		resizeMode: "both",
		capabilities: {
			background: true,
			container: true,
			children: true,
			connectable: true,
			rotation: true,
			opacity: true
		}
	},
	{
		type: "kanban",
		label: "Kanban",
		icon: Kanban,
		category: "structured",
		status: "coming-soon",
		kind: "node",
		keywords: [
			"kanban",
			"board",
			"columns",
			"tasks"
		],
		defaultWidth: 600,
		defaultHeight: 400,
		minWidth: 400,
		minHeight: 300,
		maxWidth: 1200,
		maxHeight: 900,
		resizeMode: "both",
		capabilities: {
			background: true,
			container: true,
			children: true,
			rotation: false,
			opacity: true
		}
	},
	{
		type: "card",
		label: "Card",
		icon: LayoutDashboard,
		category: "structured",
		status: "coming-soon",
		kind: "node",
		keywords: [
			"card",
			"wireframe",
			"ui",
			"component"
		],
		defaultWidth: 280,
		defaultHeight: 180,
		minWidth: 200,
		minHeight: 120,
		maxWidth: 520,
		resizeMode: "both",
		capabilities: {
			background: true,
			stroke: true,
			opacity: true,
			rotation: true
		}
	},
	{
		type: "wireframe",
		label: "Wireframe",
		icon: LayoutDashboard,
		category: "structured",
		status: "coming-soon",
		kind: "node",
		keywords: [
			"wireframe",
			"ui",
			"mockup",
			"design"
		],
		defaultWidth: 360,
		defaultHeight: 240,
		minWidth: 280,
		minHeight: 180,
		maxWidth: 800,
		maxHeight: 600,
		resizeMode: "both",
		capabilities: {
			background: true,
			stroke: true,
			opacity: true,
			rotation: true
		}
	},
	{
		type: "comment",
		label: "Comment",
		icon: MessageCircle,
		category: "collaboration",
		status: "available",
		kind: "node",
		keywords: [
			"comment",
			"note",
			"feedback",
			"discussion"
		],
		defaultWidth: 280,
		defaultHeight: 100,
		minWidth: 180,
		minHeight: 60,
		maxWidth: 420,
		resizeMode: "width",
		editableText: true,
		capabilities: {
			background: true,
			rotation: true,
			opacity: true,
			editableText: true,
			comments: true
		}
	},
	{
		type: "voting",
		label: "Voting",
		icon: Vote,
		category: "collaboration",
		status: "coming-soon",
		kind: "node",
		keywords: [
			"vote",
			"poll",
			"survey",
			"decision"
		],
		defaultWidth: 280,
		defaultHeight: 160,
		minWidth: 240,
		minHeight: 120,
		maxWidth: 520,
		resizeMode: "both",
		capabilities: {
			background: true,
			rotation: true,
			opacity: true
		}
	},
	{
		type: "timer",
		label: "Timer",
		icon: Timer,
		category: "collaboration",
		status: "coming-soon",
		kind: "node",
		keywords: [
			"timer",
			"countdown",
			"clock",
			"pomodoro"
		],
		defaultWidth: 160,
		defaultHeight: 160,
		minWidth: 140,
		minHeight: 140,
		maxWidth: 280,
		maxHeight: 280,
		resizeMode: "both",
		capabilities: {
			background: true,
			rotation: true,
			opacity: true
		}
	},
	{
		type: "presentation_mode",
		label: "Presentation",
		icon: Presentation,
		category: "collaboration",
		status: "coming-soon",
		kind: "action",
		keywords: [
			"present",
			"slideshow",
			"slides",
			"demo"
		],
		defaultWidth: 280,
		defaultHeight: 100,
		minWidth: 240,
		minHeight: 80,
		maxWidth: 520,
		resizeMode: "width",
		capabilities: {
			background: true,
			rotation: true,
			opacity: true
		}
	},
	{
		type: "unsorted",
		label: "Unsorted Note",
		icon: Zap,
		category: "capture",
		status: "coming-soon",
		kind: "node",
		keywords: [
			"quick",
			"capture",
			"inbox",
			"scratch"
		],
		defaultWidth: 280,
		defaultHeight: 120,
		minWidth: 200,
		minHeight: 80,
		maxWidth: 520,
		resizeMode: "width-content",
		capabilities: {
			background: true,
			rotation: true,
			opacity: true,
			editableText: true
		}
	},
	{
		type: "quick_capture",
		label: "Quick Capture",
		icon: Zap,
		category: "capture",
		status: "coming-soon",
		kind: "node",
		keywords: [
			"quick",
			"capture",
			"instant",
			"scratch"
		],
		defaultWidth: 280,
		defaultHeight: 100,
		minWidth: 200,
		minHeight: 60,
		maxWidth: 520,
		resizeMode: "width-content",
		capabilities: {
			background: true,
			rotation: true,
			opacity: true,
			editableText: true
		}
	}
];
ITEM_REGISTRY.filter((i) => i.status === "available");
var ALL_CATEGORIES = [
	"text",
	"media",
	"files",
	"organize",
	"visual",
	"drawing",
	"structured",
	"collaboration",
	"capture"
];
var CATEGORY_LABELS = {
	text: "Text & Notes",
	media: "Media & Web",
	files: "Files",
	organize: "Organization",
	visual: "Visual",
	drawing: "Drawing",
	structured: "Structured",
	collaboration: "Collaboration",
	capture: "Capture"
};
var STATUS_LABELS = {
	available: "",
	experimental: "Experimental",
	"coming-soon": "Soon"
};
function getItemDef(type) {
	return ITEM_REGISTRY.find((i) => i.type === type);
}
var SUTONOTE_ITEM_MIME = "application/x-sutonote-item";
function setCanvasItemDragData(dataTransfer, type) {
	dataTransfer.effectAllowed = "copy";
	dataTransfer.setData(SUTONOTE_ITEM_MIME, type);
	dataTransfer.setData("text/plain", type);
}
var TOOL_TYPES = /* @__PURE__ */ new Set([
	"select",
	"hand",
	"connector",
	"pen",
	"highlighter",
	"eraser"
]);
function isCanvasTool(type) {
	return TOOL_TYPES.has(type);
}
/** Single execution boundary shared by the dock, picker, palette, and shortcuts. */
function executeCanvasItem(type, context = {}) {
	if (type === "select" || type === "hand") {
		useInteractionStore.getState().setActiveTool(type);
		return true;
	}
	const item = getItemDef(type);
	if (!item || item.status === "coming-soon") return false;
	if (item.kind === "tool") {
		if (!isCanvasTool(item.type)) return false;
		useInteractionStore.getState().setActiveTool(item.type);
		return true;
	}
	if (item.kind === "action") {
		context.onAction?.(item.type);
		return Boolean(context.onAction);
	}
	const nodes = useCanvasStore.getState().nodes;
	const position = context.position ?? {
		x: nodes.reduce((max, node) => Math.max(max, node.position.x), 0) + 300,
		y: 0
	};
	useCanvasStore.getState().addNode(item.type, position);
	if (!context.preserveTool) useInteractionStore.getState().setActiveTool("select");
	return true;
}
var ScrollArea = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root$1, {
	ref,
	className: cn("relative overflow-hidden", className),
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
			className: "h-full w-full rounded-[inherit]",
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollBar, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Corner, {})
	]
}));
ScrollArea.displayName = Root$1.displayName;
var ScrollBar = import_react.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaScrollbar, {
	ref,
	orientation,
	className: cn("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
}));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;
function ToolPicker({ open, onClose }) {
	const panelRef = (0, import_react.useRef)(null);
	const { screenToFlowPosition } = useReactFlow();
	const [query, setQuery] = (0, import_react.useState)("");
	const inputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (open) inputRef.current?.focus();
	}, [open]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const handler = (e) => {
			if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
		};
		window.addEventListener("mousedown", handler);
		return () => window.removeEventListener("mousedown", handler);
	}, [open, onClose]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const handler = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [open, onClose]);
	const pick = (0, import_react.useCallback)((item) => {
		if (item.status === "coming-soon") return;
		const rect = document.querySelector(".react-flow")?.getBoundingClientRect();
		const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
		const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
		const pos = screenToFlowPosition({
			x: cx,
			y: cy
		});
		if (executeCanvasItem(item.type, { position: pos })) onClose();
	}, [onClose, screenToFlowPosition]);
	const categories = (0, import_react.useMemo)(() => ALL_CATEGORIES, []);
	const filteredItems = (0, import_react.useMemo)(() => ITEM_REGISTRY.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()) || item.keywords?.some((k) => k.toLowerCase().includes(query.toLowerCase()))), [query]);
	const getStatusColor = (status) => {
		switch (status) {
			case "available": return "text-foreground";
			case "experimental": return "text-yellow-500";
			case "coming-soon": return "text-muted-foreground/40";
		}
	};
	const getStatusBg = (status) => {
		switch (status) {
			case "available": return "bg-transparent";
			case "experimental": return "bg-yellow-500/10";
			case "coming-soon": return "bg-muted/30";
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		ref: panelRef,
		initial: {
			opacity: 0,
			y: 8,
			scale: .96
		},
		animate: {
			opacity: 1,
			y: 0,
			scale: 1
		},
		exit: {
			opacity: 0,
			y: 8,
			scale: .96
		},
		transition: {
			duration: .15,
			ease: [
				.22,
				1,
				.36,
				1
			]
		},
		className: "fixed bottom-20 left-1/2 z-50 w-[360px] -translate-x-1/2 rounded-2xl border border-border bg-popover/95 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px] font-semibold text-foreground",
					children: "Add item"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: inputRef,
					type: "text",
					placeholder: "Search items...",
					value: query,
					onChange: (e) => setQuery(e.target.value),
					className: "w-full h-8 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm text-foreground outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "max-h-[400px]",
				children: categories.map((cat) => {
					const items = filteredItems.filter((i) => i.category === cat);
					if (items.length === 0) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between mb-1 px-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60",
								children: CATEGORY_LABELS[cat]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[9px] text-muted-foreground/50",
								children: [items.length, " items"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 gap-1",
							children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								draggable: item.status !== "coming-soon",
								onDragStart: (event) => {
									if (item.status === "coming-soon") return;
									event.stopPropagation();
									setCanvasItemDragData(event.dataTransfer, item.type);
								},
								onClick: () => pick(item),
								disabled: item.status === "coming-soon",
								className: `flex flex-col items-center gap-1 rounded-xl p-2 transition-colors ${item.status === "available" ? "text-muted-foreground hover:bg-surface-hover hover:text-foreground active:scale-95" : item.status === "experimental" ? "text-yellow-600 bg-yellow-500/10 cursor-help" : "text-muted-foreground/40 bg-muted/30 cursor-not-allowed"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
										className: "h-5 w-5",
										strokeWidth: 1.5
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-medium truncate w-full text-center",
										children: item.label
									}),
									item.status !== "available" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `text-[8px] font-medium px-1.5 py-0.5 rounded ${getStatusBg(item.status)} ${getStatusColor(item.status)}`,
										children: STATUS_LABELS[item.status]
									})
								]
							}, item.type))
						})]
					}, cat);
				})
			})
		]
	}) });
}
function ImageLightbox() {
	const { isOpen, currentId, imageIds, close, next, prev } = useLightboxStore();
	const nodes = useCanvasStore((s) => s.nodes);
	const [url, setUrl] = (0, import_react.useState)(null);
	const [caption, setCaption] = (0, import_react.useState)("");
	const currentNode = nodes.find((n) => n.id === currentId);
	const hasMultiple = imageIds.length > 1;
	(0, import_react.useEffect)(() => {
		if (!isOpen || !currentNode) {
			setUrl(null);
			return;
		}
		const assetId = currentNode.data.assetId;
		const remoteUrl = currentNode.data.remoteUrl;
		if (assetId) getAssetUrl(assetId).then((u) => setUrl(u ?? remoteUrl ?? null));
		else if (remoteUrl) setUrl(remoteUrl);
		else setUrl(null);
		setCaption(currentNode.data.caption ?? "");
	}, [
		isOpen,
		currentId,
		currentNode
	]);
	(0, import_react.useEffect)(() => {
		if (!isOpen) return;
		const onKey = (e) => {
			if (e.key === "Escape") close();
			else if (e.key === "ArrowLeft" && hasMultiple) {
				e.preventDefault();
				prev();
			} else if (e.key === "ArrowRight" && hasMultiple) {
				e.preventDefault();
				next();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		isOpen,
		hasMultiple,
		close,
		next,
		prev
	]);
	if (!isOpen || !currentNode) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm",
		onClick: close,
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Image viewer",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: close,
				className: "absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20",
				"aria-label": "Close",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
			}),
			hasMultiple && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: (e) => {
					e.stopPropagation();
					prev();
				},
				className: "absolute left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20",
				"aria-label": "Previous",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-5 w-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: (e) => {
					e.stopPropagation();
					next();
				},
				className: "absolute right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:right-16",
				"aria-label": "Next",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-5 w-5" })
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-[10px] bg-card shadow-2xl",
				onClick: (e) => e.stopPropagation(),
				children: [
					url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: url,
						alt: caption || "image",
						className: "max-h-[75vh] w-auto max-w-[90vw] object-contain"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-64 w-96 items-center justify-center text-muted-foreground",
						children: "No image"
					}),
					caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-border bg-card px-4 py-3 text-center text-sm text-foreground",
						children: caption
					}),
					hasMultiple && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2 py-1 text-xs text-white",
						children: [
							imageIds.indexOf(currentId ?? "") + 1,
							" / ",
							imageIds.length
						]
					})
				]
			})
		]
	});
}
function DocumentPreview() {
	const { isOpen, nodeId, close } = useDocumentPreviewStore();
	const node = useCanvasStore((s) => s.nodes.find((item) => item.id === nodeId));
	const [url, setUrl] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let active = true;
		if (!isOpen || !node) {
			setUrl(null);
			return () => {
				active = false;
			};
		}
		const remote = node.data.remoteUrl || "";
		const assetId = node.data.assetId || "";
		if (assetId) getAssetUrl(assetId).then((value) => active && setUrl((value ?? remote) || null));
		else setUrl(remote || null);
		return () => {
			active = false;
		};
	}, [isOpen, node]);
	(0, import_react.useEffect)(() => {
		if (!isOpen) return;
		const onKey = (event) => event.key === "Escape" && close();
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [isOpen, close]);
	if (!isOpen || !node) return null;
	const title = node.data.filename || node.data.title || "Document preview";
	const mime = node.data.mime || (node.type === "pdf" ? "application/pdf" : "");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-6 backdrop-blur-sm",
		onClick: close,
		role: "dialog",
		"aria-modal": "true",
		"aria-label": title,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-[min(78dvh,720px)] w-[min(760px,92vw)] flex-col overflow-hidden rounded-[10px] border border-border bg-card shadow-2xl",
			onClick: (event) => event.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-12 shrink-0 items-center gap-2 bg-foreground px-3 text-background",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Close preview",
							onClick: close,
							className: "h-3 w-3 rounded-full bg-[#d35e53]"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Close preview",
							onClick: close,
							className: "h-3 w-3 rounded-full bg-[#e5c34b]"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-3 min-w-0 flex-1 truncate text-xs font-medium",
							children: title
						}),
						url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: url,
							target: "_blank",
							rel: "noreferrer",
							"aria-label": "Open document in new tab",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: close,
							"aria-label": "Close preview",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 flex-1 bg-muted/30",
					children: url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
						src: url,
						title,
						className: "h-full w-full border-0",
						sandbox: "allow-scripts allow-same-origin"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-full items-center justify-center text-sm text-muted-foreground",
						children: "No preview available"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-11 shrink-0 items-center justify-end border-t border-border bg-card px-3",
					children: [url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: url,
						download: title,
						className: "flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), "Download"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-3 text-[10px] text-muted-foreground/60",
						children: mime || "document"
					})]
				})
			]
		})
	});
}
/** Keep long freehand strokes cheap without changing their endpoints. */
function reduceStroke(points, maxPoints = 256) {
	if (points.length <= maxPoints || maxPoints < 2) return points;
	const reduced = [];
	const step = (points.length - 1) / (maxPoints - 1);
	for (let index = 0; index < maxPoints; index += 1) {
		const point = points[Math.round(index * step)];
		if (point && reduced[reduced.length - 1] !== point) reduced.push(point);
	}
	return reduced;
}
var nodeTypes = {
	sticky: StickyNoteNode_default,
	text: TextNode_default,
	todo: TodoNode_default,
	image: ImageNode_default,
	link: LinkNode_default,
	file: FileNode_default,
	comment: CommentNode_default,
	shape: ShapeNode_default,
	color_swatch: ColorSwatchNode_default,
	board: BoardNode_default,
	folder: FolderNode_default,
	column: ColumnNode_default,
	frame: FrameNode_default,
	pdf: PDFNode_default,
	video: VideoNode_default,
	embed: EmbedNode_default,
	code: CodeBlockNode_default,
	section: SectionNode_default,
	audio: AudioNode_default,
	table: TableNode_default,
	drawing: DrawingNode_default
};
var isDrawingTool = (tool) => tool === "pen" || tool === "highlighter";
function centerViewport() {
	if (typeof window === "undefined") return {
		x: 0,
		y: 0,
		zoom: .9
	};
	return {
		x: window.innerWidth / 2,
		y: window.innerHeight / 2,
		zoom: .9
	};
}
function getCanvasCenter() {
	if (typeof document === "undefined") return {
		x: window.innerWidth / 2,
		y: window.innerHeight / 2
	};
	const rect = document.querySelector(".react-flow")?.getBoundingClientRect();
	return {
		x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
		y: rect ? rect.top + rect.height / 2 : window.innerHeight / 2
	};
}
var addAtViewportCenter = (getViewport, type) => {
	const vp = getViewport();
	const center = getCanvasCenter();
	const x = (center.x - vp.x) / vp.zoom;
	const y = (center.y - vp.y) / vp.zoom;
	executeCanvasItem(type, { position: {
		x: x + (Math.floor(Math.random() * 200) - 100),
		y: y + (Math.floor(Math.random() * 200) - 100)
	} });
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
	useSettingsStore((s) => s.snapToGrid);
	const activeTool = useInteractionStore((s) => s.activeTool);
	const spaceHeld = useInteractionStore((s) => s.spaceHeld);
	const isDragging = useInteractionStore((s) => s.isDragging);
	const editingNodeId = useInteractionStore((s) => s.editingNodeId);
	const { getViewport, screenToFlowPosition } = useReactFlow();
	const containerRef = (0, import_react.useRef)(null);
	const [defaultViewport] = (0, import_react.useState)(() => loadViewport() ?? centerViewport());
	const extentRef = (0, import_react.useRef)(typeof window === "undefined" ? [[-800, -600], [800, 600]] : [[-window.innerWidth, -window.innerHeight], [window.innerWidth, window.innerHeight]]);
	const [extent, setExtent] = (0, import_react.useState)(extentRef.current);
	const drawingPointsRef = (0, import_react.useRef)([]);
	const [virtualized, setVirtualized] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setVirtualized((cur) => shouldVirtualize(nodes.length, cur));
	}, [nodes.length]);
	(0, import_react.useEffect)(() => {
		initializeStore();
	}, [initializeStore]);
	(0, import_react.useEffect)(() => {
		if (!isLoaded) return;
		const full = computeExtentForAllNodes(useCanvasStore.getState().nodes);
		extentRef.current = full;
		setExtent(full);
	}, [isLoaded]);
	(0, import_react.useEffect)(() => {
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
	const displayNodes = import_react.useMemo(() => nodes.map((n) => ({
		...n,
		hidden: n.data?.["hidden"] === true,
		draggable: !handMode && !isDrawingTool(activeTool) && !n.data?.locked && editingNodeId !== n.id,
		className: n.data?.locked ? "locked" : ""
	})), [
		nodes,
		handMode,
		editingNodeId,
		activeTool
	]);
	const handleNodeDragStart = (0, import_react.useCallback)(() => {
		useInteractionStore.getState().setDragging(true);
	}, []);
	const handleNodeDrag = (0, import_react.useCallback)((_e, _node, dragged) => {
		let nextExtent = extentRef.current;
		for (const n of dragged) {
			const w = n.width ?? n.style?.width ?? 200;
			const h = n.height ?? n.style?.minHeight ?? 120;
			nextExtent = ensureExtentForNode(nextExtent, n.position.x, n.position.y, w, h);
		}
		if (nextExtent !== extentRef.current) {
			extentRef.current = nextExtent;
			setExtent(nextExtent);
		}
	}, []);
	const handleNodeDragStop = (0, import_react.useCallback)(() => {
		useInteractionStore.getState().setDragging(false);
	}, []);
	const expandFor = (0, import_react.useCallback)((x, y, w, h) => {
		const next = ensureExtentForNode(extentRef.current, x, y, w ?? 200, h ?? 120);
		if (next !== extentRef.current) {
			extentRef.current = next;
			setExtent(next);
		}
	}, []);
	const handleNodesChange = (0, import_react.useCallback)((changes) => {
		onNodesChange(changes);
		const state = useCanvasStore.getState();
		for (const c of changes) if (c.type === "position" && c.position) {
			const n = state.nodes.find((x) => x.id === c.id);
			if (n) expandFor(c.position.x, c.position.y, n.style?.width, n.style?.minHeight);
		} else if (c.type === "dimensions" && c.dimensions) {
			const n = state.nodes.find((x) => x.id === c.id);
			if (n) expandFor(n.position.x, n.position.y, c.dimensions.width ?? n.style?.width, c.dimensions.height ?? n.style?.minHeight);
		}
	}, [onNodesChange, expandFor]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			const t = e.target;
			const isEditingInput = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
			const editingNode = useInteractionStore.getState().editingNodeId;
			if (e.code === "Space" && !isEditingInput && !editingNode) {
				e.preventDefault();
				if (!useInteractionStore.getState().spaceHeld) useInteractionStore.getState().setSpaceHeld(true);
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
			if (mod && k === "z" && e.shiftKey || mod && k === "y") {
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
					y: (center.y - vp.y) / vp.zoom
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
			if (k === "v") executeCanvasItem("select");
			else if (k === "h") executeCanvasItem("hand");
			else if (k === "c") executeCanvasItem("connector");
			else if (k === "p") executeCanvasItem("pen");
			else if (k === "l") executeCanvasItem("highlighter");
			else if (k === "e") executeCanvasItem("eraser");
			else if (k === "t") addAtViewportCenter(getViewport, "text");
			else if (k === "s") addAtViewportCenter(getViewport, "sticky");
			else if (k === "d") addAtViewportCenter(getViewport, "todo");
			else if (e.key === "Escape") {
				const { editingNodeId, setEditingNode } = useInteractionStore.getState();
				if (editingNodeId) {
					e.preventDefault();
					setEditingNode(null);
					return;
				}
				if (isDrawingTool(useInteractionStore.getState().activeTool) || useInteractionStore.getState().activeTool === "eraser" || activeTool === "connector") {
					e.preventDefault();
					useInteractionStore.getState().setActiveTool("select");
					useInteractionStore.getState().setInteractionMode("canvas");
					drawingPointsRef.current = [];
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
					canvas.nodes.filter((n) => n.selected).forEach((n) => canvas.updateNodePosition(n.id, n.position.x + dx, n.position.y + dy));
				}
			}
		};
		const onKeyUp = (e) => {
			if (e.code === "Space") useInteractionStore.getState().setSpaceHeld(false);
		};
		window.addEventListener("keydown", onKey);
		window.addEventListener("keyup", onKeyUp);
		return () => {
			window.removeEventListener("keydown", onKey);
			window.removeEventListener("keyup", onKeyUp);
		};
	}, [getViewport, activeTool]);
	const handlePaneClick = (0, import_react.useCallback)(() => useCanvasStore.getState().clearSelection(), []);
	const handleMoveEnd = (0, import_react.useCallback)((_e, vp) => saveViewport(vp), []);
	const handleDrop = (0, import_react.useCallback)(async (e) => {
		e.preventDefault();
		const draggedType = e.dataTransfer.getData(SUTONOTE_ITEM_MIME);
		if (draggedType) {
			executeCanvasItem(draggedType, { position: screenToFlowPosition({
				x: e.clientX,
				y: e.clientY
			}) });
			return;
		}
		const files = Array.from(e.dataTransfer.files ?? []);
		const file = files[0];
		if (!file) return;
		const pos = screenToFlowPosition({
			x: e.clientX,
			y: e.clientY
		});
		const createFileNode = async (fileToPlace, index) => {
			const typeMap = {
				"image/": "image",
				"video/": "video",
				"audio/": "audio",
				"application/pdf": "pdf"
			};
			let nodeType = "file";
			for (const [prefix, type] of Object.entries(typeMap)) if (fileToPlace.type.startsWith(prefix) || fileToPlace.type === prefix) {
				nodeType = type;
				break;
			}
			const position = {
				x: pos.x + index * 36,
				y: pos.y + index * 36
			};
			executeCanvasItem(nodeType, { position });
			const id = useCanvasStore.getState().selectedNodeIds[0];
			if (!id) return;
			const assetId = await storeImageAsset(fileToPlace, fileToPlace.name);
			useCanvasStore.getState().updateNodeDataWithHistory(id, {
				assetId,
				caption: fileToPlace.name,
				filename: fileToPlace.name,
				mime: fileToPlace.type,
				sourceType: "local",
				remoteUrl: ""
			});
		};
		const allNodes = useCanvasStore.getState().nodes;
		const emptyAssetTypes = [
			"image",
			"pdf",
			"video",
			"audio",
			"file"
		];
		const hitEmpty = allNodes.find((n) => {
			if (!n.type || !emptyAssetTypes.includes(n.type)) return false;
			if (n.data.assetId || n.data.remoteUrl) return false;
			const w = n.style?.width ?? 280;
			const h = n.style?.minHeight ?? 120;
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
				mime: file.type,
				sourceType: "local",
				remoteUrl: ""
			});
			useCanvasStore.getState().setSelectedIds([hitEmpty.id]);
			await Promise.all(files.slice(1).map((fileToPlace, index) => createFileNode(fileToPlace, index + 1)));
			return;
		}
		await Promise.all(files.map(createFileNode));
	}, [screenToFlowPosition]);
	const handleDragOver = (0, import_react.useCallback)((e) => {
		if (e.dataTransfer.types.includes("Files") || e.dataTransfer.types.includes("application/x-sutonote-item")) {
			e.preventDefault();
			e.dataTransfer.dropEffect = "copy";
		}
	}, []);
	const handlePaneMouseDown = (0, import_react.useCallback)((event) => {
		if (!isDrawingTool(activeTool) || event.button !== 0) return;
		if (!event.target.closest(".react-flow__pane")) return;
		event.preventDefault();
		drawingPointsRef.current = [screenToFlowPosition({
			x: event.clientX,
			y: event.clientY
		})];
		useInteractionStore.getState().setInteractionMode("draw");
	}, [activeTool, screenToFlowPosition]);
	const handlePaneMouseMove = (0, import_react.useCallback)((event) => {
		if (!isDrawingTool(useInteractionStore.getState().activeTool)) return;
		if (drawingPointsRef.current.length === 0) return;
		const point = screenToFlowPosition({
			x: event.clientX,
			y: event.clientY
		});
		const previous = drawingPointsRef.current[drawingPointsRef.current.length - 1];
		if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) < 2) return;
		drawingPointsRef.current.push(point);
	}, [screenToFlowPosition]);
	const handlePaneMouseUp = (0, import_react.useCallback)(() => {
		const points = drawingPointsRef.current;
		drawingPointsRef.current = [];
		if (points.length < 2) {
			useInteractionStore.getState().setInteractionMode("canvas");
			return;
		}
		const minX = Math.min(...points.map((point) => point.x));
		const maxX = Math.max(...points.map((point) => point.x));
		const minY = Math.min(...points.map((point) => point.y));
		const maxY = Math.max(...points.map((point) => point.y));
		const padding = 12;
		const normalized = reduceStroke(points.map((point) => ({
			x: point.x - minX + padding,
			y: point.y - minY + padding
		})));
		const width = Math.max(40, maxX - minX + 24);
		const height = Math.max(40, maxY - minY + 24);
		const tool = useInteractionStore.getState().activeTool;
		const canvas = useCanvasStore.getState();
		executeCanvasItem("drawing", {
			position: {
				x: (minX + maxX) / 2,
				y: (minY + maxY) / 2
			},
			preserveTool: true
		});
		const drawingId = useCanvasStore.getState().selectedNodeIds[0];
		if (drawingId) {
			canvas.updateNodeData(drawingId, {
				points: normalized,
				strokeColor: tool === "highlighter" ? "rgba(250, 204, 21, 0.55)" : "#ef4444",
				strokeWidth: tool === "highlighter" ? 12 : 3
			});
			canvas.updateNodeSize(drawingId, width, height);
		}
		useInteractionStore.getState().setInteractionMode("canvas");
	}, []);
	const cursorClass = isDragging || useInteractionStore.getState().isPanning ? "sut-cursor-grabbing" : handMode ? "sut-cursor-grab" : activeTool === "select" ? "sut-cursor-default" : activeTool === "eraser" ? "sut-cursor-eraser" : "sut-cursor-crosshair";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: containerRef,
		className: "relative w-full h-full",
		onDrop: handleDrop,
		onDragOver: handleDragOver,
		onMouseDown: handlePaneMouseDown,
		onMouseMove: handlePaneMouseMove,
		onMouseUp: handlePaneMouseUp,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ReactFlow, {
			nodes: displayNodes,
			edges,
			onNodesChange: handleNodesChange,
			onEdgesChange,
			onConnect,
			onPaneClick: handlePaneClick,
			onMoveEnd: handleMoveEnd,
			onNodeDragStart: handleNodeDragStart,
			onNodeDrag: handleNodeDrag,
			onNodeDragStop: handleNodeDragStop,
			nodeTypes,
			proOptions: { hideAttribution: true },
			defaultViewport,
			translateExtent: extent,
			onlyRenderVisibleElements: virtualized,
			className: `bg-canvas ${cursorClass}`,
			nodeOrigin: [.5, .5],
			minZoom: .2,
			maxZoom: 2,
			snapToGrid: false,
			snapGrid: [16, 16],
			deleteKeyCode: null,
			multiSelectionKeyCode: [
				"Meta",
				"Shift",
				"Control"
			],
			selectionOnDrag: !handMode && activeTool !== "connector" && !isDrawingTool(activeTool),
			panOnDrag: handMode ? [
				0,
				1,
				2
			] : activeTool === "connector" ? [] : [1, 2],
			nodesDraggable: !handMode && activeTool !== "connector" && !isDrawingTool(activeTool),
			connectionRadius: 30,
			connectOnClick: activeTool === "connector",
			children: [gridVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Background$1, {
				color: "var(--canvas-dot)",
				gap: 24,
				size: .8
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniMap$1, {
				position: "bottom-left",
				pannable: true,
				zoomable: true,
				nodeColor: "var(--muted)",
				nodeBorderRadius: 6,
				maskColor: "rgba(0,0,0,0.08)",
				style: {
					width: 160,
					height: 120,
					background: "var(--popover)",
					border: "1px solid var(--border)",
					borderRadius: 8
				}
			})]
		})
	});
}
function CanvasArea() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReactFlowProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex-1 overflow-hidden",
		style: {
			width: "100%",
			height: "100%"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasInner, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasOverlay, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomToolbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageLightbox, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocumentPreview, {})
		]
	}) });
}
function CanvasOverlay() {
	const count = useCanvasStore((s) => s.nodes.length);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: count === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: {
			opacity: 0,
			y: 6
		},
		animate: {
			opacity: 1,
			y: 0
		},
		exit: {
			opacity: 0,
			y: 6
		},
		transition: {
			duration: .4,
			ease: [
				.22,
				1,
				.36,
				1
			]
		},
		className: "pointer-events-none absolute inset-0 z-10 flex items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-serif text-sm text-muted-foreground/70",
			children: "Click a tool below to begin — or drag to explore the canvas."
		})
	}) });
}
var toolBtn = (active) => `flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-surface-hover hover:text-foreground active:scale-95 ${active ? "bg-surface-active text-foreground" : ""}`;
function BottomToolbar() {
	const { getViewport, zoomIn, zoomOut } = useReactFlow();
	const { zoom } = useViewport();
	const activeTool = useInteractionStore((s) => s.activeTool);
	const [pickerOpen, setPickerOpen] = (0, import_react.useState)(false);
	const [pressed, setPressed] = (0, import_react.useState)(null);
	const createWith = (type) => {
		setPressed(type);
		setTimeout(() => setPressed(null), 180);
		const vp = getViewport();
		const center = getCanvasCenter();
		executeCanvasItem(type, { position: {
			x: (center.x - vp.x) / vp.zoom + (Math.floor(Math.random() * 200) - 100),
			y: (center.y - vp.y) / vp.zoom + (Math.floor(Math.random() * 200) - 100)
		} });
	};
	const drawingTools = [
		"pen",
		"highlighter",
		"eraser"
	].map((type) => getItemDef(type)).filter((item) => Boolean(item));
	const tools = [
		"text",
		"sticky",
		"todo",
		"image",
		"link",
		"shape",
		"section",
		"connector"
	].map((type) => getItemDef(type)).filter((item) => Boolean(item));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-border bg-popover/92 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => executeCanvasItem("select"),
				className: toolBtn(activeTool === "select"),
				"aria-label": "Select (V)",
				title: "Select (V)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MousePointer2, {
					className: "h-[18px] w-[18px]",
					strokeWidth: 1.75
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => executeCanvasItem("hand"),
				className: toolBtn(activeTool === "hand"),
				"aria-label": "Hand / pan (H)",
				title: "Hand / pan (H)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hand, {
					className: "h-[18px] w-[18px]",
					strokeWidth: 1.75
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 h-6 w-px bg-border" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-1",
				children: tools.map(({ type, label, icon: Icon, kind }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					draggable: true,
					onDragStart: (event) => {
						event.stopPropagation();
						setCanvasItemDragData(event.dataTransfer, type);
					},
					onClick: () => kind === "tool" ? executeCanvasItem(type) : createWith(type),
					className: toolBtn(pressed === type || activeTool === type),
					"aria-label": label,
					title: label,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: "h-[18px] w-[18px]",
						strokeWidth: 1.75
					})
				}, type))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setPickerOpen(!pickerOpen),
				className: toolBtn(pickerOpen),
				"aria-label": "More items",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {
					className: "h-[18px] w-[18px]",
					strokeWidth: 1.75
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 h-6 w-px bg-border" }),
			drawingTools.map(({ type, label, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => executeCanvasItem(type),
				className: toolBtn(activeTool === type),
				"aria-label": label,
				title: label,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "h-[18px] w-[18px]",
					strokeWidth: 1.75
				})
			}, type)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 h-6 w-px bg-border" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => zoomOut(),
				className: toolBtn(false),
				"aria-label": "Zoom out",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomOut, {
					className: "h-[18px] w-[18px]",
					strokeWidth: 1.75
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-[40px] text-center text-[11px] font-mono tabular-nums text-muted-foreground",
				children: [Math.round(zoom * 100), "%"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => zoomIn(),
				className: toolBtn(false),
				"aria-label": "Zoom in",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, {
					className: "h-[18px] w-[18px]",
					strokeWidth: 1.75
				})
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolPicker, {
		open: pickerOpen,
		onClose: () => setPickerOpen(false)
	})] });
}
var colors = [
	{
		name: "Yellow",
		class: "bg-note-yellow"
	},
	{
		name: "Rose",
		class: "bg-note-rose"
	},
	{
		name: "Sage",
		class: "bg-note-sage"
	},
	{
		name: "Lavender",
		class: "bg-note-lavender"
	},
	{
		name: "Blue",
		class: "bg-note-blue"
	},
	{
		name: "White",
		class: "bg-card"
	}
];
function SectionLabel({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80",
		children
	});
}
function Field({ label, value, onCommit, step = 1 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex items-center gap-2 text-xs text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "w-4 text-center",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "number",
			step,
			value: value ?? "",
			placeholder: value === null ? "Mixed" : void 0,
			onChange: (e) => {
				const n = parseFloat(e.target.value);
				if (!Number.isNaN(n)) onCommit(n);
			},
			className: "w-full rounded-[5px] border border-border bg-surface px-2 py-1 text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/20"
		})]
	});
}
function IconBtn({ label, icon: Icon, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		"aria-label": label,
		title: label,
		className: "flex flex-1 items-center justify-center rounded-[5px] p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: "h-4 w-4",
			strokeWidth: 1.75
		})
	});
}
function RightPropertiesSidebar() {
	const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
	const nodes = useCanvasStore((s) => s.nodes);
	const patchSelectedData = useCanvasStore((s) => s.patchSelectedData);
	const setPositionSelected = useCanvasStore((s) => s.setPositionSelected);
	const setSizeSelected = useCanvasStore((s) => s.setSizeSelected);
	const setWidthSelected = useCanvasStore((s) => s.setWidthSelected);
	const setHeightSelected = useCanvasStore((s) => s.setHeightSelected);
	const setRotationSelected = useCanvasStore((s) => s.setRotationSelected);
	const setOpacitySelected = useCanvasStore((s) => s.setOpacitySelected);
	const bringToFront = useCanvasStore((s) => s.bringToFront);
	const sendToBack = useCanvasStore((s) => s.sendToBack);
	const bringForward = useCanvasStore((s) => s.bringForward);
	const sendBackward = useCanvasStore((s) => s.sendBackward);
	const alignSelected = useCanvasStore((s) => s.alignSelected);
	const distributeSelected = useCanvasStore((s) => s.distributeSelected);
	const matchSizeSelected = useCanvasStore((s) => s.matchSizeSelected);
	const setColorSelected = useCanvasStore((s) => s.setColorSelected);
	const setBackgroundColorSelected = useCanvasStore((s) => s.setBackgroundColorSelected);
	const setLockedSelected = useCanvasStore((s) => s.setLockedSelected);
	const groupSelected = useCanvasStore((s) => s.groupSelected);
	const ungroupSelected = useCanvasStore((s) => s.ungroupSelected);
	const duplicateSelected = useCanvasStore((s) => s.duplicateSelected);
	const deleteSelected = useCanvasStore((s) => s.deleteSelected);
	const imageRef = (0, import_react.useRef)(null);
	const selected = (0, import_react.useMemo)(() => nodes.filter((n) => selectedNodeIds.includes(n.id)), [nodes, selectedNodeIds]);
	if (selected.length === 0) return null;
	const node = selected[0];
	if (!node) return null;
	const multi = selected.length > 1;
	const def = getNodeDef(node.type ?? "text");
	const capabilities = getItemDef(node.type ?? "text")?.capabilities ?? {};
	const locked = node.data.locked ?? false;
	const hasGroup = selected.some((n) => n.data.groupId);
	const commonStyle = (key) => {
		const vals = selected.map((n) => n.style?.[key]);
		return vals.every((v) => v === vals[0]) ? vals[0] : null;
	};
	const commonData = (key) => {
		const vals = selected.map((n) => n.data[key]);
		return vals.every((v) => v === vals[0]) ? vals[0] : null;
	};
	const colorMatches = selected.every((n) => n.data.color === node.data.color) && node.data.color !== void 0;
	const rotationVal = commonData("rotation");
	const opacityVal = commonData("opacity");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full w-full flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center justify-between border-b border-border/50 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-medium uppercase tracking-wider text-muted-foreground",
					children: multi ? `${selected.length} items selected` : "Properties"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: deleteSelected,
					"aria-label": "Delete",
					className: "rounded-[5px] p-1.5 text-destructive transition-colors hover:bg-destructive/10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 16 })
				})]
			}),
			!multi && node.type === "table" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-b border-border/50 px-4 py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => useItemEditorStore.getState().open(node.id, "table", "window"),
					className: "flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table2, { className: "h-3.5 w-3.5" }), "Edit table"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "flex-1 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Transform" }),
							!multi ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "X",
										value: Math.round(node.position.x),
										onCommit: (n) => setPositionSelected(node.id, n, node.position.y)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Y",
										value: Math.round(node.position.y),
										onCommit: (n) => setPositionSelected(node.id, node.position.x, n)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "W",
										value: commonStyle("width"),
										onCommit: (n) => setSizeSelected(node.id, Math.max(def.minWidth, n), node.style?.minHeight)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "H",
										value: commonStyle("minHeight"),
										onCommit: (n) => setSizeSelected(node.id, node.style?.width, Math.max(def.minHeight, n))
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "W",
									value: commonStyle("width"),
									onCommit: (n) => setWidthSelected(n)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "H",
									value: commonStyle("minHeight"),
									onCommit: (n) => setHeightSelected(n)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "R",
									value: rotationVal !== null ? Math.round(rotationVal) : null,
									onCommit: (n) => setRotationSelected(n)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setRotationSelected(0),
									className: "rounded-[5px] border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-surface-hover",
									children: "Reset"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-4 text-center",
											children: "O"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "range",
											min: 20,
											max: 100,
											value: opacityVal ?? 100,
											onChange: (e) => setOpacitySelected(parseInt(e.target.value)),
											className: "flex-1"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-8 text-right text-[11px] tabular-nums",
											children: opacityVal === null ? "Mixed" : `${opacityVal}%`
										})
									]
								})
							})
						] }),
						(capabilities.background || node.type === "text" || node.type === "sticky" || node.type === "todo" || node.type === "shape" || node.type === "section" || node.type === "frame" || node.type === "column") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Appearance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-6 gap-2",
							children: [colors.map((color, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setColorSelected(color.class),
								"aria-label": color.name,
								title: color.name,
								className: `aspect-square rounded-[5px] border border-border-strong transition-all ${colorMatches && node.data.color === color.class ? "ring-2 ring-foreground/40 ring-offset-1" : "hover:scale-105"} ${color.class}`
							}, `${color.name}-${i}`)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SutonoteColorPicker, {
								value: node.data.backgroundColor ?? "",
								onChange: (c) => setBackgroundColorSelected(c),
								palette: "object"
							})]
						})] }),
						!multi && (node.type === "section" || node.type === "frame" || node.type === "column") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Container" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								node.type !== "column" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: node.data["showTitle"] ?? true,
										onChange: (event) => patchSelectedData({ showTitle: event.target.checked }),
										className: "accent-primary"
									}), "Show title"]
								}),
								node.type === "column" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "G",
										value: node.data.gap ?? 10,
										onCommit: (value) => patchSelectedData({ gap: Math.max(0, value) })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "P",
										value: node.data.padding ?? 12,
										onCommit: (value) => patchSelectedData({ padding: Math.max(0, value) })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-center gap-2 text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: node.data.autoHeight ?? false,
											onChange: (event) => patchSelectedData({ autoHeight: event.target.checked }),
											className: "accent-primary"
										}), "Auto height"]
									})
								] }),
								node.type === "section" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "BO",
									value: node.data["borderOpacity"] ?? 70,
									onCommit: (value) => patchSelectedData({ borderOpacity: Math.max(0, Math.min(100, value)) })
								})
							]
						})] }),
						!multi && node.type === "shape" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Shape" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-12",
										children: "Type"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: node.data.shape ?? "rectangle",
										onChange: (e) => patchSelectedData({ shape: e.target.value }),
										className: "flex-1 rounded-[5px] border border-border bg-surface px-2 py-1 text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/20",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "rectangle",
												children: "Rectangle"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "rounded-rectangle",
												children: "Rounded"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "circle",
												children: "Circle"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "diamond",
												children: "Diamond"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-12",
											children: "Fill"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SutonoteColorPicker, {
											value: node.data.fill ?? "transparent",
											onChange: (c) => patchSelectedData({ fill: c }),
											palette: "object"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px]",
											children: node.data.fill || "none"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-12",
										children: "Stroke"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SutonoteColorPicker, {
										value: node.data.stroke ?? "#000000",
										onChange: (c) => patchSelectedData({ stroke: c }),
										palette: "object"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "W",
									value: node.data.strokeWidth ?? 2,
									onCommit: (n) => patchSelectedData({ strokeWidth: n }),
									step: 1
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "R",
									value: node.data.rotation ?? 0,
									onCommit: (n) => patchSelectedData({ rotation: n }),
									step: 1
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-12",
											children: "Opacity"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "range",
											min: 20,
											max: 100,
											value: node.data.opacity ?? 100,
											onChange: (e) => patchSelectedData({ opacity: parseInt(e.target.value) }),
											className: "flex-1"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-8 text-right text-[11px] tabular-nums",
											children: `${node.data.opacity ?? 100}%`
										})
									]
								}),
								node.data.shape === "rounded-rectangle" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "CR",
									value: node.data.cornerRadius ?? 12,
									onCommit: (n) => patchSelectedData({ cornerRadius: n }),
									step: 1
								})
							]
						})] }),
						!multi && node.type === "color_swatch" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Swatch" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-12",
									children: "Color"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SutonoteColorPicker, {
									value: node.data.color ?? "#6366f1",
									onChange: (c) => patchSelectedData({ color: c }),
									palette: "object"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-12",
									children: "Label"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: node.data.label ?? "",
									onChange: (e) => patchSelectedData({ label: e.target.value }),
									placeholder: "Color name",
									className: "flex-1 rounded-[5px] border border-border bg-surface px-2 py-1 text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/20"
								})]
							})]
						})] }),
						!multi && node.type === "folder" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Folder" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: node.data.title ?? "",
								onChange: (e) => patchSelectedData({ title: e.target.value }),
								placeholder: "Folder name",
								className: "mb-2 w-full rounded-[5px] border border-border bg-surface px-2 py-1 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/20"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-2 grid grid-cols-8 gap-1",
								children: FOLDER_ICONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									title: opt.label,
									"aria-label": opt.label,
									onClick: () => patchSelectedData({ icon: opt.id }),
									className: `flex aspect-square items-center justify-center rounded-[5px] border transition-colors ${(node.data["icon"] ?? "folder") === opt.id ? "border-border-strong bg-surface-active text-foreground" : "border-border text-muted-foreground hover:bg-surface-hover hover:text-foreground"}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(opt.icon, {
										className: "h-3.5 w-3.5",
										strokeWidth: 1.75
									})
								}, opt.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-12",
										children: "Icon"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SutonoteColorPicker, {
										value: node.data["iconColor"] ?? "",
										onChange: (c) => patchSelectedData({ iconColor: c }),
										palette: "object"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => patchSelectedData({ iconColor: "" }),
										className: "rounded-[5px] border border-border px-2 py-1 text-[11px] hover:bg-surface-hover",
										children: "Default"
									})
								]
							})
						] }),
						!multi && node.type === "board" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Board" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: node.data.title ?? "",
							onChange: (e) => patchSelectedData({ title: e.target.value }),
							placeholder: "Board name",
							className: "w-full rounded-[5px] border border-border bg-surface px-2 py-1 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/20"
						})] }),
						!multi && node.type === "link" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Link" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: node.data.url ?? "",
								onChange: (e) => patchSelectedData({ url: e.target.value }),
								placeholder: "https://…",
								className: "mb-2 w-full rounded-[5px] border border-border bg-surface px-2 py-1 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/20"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: node.data.title ?? "",
								onChange: (e) => patchSelectedData({ title: e.target.value }),
								placeholder: "Title",
								className: "w-full rounded-[5px] border border-border bg-surface px-2 py-1 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/20"
							})
						] }),
						!multi && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Arrange" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex w-full gap-1 rounded-[var(--radius-panel)] border border-border p-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
									label: "Bring forward",
									icon: ArrowUp,
									onClick: () => bringForward(node.id)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
									label: "Send backward",
									icon: ArrowDown,
									onClick: () => sendBackward(node.id)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
									label: "Bring to front",
									icon: BringToFront,
									onClick: () => bringToFront(node.id)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
									label: "Send to back",
									icon: SendToBack,
									onClick: () => sendToBack(node.id)
								})
							]
						})] }),
						multi && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Arrange" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex w-full gap-1 rounded-[var(--radius-panel)] border border-border p-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
								label: "Bring to front",
								icon: BringToFront,
								onClick: () => selected.forEach((n) => bringToFront(n.id))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
								label: "Send to back",
								icon: SendToBack,
								onClick: () => selected.forEach((n) => sendToBack(n.id))
							})]
						})] }),
						multi && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Align" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "rounded-[5px] border border-border py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover",
										onClick: () => alignSelected("left"),
										children: "Left"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "rounded-[5px] border border-border py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover",
										onClick: () => alignSelected("centerX"),
										children: "Center"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "rounded-[5px] border border-border py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover",
										onClick: () => alignSelected("right"),
										children: "Right"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "rounded-[5px] border border-border py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover",
										onClick: () => alignSelected("top"),
										children: "Top"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "rounded-[5px] border border-border py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover",
										onClick: () => alignSelected("centerY"),
										children: "Middle"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "rounded-[5px] border border-border py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover",
										onClick: () => alignSelected("bottom"),
										children: "Bottom"
									})
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Distribute" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "rounded-[5px] border border-border py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover",
									onClick: () => distributeSelected("horizontal"),
									children: "Horizontally"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "rounded-[5px] border border-border py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover",
									onClick: () => distributeSelected("vertical"),
									children: "Vertically"
								})]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Size" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "rounded-[5px] border border-border py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover",
									onClick: () => matchSizeSelected("width"),
									children: "Match width"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "rounded-[5px] border border-border py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-hover",
									onClick: () => matchSizeSelected("height"),
									children: "Match height"
								})]
							})] })
						] }),
						!multi && node.type === "todo" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "To-do" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: node.data.title ?? "To-do",
								onChange: (e) => patchSelectedData({ title: e.target.value }),
								placeholder: "Title",
								className: "mb-2 w-full rounded-[5px] border border-border bg-surface px-2 py-1 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/20"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: node.data.showCompleted ?? true,
										onChange: (e) => patchSelectedData({ showCompleted: e.target.checked }),
										className: "accent-primary"
									}), "Show completed"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "rounded-[5px] border border-border px-2 py-1 hover:bg-surface-hover",
									onClick: () => {
										const todos = Array.isArray(node.data.todos) ? node.data.todos : [];
										patchSelectedData({ todos: todos.filter((t) => !t.done) });
									},
									children: "Clear completed"
								})]
							})
						] }),
						!multi && node.type === "image" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Image" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: imageRef,
								type: "file",
								accept: "image/*",
								className: "hidden",
								onChange: async (e) => {
									const file = e.target.files?.[0];
									if (!file) return;
									const assetId = await storeImageAsset(file, file.name);
									patchSelectedData({
										assetId,
										caption: file.name
									});
									e.target.value = "";
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => imageRef.current?.click(),
								className: "mb-2 flex w-full items-center justify-center gap-2 rounded-[5px] border border-border py-1.5 text-xs text-muted-foreground hover:bg-surface-hover",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Replace, { className: "h-3.5 w-3.5" }), " Replace image"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mb-2 flex items-center gap-2 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: node.data.captionVisible ?? true,
									onChange: (e) => patchSelectedData({ captionVisible: e.target.checked }),
									className: "accent-primary"
								}), "Show caption"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: node.data.alt ?? "",
								onChange: (e) => patchSelectedData({ alt: e.target.value }),
								placeholder: "Alt text",
								className: "w-full rounded-[5px] border border-border bg-surface px-2 py-1 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/20"
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Actions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex w-full gap-1 rounded-[var(--radius-panel)] border border-border p-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
									label: "Duplicate",
									icon: Copy,
									onClick: duplicateSelected
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
									label: locked ? "Unlock" : "Lock",
									icon: locked ? LockOpen : Lock,
									onClick: () => setLockedSelected(!locked)
								}),
								multi && selected.length >= 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
									label: hasGroup ? "Ungroup" : "Group",
									icon: hasGroup ? Ungroup : Group,
									onClick: () => hasGroup ? ungroupSelected() : groupSelected()
								})
							]
						})] })
					]
				})
			})
		]
	});
}
var Command$1 = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e, {
	ref,
	className: cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className),
	...props
}));
Command$1.displayName = _e.displayName;
var CommandDialog = ({ children, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			className: "overflow-hidden p-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Command$1, {
				className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5",
				children
			})
		})
	});
};
var CommandInput = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "flex items-center border-b px-3",
	"cmdk-input-wrapper": "",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Input, {
		ref,
		className: cn("flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	})]
}));
CommandInput.displayName = _e.Input.displayName;
var CommandList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.List, {
	ref,
	className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
	...props
}));
CommandList.displayName = _e.List.displayName;
var CommandEmpty = import_react.forwardRef((props, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Empty, {
	ref,
	className: "py-6 text-center text-sm",
	...props
}));
CommandEmpty.displayName = _e.Empty.displayName;
var CommandGroup = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
	ref,
	className: cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className),
	...props
}));
CommandGroup.displayName = _e.Group.displayName;
var CommandSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Separator, {
	ref,
	className: cn("-mx-1 h-px bg-border", className),
	...props
}));
CommandSeparator.displayName = _e.Separator.displayName;
var CommandItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Item, {
	ref,
	className: cn("relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", className),
	...props
}));
CommandItem.displayName = _e.Item.displayName;
var CommandShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest text-muted-foreground", className),
		...props
	});
};
CommandShortcut.displayName = "CommandShortcut";
function CommandPalette({ open, onOpenChange }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const inputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (open) inputRef.current?.focus();
	}, [open]);
	const execute = (0, import_react.useCallback)((type) => {
		if (executeCanvasItem(type)) onOpenChange(false);
	}, [onOpenChange]);
	const exportBoard = (0, import_react.useCallback)(() => {
		const { nodes, edges } = useCanvasStore.getState();
		const data = JSON.stringify({
			nodes,
			edges
		}, null, 2);
		const blob = new Blob([data], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "sutonote-board.json";
		a.click();
		URL.revokeObjectURL(url);
		onOpenChange(false);
		useNoticeStore.getState().show("Board exported", "success");
	}, [onOpenChange]);
	const allActions = (0, import_react.useMemo)(() => {
		return [...ITEM_REGISTRY.filter((item) => item.status !== "coming-soon").map((item) => ({
			label: item.kind === "node" ? `Add ${item.label}` : item.type === "pen" ? "Pen Tool" : item.label,
			icon: item.icon,
			action: () => execute(item.type)
		})), {
			label: "Export board",
			icon: Download,
			action: exportBoard
		}];
	}, [execute, exportBoard]);
	const filteredActions = (0, import_react.useMemo)(() => allActions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase())), [allActions, query]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandDialog, {
		open,
		onOpenChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, {
			ref: inputRef,
			placeholder: "Search actions...",
			onChange: (e) => setQuery(e.target.value)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, {
			className: "p-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: "No results." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
					heading: "Insert",
					children: filteredActions.filter((a) => a.label.startsWith("Add")).map((action) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						onSelect: action.action,
						className: "gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(action.icon, { className: "h-4 w-4 text-muted-foreground" }), action.label]
					}, action.label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
					heading: "Board",
					children: filteredActions.filter((a) => !a.label.startsWith("Add")).map((action) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						onSelect: action.action,
						className: "gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(action.icon, { className: "h-4 w-4 text-muted-foreground" }), action.label]
					}, action.label))
				})
			]
		})]
	});
}
var kindStyles = {
	info: "bg-popover border-border text-foreground",
	success: "bg-popover border-border text-foreground",
	error: "bg-destructive/10 border-destructive/30 text-destructive"
};
var kindIcon = {
	info: Info,
	success: CircleCheck,
	error: CircleX
};
function NoticeBar() {
	const notice = useNoticeStore((s) => s.notice);
	const dismiss = useNoticeStore((s) => s.dismiss);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none fixed left-1/2 top-12 z-[60] -translate-x-1/2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: notice && (() => {
			const Icon = kindIcon[notice.kind];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				initial: {
					opacity: 0,
					y: -8
				},
				animate: {
					opacity: 1,
					y: 0
				},
				exit: {
					opacity: 0,
					y: -8
				},
				transition: {
					duration: .2,
					ease: [
						.22,
						1,
						.36,
						1
					]
				},
				className: `pointer-events-auto flex items-center gap-2 rounded-xl border px-4 py-2 shadow-lg backdrop-blur-md ${kindStyles[notice.kind]}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: "h-3.5 w-3.5 shrink-0",
						strokeWidth: 1.75
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-medium",
						children: notice.message
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: dismiss,
						className: "ml-1 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground",
						"aria-label": "Dismiss",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-3 w-3" })
					})
				]
			}, notice.id);
		})() })
	});
}
var CanvasErrorBoundary = class extends import_react.Component {
	constructor(props) {
		super(props);
		this.state = {
			hasError: false,
			error: null
		};
	}
	static getDerivedStateFromError(error) {
		return {
			hasError: true,
			error
		};
	}
	componentDidCatch(error) {
		console.error("[CanvasErrorBoundary]", error);
	}
	render() {
		if (this.state.hasError) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-full w-full flex-col items-center justify-center gap-4 bg-background p-8 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-destructive/30 bg-destructive/5 p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-destructive",
					children: "Canvas failed to render"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: this.state.error?.message ?? "Unknown error"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => this.setState({
					hasError: false,
					error: null
				}),
				className: "inline-flex items-center gap-2 rounded-lg border border-border bg-popover px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5" }), "Try again"]
			})]
		});
		return this.props.children;
	}
};
var labels = {
	sticky: "Sticky note",
	text: "Text",
	todo: "To-do",
	image: "Image",
	link: "Link",
	section: "Section",
	frame: "Frame",
	column: "Column",
	board: "Board",
	folder: "Folder",
	audio: "Audio",
	table: "Table",
	drawing: "Drawing"
};
function LayersPanel() {
	const nodes = useCanvasStore((s) => s.nodes);
	const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
	const setSelectedIds = useCanvasStore((s) => s.setSelectedIds);
	const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
	const childrenByParent = /* @__PURE__ */ new Map();
	const nodeIds = new Set(nodes.map((node) => node.id));
	for (const node of nodes) {
		const parentId = node.data.parentId;
		if (!parentId || !nodeIds.has(parentId)) continue;
		const children = childrenByParent.get(parentId) ?? [];
		children.push(node);
		childrenByParent.set(parentId, children);
	}
	const ordered = (items, parentId) => {
		const order = parentId ? nodes.find((node) => node.id === parentId)?.data.childOrder ?? [] : [];
		return [...items].sort((a, b) => {
			const aIndex = order.indexOf(a.id);
			const bIndex = order.indexOf(b.id);
			if (aIndex !== -1 || bIndex !== -1) return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
			return (b.zIndex ?? 0) - (a.zIndex ?? 0);
		});
	};
	const renderLayer = (node, depth, ancestors) => {
		if (ancestors.has(node.id)) return [];
		const nextAncestors = new Set(ancestors).add(node.id);
		const children = ordered(childrenByParent.get(node.id) ?? [], node.id);
		const selected = selectedNodeIds.includes(node.id);
		const hidden = node.data["hidden"] === true;
		const locked = node.data.locked === true;
		const label = node.data.title || node.data.text || labels[node.type ?? ""] || "Layer";
		return [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `group flex items-center gap-2 rounded-lg py-1.5 pr-2 text-xs ${selected ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"}`,
			style: { paddingLeft: 8 + depth * 14 },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "min-w-0 flex-1 truncate text-left",
					onClick: () => setSelectedIds([node.id]),
					title: label,
					children: [children.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mr-1 text-[9px] text-muted-foreground/60",
						children: "▾"
					}), label]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": hidden ? "Show layer" : "Hide layer",
					className: "rounded p-1 opacity-60 transition-colors hover:bg-surface-active hover:opacity-100",
					onClick: () => updateNodeDataWithHistory(node.id, { hidden: !hidden }),
					children: hidden ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": locked ? "Unlock layer" : "Lock layer",
					className: "rounded p-1 opacity-60 transition-colors hover:bg-surface-active hover:opacity-100",
					onClick: () => updateNodeDataWithHistory(node.id, { locked: !locked }),
					children: locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "h-3.5 w-3.5" })
				})
			]
		}, node.id), ...children.flatMap((child) => renderLayer(child, depth + 1, nextAncestors))];
	};
	const rootNodes = ordered(nodes.filter((node) => {
		const parentId = node.data.parentId;
		return !parentId || !nodeIds.has(parentId);
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "h-[275px] shrink-0 overflow-hidden rounded-[var(--radius-panel)] border border-border bg-popover/95 shadow-xl backdrop-blur-md",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between border-b border-border px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xs font-semibold tracking-wide text-foreground",
				children: "Layers"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] tabular-nums text-muted-foreground",
				children: nodes.length
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-[calc(100%-49px)] overflow-y-auto overscroll-contain p-1.5",
			children: nodes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 py-4 text-xs text-muted-foreground",
				children: "No layers yet"
			}) : rootNodes.flatMap((node) => renderLayer(node, 0, /* @__PURE__ */ new Set()))
		})]
	});
}
var CELL_TYPES = [
	"text",
	"number",
	"checkbox",
	"date"
];
function TableEditor({ nodeId, onClose }) {
	const node = useCanvasStore((state) => state.nodes.find((item) => item.id === nodeId));
	const updateNodeData = useCanvasStore((state) => state.updateNodeData);
	const updateNodeDataWithHistory = useCanvasStore((state) => state.updateNodeDataWithHistory);
	const persisted = (0, import_react.useMemo)(() => node?.data.table ?? createDefaultTable(), [node?.data.table]);
	const [table, setTable] = (0, import_react.useState)(persisted);
	(0, import_react.useEffect)(() => setTable(persisted), [persisted]);
	if (!node) return null;
	const commit = (next, withHistory = true) => {
		setTable(next);
		if (withHistory) updateNodeDataWithHistory(nodeId, { table: next });
	};
	const updateColumn = (index, patch) => {
		const next = {
			...table,
			columns: table.columns.map((column, columnIndex) => columnIndex === index ? {
				...column,
				...patch
			} : column)
		};
		setTable(next);
	};
	const addRow = () => commit({
		...table,
		rows: [...table.rows, {
			id: nanoid(6),
			cells: table.columns.map(() => "")
		}]
	});
	const addColumn = () => commit({
		...table,
		columns: [...table.columns, {
			id: nanoid(6),
			label: `Column ${table.columns.length + 1}`,
			kind: "text"
		}],
		rows: table.rows.map((row) => ({
			...row,
			cells: [...row.cells, ""]
		}))
	});
	const removeColumn = (index) => {
		if (table.columns.length <= 1) return;
		commit({
			...table,
			columns: table.columns.filter((_, columnIndex) => columnIndex !== index),
			rows: table.rows.map((row) => ({
				...row,
				cells: row.cells.filter((_, columnIndex) => columnIndex !== index)
			}))
		});
	};
	const removeRow = (index) => {
		if (table.rows.length <= 1) return;
		commit({
			...table,
			rows: table.rows.filter((_, rowIndex) => rowIndex !== index)
		});
	};
	const setCell = (rowIndex, columnIndex, value) => {
		setTable(updateTableCell(table, rowIndex, columnIndex, value));
	};
	const cellValue = (row, index) => row.cells[index] ?? "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-3 border-b border-border/70 bg-popover px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table2, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: node.data.title || "Table",
						onChange: (event) => updateNodeData(nodeId, { title: event.target.value }),
						onBlur: (event) => updateNodeDataWithHistory(nodeId, { title: event.target.value }),
						className: "min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none",
						"aria-label": "Table name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[11px] tabular-nums text-muted-foreground",
						children: [
							table.rows.length,
							" × ",
							table.columns.length
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-hover",
						children: "Done"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-auto bg-card p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[620px] border-collapse text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [table.columns.map((column, columnIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
						className: "border border-border bg-muted/30 p-2 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: column.label,
								onChange: (event) => updateColumn(columnIndex, { label: event.target.value }),
								onBlur: () => updateNodeDataWithHistory(nodeId, { table }),
								className: "min-w-0 flex-1 bg-transparent font-semibold text-foreground outline-none",
								"aria-label": `${column.label} column name`
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => removeColumn(columnIndex),
								className: "rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
								"aria-label": `Remove ${column.label} column`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: column.kind ?? "text",
							onChange: (event) => updateColumn(columnIndex, { kind: event.target.value }),
							onBlur: () => updateNodeDataWithHistory(nodeId, { table }),
							className: "mt-2 w-full rounded border border-border bg-surface px-1.5 py-1 text-[10px] text-muted-foreground outline-none",
							"aria-label": `${column.label} column type`,
							children: CELL_TYPES.map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: kind,
								children: kind === "checkbox" ? "Checkbox" : kind[0]?.toUpperCase() + kind.slice(1)
							}, kind))
						})]
					}, column.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "w-12 border border-border bg-muted/20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: addColumn,
							className: "rounded p-2 text-muted-foreground hover:text-foreground",
							"aria-label": "Add column",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" })
						})
					})] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: table.rows.map((row, rowIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [table.columns.map((column, columnIndex) => {
						const value = cellValue(row, columnIndex);
						if (column.kind === "checkbox") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "border border-border p-2 text-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: value === "true",
								onChange: (event) => commit(updateTableCell(table, rowIndex, columnIndex, String(event.target.checked))),
								"aria-label": `${column.label}, row ${rowIndex + 1}`
							})
						}, column.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "border border-border p-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: column.kind === "number" ? "number" : column.kind === "date" ? "date" : "text",
								value,
								onChange: (event) => setCell(rowIndex, columnIndex, event.target.value),
								onBlur: () => updateNodeDataWithHistory(nodeId, { table }),
								className: "w-full bg-transparent px-2.5 py-2.5 text-foreground outline-none focus:bg-muted/20",
								"aria-label": `${column.label}, row ${rowIndex + 1}`
							})
						}, column.id);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border border-border p-1 text-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-center gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => commit(reorderTableRows(table, rowIndex, -1)),
									"aria-label": `Move row ${rowIndex + 1} up`,
									className: "rounded px-1 text-muted-foreground hover:bg-surface-hover",
									children: "↑"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => commit(reorderTableRows(table, rowIndex, 1)),
									"aria-label": `Move row ${rowIndex + 1} down`,
									className: "rounded px-1 text-muted-foreground hover:bg-surface-hover",
									children: "↓"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => removeRow(rowIndex),
									"aria-label": `Remove row ${rowIndex + 1}`,
									className: "rounded p-1 text-muted-foreground hover:text-destructive",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
								})
							]
						})
					})] }, row.id)) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-2 border-t border-border/70 bg-popover px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: addRow,
						className: "flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Row"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: addColumn,
						className: "flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Column"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-auto flex items-center gap-1 text-[10px] text-muted-foreground/70",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3 text-emerald-500" }), " Saved locally"]
					})
				]
			})
		]
	});
}
var ITEM_EDITOR_REGISTRY = [{
	type: "table",
	mode: "window",
	component: TableEditor
}];
function getItemEditor(type) {
	return ITEM_EDITOR_REGISTRY.find((definition) => definition.type === type);
}
function FloatingItemEditor() {
	const active = useItemEditorStore((state) => state.active);
	const close = useItemEditorStore((state) => state.close);
	const node = useCanvasStore((state) => active ? state.nodes.find((item) => item.id === active.nodeId) : void 0);
	const definition = active ? getItemEditor(active.type) : void 0;
	const item = active ? getItemDef(active.type) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
		initial: false,
		children: active && node && definition && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				y: 18,
				scale: .97
			},
			animate: {
				opacity: 1,
				y: 0,
				scale: 1
			},
			exit: {
				opacity: 0,
				y: 18,
				scale: .97
			},
			transition: {
				duration: .18,
				ease: [
					.22,
					1,
					.36,
					1
				]
			},
			className: "pointer-events-auto fixed bottom-24 left-1/2 z-[70] flex h-[min(68dvh,560px)] w-[min(760px,calc(100vw-32px))] -translate-x-1/2 flex-col overflow-hidden rounded-[10px] border border-border bg-card shadow-2xl",
			role: "dialog",
			"aria-modal": "false",
			"aria-label": `${item?.label ?? active.type} editor`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-none absolute left-3 top-3 z-10 flex gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: close,
						className: "pointer-events-auto h-3 w-3 rounded-full bg-[#d35e53]",
						"aria-label": "Close editor"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: close,
						className: "pointer-events-auto h-3 w-3 rounded-full bg-[#e5c34b]",
						"aria-label": "Close editor"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(definition.component, {
						nodeId: node.id,
						onClose: close
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: close,
					"aria-label": "Close editor",
					className: "absolute right-3 top-2 z-10 rounded p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				})
			]
		}, active.nodeId)
	});
}
function resolveDark(theme) {
	if (theme === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches;
	return theme === "dark";
}
function useThemeManager() {
	const theme = useSettingsStore((s) => s.theme);
	(0, import_react.useEffect)(() => {
		const apply = () => {
			const dark = resolveDark(theme);
			document.documentElement.classList.toggle("dark", dark);
		};
		apply();
		if (theme === "system") {
			const mq = window.matchMedia("(prefers-color-scheme: dark)");
			mq.addEventListener("change", apply);
			return () => mq.removeEventListener("change", apply);
		}
	}, [theme]);
}
function Workspace() {
	const [paletteOpen, setPaletteOpen] = (0, import_react.useState)(false);
	const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
	const lastSaveError = useCanvasStore((s) => s.lastSaveError);
	useThemeManager();
	(0, import_react.useEffect)(() => {
		if (lastSaveError) import("./notice-store-Do7Ncs7S.mjs").then(({ useNoticeStore }) => useNoticeStore.getState().show(`Save failed: ${lastSaveError}`, "error"));
	}, [lastSaveError]);
	(0, import_react.useEffect)(() => {
		const onKeyDown = (e) => {
			if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setPaletteOpen((open) => !open);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh w-screen overflow-hidden bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasErrorBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasArea, {}) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-0 z-30",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-auto absolute left-4 right-4 top-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceHeader, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto fixed bottom-4 right-4 flex max-h-[calc(100dvh-8rem)] w-[238px] flex-col justify-end overflow-y-auto overscroll-contain scrollbar-thin",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
						initial: false,
						children: selectedNodeIds.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							initial: {
								opacity: 0,
								y: 16,
								scale: .96
							},
							animate: {
								opacity: 1,
								y: 0,
								scale: 1
							},
							exit: {
								opacity: 0,
								y: 16,
								scale: .96
							},
							transition: {
								duration: .18,
								ease: [
									.22,
									1,
									.36,
									1
								]
							},
							className: "mb-3 h-[275px] shrink-0 overflow-hidden rounded-[8px] border border-border bg-popover/95 shadow-xl backdrop-blur-md",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RightPropertiesSidebar, {})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayersPanel, {})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandPalette, {
				open: paletteOpen,
				onOpenChange: setPaletteOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingItemEditor, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoticeBar, {})
		]
	});
}
//#endregion
export { replaceImageAsset as a, storeImageAsset as c, Workspace as component, getAssetUrl as i, useNoticeStore as n, storeAsset as o, getAssetBlob as r, storeAssetBlob as s, useCanvasStore as t };
