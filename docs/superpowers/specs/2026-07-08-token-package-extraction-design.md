# Token package extraction — `@digitaltableteur/tokens` + `@digitaltableteur/tokens-css`

**Roadmap task:** Astryx-parity 1.7 (+ the workspace-root mechanism of 1.1, without the app relocation).
**Date:** 2026-07-08. **Status:** implemented locally; publish is blocked only on local npm auth.
**Reviewed by:** grounded LLM-council (6 lenses + adversarial verify + synthesis, run `wf_bcee55af-807`). Verdict was "rework"; this spec incorporates the three verified blockers and the standing should-fixes.

---

## Goal

Extract the design system's **token layer** into two installable, versioned, framework-agnostic packages fed by the existing token pipeline. First real package boundary for the DS. Advances **Scalability** (boundary), **Futureproofness** (framework-agnostic DTCG + CSS), and lays **Distribution** groundwork.

**Not in the token-package increment (honors checkpoints / user steer):** no nav decoupling (1.6 🔒), no catalog (`@digitaltableteur/react`) extraction, no web-app relocation, no narrowing of the internal `@dt/*` alias. The packages are configured for restricted npm publish, but `npm publish` still belongs to the 5.1 checkpoint and requires local npm auth.

---

## Why the naive "wrap the outputs" design was rejected

The council verified three blockers against the real repo. Confirmed independently:

1. **`@dt/*` is an internal path alias, not a free npm scope.** Aliased in `tsconfig.json:43`, `next.config.ts:227` (webpack) and `:309` (turbopack), plus vitest/storybook. `import '@dt/tokens'` would resolve to `nextjs-app/shared/components/tokens`. → **Publish under a distinct scope.**
2. **No clean, theme-complete token CSS artifact exists.** Compiled `foundations/dist/tokens.css` (307 lines) carries **0** theme/a11y scopes. `variables.css` (757 lines) carries **15** (`.themeDark/.themeHCB/.themeHCW`, `forced-colors`, `prefers-contrast`, `prefers-color-scheme`) — the real accessible layer — **but also contains component/utility CSS** (`.gradientTextUtility`, `.link`, `.badge`, `.toast`, `.wavyUnderline`, `.privacyPolicy a`, 6 keyframes). Neither raw artifact is shippable. → **Build a token-only, theme-complete CSS projection.**
3. **DTCG export drops 22 tokens.** 8 nodes are simultaneously a token (`$value`) and a group (children); Style Dictionary v4 drops them on ingest — losing all 14 font-size steps + 8 semantic colors. This is a **pre-existing bug affecting the live `tokens.css` today.** → **Fix the exporter + add a round-trip completeness assertion.**

Decisions taken: (a) build the real projection (not a base-light-mode scope-down); (b) publish under `@digitaltableteur/*`.

---

## Packages

Published scope `@digitaltableteur/*`. Internal `@dt/*` alias untouched. Both packages: `"type": "module"`, `version: "0.1.0"`, `private: false`, `publishConfig: { "access": "restricted", "registry": "https://registry.npmjs.org/" }`, `files: ["dist"]`, own `README.md` / `LICENSE` / `CHANGELOG.md`. `dist/` is produced by the pipeline and only the package `dist` contents are included in npm tarballs.

### `packages/tokens/` — `@digitaltableteur/tokens@0.1.0` (framework-agnostic, no CSS)
`exports` (types-condition first, ESM default):
- `.` → `{ "types": "./dist/index.d.ts", "default": "./dist/index.js" }` — typed JS token map + token names.
- `./dtcg` → `./dist/tokens.dtcg.json` — spec-valid, collision-free, **complete** DTCG.
- `./tailwind` → `{ "types": "./dist/tailwind.tokens.d.ts", "default": "./dist/tailwind.tokens.js" }`.
- `./manifest` → `./dist/tokens-manifest.json`.

No `dependencies`.

### `packages/tokens-css/` — `@digitaltableteur/tokens-css@0.1.0` (token CSS layer)
- `exports`: `.` and `./tokens.css` → `./dist/tokens.css` (the **new theme-complete token-only projection**); `./themes/*` → `./dist/themes/*.css` (brand overrides from `generate-theme.mjs`).
- `sideEffects: ["*.css"]`.
- **No** `dependencies` on `@digitaltableteur/tokens` — it is pure CSS with no JS import; publish order is a release-script concern, not a dependency edge that forces a phantom install (council should-fix).

---

## Generator work (the real substance)

### G1. Theme-complete, token-only CSS projection
New script `scripts/design-system/build-token-css.mjs` (postcss is already a dependency):
- Parse `nextjs-app/shared/styles/variables.css` into an AST.
- Keep only declarations whose property starts with `--`, plus `color-scheme` theme metadata, preserving their enclosing scope: `:root`, `.themeDark`, `.themeHCB`, `.themeHCW`, and the `@media (forced-colors)`, `@media (prefers-contrast)`, `@media (prefers-color-scheme)` at-rules.
- Drop every non-custom-property rule (component/utility selectors, keyframes) and any rule/at-rule that ends up empty.
- Emit to the package `dist/tokens.css` with an "AUTO-GENERATED — source of truth: variables.css" header.
- **Assertion:** the projection contains the same token/theme declarations as source (418 declarations after including `color-scheme`; specifically `.themeDark`, `.themeHCB`, `.themeHCW`, `forced-colors`, `prefers-contrast`, `prefers-color-scheme` all present) and no component/utility declarations.

This is distinct from the existing `foundations/dist/tokens.css` (the flat catalog mirror), which stays as-is for tooling.

### G2. Collision-free, complete, correctly-typed DTCG
Fix `scripts/design-system/export-dtcg-from-css.mjs`:
- No node may be both `$value` and a group. For the 8 value-and-group collisions, restructure (nest the group's own value under a reserved `DEFAULT` leaf, or flatten the naming) so Style Dictionary v4 ingests all tokens.
- **Round-trip assertion:** DTCG leaf-token count == source light-root token catalog count (184 after fixing multi-line parsing). Fails the build if any token is dropped. This also fixes the live `tokens.css` gap.
- **`$type` correctness:** type each token by category (color/dimension/fontFamily/duration/…), not the current blanket `fontFamily`. Untyped tokens (~70: motion/radius/size/…) get a `$type`.
- **Raw-value honesty:** where `$value` embeds `var()/clamp()/calc()`, emit a DTCG alias `{group.token}` + static fallback where feasible; where not feasible (composite shadow/duration/typography), scope `./dtcg` to primitives and **document the exclusion in the README** so the framework-agnostic claim is honest rather than shipping opaque strings.

---

## Wiring

- Add `"workspaces": ["packages/*"]` to the root `package.json`. `npm install` symlinks both into `node_modules/@digitaltableteur/`.
- Extend `build:tokens` with a final `scripts/design-system/assemble-token-packages.mjs`: runs G1, copies the G2 DTCG + `tokens.d.ts` + `tokens-manifest.json` + `tailwind.tokens` into `packages/tokens/dist`, writes the JS `index.js`/`index.d.ts` and `tailwind.tokens.js`, and copies the projection + `dist/themes/*` into `packages/tokens-css/dist`. **No existing pipeline output path changes** → zero risk to current consumers.
- New guard `npm run check:token-packages` (`scripts/design-system/check-token-packages.mjs`), wired into pre-push next to the existing gates. Asserts: (a) package `dist/` is in sync with source (regenerate-and-diff), (b) **completeness** — CSS projection contains the theme scopes, DTCG count == source count. Closes both the drift risk and the "silently green while dark mode is missing" gap.

---

## Dogfood proof (app untouched)

- A vitest that imports `@digitaltableteur/tokens` through the workspace and asserts a known token name/value resolves.
- A Node-ESM resolution smoke (`node --input-type=module -e "import('@digitaltableteur/tokens')"`) in the guard, because vitest runs under Vite and would pass even if Node ESM resolution were misconfigured (council should-fix).
- A fs-level assertion that `@digitaltableteur/tokens-css`'s `tokens.css` contains `.themeDark` (theme-completeness at the consumer boundary).

Full publish + external registry dogfooding stay in Phase 5 (behind 5.1 🔒). Local workspace dogfooding is covered by the package guard. No app runtime path changes here.

---

## Roadmap / state updates when it lands

- **Amend roadmap 1.1:** drop the `apps/site` relocation from the intended increment; note the workspace *root* lands in 1.7 with the app staying at repo root (council: 1.1/1.7 desync).
- Tick **1.7** done; note packages built + `check:token-packages` guard added.
- `astryx-roadmap.state.json`: modest, defensible `current` bumps — scalability 60→66, futureproofness 67→72, distribution 20→28 (installable, versioned, complete units exist; publish still gates the big jump). No ratchet regressions; `stableCount` floor unaffected.
- Packages are publish-ready but restricted: `private: false` with `publishConfig.access="restricted"`.

---

## Verification plan

`npm install` → `npm run build:tokens` (emits package dist incl. G1 projection + G2 DTCG) → `npm run check:token-packages` green (theme scopes present, DTCG count == source count, dist in sync) → dogfood vitest + Node-ESM smoke green → `npm run typecheck && npm run lint && npm test && npm run build` all exit 0 → `npm run check:astryx-roadmap` green. Branch `DT-XXX-feat-token-packages`; merge via `gh pr merge --admin` after the local gate (CI is quota-dead in this repo).

---

## Rejected council findings (considered, dismissed with evidence)

- "`npm pack` ships empty because dist is git-ignored" — refuted: `packages/*/dist` is not ignored (root `/dist` is anchored; foundations rule is path-specific). Still adding `files:["dist"]` proactively for 5.1.
- "A `variables.css` copy drags app CSS into the package" — the *specific* refutation (that the design ships the clean compiled `tokens.css`) was itself moot; the real resolution is G1 (build a token-only projection), which is why neither raw artifact is shipped.
- "Distribution bump overclaims" — downgraded to minor; the roadmap explicitly maps Phase 1 → Distribution and the bump is kept small.

---

## Units & boundaries (for isolation/testability)

- **`build-token-css.mjs`** — input: `variables.css`; output: token-only themed CSS string. Pure transform, unit-testable on a CSS fixture (assert scopes kept, component rules dropped).
- **`export-dtcg-from-css.mjs` (fixed)** — input: token catalog; output: spec-valid DTCG. Testable via round-trip count + `$type` assertions.
- **`assemble-token-packages.mjs`** — orchestration only; copies artifacts into `dist/`. Thin.
- **`check-token-packages.mjs`** — regenerate-and-diff + completeness assertions. Independent of the app.
- Packages are consumed only through their `exports` surface; internals (dist layout) can change without breaking consumers.
