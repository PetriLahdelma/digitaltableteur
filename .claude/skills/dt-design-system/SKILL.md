---
name: dt-design-system
description: >-
  Creates and modifies Digitaltableteur UI components, layout patterns, Storybook
  stories, contracts, and design tokens under nextjs-app/shared/. Use when the
  user says "new component", "scaffold component", "Storybook story", "design
  system", "CSS Modules", "component contract", "validate:components", or edits
  files in shared/components or shared/patterns. Do NOT use for Next.js page
  routes (use dt-nextjs-app) or API endpoints (use dt-api-routes).
metadata:
  version: 1.1.0
  category: design-system
---

# Design system workflow

## Instructions

### Step 1: Load context

1. Read [`references/area-guide.md`](references/area-guide.md)
2. **Before creating UI**, run [`dt-use-existing-component`](../dt-use-existing-component/SKILL.md) or `npm run find-component -- "your intent"`.
3. Search for existing components before creating new ones:

```bash
rg -n "<SimilarName" nextjs-app/shared/components/
```

3. For new components, open [`docs/LLM_COMPONENT_GENERATION_RULES.md`](../../docs/LLM_COMPONENT_GENERATION_RULES.md) by relevant section only — do not paste the full 12k-word doc into context.

### Step 2: Scaffold (new component)

```bash
npm run new-component ComponentName
```

Expected output: folder under `nextjs-app/shared/components/ComponentName/` with `.tsx`, `.module.css`, `.stories.tsx`, `.test.tsx`, `.contract.json`, `.spec.md`, `.mdx`, `index.ts`.

CRITICAL before finishing:

- WIP badge on Storybook story until promoted
- axe-core assertion in `.test.tsx`
- EN / FI / SV keys if user-facing strings
- Design tokens from `variables.css` — no hardcoded colors

### Step 3: Validate

```bash
npm run validate:components
npm test -- ComponentName
```

If validation fails, halt and fix reported contract/spec/MDX issues before proceeding.

**Before pushing contract or component changes**, also run the farm-parity contract gate (the pre-push hook enforces it too):

```bash
npm run build:tokens && npm run check:contract-props && npm run check:consumers
```

`check:contract-props` compares contracts against freshly built agent blocks. Contracts with authored `usage` (doc-adopted) own their `composesWith`/`prefersOver`/`forbiddenUse`; only props are machine-checked for them. Props must be declared locally on the `<Name>Props` interface — a prop that only arrives via a native attribute extension (e.g. `disabled`) is invisible to the extractor and will be flagged stale.

### Step 4: Promote (remove WIP badge)

Only when ALL pass:

- Unit + axe tests green
- `npm run test:stories:smoke` for the story
- Full i18n coverage
- Visual check in Storybook or via `npx agent-browser`

Ask the user before promoting contract status to stable.

### Token changes

```bash
npm run build:tokens
```

Regenerates `nextjs-app/shared/foundations/dist/agent-manifest.json`.

### @dt usage gate

Do **not** replace pattern-level `<h*>` / header chrome `<button>` with `@dt/Title` / `@dt/Button` unless explicitly requested — that changes typography and breaks section CSS. Fix heading **levels** only (`h3` → `h2`) while keeping existing classes. `npm run lint:dt-usage` flags `@/components/ui/*` in `app/`, patterns, pages, and shared components (known shadcn debt allowlisted).

### Agent / MCP discovery

- CLI: `npm run find-component -- "your intent"`
- Local MCP: `npm run ds:mcp` (stdio — see `docs/DESIGN_SYSTEM_MCP.md`)
- HTTP: `/mcp` on production (design-system tools + consulting)

---

## Examples

### Example 1: New Button variant

User says: "Add a ghost variant to Button"

Actions:

1. Load existing `nextjs-app/shared/components/Button/`
2. Update `Button.tsx`, `Button.module.css`, `Button.contract.json`, `Button.spec.md`
3. Add story variant + test coverage
4. Run `npm run validate:components && npm test -- Button`

### Example 2: New layout pattern

User says: "Create a pricing table pattern"

Actions:

1. Check `nextjs-app/shared/patterns/` for similar patterns
2. Compose from `@dt` primitives (`Title`, `Text`, `Card`, `Grid`) — no raw `<h2>` or `<p>`
3. Follow same contract/story/test structure as components
4. Run validation gates

---

## Troubleshooting

### validate:components fails on contract

Cause: props in `.tsx` drifted from `.contract.json` or spec has open TODOs at beta+.

Solution: align contract schema with exported props; rewrite stub MDX/spec prose flagged in `agent-manifest.json`.

### Storybook story missing WIP badge

Cause: scaffolder default removed manually.

Solution: restore WIP badge until a11y + visual + i18n gates pass.

### Tests fail on axe violations

Cause: missing labels, contrast, or keyboard support.

Solution: fix a11y in component first; do not suppress axe rules without documented justification in spec.

---

## Boundaries

- MUST NOT use inline styles (except dynamic `backgroundImage`)
- MUST NOT create single-file components outside folder structure
- MUST NOT remove WIP badge without full verification gate
