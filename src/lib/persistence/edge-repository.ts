import { db } from "../db";
import type { CanvasEdge } from "./types";

interface CanvasEdgeRow {
  id: string;
  board_id: string;
  source_id: string;
  target_id: string;
  source_handle: string | null;
  target_handle: string | null;
  type: string | null;
  data: Record<string, unknown> | null;
}

export async function loadEdgesByBoard(boardId: string): Promise<CanvasEdge[]> {
  const result = await db.query<CanvasEdgeRow>(
    `SELECT id, board_id, source_id, target_id, source_handle, target_handle, type, data
       FROM canvas_edges
      WHERE board_id = $1`,
    [boardId],
  );

  return result.rows.map((row) => ({
    id: row.id,
    source: row.source_id,
    target: row.target_id,
    sourceHandle: row.source_handle ?? null,
    targetHandle: row.target_handle ?? null,
    type: row.type ?? undefined,
    data: row.data ?? undefined,
  })) as CanvasEdge[];
}

export async function deleteEdgesPermanently(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const list = ids.map((id) => `'${id.replace(/'/g, "''")}'`).join(",");
  await db.query(
    `DELETE FROM canvas_edges WHERE id = ANY(ARRAY[${list}])`,
  );
}
