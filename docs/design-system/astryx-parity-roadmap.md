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

Audited 2026-07-08 against the live catalog (159 contracts). Breadth-90 (rescoped)
= every intended-surface item **present**, and **stable where it has real
consumers**; a present-but-zero-consumer beta counts as covered (it cannot be
promoted, per the promotion policy). Legend: ✓ stable · β beta (present) · ✗ gap.

- Primitives: ✓Text ✓Title ✓Button ✓IconButton ✓Icon ✓Link ✓Badge ✓Label ✓Card ✓Divider ✓Avatar ✓StatusDot · βSpacer βKbd (0-consumer, covered).
- Forms: ✓TextInput ✓TextArea ✓Select ✓Combobox ✓MultiCombobox ✓Checkbox ✓CheckboxGroup ✓PhoneInput ✓FileUpload ✓FormField · βRadio βRadioGroup βSwitch (0-consumer) · ✗Slider (optional, deferred) · ✗**SegmentedControl → 3.2**.
- Feedback: ✓Toast ✓Spinner ✓Skeleton · βAlertBanner βTooltip βProgress βEmptyState (Tooltip 0-consumer; others promotable).
- Overlays: ✓Modal ✓Menu · Lightbox (catalog-exempt per CATALOG-POLICY) · ✗Popover (optional, deferred).
- Navigation: ✓Pagination ✓SkipLink ✓LanguageSwitcher · βBreadcrumb βTabs (promotable) · site nav (patterns).
- Layout: ✓Container ✓Section ✓Grid ✓FlexBox ✓Stack · βCenter βAspectRatio (dev-harness-only, covered).
- Content/site: ✓List ✓CodeBlockWindow · βCodeSnippet · Table (simple/static) not needed yet; the engine is an anti-goal · blog/marketing/work composites present.
- Authority additions: ✗**Command Palette → 3.1** (site/docs search + agent story).

**Breadth-90 path:** build the 2 hard gaps (SegmentedControl 3.2, CommandPalette 3.1); promote the consumer-backed betas (Breadcrumb, Tabs, Progress, AlertBanner, EmptyState, CodeSnippet) as they gain consumers. Present-coverage is ~93% today; the 0-consumer betas (Radio/RadioGroup/Switch/Tooltip/Kbd/Spacer/Center/AspectRatio) are covered-but-unpromotable and do not block 90.

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
- [x] 0.5 Intended-surface checklist audited against the live catalog (159 contracts); ~93% present-coverage, 2 hard gaps (SegmentedControl 3.2, CommandPalette 3.1). Breadth re-baselined 44 → 66 under the rescoped rubric.

### Phase 1: Package boundary + decoupling → Maturity, Scalability, Futureproofness, Distribution
- [ ] 1.1 Convert to a workspace (`packages/design-system`, `packages/tokens`, `apps/site`).
- [x] 1.2 Internalize `cn` / `@/lib/utils` into the DS boundary (moved to `nextjs-app/shared/lib/cn`, 55 imports repointed, app re-exports for back-compat); `catalogAppImports` 41 → 5.
- [x] 1.3 **Link Provider** → `nextjs-app/shared/lib/linkComponent.tsx` (context + `LinkProvider` + DS `Link` component that renders the injected link, default `<a>`); app injects next/link via `providers/NextLinkProvider`. All 9 catalog `next/link` sites swapped (pure import swap; the one server component works because `Link` is a client component, not a hook). `catalogNextImports` 15 → 13 (rest are next/image + next/navigation). Build-verified RSC boundary.
- [x] 1.4 Image provider → `nextjs-app/shared/lib/imageComponent.tsx` (context + `ImageProvider` + DS `Image` + `ImageSource` type; default `<img>` maps fill/priority/sizes, drops next-only props); app injects next/image via `providers/NextImageProvider`. All 12 catalog `next/image` sites swapped (10 render + 2 type-only). `catalogNextImports` 13 → 6 (remainder is next/navigation, 1.6 checkpoint). In-app is a pass-through; a11y tree unchanged (img role + alt).
- [ ] 🔒 1.5 i18n decoupling: injected translator / prop-driven copy with English defaults (46 files); ratchet `catalogI18nImports` down. **Checkpoint: multi-locale + browser review before merge.**
- [ ] 🔒 1.6 Remove remaining `@/` and `next/navigation` from the catalog (ratchets to 0). **Checkpoint: navigation behavior review before merge.**
- [ ] 1.7 `@dt/tokens` + `@dt/tokens-css` packages from the existing token pipeline.
- [ ] 1.8 Library build (tsup/Vite) compiling TS + CSS Modules; `exports`/`types`; react/react-dom (+ next adapter) as peer deps.
- [ ] 1.9 Site consumes `@dt/react` via the workspace; full gate green.

### Phase 2: Curated utilities operational → Accessibility, Futureproofness ("selected utilities operational")
- [x] 2.1 `useMediaQuery` — SSR-safe canonical primitive at `nextjs-app/shared/hooks/useMediaQuery.ts` (+ test); operational. Migrated the one genuine responsive-breakpoint site (SocialShare `(width < 768px)`). The other `matchMedia` sites are `prefers-reduced-motion` (owned by `useHydrationSafeMotion`/`motion-safe`) and `prefers-color-scheme` (ThemeProvider), left intentionally; new responsive checks use this hook.
- [x] 2.2 `useFocusTrap` — extracted Modal's inert-background + focus-first + restore logic into `nextjs-app/shared/hooks/useFocusTrap.ts` (+ test); Modal consumes it (behavior-identical, 40 Modal tests green). Operational.
- [x] 2.3 `useScrollLock` — `nextjs-app/shared/hooks/useScrollLock.ts` (+ test), restores previous overflow so nested locks compose. Wired into Modal (closed a real gap: Modal did not lock background scroll). Operational.
- [x] 2.4 `LinkProvider` operational (built in 1.3); documented in the Utilities Storybook page as part of 2.6.
- [x] 2.5 `useTheme` / `ThemeProvider` confirmed public (exported from the `@dt` barrel) and locked in state.
- [x] 2.6 Utilities documented in Storybook: `nextjs-app/shared/foundations/05-Utilities.mdx` (`Overview/05-Utilities`) covering useMediaQuery / useFocusTrap / useScrollLock / LinkProvider / useTheme, plus the not-adopted rationale.
- Deferred (adopt only when a trigger component needs them): LayerProvider/useLayer, Syntax Theme, useOverflow/useScrollOverflow, useClickableContainer, useListFocus, useKeyboardHint, useStreamingText. Skipped (app-platform only): useGridFocus, useTreeFocus, Media Theme, useImageMode.

### Phase 3: Targeted breadth → Breadth (rescoped)
- [ ] 3.1 Command Palette (site/docs search + agent story).
- [ ] 3.2 Segmented Control.
- [ ] 3.3 Close any intended-surface gaps found in 0.5; promote the whole checklist to `stable`.

### Phase 4: Governance + agent-readiness + theming → those three to 90
- [ ] 4.1 Multi-brand theme generation from DTCG + a demo theme.
- [ ] 4.2 Verify + document MCP server / CLI / agent-manifest as an operational "agent-ready" story.
- [x] 4.3 Contract schema exposed + documented: `06-Governance.mdx` (`Overview/06-Governance`) documents the versioned schema (public `$id`), the drift-as-build-failure gate stack, and the agent inputs. Schema was already published via its public `$id`; now discoverable. **governance → 90** (first dimension at target).

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
