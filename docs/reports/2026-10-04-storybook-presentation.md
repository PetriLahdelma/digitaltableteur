# Digitaltableteur Storybook presentation verification

This refinement preserves the current design-system catalogue and original branding while improving the manager, documentation and example frames. It was developed in an isolated Codex worktree so Claude's concurrent checkout and the older repository-root checkout remained untouched. Nothing was pushed or merged.

## Baseline and preservation

The baseline is `fffd5bfafcd7a70f38d85b4c5b546cd72efc4b16`, verified against both the active `main-work` checkout and the remote `main` ref on 2026-10-04. The root accessibility branch was older and was deliberately not used. No local Storybook listener existed at inspection; the public `/storybook/` URL returned the site's 404 page.

`.storybook/presentation-baseline.json` records **2,221 entries: 1,989 stories and 232 docs**, including IDs, titles, import paths, types and tags. It also records **1,727 SHA-256 hashes** covering all tracked public assets, fonts, stories, MDX, contracts and the token source. The after-build comparison passes. The original `public/storybook_logo.svg` artwork, including its Digitalbook wordmark, is unchanged. No replacement branding or Process Genius assets were introduced.

## Changes

- Manager theme and manager-only CSS use the original chartreuse mark's accent, Satoshi, neutral dark chrome, readable toolbar labels, distinct accent icons, selected rows and keyboard focus.
- Existing custom contract docs retain lifecycle status, implementation links, review evidence, source transforms, accessibility tools and every documentation block. The masthead and reading rhythm are clearer; native Storybook section navigation stays inside the manager.
- Documentation CSS uses its own module and explicit shell selectors. Contract pages opt out of Storybook's generic prose reset. Component implementation CSS and tokens are untouched. Browser comparison checks nine computed Button style properties against the isolated canvas.
- Example grids shrink correctly on narrow screens. API/token tables have named keyboard-accessible scroll regions, controls stay connected to the Playground, and fullscreen examples retain authored layout intent.
- Related-component links now target the manager instead of nesting it in the preview iframe. Local font/favicon URLs respect the production `/storybook/` base; the obsolete external Syne request was removed because the actual design system uses Satoshi throughout.
- Three existing gallery failures were fixed in the gallery alone: DataTable row/accessor callbacks, VirtualList item callbacks and ResizablePanelGroup element descriptors. The existing descriptor resolver is reused. All cards and navigation categories remain present.
- The CSS warning ratchet was tightened from 1,918 to 1,884 warnings: 34 resolved identities, zero newly accepted warnings.

## Local checks

- Production Storybook build: passed.
- Production Next.js build: passed.
- Typecheck and JavaScript lint: passed.
- CSS/logical-property gates and Rhythmguard: passed, with no new accepted warnings.
- Full unit suite: **3,180 passed in 393 files**. A later focused docs run passed **36 tests in 6 files**, including three gallery regressions first demonstrated failing.
- Protected catalogue and asset comparison: passed.
- Browser checks exercise all four themes at 1440px and 390px, normal/hover/focus/open/changed toolbar states, font loading, search, section links, Playground updates, CSS isolation and representative form/table/overlay/page/native-component/gallery routes.
- Final browser suite: **20 passed, 2 failed**. Both failures are the unsuppressed baseline Storybook console diagnostics described below; visual/interaction assertions in the combined toolbar test passed before its console assertion. Narrow form, table and overlay docs and both Playground surfaces passed.

## Known failures and limits

The strict console assertions remain unsuppressed. Theme switching emits Storybook manager diagnostics for `storybook/instrumenter/sync` and `storyRenderPhaseChanged` saying the event source cannot be determined. The exact messages were reproduced by building the untouched baseline configuration and exercising it on a separate local port. Theme selection and rendering work; this pass does not fork Storybook or disable interactions to conceal the diagnostics.

The baseline gallery also produced DataTable, VirtualList and React element-descriptor errors. Those failures were reproduced before the gallery-only repair; the repaired gallery browser check passes.

Storybook still warns that Button and ButtonSurfaceComparison share `actions-button`. Changing those titles or IDs is an information-architecture change and was explicitly excluded. Existing PostCSS/plugin timing warnings and framework deprecation notices remain. No tests, accessibility rules or browser console checks were disabled.

Browser verification used Chromium. Safari, Firefox, assistive-technology review and a deployed public Storybook URL were not verified. These checks are not a WCAG conformance certification.

## Reproduce

From this worktree:

```sh
npm run storybook:build
node .storybook/serve-preview.mjs storybook-static 6020
node .storybook/presentation-inventory.mjs --check storybook-static/index.json
npx playwright test --config .storybook/presentation.playwright.ts
npx vitest run .storybook/blocks .storybook/lib/resolveElements.test.tsx --maxWorkers=2
```

The preview binds only to `127.0.0.1` and serves the real production base at `http://127.0.0.1:6020/storybook/`. The strict browser run will continue reporting the existing console diagnostics until their underlying Storybook issue is resolved. The baseline inventory is deliberately not regenerated by tests.
