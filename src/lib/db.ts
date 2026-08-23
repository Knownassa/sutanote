import { PGlite, type Results } from "@electric-sql/pglite";

export const db = new PGlite("idb://sutonote");

export async function initDB() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS canvas_nodes (
      id TEXT PRIMARY KEY,
      type TEXT,
      position_x FLOAT,
      position_y FLOAT,
      width INT,
      height INT,
      data JSONB,
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("Sutonote local database initialized.");
}

interface CanvasNodeRow {
  id: string;
  type: string;
  position_x: number;
  position_y: number;
  width: number | null;
  height: number | null;
  data: Record<string, unknown>;
}

export async function loadNodesFromDB() {
  const result: Results<CanvasNodeRow> = await db.query(`SELECT * FROM canvas_nodes`);
  return result.rows.map((row) => ({
    id: row.id,
    type: row.type,
    position: { x: row.position_x, y: row.position_y },
    style: { width: row.width ?? 240, minHeight: row.height ?? 120 },
    data: row.data,
  }));
}

export interface SavedNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  width: number | null;
  height: number | null;
  data: Record<string, unknown>;
}

// Single-statement bulk upsert — far cheaper than N round-trips.
export async function saveNodesToDB(nodes: SavedNode[]) {
  if (nodes.length === 0) return;

  const cols = 7;
  const values = nodes
    .map((_, i) => {
      const base = i * cols;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`;
    })
    .join(",");

  const params = nodes.flatMap((n) => [
    n.id,
    n.type,
    n.position.x,
    n.position.y,
    n.width ?? null,
    n.height ?? null,
    JSON.stringify(n.data),
  ]);

  await db.query(
    `INSERT INTO canvas_nodes (id, type, position_x, position_y, width, height, data)
     VALUES ${values}
     ON CONFLICT (id) DO UPDATE SET
       position_x = EXCLUDED.position_x,
       position_y = EXCLUDED.position_y,
       width = EXCLUDED.width,
       height = EXCLUDED.height,
       data = EXCLUDED.data,
       updated_at = NOW()`,
    params,
  );
}

export async function deleteNodeFromDB(id: string) {
  await db.query(`DELETE FROM canvas_nodes WHERE id = $1`, [id]);
}
