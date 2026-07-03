# Council Audit: Shared Evidence Pack

> **Target:** Digitaltableteur design system + frontend code (`nextjs-app/shared/`, build/config, repo hygiene).
> **Source:** local dev build, branch `main` @ `0ebee511f` (post "platinum component uplift"), working tree clean.
> **Surfaces up:** Storybook `:6010` (1,159 entries), Next 16 dev `:3001`.
> **Rule of engagement:** every finding must cite `file:line`, a screenshot, or a command output. Mark anything inferred as `UNVERIFIED`. Verify before you assert. Read the actual files: this pack is a starting map, not the territory.

---

## 1. Stack & scale (verified)

| Fact | Value |
|---|---|
| Framework | Next.js 16.2.9 (App Router, Turbopack), React 19.2.7, TypeScript 6.0.3 |
| Storybook | 10.4.5: **1,159 entries (1,035 stories, 124 docs)** |
| Design system | ~150 component dirs / 216 component `.tsx`; 47 composed `patterns/` |
| Tokens | `nextjs-app/shared/styles/variables.css` (733 lines), 4 themes: light / dark / HCB / HCW + `forced-colors` + `prefers-contrast` |
| Foundations stories | Color, Contrast, Typography, Space, Motion, Layout, Radius, Elevation, Focus, Themes, Token catalog, Icons |
| i18n | EN / FI / SV |
| Tests | 148 `.test.tsx` (axe-core in tests), Vitest 4, Playwright a11y/e2e projects |
| Repo | 5,716 git-tracked files |

## 2. Component coverage vs the stated 8-file contract

`nextjs-app/shared/components/AGENTS.md` mandates 8 files/component (`.tsx`, `.module.css`, `.stories.tsx`, `.test.tsx`, `.contract.json`, `.spec.md`, `.mdx`, `index.ts`). Actuals:

| Artifact | Count | Gap vs 216 tsx |
|---|---|---|
| stories | 122 | ~94 missing |
| tests | 148 | ~68 missing |
| contracts.json | 120 | ~96 missing |
| spec.md | 120 | ~96 missing |
| mdx | 108 | ~108 missing |
| module.css | 145 |: |

AGENTS.md also says "80+ UI components": actual is ~150 (doc drift).

## 3. Stated-rule violations (verified counts; rules from CLAUDE.md / AGENTS.md)

- **Hardcoded hex in CSS modules: 225** (rule: zero). Some are inside `color-mix()`/`@supports`/`var(--x,#fff)` fallbacks (legit-ish), but literal e.g. `ChatWidget.module.css:654-670` `background:#000; color:#fff; border-color:#fff`.
- **Inline `style={{}}`: 294** (rule: none except dynamic `backgroundImage`). `Card` exposes `bodyStyle`/`headStyle` (`React.CSSProperties`) passthrough escape hatches.
- **`@ts-ignore`: 2 files** (rule: never). `@ts-expect-error`: 7 files. `: any` in components: 21.
- **`'use client'`: 130 of ~150 components (~87%).** Includes leaf primitives. e.g. `Button.tsx:1` is `"use client"` but has no hooks/state/effects (only `forwardRef` + a dev-only `process.env.NODE_ENV` warn): likely does not need it, and it drags `Icon` client-side.

## 4. Token system: `variables.css` (read it; concrete defects)

- **VERIFIED a11y defect:** HCW theme `--color-warning:#000` (`:534`) + `--color-warning-text:#041b23` (`:536`) → near-black on black. The DS's own Contrast story computes this at **1.19:1 FAIL** (screenshot 02). Shipped unfixed.
- **Mis-nested rules:** `.themeHCB .badge` and `.themeHCB .toast` (`:510-518`) sit **inside the `.themeHCW` block**: HCB overrides scoped under the HCW selector. Structural copy-paste bug.
- **Dual focus tokens:** `--color-focus-ring` (`:103`) AND `--focus-ring-color` (`:167`) both = `var(--color-primary)`. The `:99-102` comment admits `--color-focus-ring` "was never defined → invisible focus": a past a11y bug, patched by adding a *second* parallel token rather than consolidating.
- **`--color-primary-disabled:#0000ff50` (`:127`)** is pure-blue@50% in light theme, but `--color-primary` is `#041b23` (dark teal). Disabled state doesn't track the primary it derives from.
- **Semantic inversion:** dark theme sets `--color-white:#181a1b` (`:356`) and `--color-black:#fff` (`:357`). Any component using `--color-white` expecting actual white inverts in dark mode. Literal-named tokens with non-literal values.
- **Greyscale has no coherent ramp:** `--color-gray-dark:#333`, `--color-gray:#5e5e5e`, `--color-gray-medium:#666`, `--color-muted:#6c757d`: four greys clustered #333–#6c757d with overlapping/ambiguous semantics.
- **Mixed-unit radii:** `--radius-sm:2px`, `--radius-md:0.25rem`, `--radius-lg:8px` (`:178-180`).
- **`--main-body-copy-color:#6fa8ff` in dark (`:332`)**: body copy token is saturated blue.
- Known follow-ups (from project memory, verify): ~38 missing tokens, an `xs===s` size alias collision.

## 5. Component architecture (read the files)

- **`Button.tsx`**: clean orthogonal `variant`×`tone`×`size`×`surface` API, discriminated-union polymorphism (button/link), dev-mode icon-only-without-name warning (`:131`). **But:** disabled link path (`:226-240`) sets `aria-disabled` yet keeps `href` and adds no click/keyboard suppression → a "disabled" link still navigates.
- **`Card.tsx`**: **~40 props** (god component): renders Title, Text, Tabs, Badge, actions (Buttons), `statusMessage` with `role=alert`, loading skeleton, cover media, AND a clickable-link mode. `link` mode wraps `innerContent` (which can contain Buttons/Tabs) in an `<a>` → **interactive elements nested in an anchor** (invalid HTML + a11y). Carries a `body` "legacy body text support" prop. `bordered` default `true` overlaps `variant="outlined"` default.

## 6. Build / architecture / hygiene (verified)

- **`react-icons: ^5.6.0`** in package.json: contradicts CLAUDE.md gotcha ("**pinned at 5.5.0**; 5.6 drops Adobe SI icons on work pages"). Floating `^` ≠ "pinned." `react-icons/si` is used on **10+ work pages** (e.g. `nextjs-app/shared/components/pages/Work/*Page.tsx`) → live breakage risk.
- **Two component systems:** bespoke `nextjs-app/shared/components/` (~150) **+ a tracked shadcn scaffold** `components/ui/{accordion,button,checkbox}.tsx` with root `components.json`. Storybook has `ShadcnMigration` + `MigrationDecisionBoard` stories. Source-of-truth ambiguity.
- **`tsconfig` `strict:true` but `noUncheckedIndexedAccess` OFF**: despite pervasive dynamic `styles[variant]` class lookup that would benefit. `target: ES2017` (old for R19/N16).
- **Barrel `components/index.ts` re-exports only 79** of ~150 components: inconsistent public surface.
- **Git-tracked clutter at repo root:** `debug-env.js`, `CLAUDE.md.backup`, `check_missing_tests.sh`, `PHASE_2_BREAKING_CHANGES.md`, `TIER_1_MATERIAL_DESIGN_3_CARD_ANALYSIS.md`, `claude-desktop-blank-screen-bug-report.md`. (`dist/`, `coverage/`, `src/`, `debug-storybook.log` are correctly untracked: NOT findings.)
- **Legacy Vite app** (`src/`, untracked locally) + `api-legacy-vercel-functions/`: hybrid-monorepo maintenance surface.

## 7. Runtime / a11y / SEO (verified, homepage `:3001`)

- **Lighthouse: Accessibility 100**, Best Practices 92, SEO 92, Agentic Browsing 67. (Automated a11y catches ~30-40% of issues: go deeper.)
- BP/SEO dings: `errors-in-console`, `inspector-issues`, `robots-txt` invalid, `llms-txt` "does not follow recommendations" (notable given the site's agent-native positioning).
- **Console (homepage):** CSP blocks GA4 regional endpoint `region1.analytics.google.com`: `connect-src` allows `*.google-analytics.com` but not `*.analytics.google.com`. If prod CSP matches, **GA4 regional collection is silently dropped** (UNVERIFIED in prod). Vercel `script.debug.js` blocked (dev-only). A `_next/.../app_not-found_module...css` preloaded-but-unused warning.

## 8. Notable strengths (don't only criticize: weigh these)

- Foundations layer is genuinely sophisticated: a **Contrast story that computes WCAG ratios per theme and self-flags failures**, a Token catalog, Focus/Elevation/Motion stories, and **per-component `forced-colors` stories**.
- Exemplary component docs (see `Button` docs, screenshot 04): In use / How to use (live code) / When (not) to use / Accessibility (keyboard, focus, disabled-vs-aria-disabled, reduced motion, forced colors) / dated promotion notes.
- 4 themes incl. two high-contrast + `forced-colors` + `prefers-contrast` media handling. axe-core in component tests. WIP→beta→stable lifecycle with contracts.

## 9. Screenshots (in `.claude/council-audit/screenshots/`)

- `01-color-theme-matrix.png`: 4-theme semantic swatches (note: Storybook canvas defaults dark; verify Light-column primary swatch actually = `#041b23`).
- `02-contrast-overview.png`: per-theme WCAG ratios; HCW "warning on warning" **1.19 FAIL**; "Pairs audited: 7" (shallow gate coverage).
- `03-type-scale.png`: Display XL→Button M fluid `clamp()` scale (renders blue = dark-theme `--color-title:#6fa8ff`; every heading blue in dark mode).
- `04-button-docs.png`: exemplary component documentation.

---

### How to read this as your persona
You are ONE seat on an 8-seat council. Stay in your lane but you may cite anything above. Be specific and senior. No generic "consider adding tests" filler: every finding names a file/line/screenshot, says why it matters *through your lens*, and gives a concrete fix. Praise what's genuinely excellent; this team positions itself as a **design-systems authority**, so judge against that bar, not a generic-startup bar.
