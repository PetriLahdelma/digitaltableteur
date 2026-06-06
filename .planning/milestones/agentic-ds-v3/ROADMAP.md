# Milestone: Agentic design system v3 — proof under change

**Goal:** Move from AI-ready beta to agentic-first: green full test matrix, production-proven catalog, closed Figma capture loop, commercial benchmark packaging.

**Prerequisite:** v2 complete (#696 — release gate, 86% catalog, 10 stable, semver policy).

**Baseline (2026-06-06):** `release:gate` fast passes; intent 20/20; patterns 9/9 → 10/10; catalog 86.3%; 10 stable.

---

## Phases

| Phase | Focus | Status |
|-------|--------|--------|
| **13** | Green `npm test` + CI full gate | **Done** (#698) |
| **14** | Alpha → beta promotions (patterns with stories) | **Done** (#698) |
| **15** | Figma capture loop (9 routes, surgical binding) | **In progress** (1728px Playwright; `/work` needs re-capture) |
| **16** | Production consumer auto-sync + stable fleet growth | **Started** (transitive scan + release gate) |
| **17** | AI-Ready DS Benchmark (public doc + consulting SKU) | **Started** |
| **18** | npm export spike (`@digitaltableteur/ds`) | Pending |

---

## Phase 13 — Test & CI gate

- Fix Storybook browser Vitest teardown (WebSocket / HMR race)
- Add `check:catalog-coverage` to PR validation (via `agent:eval`)
- Optional nightly: `npm run release:gate -- --full`

## Phase 14 — Pattern beta promotions

Promote alpha assemblies that already have Storybook coverage:

1. NewsBulletin ✓
2. ContactInquiryPanel ✓
3. HomeHero (already beta)
4. PricingPageContent ✓

## Phase 15 — Figma captures

Per `docs/FIGMA_DESIGN_SYSTEM_SYNC.md`:

- html-to-design captures only (no bulk DS rebuild)
- Remaining routes: work, about, pricing, blog, sitemap, dsharp
- Surgical variable + text-style binding

## Phase 16 — Stable fleet + consumers

- `npm run audit:consumers` refreshes stable `consumers[]` from transitive import scan (`@dt/`, relative, `@/`)
- `npm run check:consumers` wired into `release:gate`
- `promote-stable-fleet.mjs` runs `audit:consumers` after promotions
- Container Figma node-id when mapped
- Visual baselines on stable fleet (`test:visual`)

## Phase 17 — Benchmark product

- [docs/AI_READY_DS_BENCHMARK.md](../../../docs/AI_READY_DS_BENCHMARK.md)
- Consulting deliverable aligned with `agentic-ds-audit` + `release:gate`

---

## Success criteria (v3 complete)

1. `npm test` exits 0 locally (unit + Storybook browser).
2. `release:gate --full` in CI (scheduled or PR label).
3. ≥15 stable components with AT snapshots + Figma node-ids.
4. ≥50 cataloged components with production `consumers[]` evidence.
5. 9/9 Figma route captures with token binding (no rebuild script).
6. Published AI-Ready DS Benchmark with live metric snapshot.
