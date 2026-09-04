# Sutonote Roadmap

Positioning: a fast, local-first visual workspace — Milanote-level creative
organization, Figma-like precision, Miro-style canvas tools, Obsidian-like
ownership of your files.

## Integration hardening: Alpha 0.2.8.3

- [x] Central canvas executor shared by dock, picker, command palette, shortcuts, and drops
- [x] Registry-driven command palette with usable experimental items
- [x] Table editing guards, transaction-oriented draft editing, reorder, resize, navigation, and clipboard paste
- [x] Audio controls guarded from canvas drag/zoom and heavy media lifecycle
- [x] Pen/highlighter/eraser stroke contract with compact persisted point arrays
- [x] Shared ConnectorPorts migrated across all current canvas node renderers
- [x] Compact, non-scrolling primary dock with draggable item insertion and searchable secondary picker
- [x] In-app ItemEditorRegistry/ItemEditorStore/FloatingItemEditor foundation with Table editor v1
- [x] Layers panel shows persisted parent/child hierarchy and container child order is updated on attach/detach
- [x] Explicit registry, renderer, executor, table, and drawing domain tests
- [x] CI verify workflow covers typecheck, lint, test, and build
- [ ] Complete available-item end-to-end browser contract audit

## Milestone: Beta Performance Architecture (do this before new item types)

- [x] Add `test` / `typecheck` / `verify` scripts + GitHub Actions running `verify`
- [x] Lightweight rich-text rendering when not editing; lazy-load Tiptap only in edit mode (target: 0–1 editors per board)
- [x] Replace snapshot undo/redo with command/diff history (Move/Resize/ChangeData/Create/Delete/Attach/Edge), budget ≤32–64 MB and ~200 commands
- [x] Viewport virtualization: adaptive `onlyRenderVisibleElements` above 150 nodes with hysteresis (verified 160-node board mounts only visible nodes)
- [ ] HeavyNode lifecycle: idle → visible → interactive
- [ ] Embed = cached thumbnail until interact; destroy iframe on Escape
- [ ] Video = poster until play
- [ ] PDF = first-page thumbnail until open
- [ ] Asset object-URL ref counting + LRU with revoke
- [ ] Lazy-load heavy node implementations out of the initial bundle
- [ ] Profile at 100 / 500 / 1k / 2k / 5k nodes; add performance budget regression tests

### Performance budgets (targets)

| Scenario                  | Target      |
| ------------------------- | ----------- |
| Empty workspace idle heap | <100–120 MB |
| 100 cards                 | <150 MB     |
| 500 cards                 | <220–250 MB |
| 2,000 lightweight cards   | <350–400 MB |
| History RAM               | ≤32–64 MB   |
| Drag on 500-node board    | ~60 FPS     |
| First usable UI (cached)  | <1 s        |

## Milestone: real workspace model

- [ ] Persisted `workspaces` / `folders` / `boards` entities (activeBoardId, parentBoardId, folderId, viewport, extent, timestamps)
- [ ] Replace `DEFAULT_BOARD_ID` in all canvas operations with `activeBoardId`
- [ ] Board switch: flush → unload → load target board only → restore viewport/extent → switch history
- [ ] Move sidebar board tree off localStorage onto the persisted model
- [ ] Nested sub-board navigation (Milanote-style)

## Milestone: Milanote parity

- [ ] Templates + save board as template (starter set)
- [ ] Unsorted notes / inbox + quick capture
- [ ] Web capture / clipper, rich link metadata + thumbnails
- [x] Table v1 (editable text/number/checkbox/date cells, row/column controls, local persistence)
- [x] Drawing/pen/highlighter/eraser (lightweight persisted SVG strokes)
- [x] Audio (local upload or URL, play/scrub/download, lazy media lifecycle)
- [ ] Comment threads, @mentions, reactions

## Milestone: Miro canvas parity

- [ ] Pen / highlighter / eraser / lasso
- [ ] Mind map, flowchart, kanban, interactive table, wireframe primitives
- [ ] Connector styles (straight/curved/elbow), arrowheads, labels
- [ ] Smart guides, snapping, spacing indicators
- [ ] Presentation mode (frames as slides), timer, voting

## Milestone: export/vault

- [ ] Streaming `.sutonote` ZIP archive (manifest/boards/content/assets) — never all assets in RAM
- [ ] Desktop vault: portable files as source of truth + SQLite index (Tauri); PGlite stays browser-only

## Milestone: optional collaboration

- [ ] Share board + viewer/commenter/editor permissions
- [ ] CRDT (Yjs-compatible) sync, presence, live cursors
- [ ] Offline → online merge, notifications
- [ ] Optional cloud / self-host sync; local mode stays zero-account, zero-server
