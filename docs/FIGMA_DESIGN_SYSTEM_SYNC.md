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

Then apply each `foundations/figma/phases/phase-*.js` via MCP `use_figma` with `fileKey: PC2UPdYwm8qGt6ZTg0AakF` and `skillNames: "figma-generate-library"` (Cursor Figma plugin or remote MCP — **not** Desktop selection MCP, which lacks `use_figma`).

Optional CLI wrapper when your MCP endpoint exposes `use_figma`:

```bash
FIGMA_DESKTOP_MCP_URL=https://your-mcp-endpoint/mcp npm run figma:apply-variables
```

## Repo config

- `scripts/design-system/figma-config.mjs` — file key/slug (override with `FIGMA_FILE_KEY` / `FIGMA_FILE_SLUG`).
- Contracts still use placeholder `node-id=dt-*` until real frames exist; run `npm run sync:figma` after publishing nodes.

## Resume

State ledger pattern: `figma-generate-library` skill — tag nodes with `setSharedPluginData('dsb', …)` and re-run discovery if a session times out.
