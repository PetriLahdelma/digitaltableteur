# Next.js 16 Upgrade Plan

**Status:** Done — core upgrade merged in [#634](https://github.com/digitaltableteur/digitaltableteur/pull/634) (2026-05-31). Turbopack unblocked in follow-up branch `chore/turbopack-mdx-unblock`.
**Created:** 2026-05-31  
**Owner:** Digitaltableteur engineering  
**Goal:** Upgrade production Next.js app from 15.5.x → 16.x with Turbopack as default bundler, without regressions.

> **For AI agents / future sessions:** Read this file first. It is the source of truth for the 16 upgrade. Do not rely on chat history.

---

## Why upgrade

| Benefit | Relevance to this repo |
|--------|-------------------------|
| **Turbopack default** | Dev compiles were ~1 min/route on Webpack; Turbopack is the intended fix after icon-registry + cache work on 15.5 |
| **Official path** | Next 16 removes sync request APIs, deprecates `middleware.ts`, drops `next lint` |
| **Already on React 19 + Node 22** | Prerequisites met (repo uses Node 22.12+) |

---

## Current baseline (verify before starting)

| Item | Value | Notes |
|------|-------|-------|
| **Production app root** | `/` (`app/`, `next.config.ts`, root `package.json`) | **Authoritative** — not `nextjs-app/` |
| **Next.js (root)** | `^16.2.6` | Upgraded on `chore/nextjs-16-upgrade` |
| **Next.js (nextjs-app/)** | N/A | Legacy app shell removed; `nextjs-app/shared/` remains active design-system code |
| **React** | `^19.2.6` | OK for 16 |
| **Node (local/CI)** | `22.12.0+` | Required by Sanity Studio 6; above Next 16 minimum |
| **Bundler (dev)** | **Turbopack (default)** | `next dev -p 3001` — MDX plugins use string names; `dev:webpack` fallback retained |
| **Bundler (build)** | **Turbopack (default)** | `next build` — ~22s local vs ~90s webpack; `analyze` uses Turbopack too |
| **Lint** | Custom `scripts/lint-banner.mjs` → local ESLint | Already off `next lint` |
| **MDX** | `@next/mdx` + `next.config.ts` wrapper | Align `@next/mdx` peer with `next@16.2.x` (done in #634) |

### Recent stability context (do not repeat mistakes)

- **Blog RSC (#630):** MDX must not import through server graph at build time; client boundary `BlogArticleMdxBody.tsx`.
- **WorkNav (#631 / NextWorkNav):** No GSAP on `#main-content` during `router.push` — corrupts Webpack dev cache.
- **Dev perf (2026-05):** `Icon` used `import *` from Phosphor; fixed via `iconRegistry.ts`. Webpack dev cache re-enabled (filesystem, pruned by `predev`).

---

## Scope

### In scope

- Bump `next`, `@next/mdx`, `eslint-config-next`, and related Next peers at **repo root**
- Migrate `middleware.ts` → `proxy.ts` (16 naming)
- Port or replace `webpack()` customizations for Turbopack
- Audit async request APIs (`params`, `searchParams`, `cookies`, `headers`)
- Update CI/Vercel scripts if needed
- Full quality gate + smoke routes

### Out of scope (separate work)

- Removing shared design-system code under `nextjs-app/shared/`
- Cache Components / `"use cache"` adoption (evaluate post-upgrade, not required for bump)
- Production `next build --turbopack` as default until bundle-size A/B passes

---

## Breaking changes checklist (Next 16)

Use official guide: https://nextjs.org/docs/app/guides/upgrading/version-16

| Change | This repo | Action |
|--------|-----------|--------|
| **Turbopack default** | Custom `webpack()` in `next.config.ts` | Port to `turbopack: {}` or temporary `--webpack` opt-out |
| **`middleware.ts` → `proxy.ts`** | `middleware.ts` (blog drafts + markdown negotiation) | Rename file + export; verify matcher behavior |
| **Async request APIs enforced** | Mostly migrated | Grep audit (see Phase 3) |
| **`next lint` removed** | Already using ESLint directly | Confirm CI/hooks don't call `next lint` |
| **`eslint` key in next.config removed** | `eslint.ignoreDuringBuilds: true` | Remove block; keep CI lint |
| **`revalidateTag()` signature** | Not used in app code | N/A unless added during upgrade |
| **Open Graph / sitemap async `params`/`id`** | OG routes use `Promise<Params>` | Verify `sitemap.ts` if using dynamic segments |
| **Parallel routes need `default.js`** | No `@(...)` parallel routes found | Confirm with `find app -name '@*'` |
| **Image defaults** | Custom `images` in next.config | Re-read 16 image breaking changes before merge |

---

## Phase 0 — Branch & preflight (30 min)

1. Branch: `DT-XXX-chore-nextjs-16-upgrade`
2. Confirm clean baseline passes:
   ```bash
   npm run typecheck && npm run lint && npm run test:ci && npm run build
   ```
3. Record timings (cold dev compile for `/` and one `/work/*` route) for before/after comparison.
4. Run codemod **on branch only** (review diff, don't blind-commit):
   ```bash
   npx @next/codemod@canary upgrade latest
   ```

**Exit criteria:** Codemod applied or manual version bumps staged; baseline metrics recorded.

---

## Phase 1 — Dependency alignment (1–2 h)

**Files:** root `package.json`, `package-lock.json`

1. Align versions (target: single Next 16.x line):
   - `next`
   - `@next/mdx`
   - `eslint-config-next`
   - `@sentry/nextjs` (check compatibility matrix)
   - `next-sanity` / `sanity` if codemod didn't bump them
2. Remove version drift: root `@next/mdx@16` + `next@15` is invalid long-term.
3. `npm install`
4. Fix TypeScript/eslint peer warnings.

The former `nextjs-app` package mirror has been removed; root is production.

**Exit criteria:** `npm ls next` shows one 16.x at root; install succeeds.

---

## Phase 2 — Config migration (2–4 h)

**Primary file:** `next.config.ts`

### 2a. Remove deprecated Next config

- Delete `eslint: { ignoreDuringBuilds: true }` (removed in 16)
- Delete `typescript: { ignoreBuildErrors: true }` **if** policy allows — otherwise document why it must stay temporarily
- Review `experimental` keys against 16 docs (some promoted/renamed)

### 2b. Webpack → Turbopack

Current Webpack-only behavior to replicate or consciously drop:

| Webpack behavior | Location | Turbopack action |
|------------------|----------|------------------|
| Path aliases `@`, `@dt`, `@dt-pages`, i18n | `webpack()` resolve.alias | Prefer `tsconfig.json` paths + `turbopack.resolveAlias` if needed |
| Dev filesystem cache | `webpack()` cache | Turbopack FS cache default in 16 dev; see `turbopackFileSystemCacheForDev` |
| `watchOptions.ignored` | blog manifest, fixtures | Confirm Turbopack watch ignores or move generators out of hot path |
| Sanity `NormalModuleReplacementPlugin` | React `useEffectEvent` shim | **Critical:** test `/studio` and Sanity imports; may need Turbopack alias to `lib/react-with-use-effect-event.js` |
| `serverExternalPackages` | Sentry, OTEL, MCP | Verify still supported unchanged |

**Fallback strategy (allowed for Phase 2 only):**

```json
"dev": "next dev --webpack -p 3001",
"build": "next build --webpack"
```

Use `--webpack` only until Turbopack parity is verified, then remove flags.

### 2c. MDX

- Confirm `@next/mdx` wrapper still composes after upgrade
- Run `npm run generate:blog` and hit `/blog/[slug]`

**Exit criteria:** `next dev` starts; homepage loads; no config throw on boot.

---

## Phase 3 — Code migrations (2–4 h)

### 3a. `middleware.ts` → `proxy.ts`

**File:** `middleware.ts` → rename to `proxy.ts`

- Rename exported `middleware` function → `proxy`
- Preserve:
  - Blog draft preview cookie (`?preview=drafts|off`)
  - Homepage markdown content negotiation → `/llms.txt`
  - `config.matcher` for `/`, `/blog`, `/blog/:path*`
- Run dev tests: `/blog?preview=drafts`, `Accept: text/markdown` on `/`

Docs: https://nextjs.org/docs/app/guides/upgrading/version-16#middleware-to-proxy

### 3b. Async request API audit

```bash
# Find suspicious sync access (manual review required)
rg "params\.|searchParams\." app --glob '*.tsx' --glob '*.ts'
rg "headers\(\)|cookies\(\)|draftMode\(\)" app --glob '*.tsx' --glob '*.ts'
```

**Known-good patterns already in repo:**

- `app/contact/page.tsx` — `searchParams: Promise<...>` + `await`
- `app/blog/[slug]/page.tsx` — `params: Promise<...>` + `await cookies()`
- PSEO + OG image routes — `params: Promise<Params>`

Fix any stragglers the codemod missed (especially layouts, helpers passing `params` as props).

### 3c. Instrumentation / Sentry

- `instrumentation.ts` skips Sentry in dev — keep behavior
- Re-test Sentry webpack/turbopack externals after bump

**Exit criteria:** Grep audit clean; proxy behaves like old middleware.

---

## Phase 4 — Scripts & CI (1 h)

**Files:** `package.json`, `.github/workflows/*.yml`

| Script | Current | 16 action |
|--------|---------|-----------|
| `dev` | `next dev -p 3001` | Default Turbopack (or `--webpack` interim) |
| `build` | `next build` | Default Turbopack when ready |
| `lint` | `node scripts/lint-banner.mjs` | **Keep** — no `next lint` |
| `predev` | cache prune scripts | Keep; update comments if cache paths change |

Verify workflows:

- `.github/workflows/pr-validation.yml` — Node 22.12, no `next lint`
- Vercel build command matches local `npm run build`

**Exit criteria:** CI green on PR branch.

---

## Phase 5 — Verification (2–4 h)

### Automated gates (required)

```bash
npm run typecheck && npm run lint && npm run test:ci && npm run build
```

### Route smoke matrix (manual or Playwright)

| Route | Why |
|-------|-----|
| `/` | Layout, header, home |
| `/work` + 2 case studies via WorkNav | Client nav, heavy pages |
| `/blog` + one `[slug]` | MDX client boundary, draft cookie |
| `/blog?preview=drafts` | Proxy cookie |
| `/contact` + `?mode=book` | Cal embed, searchParams |
| `/api/chat` (smoke POST) | AI route |
| `/api/contact` (validation only) | Server route |
| `/studio` or Sanity path | React shim / Sanity |

### Performance comparison

Record after upgrade (Turbopack dev):

- Cold compile: `/`, `/work/vertaaux`
- Second route: `/work/garage-junction`
- Repeat visit latency

Targets (from 2026-05-31 Webpack baseline after icon fix): first route ~27s → aim lower; second route ~3s; repeat ~100ms.

### Production build A/B (before making Turbopack build default)

```bash
npm run build          # Turbopack (16 default)
npm run build -- --webpack   # Compare if needed
```

Compare route first-load JS sizes if Turbopack build is used on Vercel. Roll back build bundler if regression >10% on critical routes.

**Exit criteria:** All gates pass; smoke matrix checked; perf not worse than Webpack baseline.

---

## Rollback plan

1. Revert PR / branch — production would roll back to 15.5.x (pre-#634)
2. If merged and broken: revert commit on `main`, redeploy Vercel
3. `.next` local corruption: `npm run dev:reset`
4. Keep `--webpack` flags in scripts for 1 release if Turbopack blocks ship

---

## Definition of done

- [ ] Root `next@16.x` deployed to production on Vercel
- [x] `npm run typecheck && npm run lint && npm run test:ci && npm run build` pass on CI *(verified locally 2026-05-31)*
- [x] Smoke matrix passed *(16 routes — see upgrade notes)*
- [x] `middleware.ts` removed; `proxy.ts` in place
- [x] `--webpack` opt-out documented for **build** only (MDX); dev uses Turbopack default
- [ ] Dev compile times measured and noted in PR description
- [x] This doc **Status** updated to `Done` with PR link and date

### Upgrade notes (2026-05-28, [#634](https://github.com/digitaltableteur/digitaltableteur/pull/634))

- **`middleware.ts` → `proxy.ts`:** export renamed to `proxy`; matcher unchanged.
- **`/auth.md` route:** moved to `app/agent-auth/route.ts` + rewrite (`.md` conflicts with `pageExtensions`).
- **`images.localPatterns`:** added `/images/**` for cache-busting query strings (Next 16 breaking change).
- **Build bundler:** Turbopack default as of `chore/turbopack-mdx-unblock` — MDX remark/rehype plugins converted to string names + JSON options; Turbopack `resolveAlias` uses **project-relative** paths (`./node_modules/i18next`, not absolute).
- **`test:ci` teardown:** fixed by making `test-stubs/next-loadable.tsx` skip async dynamic imports (no post-teardown module loads).
- **`@types/react` dedupe:** root `package.json` overrides `"@types/react": "$@types/react"` to reduce Ref type clashes.
- **Draft MDX:** `BlogArticleMdxBody` now wraps content in `MDXProvider` with exported `articleMdxComponents` (fixes `ArticleFigure` on preview drafts).
- **Smoke (2026-05-31):** `/`, `/work`, `/work/vertaaux`, `/work/garage-junction`, `/blog`, published slug, draft slug + cookie, `/blog?preview=drafts`, `/contact`, `/contact?mode=book`, `/studio`, `/auth.md`, `/llms.txt`, markdown negotiation on `/`, `/api/contact`, `/api/chat`.

---

## Post-upgrade follow-ups

### Turbopack (done locally on `chore/turbopack-mdx-unblock`)

| Change | File |
|--------|------|
| MDX plugins → string names (`remark-gfm`, `rehype-pretty-code`, …) | `next.config.ts` |
| Turbopack `resolveAlias` with `./`-relative paths | `next.config.ts` |
| Default `dev` / `build` without `--webpack` | `package.json` |
| Fallback `dev:webpack` for debugging | `package.json` |

**Webpack-only (still required for Sanity):** `NormalModuleReplacementPlugin` for `react` → `lib/react-with-use-effect-event.js` inside Sanity packages. Turbopack has no equivalent yet; `/studio` may log `SchemaError` in dev but returns 200 — verify in browser after deploy.

### Cache Components (not started — separate PR)

Enabling `cacheComponents: true` requires migrating ~40 routes from `export const revalidate = N` to `cacheLife({ revalidate: N })` inside `'use cache'` functions. Recommended pilot:

1. `app/lib/blog/cachedPostMetadata.ts` — `'use cache'` + `cacheTag('blog-posts')`
2. Wire `revalidateTag('blog-posts')` from a Server Action or publish webhook after `npm run generate:blog`
3. Enable `cacheComponents: true` only after blog pilot passes build + smoke

See [Cache Components guide](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents).

### Human-only verification checklist

| Step | Why |
|------|-----|
| Confirm Vercel production deploy for merge commit `747bfdabb` | Validates CI + env on real infra |
| Submit `/contact` on production; check Resend inbox | Confirms honeypot + HTML email template |
| Resend dashboard: `CONTACT_EMAIL_FROM` on verified domain | Avoid `onboarding@resend.dev` in prod |
| Open `/studio` in prod; confirm Sanity loads | Turbopack has no React shim — webpack build may behave differently |
| Run `npm run test:stories:matrix:ci` with **no** dev server on 3001/6010 | Prior matrix run timed out with dev server running |
| IDE: select workspace TypeScript 6.0.2 if `ignoreDeprecations` warning persists | `.vscode/settings.json` already points `typescript.tsdk` |

---

## File touch list (expected)

```
package.json
package-lock.json
next.config.ts
middleware.ts          → proxy.ts
app/**/page.tsx        (only if async audit finds issues)
instrumentation.ts     (verify only)
.github/workflows/pr-validation.yml (verify only)
scripts/dev-banner.mjs (update timing hints if needed)
docs/NEXTJS_16_UPGRADE_PLAN.md (status update)
```

**Unlikely to need changes:** `nextjs-app/shared/**` (unless Turbopack alias issues), Vite `src/`.

---

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Turbopack ignores Webpack Sanity shim | Test studio early; use `resolveAlias` or temporary `--webpack` |
| Dev cache corruption returns | Keep WorkNav fix; don't animate `#main-content` on route change |
| Blog build RSC break | Don't import MDX in server components; keep `BlogArticleMdxBody` pattern |
| Bundle size regression (Turbopack build) | A/B before Vercel promotion; use `--webpack` for build if needed |
| Hidden sync `params` access | Strict TS + grep audit in Phase 3 |
| `@next/mdx` + rehype plugin break | Test blog compile in Phase 2c |

---

## Suggested PR structure

1. **PR 1 (mechanical):** Codemod + deps + proxy rename + config cleanup — no behavior changes
2. **PR 2 (bundler):** Turbopack config port + remove `--webpack` + perf notes

Or single PR if small diff — prefer two if Turbopack shims are non-trivial.

---

## Session handoff template

When pausing mid-upgrade, append to PR or a comment:

```
## Next.js 16 upgrade — handoff
- Branch:
- Phase completed:
- Blocker:
- Commands run:
- Next action:
- Dev bundler: turbopack | webpack
- Smoke routes tested:
```

---

## Related docs

- `docs/NEXTJS_MIGRATION_PLAN.md` — Vite → Next (historical parallel strategy)
- `CLAUDE.md` / `app/CLAUDE.md` — App Router patterns
- `next.config.ts` — Current Webpack customizations
- `scripts/ensure-dev-next-cache.mjs` — Dev cache hygiene

---

**End of plan.** Update **Status** at top when work begins or completes.
