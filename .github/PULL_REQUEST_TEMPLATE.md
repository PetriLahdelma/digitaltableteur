## Summary

<!-- What changed and why -->

## Design system (if UI / shared / tokens touched)

- [ ] Opened the relevant **Migration board** in Storybook and approved the green **Proposed** row (if migrating off shadcn)
- [ ] `npm run ds:health` passes locally
- [ ] If migration surfaces changed: `npm run test:migration:visual` (Storybook `:6010` + dev `:3001`)
- [ ] Deferred items unchanged (Modal / Lightbox / EnhancedContactForm unless explicitly in scope)

Docs: [`docs/DS_AUTOMATION_STRATEGY.md`](docs/DS_AUTOMATION_STRATEGY.md) · [`docs/SHADCN_TO_DT_MIGRATION.md`](docs/SHADCN_TO_DT_MIGRATION.md)

## Test plan

- [ ] `npm run typecheck && npm run lint && npm test`
- [ ] Visual check in Storybook for affected stories / themes
