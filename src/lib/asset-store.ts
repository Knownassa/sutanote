import { nanoid } from "nanoid";
import { db } from "./database";

const DB_NAME = "sutonote-assets";
const STORE = "blobs";

const idb: IDBDatabase | null = null;
const idbReady: Promise<IDBDatabase> = (() => {
  if (typeof indexedDB === "undefined") return Promise.resolve(null as unknown as IDBDatabase);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
})();

async function idbPut(id: string, blob: Blob) {
  const d = await idbReady;
  if (!d) return;
  await new Promise<void>((resolve, reject) => {
    const tx = d.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet(id: string): Promise<Blob | null> {
  const d = await idbReady;
  if (!d) return null;
  return new Promise((resolve, reject) => {
    const tx = d.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result as Blob) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function idbDelete(id: string) {
  const d = await idbReady;
  if (!d) return;
  await new Promise<void>((resolve, reject) => {
    const tx = d.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

const urlCache = new Map<string, string>();

/** Persist a file locally and return a stable asset id. Generic for all file types. */
export async function storeAsset(file: Blob, name?: string): Promise<string> {
  return storeImageAsset(file, name);
}

/** Persist an image file locally and return a stable asset id. @deprecated use storeAsset */
export async function storeImageAsset(file: Blob, name?: string): Promise<string> {
  const assetId = nanoid();
  await idbPut(assetId, file);
  await db.query(
    `INSERT INTO canvas_assets (id, name, mime, size) VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, mime = EXCLUDED.mime, size = EXCLUDED.size`,
    [assetId, name ?? "image", file.type || "image/png", file.size ?? 0],
  );
  return assetId;
}

/** Replace the binary + metadata of an existing asset (keeps the same id). */
export async function replaceImageAsset(assetId: string, file: Blob, name?: string): Promise<void> {
  await idbPut(assetId, file);
  await db.query(`UPDATE canvas_assets SET name = $2, mime = $3, size = $4 WHERE id = $1`, [
    assetId,
    name ?? "image",
    file.type || "image/png",
    file.size ?? 0,
  ]);
  const old = urlCache.get(assetId);
  if (old) {
    URL.revokeObjectURL(old);
    urlCache.delete(assetId);
  }
}

/** Resolve an asset id to a usable object URL (cached for the session). */
export async function getAssetUrl(assetId: string): Promise<string | null> {
  const cached = urlCache.get(assetId);
  if (cached) return cached;
  const blob = await idbGet(assetId);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(assetId, url);
  return url;
}

export async function deleteAsset(assetId: string): Promise<void> {
  await idbDelete(assetId);
  await db.query(`DELETE FROM canvas_assets WHERE id = $1`, [assetId]);
  const old = urlCache.get(assetId);
  if (old) {
    URL.revokeObjectURL(old);
    urlCache.delete(assetId);
  }
}

/** Generic binary blob storage (used by VaultStorage). Key is an arbitrary path/id. */
export async function storeAssetBlob(key: string, data: Uint8Array): Promise<void> {
  await idbPut(key, new Blob([data.buffer as ArrayBuffer]));
}

/** Generic binary blob retrieval (used by VaultStorage). Returns null if not found. */
export async function getAssetBlob(key: string): Promise<Uint8Array | null> {
  const blob = await idbGet(key);
  if (!blob) return null;
  return new Uint8Array(await blob.arrayBuffer());
}
