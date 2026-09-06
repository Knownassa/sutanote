import { n as __exportAll } from "../_runtime.mjs";
import { t as db } from "./database-zWc1BJtE.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/edge-repository-BnTtDDTa.js
var edge_repository_BnTtDDTa_exports = /* @__PURE__ */ __exportAll({
	n: () => loadEdgesByBoard,
	t: () => edge_repository_exports
});
var edge_repository_exports = /* @__PURE__ */ __exportAll$1({ loadEdgesByBoard: () => loadEdgesByBoard });
async function loadEdgesByBoard(boardId) {
	return (await db.query(`SELECT id, board_id, source_id, target_id, source_handle, target_handle, type, data
       FROM canvas_edges
      WHERE board_id = $1`, [boardId])).rows.map((row) => ({
		id: row.id,
		source: row.source_id,
		target: row.target_id,
		sourceHandle: row.source_handle ?? null,
		targetHandle: row.target_handle ?? null,
		type: row.type ?? void 0,
		data: row.data ?? void 0
	}));
}
//#endregion
export { loadEdgesByBoard as n, edge_repository_BnTtDDTa_exports as t };
