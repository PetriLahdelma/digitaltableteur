# Astryx-parity roadmap

**Goal:** reach at least **90/100** on every rescoped Astryx-comparison dimension, and make the selected utilities operational.

**Status source of truth:** this file (human) + [`scripts/design-system/astryx-roadmap.state.json`](../../scripts/design-system/astryx-roadmap.state.json) (machine). The guard [`scripts/design-system/check-astryx-roadmap.mjs`](../../scripts/design-system/check-astryx-roadmap.mjs) runs `npm run check:astryx-roadmap` and is wired into pre-push, so completed progress cannot silently regress.

Benchmark: [astryx.atmeta.com/components](https://astryx.atmeta.com/components) (Meta, React + StyleX, 160+ components, powers 13k+ apps). Prior roadmap: `docs/superpowers/specs/2026-07-03-astryx-level-design-system-roadmap.md`.

---

## Rescoped rubric (decided 2026-07-08)

DT is a portfolio-site design-system-of-record, not an app platform. "90" is measured against DT's **intended surface** and a **published, dogfooded package**, NOT against Astryx's absolute breadth or raw OSS adoption. The anti-goals below stay in force. Under this rubric all nine dimensions are reachable by engineering.

| Dimension | Now | Target | What earns 90 (rescoped, checkable) |
|---|---:|---:|---|
| Maturity | 62 | 90 | Versioned package + semver + changelog; ≥90% of catalog at `stable`; documented, frozen public API; no `alpha` in the shipped surface. |
| Breadth | 44 | 90 | Full coverage of the **intended-surface checklist** (below), all at `stable`. Not app-platform parity. |
| Scalability | 54 | 90 | Workspace package boundary; catalog decoupled from the app (0 `@/`, 0 direct `next/*`, i18n injected); multi-brand-capable token pipeline; scaffolder + contracts for contributors. |
| Futureproofness | 61 | 90 | Framework-agnostic package (Link/Image injected), DTCG tokens, agent-manifest/MCP, current stack, bus-factor mitigations (docs + scaffolder + gates). |
| Accessibility | 78 | 90 | Every `stable` component: 4-mode AT + axe + forced-colors + reduced-motion verified; focus-trap/scroll-lock utilities operational for custom overlays; keyboard coverage documented. |
| Governance | 88 | 90 | Contract drift-as-build-failure (have), controls audit 100% (have), rhythmguard (have) + this roadmap self-check gate + published contract schema. |
| Agent-readiness | 80 | 90 | MCP server + CLI + agent-manifest + docs-registry all operational and documented ("agent-ready docs from CLI/MCP"). |
| Theming | 67 | 90 | Multi-brand theme generation from DTCG; light/dark/HC/forced-colors (have); documented theming API + generator/recipe. |
| Distribution | 20 | 90 | Published to a registry, versioned, installable, consumer-setup docs, dogfooded by the site via the package, documented second-consumer path. Not adoption count. |

Scores are tracked in the state file. Where a score is backed by a measurable fact, the guard ratchets it (coupling counts, stable count) so it cannot regress.

---

## Anti-goals (do not build; guarded by exact-name check)

App-platform surface DT will **not** build: **App Shell**, **Tree List**, **Data-grid/Table engine** (14-hook Astryx table), **Mega-menu nav**, and the full **Chat suite** (DT keeps its single ChatWidget; it will not grow Astryx's 15-part chat). The guard hard-fails if `AppShell`, `TreeList`, `DataGrid`, or `MegaMenu` appear as catalog components. Table/Chat are nuanced so they are prose anti-goals; add either only by amending this file deliberately, backed by a real use case.

---

## Intended-surface checklist (defines Breadth = 90)

The Breadth target is "all of this present and `stable`", not Astryx parity. (Fill in during Phase 3 audit; most already exist.)

- Primitives: Text, Title, Button, IconButton, Icon, Link, Badge, Label, Card, Divider, Spacer, Avatar, StatusDot, Kbd.
- Forms: TextInput, TextArea, Select, Combobox, MultiCombobox, Checkbox(+Group), Radio(+Group), Switch, PhoneInput, FileUpload, FormField, Slider (gap?), Segmented Control (new, Phase 3).
- Feedback: Alert/Banner, Toast, Tooltip, Progress, Spinner, Skeleton, EmptyState.
- Overlays: Modal/Dialog, Popover (gap?), Menu, Lightbox.
- Navigation: Breadcrumb, Tabs, Pagination, SkipLink, LanguageSwitcher, site nav.
- Layout: Container, Section, Grid, FlexBox, Stack, Center, AspectRatio.
- Content/site: List, Table (simple/static, not the engine), CodeBlock, blog + marketing + work composites.
- Authority additions: **Command Palette** (Phase 3), for site/docs search + the agent story.

---

## Stopping contract (enforced by the guard)

An autonomous loop may drive this roadmap, but three tasks are **checkpoints** that require explicit human clearance and are marked 🔒 below. They are listed in `state.json` under `checkpoints`, and the guard **hard-fails** if any checkpoint task is marked `done` in `state.tasks` without an `approval: { clearedBy, on }` record. So the loop structurally cannot auto-complete them; it must stop, ask, and record the clearance.

- 🔒 **1.5 i18n decoupling** and **1.6 navigation decoupling** (`unverifiable-regression`): correctness across EN/FI/SV and routing/active-link behavior is not provable by the gates (English-only snapshots, no visual/multi-locale suite, CSS-module proxy hides mis-scoped classes). Needs browser + multi-locale review before merge.
- 🔒 **5.1 publish** (`authorization`): outward-facing and irreversible.

Everything else the loop may chain autonomously (branch, gate, PR, admin-merge, tick box, tighten ratchet) until all boxes are checked and all nine dimensions reach ≥90.

## Phased tasks

Legend: `[ ]` todo, `[~]` in progress, `[x]` done, 🔒 checkpoint (needs recorded clearance). Check the box AND update the state file when a task lands.

### Phase 0: Foundation & guardrails (the non-regression spine)
- [x] 0.1 Commit this roadmap + machine state as the durable source of truth.
- [x] 0.2 Declare anti-goals (above) and hard-guard the unambiguous ones.
- [x] 0.3 Build `check:astryx-roadmap` guard (anti-goals, operational-utility locks, coupling ratchets, stable floor); wire into pre-push.
- [x] 0.4 Seed coupling ratchets at today's values (41 `@/`, 15 `next/*`, 46 i18n, stable floor 58) so it is non-regressing from day one.
- [ ] 0.5 Fill the intended-surface checklist against the live catalog (mark gaps).

### Phase 1: Package boundary + decoupling → Maturity, Scalability, Futureproofness, Distribution
- [ ] 1.1 Convert to a workspace (`packages/design-system`, `packages/tokens`, `apps/site`).
- [x] 1.2 Internalize `cn` / `@/lib/utils` into the DS boundary (moved to `nextjs-app/shared/lib/cn`, 55 imports repointed, app re-exports for back-compat); `catalogAppImports` 41 → 5.
- [ ] 1.3 **Link Provider** utility → decouple `next/link` (falls back to `<a>`); ratchet `catalogNextImports` down. (Also a utility deliverable.)
- [ ] 1.4 Image slot/provider → decouple `next/image`.
- [ ] 🔒 1.5 i18n decoupling: injected translator / prop-driven copy with English defaults (46 files); ratchet `catalogI18nImports` down. **Checkpoint: multi-locale + browser review before merge.**
- [ ] 🔒 1.6 Remove remaining `@/` and `next/navigation` from the catalog (ratchets to 0). **Checkpoint: navigation behavior review before merge.**
- [ ] 1.7 `@dt/tokens` + `@dt/tokens-css` packages from the existing token pipeline.
- [ ] 1.8 Library build (tsup/Vite) compiling TS + CSS Modules; `exports`/`types`; react/react-dom (+ next adapter) as peer deps.
- [ ] 1.9 Site consumes `@dt/react` via the workspace; full gate green.

### Phase 2: Curated utilities operational → Accessibility, Futureproofness ("selected utilities operational")
- [x] 2.1 `useMediaQuery` — SSR-safe canonical primitive at `nextjs-app/shared/hooks/useMediaQuery.ts` (+ test); operational. Migrated the one genuine responsive-breakpoint site (SocialShare `(width < 768px)`). The other `matchMedia` sites are `prefers-reduced-motion` (owned by `useHydrationSafeMotion`/`motion-safe`) and `prefers-color-scheme` (ThemeProvider), left intentionally; new responsive checks use this hook.
- [x] 2.2 `useFocusTrap` — extracted Modal's inert-background + focus-first + restore logic into `nextjs-app/shared/hooks/useFocusTrap.ts` (+ test); Modal consumes it (behavior-identical, 40 Modal tests green). Operational.
- [ ] 2.3 `useScrollLock` (custom overlays); flip to operational.
- [ ] 2.4 `LinkProvider` formalized in the Utilities surface (from 1.3); flip to operational.
- [ ] 2.5 Expose `useTheme` / `ThemeProvider` as public Utilities (already exist).
- [ ] 2.6 Document the Utilities category in Storybook Foundations.
- Deferred (adopt only when a trigger component needs them): LayerProvider/useLayer, Syntax Theme, useOverflow/useScrollOverflow, useClickableContainer, useListFocus, useKeyboardHint, useStreamingText. Skipped (app-platform only): useGridFocus, useTreeFocus, Media Theme, useImageMode.

### Phase 3: Targeted breadth → Breadth (rescoped)
- [ ] 3.1 Command Palette (site/docs search + agent story).
- [ ] 3.2 Segmented Control.
- [ ] 3.3 Close any intended-surface gaps found in 0.5; promote the whole checklist to `stable`.

### Phase 4: Governance + agent-readiness + theming → those three to 90
- [ ] 4.1 Multi-brand theme generation from DTCG + a demo theme.
- [ ] 4.2 Verify + document MCP server / CLI / agent-manifest as an operational "agent-ready" story.
- [ ] 4.3 Publish the contract schema; keep the roadmap self-check in the gate.

### Phase 5: Distribution → Distribution to 90
- [ ] 🔒 5.1 Publish `@dt/tokens` → `@dt/tokens-css` → `@dt/react` (dep order) to a registry. **Checkpoint: outward-facing, needs explicit go-ahead.**
- [ ] 5.2 Consumer-setup docs + documented second-consumer path.
- [ ] 5.3 Site dogfoods the published (or workspace) package.

---

## How to update (every session)

1. Do the task; run its gates.
2. Tick the box here; update `astryx-roadmap.state.json` (tighten ratchets, flip a utility to `operational`, bump a dimension `current`).
3. Run `npm run check:astryx-roadmap` (also runs on pre-push). Green means no completed item regressed.

## Known caveats (carried from the feasibility analysis)

- The gates cannot prove "zero regressions" for i18n (1.5) and navigation decoupling: AT snapshots are English-only and a11y-tree-only, the vitest CSS-module proxy hides mis-scoped classes, there is no visual/multi-locale regression suite, and CI is quota-dead. Those tasks get human/browser + multi-locale review before merge.
- Publishing (5.1) is irreversible and waits for an explicit go-ahead.
