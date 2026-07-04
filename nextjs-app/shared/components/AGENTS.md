# Design system & components

> **Scope:** `nextjs-app/shared/components/`  
> **Skill:** [`.claude/skills/dt-design-system/SKILL.md`](../../.claude/skills/dt-design-system/SKILL.md)  
> **Deep reference:** [`docs/LLM_COMPONENT_GENERATION_RULES.md`](../../docs/LLM_COMPONENT_GENERATION_RULES.md)

---

## Identity

80+ UI components, contracts, Storybook stories, Vitest + axe tests. Import via `@dt/<ComponentName>`.

---

## Required folder structure

```
ComponentName/
├── ComponentName.tsx
├── ComponentName.module.css
├── ComponentName.stories.tsx    # WIP badge until promoted
├── ComponentName.test.tsx
├── ComponentName.contract.json  # status, props schema
├── ComponentName.spec.md        # behavior contract
├── ComponentName.mdx            # Storybook docs
└── index.ts
```

**Location:** always `nextjs-app/shared/components/` unless explicitly platform-specific.

---

## Scaffold & validate

```bash
npm run new-component ComponentName
npm run validate:components
npm run build:tokens          # regenerates agent-manifest.json
npm run check:contract-props && npm run check:consumers   # farm CI parity (pre-push enforces)
```

---

## Storybook Controls quality bar

Every row a dev sees in the Controls panel / docs props table must be **deliberate**. Judge each prop and pick exactly one treatment:

| Prop kind | Treatment |
|---|---|
| Enum / boolean / number | Real control (`inline-radio`/`select`/`boolean`/`number`) + `description` + `table.defaultValue.summary` |
| Free string (`title`, labels) | `control: "text"` + seed `""` in `meta.args` so it renders an input box, not a "Set string" button |
| Constrained ARIA (e.g. `role="status"`) | `inline-radio` with `options: [undefined, ...]` and `labels: { undefined: "none" }` |
| Event handler | `action: "..."` + `table: { disable: true }` (the Actions pane covers it; a dead `-` row is noise) |
| ReactNode / ref / DOM passthrough | `table: { disable: true }` — a "Set object" button helps nobody; document it in the contract instead |
| Story-only knob (e.g. `iconName`) | Real control + description saying it is a story knob |

Group everything with `table.category`: Content / Appearance / Behavior / Accessibility / Advanced.

**Never** silence the coverage gate with blanket `argTypesProxyExempt` lists. Exemptions are only for props that genuinely cannot be controlled; `validate:components` errors on stale exemptions (exempt + covered) and on exempted variant axes, and reports remaining debt as `CONTROLS_PROXY_EXEMPT`. Prune mechanically with `npx tsx scripts/design-system/prune-argtypes-exemptions.ts`.

---

## Styling

- CSS Modules only (never inline except dynamic `backgroundImage`)
- Tokens from `nextjs-app/shared/styles/variables.css`
- Logical properties: `margin-inline`, `padding-block`
- Reuse primitives: `Title`, `Text`, `Button`, `Card`, `Icon`, `Grid`, `FlexBox`

```css
/* GOOD */
.card {
  padding-inline: var(--space-layout-16);
  color: var(--color-text);
}
```

---

## i18n

- Keys in `nextjs-app/shared/locales/{en,fi,sv}/translation.json`
- 100% coverage across EN / FI / SV before removing WIP badge

---

## Testing

| Type | Command |
|------|---------|
| Unit + a11y | colocated `.test.tsx`, `npm test` |
| Story smoke | `npm run test:stories:smoke` |
| Visual / a11y matrix | `npm run test:stories:matrix:ci` |

Coverage target: >80%. Include axe-core in component tests.

---

## Status lifecycle

- **WIP** → Storybook badge; not production-ready
- **beta** → contract + spec required, plus docs: a Carbon-style MDX page or contract doc-field adoption (`usage`/`keywords`/`dense` + autodocs frame; colocated MDX must then be deleted); honest doc debt tracked in `agent-manifest.json`
- **stable** → a11y snapshots, production consumer, review evidence in contract

Do not promote to stable without running validation gates in skill `dt-design-system`.

---

## MUST NOT

- Raw `<h1>`–`<h6>`, `<p>`, styled `<button>` — use design system components
- `@ts-ignore`, hardcoded colors, standalone single-file components
- Remove WIP badge without a11y + visual + translation verification

---

## Quick find

```bash
rg -n "export (function|const|default)" nextjs-app/shared/components/
find nextjs-app/shared/components -name "*.test.tsx" | head
rg -n "<ComponentName" app/ nextjs-app/
```

---

## Generated manifest

`nextjs-app/shared/foundations/dist/agent-manifest.json` — component contracts, token catalog, doc debt. Regenerate: `npm run generate:agent-manifest`.
