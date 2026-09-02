import { useCanvasStore } from "./store";
import { useSettingsStore } from "./settings-store";
import { DEFAULT_BOARD_ID } from "./persistence/types";
import { db } from "./database";

async function getAllAssetsForNodes(
  nodes: { data: Record<string, unknown> }[],
): Promise<{ id: string; name: string; mime: string; size: number; data: string }[]> {
  const assetIds = new Set<string>();
  for (const n of nodes) {
    const aid = n.data["assetId"] as string | undefined;
    if (aid) assetIds.add(aid);
    const avatar = n.data["avatarAssetId"] as string | undefined;
    if (avatar) assetIds.add(avatar);
  }
  // also include avatar from settings
  const settingsAvatar = useSettingsStore.getState().avatarAssetId;
  if (settingsAvatar) assetIds.add(settingsAvatar);

  const assets: { id: string; name: string; mime: string; size: number; data: string }[] = [];
  // dynamic import to avoid circular
  const { getAssetBlob } = await import("./asset-store");
  // also get metadata from PGlite
  for (const id of assetIds) {
    try {
      const meta = await db.query<{ name: string; mime: string; size: number }>(
        `SELECT name, mime, size FROM canvas_assets WHERE id = $1`,
        [id],
      );
      const row = meta.rows[0];
      const blob = await getAssetBlob(id);
      if (!blob) continue;
      // Convert Uint8Array to base64
      let binary = "";
      for (let i = 0; i < blob.length; i++) binary += String.fromCharCode(blob[i]!);
      const b64 = btoa(binary);
      assets.push({
        id,
        name: row?.name ?? "file",
        mime: row?.mime ?? "application/octet-stream",
        size: row?.size ?? blob.length,
        data: b64,
      });
    } catch {
      // An unreadable asset should not prevent the rest of the workspace export.
    }
  }
  return assets;
}

export async function exportWorkspace(): Promise<void> {
  const state = useCanvasStore.getState();
  const settings = useSettingsStore.getState();
  const assets = await getAllAssetsForNodes(
    state.nodes as unknown as { data: Record<string, unknown> }[],
  );

  const payload = {
    manifest: {
      version: 1,
      exportedAt: new Date().toISOString(),
      appVersion: "0.1.0-beta",
      boards: [DEFAULT_BOARD_ID],
    },
    boards: [{ id: DEFAULT_BOARD_ID, name: settings.vaultName }],
    nodes: state.nodes,
    edges: state.edges,
    assets,
    settings: {
      vaultName: settings.vaultName,
      displayName: settings.displayName,
    },
  };

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${settings.vaultName.replace(/[^a-z0-9-_]/gi, "_") || "sutonote"}.sutonote`;
  a.click();
  URL.revokeObjectURL(url);

  const { useNoticeStore } = await import("./notice-store");
  useNoticeStore.getState().show("Workspace exported", "success");
}

export async function importWorkspace(file: File): Promise<void> {
  const text = await file.text();
  let payload: {
    manifest?: { version: number };
    nodes?: unknown[];
    edges?: unknown[];
    assets?: { id: string; name: string; mime: string; size: number; data: string }[];
    boards?: unknown[];
    settings?: { vaultName?: string; displayName?: string };
  };
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error("Invalid file: not JSON");
  }
  if (!payload.manifest || payload.manifest.version !== 1)
    throw new Error("Invalid or unsupported .sutonote version");
  if (!Array.isArray(payload.nodes) || !Array.isArray(payload.edges))
    throw new Error("Invalid file: missing nodes/edges");
  if (!Array.isArray(payload.assets)) payload.assets = [];

  const confirmed = window.confirm(
    `Import "${file.name}"? This will replace your current board (${payload.nodes.length} nodes, ${payload.edges.length} edges). This cannot be undone without your own backup. Continue?`,
  );
  if (!confirmed) return;

  // Import assets into IDB and PGlite
  const { storeAssetBlob } = await import("./asset-store");
  for (const a of payload.assets ?? []) {
    try {
      const binaryStr = atob(a.data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      await storeAssetBlob(a.id, bytes);
      await db.query(
        `INSERT INTO canvas_assets (id, name, mime, size) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, mime=EXCLUDED.mime, size=EXCLUDED.size`,
        [a.id, a.name, a.mime, a.size],
      );
    } catch {
      // Skip malformed imported assets and continue restoring the workspace.
    }
  }

  // Clear current board and insert imported
  const { useHistoryStore } = await import("./history-store");
  // push current to history before wipe for undo?
  // then wipe
  await db.query(`DELETE FROM canvas_nodes WHERE board_id = $1`, [DEFAULT_BOARD_ID]);
  await db.query(`DELETE FROM canvas_edges WHERE board_id = $1`, [DEFAULT_BOARD_ID]);

  // Insert nodes/edges via store's dirty queue + flush? Simpler: directly via db then reload store
  const { flushBoard } = await import("./persistence/persistence-manager");
  // Use store to set nodes/edges directly and mark dirty
  const { useCanvasStore: store } = await import("./store");
  // Clear in-memory and set imported
  store.setState({ nodes: [], edges: [], selectedNodeIds: [] });
  // Directly insert via DB transaction for reliability
  await db.transaction(async (tx) => {
    for (const n of payload.nodes as {
      id: string;
      type: string;
      position: { x: number; y: number };
      data: unknown;
      style?: { width?: number; minHeight?: number };
      zIndex?: number;
    }[]) {
      await tx.query(
        `INSERT INTO canvas_nodes (id, board_id, type, position_x, position_y, width, height, z_index, data) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          n.id,
          DEFAULT_BOARD_ID,
          n.type ?? "text",
          n.position.x,
          n.position.y,
          (n.style?.width as number) ?? 280,
          (n.style?.minHeight as number) ?? 120,
          n.zIndex ?? 0,
          JSON.stringify(n.data ?? {}),
        ],
      );
    }
    for (const e of payload.edges as {
      id: string;
      source: string;
      target: string;
      sourceHandle?: string;
      targetHandle?: string;
      type?: string;
      data?: unknown;
    }[]) {
      await tx.query(
        `INSERT INTO canvas_edges (id, board_id, source_id, target_id, source_handle, target_handle, type, data) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          e.id,
          DEFAULT_BOARD_ID,
          e.source,
          e.target,
          e.sourceHandle ?? null,
          e.targetHandle ?? null,
          e.type ?? null,
          e.data ? JSON.stringify(e.data) : null,
        ],
      );
    }
  });

  // Update settings if present
  if (payload.settings?.vaultName)
    useSettingsStore.getState().setVaultName(payload.settings.vaultName);
  if (payload.settings?.displayName)
    useSettingsStore.getState().setDisplayName(payload.settings.displayName);

  // Reload store from DB
  const { loadNodesByBoard } = await import("./persistence/node-repository");
  const { loadEdgesByBoard } = await import("./persistence/edge-repository");
  const nodes = await loadNodesByBoard(DEFAULT_BOARD_ID);
  const edges = await loadEdgesByBoard(DEFAULT_BOARD_ID);
  store.setState({
    nodes: nodes as never,
    edges: edges as never,
    selectedNodeIds: [],
    isLoaded: true,
  });
  useHistoryStore.getState().init({ nodes: nodes as never, edges: edges as never });

  const { useNoticeStore } = await import("./notice-store");
  useNoticeStore.getState().show("Workspace imported", "success");
}
