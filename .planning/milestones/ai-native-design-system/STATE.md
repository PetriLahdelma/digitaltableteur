# AI-native design system — state

**Updated:** 2026-06-02

## Current phase

**Phase 2** — Generated agent blocks (props, variants, spec hints)

## Completed

### Phase 1 (2026-06-02)

- [x] `usage-scan-lib.mjs` — `@dt/*` + relative import scan
- [x] `npm run audit:usage` — 119/130 cataloged with evidence, 28 production
- [x] `npm run find-component` — intent-ranked retrieval (AlertBanner for warning banner)
- [x] `agent-manifest.json` schema v1.4 + `usageCoverage` block
- [x] `agent:eval` gates for usage evidence
- [x] Skill `dt-use-existing-component` + AGENT_INDEX entry

## In progress

- [x] `build-component-agent-blocks.ts` — TS + spec → manifest `agent` block
- [x] `parse-spec-agent-hints.mjs` — Do/Don't → useWhen/avoidWhen
- [x] `component-replacement-policy.mjs` — replacementFor defaults
- [x] Manifest schema v1.5 with `agent` per component
- [x] `sync:contract-api` — fills empty contract variant axes from TS

## Next up (Phase 3)

- [ ] Align CVA vs prop size axes (Badge sm/md/lg vs s/m/l) before contract sync
- [ ] Validator: fail on prop/variant drift vs source (strict mode)
- [ ] Retire `argTypesProxyExempt` as props become generated in contracts
- [ ] `sync:contract-api --write` after story argTypes catch up

## Metrics snapshot

| Metric | Value |
|--------|-------|
| Cataloged components | 130 |
| Usage evidence coverage | 119/130 (91.5%) |
| Production usage | 28 components |
| Stable atoms | Title, Text, Icon, Badge, Avatar |
| Honest beta doc debt | 0 |

## Commands

```bash
npm run build:tokens          # manifest + usage + agent blocks
npm run audit:usage
npm run find-component -- "your intent"
npm run agent:eval
npm run validate:components
```
