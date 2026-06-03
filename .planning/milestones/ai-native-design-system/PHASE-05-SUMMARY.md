# Phase 5 — @dt usage policy (revised)

**Completed:** 2026-06-02 (revised 2026-06-03)

## Delivered

- **ESLint mirror** (`eslint.config.mjs` dt/usage block) — `no-restricted-imports` for `@/components/ui/*` in `app/` only
- **Shared rules** — `scripts/design-system/dt-usage-rules.mjs` (single source for lint script + ESLint)
- **No mass heading/button swaps** — patterns keep native `<h*>` / chrome `<button>` and existing CSS; swapping to default `@dt/Title` / `@dt/Button` changes typography (regression)
- **`Title` `unstyled`** — semantic tag + existing classes without Title token styles (blog SSR, work meta labels)
- **CI** — `npm run lint:dt-usage` (strict) for shadcn imports in `app/`
- **Codemod** — `codemod-meta-label-titles.mjs` uses `Title as="h3" unstyled className={styles.metaLabel}`
- **Guardrails** — `REPLACEMENT_GUARDRAILS` in `component-replacement-policy.mjs`

## Commands

```bash
npm run lint:dt-usage      # strict — @/components/ui/* in app/
npm run lint               # includes ESLint dt/usage import block
node scripts/design-system/codemod-meta-label-titles.mjs
```

## Explicitly out of scope (unless discussed)

- Replacing pattern section `<h2 className="font-display…">` with default `@dt/Title`
- Header language/theme/mobile controls → `@dt/Button`
- `CTASection` shadcn → `@dt/Button` without variant parity (`isInverse`, outline on dark)
