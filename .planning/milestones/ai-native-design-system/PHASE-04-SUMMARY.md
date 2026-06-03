# Phase 4 — Relationship graph

**Completed:** 2026-06-02

## Delivered

- `generate-relationship-graph.mjs` — merges static `COMPOSES_WITH` with co-import edges (≥3 shared files)
- `relationship-graph.json` in `foundations/dist/` (gitignored, built via `build:tokens`)
- Agent blocks read graph for `composesWith` / `prefersOver`
- Manifest `relationshipGraph` summary block
- `rankComponentsForIntent` boosts parents when query terms match `composesWith` children
- Expanded static policy (ContactForm, ChatWidget, CookieConsent, ProjectHero, StoryBlock)

## Commands

```bash
npm run build:relationship-graph
npm run find-component -- "warning banner with dismiss button"
```

## Phase 5 (started)

- `lint-dt-usage.mjs` — warn-only scan for raw `<button>`, headings, shadcn imports in `app/`, patterns, pages
- CI: `npm run lint:dt-usage` (non-strict; use `--strict` when baseline is clean)
