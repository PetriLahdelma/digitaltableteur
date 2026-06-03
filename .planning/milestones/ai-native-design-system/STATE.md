# AI-native design system — state

**Updated:** 2026-06-02

## Current phase

**Phase 4** — Relationship graph (`prefersOver`, `composesWith`)

## Completed

### Phase 1 — Usage evidence

- [x] `usage-scan-lib.mjs`, `audit:usage`, `find-component`
- [x] Manifest v1.4 `usage` + `usageCoverage`
- [x] Skill `dt-use-existing-component`

### Phase 2 — Agent blocks

- [x] `build-component-agent-blocks.ts` → `component-agent-blocks.json`
- [x] Manifest v1.5 per-component `agent` blocks
- [x] Spec hints, replacement policy

### Phase 3 — Contract sync + drift

- [x] `cva-sync-lib.mjs` — eligibility rules
- [x] `check:contract-drift` — strict CI gate
- [x] `sync:contract-api` — safe allowlisted sync
- [x] `propSourced` in contract schema + validator skip for CVA
- [x] Badge CVA aligned to `s`/`m`/`l`
- [x] Six contracts synced (Icon, Badge, Title, Checkbox, Switch, AlertBanner)
- [x] CVA token normalization (`2xs`, `2xl`)

## Next up (Phase 4–6)

- [ ] Expand `composesWith` graph in manifest + `find-component` ranking
- [ ] ESLint `@dt` usage gate (Phase 5)
- [ ] Design System MCP (Phase 6)

## Metrics

| Metric | Value |
|--------|-------|
| Cataloged components | 130 |
| Usage evidence | 119/130 (91.5%) |
| Production usage | 28 |
| Contracts with synced variants | 6 (+ legacy manual) |
| Agent blocks | 130/130 |

## Commands

```bash
npm run build:tokens
npm run check:contract-drift -- --strict
npm run sync:contract-api
npm run find-component -- "your intent"
npm run validate:components
```
