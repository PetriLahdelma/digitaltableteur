# Phase 9 — Figma variables apply checklist

**File:** `PC2UPdYwm8qGt6ZTg0AakF` (DT-Site-stuff)  
**Generated payloads:** `nextjs-app/shared/foundations/figma/phases/phase-*.js`

## Done in repo

- [x] `npm run build:figma-variables` → `variables-manifest.json` + phase scripts
- [x] `FIGMA_NODE_IDS` on in-scope atoms/molecules
- [x] `npm run sync:figma` — contracts use real node-ids where mapped
- [x] `npm run check:storybook-figma` — stable atoms require verified node-ids (Icon exempt)

## Apply in Figma (MCP, sequential)

**Applied 2026-06-04** via Cursor `plugin-figma-figma` / `use_figma`: 77 variables (`DT / Color` 44, `DT / Dimension` 29, `DT / String` 4). Collection `DT / Color` id: `VariableCollectionId:322:821`.

To re-apply or refresh:

1. `npm run build:figma-variables`
2. **Cursor agent** (recommended): apply each `.use-figma-payload-*.json` with `use_figma` — not Desktop `:3845` MCP.
3. **CLI** (remote OAuth only): `FIGMA_DESKTOP_MCP_URL=https://mcp.figma.com/mcp npm run figma:apply-variables`

4. Verify in Figma Variables panel (4 themes: light, dark, HCB, HCW).
5. Re-run `npm run sync:figma` if component node ids moved.

## Resume

If a session times out, re-run discovery per `docs/FIGMA_DESIGN_SYSTEM_SYNC.md` and continue from the last successful `phase-*.js` filename in the terminal log.
