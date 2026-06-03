# Phase 5 — @dt usage enforcement (tightened)

**Completed:** 2026-06-02

## Delivered

- **ESLint mirror** (`eslint.config.mjs` dt/usage block) — `no-restricted-syntax` for raw `<button>` / `<h1>`–`<h6>`, `no-restricted-imports` for `@/components/ui/*`
- **Shared rules** — `scripts/design-system/dt-usage-rules.mjs` (single source for lint script + ESLint)
- **Baseline cleared** — 85 → 0 findings in `app/`, `patterns/`, `pages/` (work pages, Header, CTASection, HomeHero, etc.)
- **CI strict** — `npm run lint:dt-usage` defaults to `--strict`
- **Exempt** — `app/global-error.tsx` only (no provider shell)
- **Codemod** — `codemod-meta-label-titles.mjs` for portfolio meta labels

## Commands

```bash
npm run lint:dt-usage      # strict (exit 1 on violation)
npm run lint               # includes ESLint dt/usage block
```
