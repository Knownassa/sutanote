import { n as __exportAll } from "../_runtime.mjs";
import { t as db } from "./database-zWc1BJtE.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/persistence-manager-DKgXDaA_.js
var persistence_manager_DKgXDaA__exports = /* @__PURE__ */ __exportAll({
	n: () => persistence_manager_exports,
	t: () => flushBoard
});
var persistence_manager_exports = /* @__PURE__ */ __exportAll$1({ flushBoard: () => flushBoard });
function inClause(ids, start) {
	return ids.map((_, i) => `$${start + i + 1}`).join(",");
}
async function flushBoard(boardId, dirtyNodes, deletedNodeIds, dirtyEdges, deletedEdgeIds) {
	const delNodeIds = [...deletedNodeIds];
	const delEdgeIds = [...deletedEdgeIds];
	await db.transaction(async (tx) => {
		if (delNodeIds.length > 0) await tx.query(`DELETE FROM canvas_nodes WHERE id IN (${inClause(delNodeIds, 0)})`, delNodeIds);
		if (delEdgeIds.length > 0) await tx.query(`DELETE FROM canvas_edges WHERE id IN (${inClause(delEdgeIds, 0)})`, delEdgeIds);
		for (const node of dirtyNodes.values()) {
			if (deletedNodeIds.has(node.id)) continue;
			await tx.query(`INSERT INTO canvas_nodes
           (id, board_id, type, position_x, position_y, width, height, z_index, data, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, NOW())
         ON CONFLICT (id) DO UPDATE SET
           board_id = EXCLUDED.board_id,
           type = EXCLUDED.type,
           position_x = EXCLUDED.position_x,
           position_y = EXCLUDED.position_y,
           width = EXCLUDED.width,
           height = EXCLUDED.height,
           z_index = EXCLUDED.z_index,
           data = EXCLUDED.data,
           updated_at = NOW()`, [
				node.id,
				boardId,
				node.type ?? "sticky",
				node.position.x,
				node.position.y,
				node.style?.width ?? null,
				node.style?.minHeight ?? null,
				node.zIndex ?? 0,
				JSON.stringify(node.data)
			]);
		}
		for (const edge of dirtyEdges.values()) {
			if (deletedEdgeIds.has(edge.id)) continue;
			await tx.query(`INSERT INTO canvas_edges
           (id, board_id, source_id, target_id, source_handle, target_handle, type, data, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8, NOW())
         ON CONFLICT (id) DO UPDATE SET
           board_id = EXCLUDED.board_id,
           source_id = EXCLUDED.source_id,
           target_id = EXCLUDED.target_id,
           source_handle = EXCLUDED.source_handle,
           target_handle = EXCLUDED.target_handle,
           type = EXCLUDED.type,
           data = EXCLUDED.data,
           updated_at = NOW()`, [
				edge.id,
				boardId,
				edge.source,
				edge.target,
				edge.sourceHandle ?? null,
				edge.targetHandle ?? null,
				edge.type ?? null,
				edge.data ? JSON.stringify(edge.data) : null
			]);
		}
	});
}
//#endregion
export { persistence_manager_DKgXDaA__exports as n, flushBoard as t };
