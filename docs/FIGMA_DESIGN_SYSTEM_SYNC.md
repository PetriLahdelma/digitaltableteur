# Figma design system sync (code → DT-Site-stuff)

Canonical file: [DT-Site-stuff](https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?m=dev) (`PC2UPdYwm8qGt6ZTg0AakF`).

**Source of truth for tokens:** `nextjs-app/shared/styles/variables.css` (4 themes: light, dark, HCB, HCW).

## Phase order

| Phase | What | Tooling |
|-------|------|---------|
| **0** | Discovery — pages, existing variables | `get_metadata` (no `nodeId`), `get_variable_defs` on a small frame |
| **1** | Variables / tokens | `npm run build:figma-variables` → `use_figma` chunks in `foundations/figma/phases/` |
| **2** | File structure | Verified — 9 pages, Getting Started doc, dsb-state.json |
| **3** | Components | 277 nodes in file; 33/34 in-scope mapped in `FIGMA_NODE_IDS` (Icon = Phosphor library) |
| **4** | Views / routes | `generate_figma_design` + `use_figma` to assemble screens from library components |

**Code Connect:** skipped on Figma Pro (requires Organization). Use contract `figma` URLs + Storybook Design panel instead.

In-scope components: `scripts/design-system/in-scope-components.mjs`.

## MCP: avoid hangs

Per [Figma MCP tools](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/):

1. **Do not** call `get_metadata` on the whole file with a heavy `nodeId` first — use **no `nodeId`** to list pages only.
2. **Never** run two `use_figma` calls in parallel.
3. Prefer **Desktop MCP** (`http://127.0.0.1:3845/mcp`) with DT-Site-stuff open in Dev Mode if remote calls stall.
4. Smoke test: `whoami` → `get_metadata` (fileKey only) → one small `use_figma` chunk.
5. Avoid selecting huge frames for `get_design_context` / `get_variable_defs`.

Setup details: [`FIGMA_MCP_SETUP.md`](./FIGMA_MCP_SETUP.md).

## Build Figma variable payloads (local)

```bash
npm run build:tokens          # refresh token-catalog + DTCG
npm run build:figma-variables # → foundations/figma/variables-manifest.json + phases/*.js
```

Then apply each phase via MCP `use_figma` with `fileKey: PC2UPdYwm8qGt6ZTg0AakF`.

**Who can run it**

| MCP | `use_figma`? | How |
|-----|----------------|-----|
| **Cursor Figma plugin** (`plugin-figma-figma`) | Yes | Ask the Cursor agent to apply payloads (preferred in this repo). |
| **Figma remote** (`https://mcp.figma.com/mcp`) | Yes | OAuth in editor; `FIGMA_DESKTOP_MCP_URL=https://mcp.figma.com/mcp npm run figma:apply-variables` |
| **Figma Desktop** (`http://127.0.0.1:3845/mcp`) | **No** | Read/selection tools only — CLI script exits with a clear error |

Agent workflow (after `npm run build:figma-variables`):

```bash
node scripts/design-system/emit-use-figma-payload.mjs nextjs-app/shared/foundations/figma/phases/phase-1a-color-chunk-01.js
# → then CallMcpTool(plugin-figma-figma, use_figma) with the generated .use-figma-payload-*.json
```

Or batch via Cursor agent: apply all `nextjs-app/shared/foundations/figma/.use-figma-payload-*.json` sequentially.

## Repo config

- `scripts/design-system/figma-config.mjs` — file key/slug (override with `FIGMA_FILE_KEY` / `FIGMA_FILE_SLUG`).
- Contracts still use placeholder `node-id=dt-*` until real frames exist; run `npm run sync:figma` after publishing nodes.

## Html-to-design route captures (Phase 15)

Pixel-perfect references — **no bulk DS rebuild** on capture frames.

```bash
npm run dev:figma-capture          # injects capture.js via FIGMA_HTML_CAPTURE=1
npm run figma:capture-routes       # queue status + open-URL helper
```

Agent workflow per route:

1. `generate_figma_design({ fileKey: PC2UPdYwm8qGt6ZTg0AakF })` → `captureId`
2. `node scripts/design-system/figma-html-capture-routes.mjs --route work --capture-id <id>` → open URL
3. Poll `generate_figma_design` with `captureId` until `completed`
4. Record new `nodeId` in `nextjs-app/shared/foundations/figma/dsb-state.json`

Optional follow-up: surgical `use_figma` for header/footer variable binding only — not `figma-rebuild-route-views.mjs`.

## Resume

State ledger pattern: `figma-generate-library` skill — tag nodes with `setSharedPluginData('dsb', …)` and re-run discovery if a session times out.
