import { db } from "../db";
import type { CanvasNode, CanvasEdge } from "./types";

export async function flushBoard(
  boardId: string,
  dirtyNodes: Map<string, CanvasNode>,
  deletedNodeIds: Set<string>,
  dirtyEdges: Map<string, CanvasEdge>,
  deletedEdgeIds: Set<string>,
): Promise<void> {
  const nodeList = [...deletedNodeIds].map((id) => `'${id.replace(/'/g, "''")}'`).join(",");
  const edgeList = [...deletedEdgeIds].map((id) => `'${id.replace(/'/g, "''")}'`).join(",");

  await db.transaction(async (tx) => {
    // 1. Deletions always win over pending upserts.
    if (deletedNodeIds.size > 0) {
      await tx.query(`DELETE FROM canvas_nodes WHERE id = ANY(ARRAY[${nodeList}])`);
    }
    if (deletedEdgeIds.size > 0) {
      await tx.query(`DELETE FROM canvas_edges WHERE id = ANY(ARRAY[${edgeList}])`);
    }

    // 2. Upsert dirty entities (skip anything just deleted).
    for (const node of dirtyNodes.values()) {
      if (deletedNodeIds.has(node.id)) continue;
      await tx.query(
        `INSERT INTO canvas_nodes
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
           updated_at = NOW()`,
        [
          node.id,
          boardId,
          node.type ?? "sticky",
          node.position.x,
          node.position.y,
          (node.style?.width as number) ?? null,
          (node.style?.minHeight as number) ?? null,
          node.zIndex ?? 0,
          JSON.stringify(node.data),
        ],
      );
    }

    for (const edge of dirtyEdges.values()) {
      if (deletedEdgeIds.has(edge.id)) continue;
      await tx.query(
        `INSERT INTO canvas_edges
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
           updated_at = NOW()`,
        [
          edge.id,
          boardId,
          edge.source,
          edge.target,
          edge.sourceHandle ?? null,
          edge.targetHandle ?? null,
          edge.type ?? null,
          edge.data ? JSON.stringify(edge.data) : null,
        ],
      );
    }
  });
}
