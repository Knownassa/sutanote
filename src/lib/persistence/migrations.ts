import { db } from "../database";
import { DEFAULT_BOARD_ID } from "./types";

/**
 * SAFE LEGACY SCHEMA BOOTSTRAP
 *
 * Runs BEFORE versioned migrations. Detects whether old tables exist and
 * adds any missing columns so that later migrations and indexes don't fail.
 *
 * This is idempotent — safe on both fresh and legacy databases.
 */
async function bootstrapLegacySchema(): Promise<void> {
  // Ensure schema_migrations exists so versioned migrations can record state.
  await db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  // Detect whether canvas_nodes exists at all.
  const nodeTable = await db.query<{ relname: string }>(
    `SELECT relname FROM pg_class WHERE relname = 'canvas_nodes' AND relkind = 'r'`,
  );
  const nodesExist = nodeTable.rows.length > 0;

  if (nodesExist) {
    // Legacy table exists — ensure all required columns are present.
    // ADD COLUMN IF NOT EXISTS is safe even if the column already exists.
    await db.exec(`
      ALTER TABLE canvas_nodes ADD COLUMN IF NOT EXISTS board_id TEXT NOT NULL DEFAULT '${DEFAULT_BOARD_ID}';
      ALTER TABLE canvas_nodes ADD COLUMN IF NOT EXISTS z_index INT NOT NULL DEFAULT 0;
      ALTER TABLE canvas_nodes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
      ALTER TABLE canvas_nodes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
      ALTER TABLE canvas_nodes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
    `);

    // Now safe to create indexes that depend on board_id.
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_canvas_nodes_board ON canvas_nodes(board_id);
    `);
  } else {
    // Fresh database — create the full table.
    await db.exec(`
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
  }

  // Same treatment for canvas_edges.
  const edgeTable = await db.query<{ relname: string }>(
    `SELECT relname FROM pg_class WHERE relname = 'canvas_edges' AND relkind = 'r'`,
  );
  const edgesExist = edgeTable.rows.length > 0;

  if (edgesExist) {
    await db.exec(`
      ALTER TABLE canvas_edges ADD COLUMN IF NOT EXISTS board_id TEXT NOT NULL DEFAULT '${DEFAULT_BOARD_ID}';
      ALTER TABLE canvas_edges ADD COLUMN IF NOT EXISTS source_handle TEXT;
      ALTER TABLE canvas_edges ADD COLUMN IF NOT EXISTS target_handle TEXT;
      ALTER TABLE canvas_edges ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
      ALTER TABLE canvas_edges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
      CREATE INDEX IF NOT EXISTS idx_canvas_edges_board ON canvas_edges(board_id);
    `);
  } else {
    await db.exec(`
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
}

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
      // Handled by bootstrapLegacySchema — this migration is a no-op
      // but must exist so versioned tracking stays consistent.
    },
  },
  {
    version: 2,
    name: "002_alter_nodes_add_board_and_z",
    up: async () => {
      // Handled by bootstrapLegacySchema — columns are added there.
    },
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
    },
  },
  {
    version: 4,
    name: "004_normalize_legacy_board_ids",
    up: async () => {
      // Normalize known legacy sentinel board IDs to the current default.
      // Only touches empty/NULL/known-sentinel values — never merges future legitimate boards.
      const legacyIds = ["", "default-board", "default_board", "default"];
      const placeholders = legacyIds.map((_, i) => `$${i + 1}`).join(",");

      await db.query(
        `UPDATE canvas_nodes SET board_id = $${legacyIds.length + 1}
         WHERE board_id IS NULL OR board_id IN (${placeholders})`,
        [...legacyIds, DEFAULT_BOARD_ID],
      );
      await db.query(
        `UPDATE canvas_edges SET board_id = $${legacyIds.length + 1}
         WHERE board_id IS NULL OR board_id IN (${placeholders})`,
        [...legacyIds, DEFAULT_BOARD_ID],
      );
    },
  },
  {
    version: 5,
    name: "005_numeric_width_height",
    up: async () => {
      // React Flow generates fractional dimensions — INT truncates them.
      // Convert to DOUBLE PRECISION to match runtime values.
      const nodeTable = await db.query<{ relname: string }>(
        `SELECT relname FROM pg_class WHERE relname = 'canvas_nodes' AND relkind = 'r'`,
      );
      if (nodeTable.rows.length > 0) {
        // Check current column type before altering.
        const colInfo = await db.query<{ data_type: string }>(
          `SELECT data_type FROM information_schema.columns
           WHERE table_name = 'canvas_nodes' AND column_name = 'width'`,
        );
        const currentType = colInfo.rows[0]?.data_type;
        if (currentType && currentType !== "double precision") {
          await db.exec(`
            ALTER TABLE canvas_nodes ALTER COLUMN width TYPE DOUBLE PRECISION USING width::DOUBLE PRECISION;
            ALTER TABLE canvas_nodes ALTER COLUMN height TYPE DOUBLE PRECISION USING height::DOUBLE PRECISION;
          `);
        }
      }
    },
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
    },
  },
];

export async function runMigrations(): Promise<void> {
  // Step 1: Safe legacy bootstrap — ensures structural compatibility.
  await bootstrapLegacySchema();

  // Step 2: Run versioned migrations.
  const res = await db.query<{ version: number }>(
    `SELECT version FROM schema_migrations ORDER BY version`,
  );
  const applied = new Set(res.rows.map((r) => r.version));

  for (const m of migrations) {
    if (applied.has(m.version)) continue;
    await m.up();
    await db.query(`INSERT INTO schema_migrations (version, name) VALUES ($1, $2)`, [
      m.version,
      m.name,
    ]);
  }
}
