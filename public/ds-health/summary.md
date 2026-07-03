# Design system health

Generated: 2026-07-03T15:14:29.550Z

## Governance checks

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

## Before merging DS changes

1. Approve green **Proposed** row on the relevant Storybook board
2. `npm run test:migration:visual` when touching migrated surfaces
3. `npm run lint:dt-responsive-visibility`

Full strategy: [docs/DS_AUTOMATION_STRATEGY.md](../docs/DS_AUTOMATION_STRATEGY.md)