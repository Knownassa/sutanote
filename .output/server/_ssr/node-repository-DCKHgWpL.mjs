import { n as __exportAll } from "../_runtime.mjs";
import { t as db } from "./database-zWc1BJtE.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/node-repository-DCKHgWpL.js
var node_repository_DCKHgWpL_exports = /* @__PURE__ */ __exportAll({
	n: () => node_repository_exports,
	r: () => getNodeDef,
	t: () => loadNodesByBoard
});
var NODE_DEFINITIONS = {
	text: {
		defaultWidth: 280,
		defaultHeight: 120,
		minWidth: 200,
		minHeight: 80,
		maxWidth: 520,
		resizeMode: "width-content",
		editableText: true
	},
	sticky: {
		defaultWidth: 280,
		defaultHeight: 180,
		minWidth: 180,
		minHeight: 140,
		maxWidth: 420,
		resizeMode: "both"
	},
	todo: {
		defaultWidth: 280,
		defaultHeight: 160,
		minWidth: 240,
		minHeight: 120,
		maxWidth: 520,
		resizeMode: "both"
	},
	image: {
		defaultWidth: 280,
		defaultHeight: 220,
		minWidth: 120,
		minHeight: 120,
		maxWidth: 1200,
		maxHeight: 1200,
		resizeMode: "both",
		preserveAspectRatio: true
	},
	link: {
		defaultWidth: 280,
		defaultHeight: 100,
		minWidth: 200,
		minHeight: 60,
		maxWidth: 520,
		resizeMode: "width"
	},
	file: {
		defaultWidth: 280,
		defaultHeight: 80,
		minWidth: 180,
		minHeight: 60,
		maxWidth: 520,
		resizeMode: "width"
	},
	comment: {
		defaultWidth: 280,
		defaultHeight: 100,
		minWidth: 180,
		minHeight: 60,
		maxWidth: 420,
		resizeMode: "width",
		editableText: true
	},
	section: {
		defaultWidth: 560,
		defaultHeight: 360,
		minWidth: 280,
		minHeight: 180,
		maxWidth: 1200,
		maxHeight: 900,
		resizeMode: "both"
	},
	shape: {
		defaultWidth: 120,
		defaultHeight: 120,
		minWidth: 60,
		minHeight: 60,
		maxWidth: 400,
		maxHeight: 400,
		resizeMode: "both"
	},
	color_swatch: {
		defaultWidth: 140,
		defaultHeight: 100,
		minWidth: 100,
		minHeight: 80,
		maxWidth: 280,
		maxHeight: 200,
		resizeMode: "width"
	},
	folder: {
		defaultWidth: 280,
		defaultHeight: 100,
		minWidth: 220,
		minHeight: 80,
		maxWidth: 420,
		resizeMode: "width"
	},
	board: {
		defaultWidth: 280,
		defaultHeight: 100,
		minWidth: 220,
		minHeight: 80,
		maxWidth: 420,
		resizeMode: "width"
	},
	column: {
		defaultWidth: 300,
		defaultHeight: 400,
		minWidth: 240,
		minHeight: 200,
		maxWidth: 600,
		maxHeight: 800,
		resizeMode: "both"
	},
	frame: {
		defaultWidth: 400,
		defaultHeight: 300,
		minWidth: 200,
		minHeight: 150,
		maxWidth: 1200,
		maxHeight: 900,
		resizeMode: "both"
	},
	pdf: {
		defaultWidth: 280,
		defaultHeight: 100,
		minWidth: 200,
		minHeight: 80,
		maxWidth: 520,
		resizeMode: "width"
	},
	video: {
		defaultWidth: 280,
		defaultHeight: 200,
		minWidth: 280,
		minHeight: 160,
		maxWidth: 800,
		maxHeight: 600,
		resizeMode: "both",
		preserveAspectRatio: true
	},
	embed: {
		defaultWidth: 280,
		defaultHeight: 200,
		minWidth: 280,
		minHeight: 160,
		maxWidth: 800,
		maxHeight: 600,
		resizeMode: "both"
	},
	code: {
		defaultWidth: 280,
		defaultHeight: 200,
		minWidth: 280,
		minHeight: 140,
		maxWidth: 800,
		resizeMode: "both",
		editableText: true
	},
	audio: {
		defaultWidth: 280,
		defaultHeight: 112,
		minWidth: 280,
		minHeight: 88,
		maxWidth: 520,
		resizeMode: "width"
	},
	table: {
		defaultWidth: 480,
		defaultHeight: 280,
		minWidth: 320,
		minHeight: 160,
		maxWidth: 1200,
		maxHeight: 800,
		resizeMode: "both"
	},
	drawing: {
		defaultWidth: 160,
		defaultHeight: 120,
		minWidth: 40,
		minHeight: 40,
		maxWidth: 1600,
		maxHeight: 1200,
		resizeMode: "both"
	}
};
var FALLBACK = {
	defaultWidth: 280,
	defaultHeight: 120,
	minWidth: 140,
	minHeight: 90,
	resizeMode: "both"
};
function getNodeDef(type) {
	return NODE_DEFINITIONS[type] ?? FALLBACK;
}
var node_repository_exports = /* @__PURE__ */ __exportAll$1({ loadNodesByBoard: () => loadNodesByBoard });
async function loadNodesByBoard(boardId) {
	return (await db.query(`SELECT id, board_id, type, position_x, position_y, width, height, z_index, data
       FROM canvas_nodes
      WHERE board_id = $1 AND deleted_at IS NULL
      ORDER BY z_index ASC, id ASC`, [boardId])).rows.map((row) => ({
		id: row.id,
		type: row.type,
		position: {
			x: row.position_x,
			y: row.position_y
		},
		zIndex: row.z_index,
		style: {
			width: row.width ?? getNodeDef(row.type).defaultWidth,
			minHeight: row.height ?? getNodeDef(row.type).defaultHeight
		},
		data: row.data
	}));
}
//#endregion
export { loadNodesByBoard as n, node_repository_DCKHgWpL_exports as r, getNodeDef as t };
