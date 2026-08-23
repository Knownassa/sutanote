import { db } from "./database";
import type { VaultStorage } from "./vault-storage";

/**
 * BrowserStorageAdapter: VaultStorage backed by PGlite (text) + IndexedDB (binary).
 *
 * Text files go into a vault_kv PGlite table keyed by path.
 * Binary files go into IndexedDB via the existing asset-store (content-addressed).
 * Directory listing is derived by prefix-matching paths.
 */

export class BrowserStorageAdapter implements VaultStorage {
  async readText(path: string): Promise<string | null> {
    const res = await db.query<{ content: string }>(
      `SELECT content FROM vault_kv WHERE path = $1`,
      [path],
    );
    return res.rows[0]?.content ?? null;
  }

  async writeTextAtomic(path: string, content: string): Promise<void> {
    await db.query(
      `INSERT INTO vault_kv (path, content, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (path) DO UPDATE SET content = $2, updated_at = NOW()`,
      [path, content],
    );
  }

  async readBinary(path: string): Promise<Uint8Array | null> {
    // Binary files are stored in IndexedDB under the asset store.
    // Import dynamically to avoid circular deps.
    const { getAssetBlob } = await import("./asset-store");
    return getAssetBlob(path);
  }

  async writeBinaryAtomic(path: string, data: Uint8Array): Promise<void> {
    const { storeAssetBlob } = await import("./asset-store");
    await storeAssetBlob(path, data);
  }

  async exists(path: string): Promise<boolean> {
    // Check text store first.
    const textRow = await db.query<{ path: string }>(`SELECT path FROM vault_kv WHERE path = $1`, [
      path,
    ]);
    if (textRow.rows.length > 0) return true;
    // Check binary store.
    const { getAssetBlob } = await import("./asset-store");
    const blob = await getAssetBlob(path);
    return blob !== null;
  }

  async list(dir: string): Promise<string[]> {
    // Prefix match on text store. dir = "boards" → match "boards/*".
    const prefix = dir.endsWith("/") ? dir : `${dir}/`;
    const res = await db.query<{ path: string }>(`SELECT path FROM vault_kv WHERE path LIKE $1`, [
      `${prefix}%`,
    ]);
    return res.rows.map((r) => r.path);
  }

  async move(from: string, to: string): Promise<void> {
    await db.transaction(async (tx) => {
      const row = await tx.query<{ content: string }>(
        `SELECT content FROM vault_kv WHERE path = $1`,
        [from],
      );
      const content = row.rows[0]?.content;
      if (content === undefined) return;
      await tx.query(`DELETE FROM vault_kv WHERE path = $1`, [from]);
      await tx.query(`INSERT INTO vault_kv (path, content, updated_at) VALUES ($1, $2, NOW())`, [
        to,
        content,
      ]);
    });
  }

  async remove(path: string): Promise<void> {
    await db.query(`DELETE FROM vault_kv WHERE path = $1`, [path]);
  }
}
