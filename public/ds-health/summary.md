# Design system health

Generated: 2026-07-16T16:17:55.388Z

## Governance checks

- **audit:agent-experience**: pass (exit 0)
- **lint:dt-usage**: pass (exit 0)
- **lint:dt-responsive-visibility**: pass (exit 0)

## shadcn import inventory (informational)

- `app`: 0 import line(s)
- `nextjs-app/shared/components`: 7 import line(s)
- `nextjs-app/shared/patterns`: 0 import line(s)
- **Total:** 7 (see report.json for paths)

## Migration boards

- **buttonSurfaces**: approved
- **buttonContexts**: migrated
- **contactFlow**: migrated
- **formPrimitives**: migrated
- **dialogs**: blocked — @dt/Modal needs board sign-off

## Last visual matrix

- 96/96 passed
- Report time: 2026-06-05T13:10:40.288Z

## Agent Experience

- **Ratchet:** pass
- **Prop documentation:** 924/1065 (86.8%)
- **Complete contract evidence:** 134/161
- **Machine-readable prop relationships:** 2 component(s)
- **Golden intent retrieval:** 18/20

## Before merging DS changes

1. Approve green **Proposed** row on the relevant Storybook board
2. `npm run test:migration:visual` when touching migrated surfaces
3. `npm run lint:dt-responsive-visibility`

Full strategy: [docs/DS_AUTOMATION_STRATEGY.md](../docs/DS_AUTOMATION_STRATEGY.md)