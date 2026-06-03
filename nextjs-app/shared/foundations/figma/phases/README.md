# Figma `use_figma` phase scripts

Generated from `variables-manifest.json`. **Run sequentially** via Figma MCP `use_figma` (remote) — never in parallel.

File: [`DT-Site-stuff`](https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff) (`PC2UPdYwm8qGt6ZTg0AakF`)

## Phase 1 — variables

1. `whoami` — confirm MCP auth
2. `get_metadata` with **fileKey only** (no nodeId) — list pages
3. For each `phase-1a-color-chunk-*.js`: pass file contents to `use_figma` with `skillNames: "figma-generate-library"`
4. Then each `phase-1b-dimension-string-chunk-*.js`

## Phase 2+ 

See `docs/FIGMA_DESIGN_SYSTEM_SYNC.md`.

Run ID: `dt-dsb-2026-06-03`

## Phase 2–3 — library (verified)

State ledger: `../dsb-state.json`. Verify in-scope node ids:

```bash
npm run verify:figma-in-scope
npm run sync:figma
```

Code Connect is **not** used (Figma Pro). Storybook Design panel + contract `figma` URLs instead.
