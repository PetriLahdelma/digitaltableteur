# Phase 3 summary — Contract API sync + drift gate

**Completed:** 2026-06-02

## Delivered

| Artifact | Purpose |
|----------|---------|
| `cva-sync-lib.mjs` | Eligibility: CVA invoked + prop-aligned, or allowlisted `propSourced` axes |
| `check:contract-drift.mjs` | CI gate (`--strict`) for missing contract variants vs agent blocks |
| `sync-contract-api.mjs` | Safe write path (5–6 components per run, not 43) |
| `contract.schema.json` | `propSourced` flag on variant axes |
| `validate-components.ts` | Skip CVA check for `propSourced`; normalize `2xs`/`2xl` tokens |
| Badge.tsx | CVA `badgeVariants` wired with `s`/`m`/`l` (was dead stub `sm/md/lg`) |

## Contracts updated (`sync:contract-api --write`)

| Component | Axes | Source |
|-----------|------|--------|
| Icon | size | CVA (invoked in render) |
| Badge | size | CVA (now invoked) |
| Title | size, terminals | propSourced |
| Checkbox | size | propSourced |
| Switch | size | propSourced |
| AlertBanner | tone | propSourced |

## CI

- `npm run check:contract-drift -- --strict` in `pr-validation.yml` and `parity:verify`
- Drift passes after sync; legacy stale axes only reported in non-strict mode

## Verification

- `npm run validate:components` ✓
- `npm run agent:eval` ✓
- `npm run check:contract-drift -- --strict` ✓

## Deferred to Phase 4+

- Button/Card prop axes in contracts (agent block only; no CVA)
- ESLint `@dt` gate
- Design System MCP
- Expand `PROP_SOURCED_AXES` as more atoms align
