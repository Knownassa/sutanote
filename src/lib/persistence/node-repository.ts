import { db } from "../database";
import type { CanvasNode, CanvasNodeData } from "./types";
import { getNodeDef } from "../node-definitions";

interface CanvasNodeRow {
  id: string;
  board_id: string;
  type: string;
  position_x: number;
  position_y: number;
  width: number | null;
  height: number | null;
  z_index: number;
  data: Record<string, unknown>;
}

export async function loadNodesByBoard(boardId: string): Promise<CanvasNode[]> {
  const result = await db.query<CanvasNodeRow>(
    `SELECT id, board_id, type, position_x, position_y, width, height, z_index, data
       FROM canvas_nodes
      WHERE board_id = $1 AND deleted_at IS NULL
      ORDER BY z_index ASC, id ASC`,
    [boardId],
  );

  return result.rows.map((row) => ({
    id: row.id,
    type: row.type,
    position: { x: row.position_x, y: row.position_y },
    zIndex: row.z_index,
    style: {
      width: row.width ?? getNodeDef(row.type).defaultWidth,
      minHeight: row.height ?? getNodeDef(row.type).defaultHeight,
    },
    data: row.data as CanvasNodeData,
  }));
}

export async function deleteNodesPermanently(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const clause = ids.map((_, i) => `$${i + 1}`).join(",");
  await db.query(`DELETE FROM canvas_nodes WHERE id IN (${clause})`, ids);
}
