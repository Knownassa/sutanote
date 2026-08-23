/**
 * VaultStorage: abstraction over the on-disk vault layout.
 *
 * Browser uses PGlite + IndexedDB. Desktop app will provide a filesystem-backed adapter.
 * All paths are relative to the vault root (e.g. "boards/main.json").
 */

export interface VaultStorage {
  readText(path: string): Promise<string | null>;
  writeTextAtomic(path: string, content: string): Promise<void>;
  readBinary(path: string): Promise<Uint8Array | null>;
  writeBinaryAtomic(path: string, data: Uint8Array): Promise<void>;
  exists(path: string): Promise<boolean>;
  list(dir: string): Promise<string[]>;
  move(from: string, to: string): Promise<void>;
  remove(path: string): Promise<void>;
  watch?(path: string, cb: () => void): () => void;
}
