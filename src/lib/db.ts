import { PGlite, type Results } from "@electric-sql/pglite";

export const db = new PGlite("idb://sutonote");

export async function initDB() {
  await db.exec(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS boards (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT,
      parent_id UUID,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS canvas_nodes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
      type TEXT,
      position JSONB,
      data JSONB,
      width INT,
      height INT,
      z_index INT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("Sutonote local database initialized.");
}

interface SavedNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  width?: number | null;
  height?: number | null;
  z_index?: number;
}

export async function saveNode(node: SavedNode) {
  await db.query(
    `
      INSERT INTO canvas_nodes (id, board_id, type, position, data, width, height, z_index)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        type = EXCLUDED.type,
        position = EXCLUDED.position,
        data = EXCLUDED.data,
        width = EXCLUDED.width,
        height = EXCLUDED.height,
        z_index = EXCLUDED.z_index
    `,
    [
      node.id,
      "default-board",
      node.type,
      JSON.stringify(node.position),
      JSON.stringify(node.data),
      node.width ?? null,
      node.height ?? null,
      node.z_index ?? 0,
    ],
  );
}

interface CanvasNodeRow {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  width: number | null;
  height: number | null;
  z_index: number;
}

export async function loadNodes(boardId: string = "default-board"): Promise<CanvasNodeRow[]> {
  const result: Results<CanvasNodeRow> = await db.query(
    `SELECT * FROM canvas_nodes WHERE board_id = $1 ORDER BY z_index ASC`,
    [boardId],
  );
  return result.rows;
}

export async function deleteNode(id: string) {
  await db.query(`DELETE FROM canvas_nodes WHERE id = $1`, [id]);
}
