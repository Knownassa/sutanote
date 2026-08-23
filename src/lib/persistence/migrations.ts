import { db } from "../db";
import { DEFAULT_BOARD_ID } from "./types";

interface Migration {
  version: number;
  name: string;
  up: () => Promise<void>;
}

const migrations: Migration[] = [
  {
    version: 1,
    name: "001_initial",
    up: async () => {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          applied_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS canvas_nodes (
          id TEXT PRIMARY KEY,
          board_id TEXT NOT NULL DEFAULT '${DEFAULT_BOARD_ID}',
          type TEXT,
          position_x FLOAT,
          position_y FLOAT,
          width INT,
          height INT,
          z_index INT NOT NULL DEFAULT 0,
          data JSONB,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          deleted_at TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_canvas_nodes_board ON canvas_nodes(board_id);

        CREATE TABLE IF NOT EXISTS canvas_edges (
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
    },
  },
  {
    version: 2,
    name: "002_alter_nodes_add_board_and_z",
    up: async () => {
      // Safe on both fresh and legacy DBs: adds missing columns / tables only.
      await db.exec(`
        ALTER TABLE canvas_nodes ADD COLUMN IF NOT EXISTS board_id TEXT NOT NULL DEFAULT '${DEFAULT_BOARD_ID}';
        ALTER TABLE canvas_nodes ADD COLUMN IF NOT EXISTS z_index INT NOT NULL DEFAULT 0;
        ALTER TABLE canvas_nodes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
        ALTER TABLE canvas_nodes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
        CREATE INDEX IF NOT EXISTS idx_canvas_nodes_board ON canvas_nodes(board_id);

        CREATE TABLE IF NOT EXISTS canvas_edges (
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
    },
  },
];

export async function runMigrations(): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const res = await db.query<{ version: number }>(
    `SELECT version FROM schema_migrations ORDER BY version`,
  );
  const applied = new Set(res.rows.map((r) => r.version));

  for (const m of migrations) {
    if (applied.has(m.version)) continue;
    await m.up();
    await db.query(
      `INSERT INTO schema_migrations (version, name) VALUES ($1, $2)`,
      [m.version, m.name],
    );
  }
}
