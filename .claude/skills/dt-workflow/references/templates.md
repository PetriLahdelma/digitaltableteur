# Dynamic workflow prompt templates

Copy into Claude Code. Replace `[brackets]`. Always include **`workflow:`** or **`ultracode:`** on the first line.

Pilot first (3–5 items) unless you have cost confidence from a prior run.

---

## Confirmation gate (recommended for every workflow)

Add this block to any template before the first run. Prevents runaway token spend and lets you review the partition plan.

```text
Confirmation:
- Plan only first — list partitions, estimated slice count, and which skill/AGENTS.md each slice uses.
- Run the pilot only after I reply "go" (or "go full" to skip pilot cap).
- Use /cost after the pilot; quote estimated cost before expanding to full fan-out.
- Enable auto mode or scoped permissions for the session so subagent edits are not interrupted (/permissions).
```

For **staged migrations** (T3), run one stage per session; do not combine map + port + fix in a single prompt unless the pilot succeeded.

---

## T1 — Component beta promotion sweep

```text
workflow: Promote WIP/alpha design-system components to beta contract status.

Partition: one subagent per folder in nextjs-app/shared/components/ where contract.status is alpha or WIP in agent-manifest.json (or missing .test.tsx / .stories.tsx).

Per slice:
- Follow dt-design-system skill and nextjs-app/shared/components/AGENTS.md
- Each component folder MUST have: Component.tsx, Component.module.css, Component.stories.tsx (WIP badge until verified), Component.test.tsx (Vitest + axe), index.ts
- CSS Modules only; design tokens from variables.css; EN/FI/SV if user-facing strings added

Done when (repo-wide after all slices):
npm run validate:components && npm run typecheck && npm test

Pilot: first 5 components only.

Confirmation:
- Plan only first — show component list and pilot subset; wait for my "go".
- /cost after pilot before full fan-out.

Do not: remove WIP badge without a11y tests passing; edit .env*; commit .planning/
```

---

## T2 — Translation gap fill (EN → FI/SV)

```text
workflow: Fill missing Finnish and Swedish translation keys to match English.

Partition: one subagent per namespace block in nextjs-app/shared/locales/ — compare en/translation.json keys to fi/ and sv/; each agent owns keys missing in one locale file.

Per slice:
- Match tone of existing FI/SV entries in the same file
- Do not invent new English keys; only translate keys present in en/
- Preserve JSON structure and interpolation placeholders exactly ({{name}}, etc.)

Done when:
npm run validate-translations && npm test

Pilot: first 20 missing keys across all locales.

Confirmation:
- Plan only first — show key count per locale; wait for my "go".

Do not: machine-translate brand terms "Digitaltableteur", "Donny", or product names unless already localized elsewhere.
```

---

## T3 — Next.js page migration (single-stage, small batch)

Use for 1–3 routes only. For larger migrations, use **T3a → T3b → T3c** below.

```text
workflow: Migrate legacy Vite pages to Next.js App Router for the listed routes.

Partition: one subagent per route from docs/NEXTJS_MIGRATION_PLAN.md [list specific routes or phase].

Per slice:
- Follow dt-nextjs-app skill and app/AGENTS.md
- Create app/[route]/page.tsx with generateMetadata / opengraph-image.tsx where applicable
- Reuse nextjs-app/shared/components; CSS Modules; async params pattern for dynamic routes
- Wire i18n via existing providers pattern

Done when:
npm run typecheck && npm run build && npm test

Pilot: 3 routes only.

Confirmation:
- Plan only first — show route list and legacy src/ sources; wait for my "go".

Do not: modify src/ legacy unless explicitly listed; do not use logo512.png for OG — use colocated opengraph-image.tsx.
```

---

## T3a — Stage 1: Map migration (plan only, no edits)

Run this before T3b. Output is a migration map you review manually.

```text
workflow: Map Next.js migration for routes listed in docs/NEXTJS_MIGRATION_PLAN.md [phase or route list].

Stage: 1 of 3 — MAP ONLY. Do not edit any files.

Tasks:
- For each route: legacy src/ entry file, target app/ path, shared components used, i18n keys, metadata/OG needs, API dependencies
- Flag blockers (client-only APIs, Vite-specific imports, missing shared components)
- Propose partition for T3b (one subagent per route)

Output: markdown table in chat — route | legacy path | app path | deps | blockers | ready (yes/no)

Confirmation:
- This stage is read-only; no "go" needed for edits.
- Wait for my "proceed to T3b" before any porting.

Done when: map covers every route in scope with ready/blocked status.
```

---

## T3b — Stage 2: Port routes (behavior-preserving)

Run after T3a map is approved. One workflow per pilot batch.

```text
workflow: Port approved routes from Vite legacy to Next.js App Router (stage 2 of 3).

Partition: one subagent per route marked ready=yes in the T3a migration map [paste route list].

Per slice:
- Follow dt-nextjs-app skill and app/AGENTS.md
- Create app/[route]/page.tsx (+ layout.tsx if needed), generateMetadata, opengraph-image.tsx
- Reuse nextjs-app/shared/components; CSS Modules; Next.js 15 async params
- Do not delete src/ legacy files yet

Done when:
npm run typecheck && npm run build && npm test

Pilot: 3 routes only.

Confirmation:
- Plan only first — confirm route list matches T3a map; wait for my "go".
- /cost after pilot before remaining routes.

Do not: use logo512.png for OG; edit .env*; modify routes marked blocked in T3a.
```

---

## T3c — Stage 3: Fix loop until green

Run after T3b ports land. Converges build/test failures across all ported routes.

```text
workflow: Fix loop for Next.js migration — drive typecheck, build, and tests to green (stage 3 of 3).

Partition: one subagent per failing area — type errors (group by app/ segment), build errors, test failures (group by test file).

Context: routes ported in T3b [list routes].

Per slice:
- Fix only what is required for gates to pass; no refactors or visual redesign
- Follow dt-nextjs-app skill and app/AGENTS.md

Fix loop:
1. Run npm run typecheck && npm run build && npm test
2. Triage failures; assign partitions
3. Re-run gates after each batch until all pass

Done when:
npm run typecheck && npm run build && npm test

Confirmation:
- Show failure summary and proposed partitions; wait for my "go" before edits.

Do not: delete src/ legacy until I confirm migration verified in browser.
```

---

## T4 — OG image and metadata standardization

```text
workflow: Add colocated opengraph-image.tsx to App Router pages missing dynamic OG images.

Partition: one subagent per app/**/page.tsx that lacks opengraph-image.tsx in the same segment (grep for pages still using default metadata or logo512 references).

Per slice:
- Follow dt-nextjs-app skill and app/AGENTS.md
- Use existing OG template patterns from sibling routes in app/
- generateMetadata must not reference logo512.png

Done when:
npm run typecheck && npm run build
rg 'logo512' app/ --glob '*.tsx' returns no OG/metadata hits

Pilot: 5 pages only.

Confirmation:
- Plan only first — list pages missing opengraph-image.tsx; wait for my "go".

Do not: change page content or layout beyond metadata/OG files.
```

---

## T5 — CSS hardcoded color purge (design tokens)

```text
ultracode: Replace hardcoded colors in CSS modules with design tokens.

Partition: one subagent per nextjs-app/shared/components/**/*.module.css file flagged by stylelint scale-unlimited/declaration-strict-value (or files with # hex / rgb literals).

Per slice:
- Follow dt-design-system skill
- Map to var(--color-*) or var(--space-*) from nextjs-app/shared/styles/variables.css
- Preserve visual appearance; use logical properties where touching layout

Done when:
npm run lint:css && npm run test:visual -- --grep [component name if scoped]

Pilot: 10 files only.

Confirmation:
- Plan only first — list CSS files with hardcoded colors; wait for my "go".
- /cost after pilot before full fan-out.

Do not: change component behavior or TSX unless required for token swap.
```

---

## Custom template skeleton

```text
workflow: [One-sentence goal]

Partition: [files | components | routes | locale keys | other]

Per slice:
- Skill: [dt-design-system | dt-nextjs-app | dt-api-routes | dt-scripts | dt-sanity-cms]
- Area doc: [path/to/AGENTS.md]
- [Additional rules]

Done when:
[exact npm / node commands]

Pilot: first [N] items.

Confirmation:
- Plan only first — show partitions and pilot subset; wait for my "go" before edits.
- /cost after pilot before full fan-out (recommended).

Do not: [secrets, .env, force-push, scope exclusions]
```
