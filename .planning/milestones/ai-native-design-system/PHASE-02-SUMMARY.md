# Phase 2 summary — Agent blocks in manifest

**Completed:** 2026-06-02

## Delivered

| Artifact | Purpose |
|----------|---------|
| `build-component-agent-blocks.ts` | Single ts-morph project → `component-agent-blocks.json` |
| `parse-spec-agent-hints.mjs` | spec.md Do/Don't → `useWhen` / `avoidWhen` |
| `component-replacement-policy.mjs` | `replacementFor` / `prefersOver` for primitives |
| `agent-manifest.json` v1.5 | Per-component `agent` + `usage` blocks |
| `sync-contract-api.mjs` | CVA-only contract sync (dry-run default) |
| `find-component.mjs` | Uses `agent.intent` + spec hints for ranking |

## npm scripts

```bash
npm run build:agent-blocks
npm run sync:contract-api
```

Wired into `npm run build:tokens`.

## Example: Button agent block

- **variants:** `variant`, `severity`, `size` from resolved TypeScript unions
- **useWhen:** parsed from spec Do lines
- **replacementFor:** `raw <button>`, `@/components/ui/button`, `shadcn Button`

## Example: find-component

Query: *"warning banner dismiss action"* → **AlertBanner** (score 15)

## Phase 3 note

`sync:contract-api --write` was tested on 9 atoms; validation failed until story `argTypes` match new CVA axes (Badge size sm/md/lg vs runtime s/m/l). Contracts reverted; agent blocks carry full prop/variant intelligence without mutating contracts yet.

## Verification

- `npm run agent:eval` — passes (130 agent blocks, Button variants)
- `npm run validate:components` — passes (contracts unchanged)
