# Dogfooding Plan: Raw HTML → Design-System Components

> Companion to the [raw-HTML migration audit](raw-html-migration-audit.md) (2026-07-09).
> The audit is the inventory; this is the execution and enforcement plan.
> Status: PROPOSED, awaiting owner sign-off on the decision points at the bottom.

## Why now

The audit counts ~33 raw `<button>`, ~30 raw anchors, ~22 raw `<img>`, ~60 raw
headings/paragraphs, 12 raw inputs and ~350 Tailwind utility lines across ~55
files, all in a repo whose own rule is CSS Modules + DS primitives only. The
root cause is structural: Tailwind renders fine in production and
`lint:dt-usage` only catches shadcn imports, so nothing fails when new
AI-generated code hand-rolls elements. Every generation pass compounds the
drift. Migration without enforcement just resets the clock; enforcement comes
first.

## Phase 0: Enforcement ratchet (before any migration)

Add `check:dogfood-ratchet`, a baseline-ratchet gate in the style of the
stylelint baseline, but **count-keyed per file instead of line-keyed** (the
rhythmguard lesson: line-keyed baselines false-positive on every unrelated
edit).

1. Scanner counts, per file in `app/`, `nextjs-app/shared/patterns/`,
   `nextjs-app/shared/components/` (skipping tests, stories, dev harnesses,
   and the audit's documented intentionally-raw sites):
   - raw interactive/content elements where a DS primitive exists:
     `<button>`, internal `<a>`, `<img>`, `<h1>-<h4>`, `<input>`, `<select>`,
     `<textarea>`, `<table>`, styled `<ul>/<ol>`
   - Tailwind utility lines (the audit's detection heuristic: `className`
     strings composed of utility tokens, incl. inside `cn()`)
2. Baseline JSON committed at current counts. The check fails when any file's
   count **increases** or a new file appears with a nonzero count. Decreases
   auto-shrink the baseline (same auto-tighten idiom as the astryx coupling
   ratchets).
3. Wire into pre-push (same trigger paths as the registry gate) and farm
   pr-validation once green on main.
4. Exemption mechanism mirrors `EFFECT_EXEMPT`: an entry requires a written
   justification (honeypots, email-template HTML, markdown element maps,
   sr-only SEO block, dev harnesses).

Result: dogfooding debt can only go down, and AI-generated PRs that hand-roll
a button fail locally before review.

## Phase 1: Generic Hero — RESOLVED by deprecation (2026-07-10)

The audit flagged `patterns/Hero/Hero.tsx:126-135, 222-236` (raw `<a>`
wrapping `<Button>`, a nested-interactive defect). Re-verification showed the
generic Hero has **zero production consumers** (barrel re-exports only; the
front page uses HomeHero, and HeroSection plus the six specialized heroes
cover every real page). Owner decision: deprecate instead of fix. The
contract's `deprecatedReason` documents the successor components and warns
against the anchor-wrap pattern; any future hero work composes HeroSection.

## Phase 2: Quick-win sweep

The audit's A-list: 13 mechanical swaps (Footer anchors → RouterLink/Title,
DesignSprintsSection pill anchor → Button href, hand-rolled badge → Badge,
NewsBulletin icon buttons → IconButton, Modal spinner → Spinner, raw
headings → Title, etc.). One PR, each swap verified by the touched component's
AT snapshots and stories. Note several touched components are now stable, so
snapshot deltas are expected and reviewed, not waved through.

## Phase 3: New primitives, then their consumer swaps

Three molecules earn their place by repetition (build through the full
component pipeline: contract, stories, tests, Figma, alpha → beta):

| Component | Replaces | Sites |
|---|---|---|
| `SocialIconLink` | icon-only social anchors | ~13 (Footer 8, SiteFooter, ArticleShareSection 3, SocialShare) |
| `FilterChip` (+ group) | `aria-pressed` chip buttons | 6 across CategoryFilter + BlogCategoryFilter (near-duplicates, collapse to one) |
| `CopyField` | input + copy-button rows | 9 in EmailSignatureGenerator |

Plus `HoneypotField` as a centralization (intentionally raw, but duplicated
verbatim in two forms; one exempted component beats two exemptions).
`Table` waits for a second real consumer (only OpenHours today).

## Phase 4: Images

Work-page raw `<img>` (VertaaUX 14, KnobSmithAudio 2, Illustrations 1) and
card images (PersonCard, LinkedInQuoteCard, Testimonial, Gallery) → DS
`Image`. Real LCP win on the work pages, measurable via PSI after deploy.
Deliberate wrappers (Avatar, MdxImage, BlogMediaImage, ClientLogoMarquee)
stay.

## Phase 5: Interactive adaptations

The audit's B-list judgment swaps, one cohesive PR each:
- Lightbox: 3 raw buttons + raw img → IconButton ×3 + Image (mind focus trap)
- CookieConsent hand-rolled switch → `Switch`
- TableOfContents → IconButton/Button/Title/List (mind scroll-spy)
- AskAI hand-rolled listbox → `Menu` (Radix)
- MobileDrawer language buttons → Button variants or LanguageSwitcher reuse
- Assorted raw buttons (ScrollIndicator, Designerman, Chat*, ChunkErrorBoundary
  with its inline `#007bff`)
- PricingPageContent disclosure → `ExpandableSection` (keep data-donny-target)
- ContactPageContentEditorial anchors → DS Link

## Phase 6: Tailwind burn-down, cohort by cohort

~55 files, ~350 utility lines. Order by leverage:
1. `app/design-system/agent/page.tsx` (34 lines, the DS's own docs page:
   dogfooding credibility)
2. Blog server shell (ServerArticleHero/Main/RelatedPosts, ~24 lines,
   server-safe DS components; RSC constraint documented in the registry guard)
3. Project* cohort (ProjectMetaSection 25, ProjectHero 18, ProjectNav 14)
4. SiteHeader/SiteFooter/MobileDrawer cohort (43 lines combined)
5. Enhanced*Card + BlogIndexContent remainder

Each cohort PR shrinks the Phase-0 baseline; the ratchet locks the gain.

## Phase 7: FormFieldEditorial recomposition

B19: FormFieldEditorial hand-rolls input/textarea chrome, violating the #978
decision that all inputs compose `field.module.css`. It is stable now (#1040),
so this is an internal recomposition with unchanged contract and props,
verified by its AT snapshots and the select-variant test.

## Sequencing and rules of engagement

- One phase per PR (Phase 5 splits per bullet), merged before the next starts.
- The Phase-0 ratchet lands first; every later PR must show a baseline
  decrease, which doubles as the progress metric.
- Every touched stable component re-runs its AT compare + forced-colors pass;
  visual spot-checks in the running app for layout-bearing swaps.
- New primitives (Phase 3) go through alpha → beta with the standard promotion
  evidence before their consumer swaps land, so the swaps consume a reviewed
  API, not a moving target.

## Decision points (owner call)

1. Bless the three new primitives (SocialIconLink, FilterChip, CopyField) and
   HoneypotField? Phase 3 is scoped assuming yes.
2. Tailwind burn-down appetite: all ~55 files, or stop after cohorts 1-2 and
   ratchet-freeze the rest?
3. Phase 4 image swaps touch Work-page layouts that PSI decisions banked
   (mobile 72 / desktop 84): re-measure after, or keep hands off VertaaUX
   until the next PSI window?
4. `global-error.tsx` mirror of `error.tsx` must stay provider-free: confirm
   Button-without-providers is acceptable there or keep it raw with an
   exemption entry.
