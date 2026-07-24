# design-sync NOTES — @digitaltableteur/react → Claude Design

## Re-sync setup (do every sync)
- **[GENERAL] Reference storybook base-path fix (CRITICAL).** `.storybook/main.ts` sets `config.base = "/storybook/"` for production builds (line ~364) and `<base href="/storybook/">` (line ~118). `storybook build` runs in production, so `.design-sync/sb-reference` references assets at absolute `/storybook/assets/...`. The compare harness serves the reference at ROOT → assets 404 → every story is `sb-error` ("no storybook root content") and NOTHING can be graded. FIX: after each `storybook build`, create a self-symlink so `/storybook/*` resolves:
  `ln -sfn . .design-sync/sb-reference/storybook`
  (sb-reference is gitignored + rebuilt each sync, so recreate the symlink every time.)
- **Package types entry.** `@digitaltableteur/react` declares types only via `exports["."].types`, not a top-level `types` field. The converter's d.ts reader needs the top-level field, so `packages/react/package.json` now has `"types": "./dist/index.d.ts"` (added — committed). Without it: 0 exported symbols → 0 components.
- **[GENERAL] Global CSS layer (Tailwind utilities + .wavyUnderline) — CRITICAL.** The package build compiles .module.css only; it NEVER emits Tailwind utilities or the app global helpers (.wavyUnderline wave-draw). Components using cn()/Tailwind (Center, Stack, Section, Spacer, AspectRatio, NavLink, Pagination) render UNSTYLED without them. FIX: ship the storybook compiled CSS (a superset: 967 module classes + Tailwind layer + globals + tokens) via cfg.cssEntry. cssEntry is pkgDir-bounded, so stage it each sync AFTER the storybook build:
  `cp .design-sync/sb-reference/assets/iframe-*.css packages/react/_ds-sync-globals.css`  (cfg.cssEntry="_ds-sync-globals.css"). This also fixes the TextInput error-fill CSS-order bug (bundle cascade then matches storybook).
- **Build the react package first:** `cd packages/react && npm run build` (compiles nextjs-app/shared/components via vite aliases). Entry: `packages/react/dist/index.js`.

## Tokens / styling
- Tokens ship via `cfg.tokensPkg: "@digitaltableteur/tokens-css"`. BUT the node_modules copy is the published **0.1.4**, which PREDATES the radius/shadow token sweep (missing --radius-circle, --shadow-*). The freshly-built local `packages/tokens-css/dist` has them. FIX every sync: after `build:tokens`, refresh the installed copy:
  `cp -r packages/tokens-css/dist/* node_modules/@digitaltableteur/tokens-css/dist/`
  (tokensGlob is a glob WITHIN the pkg dir, not arbitrary source paths — can't point it at nextjs-app source.)
- Light tokens are `:root`-scoped; dark under `.themeDark`. Base previews need no theme provider for light.

## Provider (decorators)
- `.storybook/preview.tsx` decorators (ThemeProvider + I18next + Animation + CookieConsent) do NOT bundle: the preview imports `app/tailwind.css` (`@import "tailwindcss"`), which esbuild can't resolve → "! preview decorator bundle failed". TBD whether cfg.provider is needed (discover in solo phase: i18n/theme-sensitive components).

## Re-sync risks
- `--font-size-body-m` / `--line-height-m` referenced but defined nowhere (runtime or dead ref) — accepted, not shipped.

## Grading guidance (subagents — read before grading)
- **i18n demo labels → `close` (accepted).** Many stories wrap the demo label in a react-i18next `t()` helper (e.g. `<Label tKey="buttonPrimary">`). The preview shows the RAW KEY (e.g. "buttonPrimary", "storyTextDefault") while storybook shows the resolved English ("Primary"). A dual react-i18next instance prevents the provider from connecting; OWNER DECISION: accept these as `close` with a note "i18n demo label only; component render identical". Do NOT try to fix the .tsx for this — it's global, not per-component. Grade the actual RENDER (shape/color/size/typography); if that's faithful and the ONLY diff is the i18n label text, it's `close`.
- **Overlay/portal components** (Modal, Toast, ToastStack, Tooltip, Menu, CommandPalette, CookieConsent, SplitButton, LanguageSwitcher, SegmentedControl if it portals): the storybook capture shows only the trigger — the overlay portals to document.body, OUTSIDE the captured #storybook-root. The PREVIEW captures the full overlay. Judge the overlay render on its own (per §4 rubric: "preview that renders more than the gated reference is not close"); grade `match` if the overlay renders faithfully, and REPORT the component for `cardMode: "single"` in your learnings (orchestrator applies it — you may NOT edit config).
- **[GRID_OVERFLOW] wide components** need `cardMode: "column"` — report in learnings, orchestrator applies (presentation-only, doesn't affect your grade).
- Styling baseline is VERIFIED GOOD (tokens/radius/shadows/fonts correct via Button/Avatar/Text/Modal solo). If a WHOLE component is unstyled/wrong-color, that's a NEW global issue — STOP and report `[GENERAL]`, don't work around it per-component.

## Wave 2-3 findings (folded)
- **[GENERAL] CSS-module hash desync (CRITICAL, root cause of the whole re-grade).** Shipping storybook's compiled CSS via cfg.cssEntry REPLACED the package style.css whose module hashes match the JS → pure-CSS-Module components (Badge, StatusDot, Toast, Spinner, code windows, SelectableCard, MacWindowFrame…) rendered unstyled. FIX: cfg.cssEntry must ship BOTH — build `_ds-sync-globals.css` = storybook iframe CSS + package dist/style.css (package LAST so its JS-matching classes win): `cat .design-sync/sb-reference/assets/iframe-*.css packages/react/dist/style.css > packages/react/_ds-sync-globals.css`. Verify `_badge_<hash>` from _ds_bundle.js is present in _ds_bundle.css after build.
- **[GENERAL] Absolute public-asset paths (author photos).** Stories use `imageUrl="/images/authors/petri-lahdelma.jpg"`; the compare reference (and preview) have no host → broken image, and AuthorBio's storybook reference HANGS forever on it (deadlocked a 19-component compare for 5.5h). FIX: stage the images where both serve from — `cp public/images/authors/* .design-sync/sb-reference/images/authors/` AND `cp public/images/authors/* ds-bundle/images/authors/` (re-copy into ds-bundle after every rebuild; sb-reference persists). ALWAYS run compares with a hang guard / small chunks — one bad component can deadlock a whole serial run.
- Native web-component duplicate stories (`web-components/*`) render blank in BOTH reference and preview (custom elements undefined in the React static build) — faithful emptiness, graded close/match. Bundle ships React, not native.
- ValueCard/CategoryFilter/FilterChip/Gallery/NavMenuList native variants: same blank-both-sides pattern.
