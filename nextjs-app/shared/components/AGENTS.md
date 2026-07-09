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

**Prefer contract-driven autogen over hand-written argTypes.** Components registered in `.storybook/controls-autogen.json` get their Controls panel derived at runtime by `.storybook/lib/controls-autogen.ts` from the contract (prop set, union values) and docgen (JSDoc descriptions, extracted defaults) — the treatment table above, implemented once. For those components: put prop descriptions in JSDoc on the Props interface (never only in argTypes), author story argTypes ONLY for mapping presets and bespoke knobs (authored entries win), and append to the registry only after `audit:controls --only <Name>` shows 100% presence and `--effects` shows 0 inert. `validate:components` skips its static argTypes gate for registered components because the runtime instruments are stronger. Gotcha: enhancer-emitted controls must use the `{ type: "..." }` object form — CSF shorthand normalization runs before enhancers, so `control: "text"` from an enhancer renders no widget.

**Static argTypes coverage is NOT proof the control works — and an operable widget is not proof it drives anything.** `validate:components` only checks that an argTypes entry exists with a description — it cannot see that the rendered Controls panel actually shows an operable widget. A prop can pass validation and still render as a dead "Set object"/"Set string" button (unseeded control) or a hidden row (`table.disable` beside a real `control`). The **`npm run audit:controls`** harness drives the real Storybook Controls panel in a headless browser and classifies every value prop as operable (text/number/range/checkbox/radio/select/textarea), dead (Set-button), or missing; **`--effects`** then perturbs each operable widget and fails on props whose canvas DOM never changes (a controls-enabled story must render `{...args}` — a custom render that hardcodes a mapped prop makes its control a lie). Two rules that keep controls operable: (1) never pair a real `control` with `table: { disable: true }`; (2) seed a value in `args` for every text/number/object control so it renders an input, not a "Set X" button (enums render without seeding; booleans DO need a seeded default). Run `audit:controls --min <pct>` as a ratchet; a component is "done" at 100% presence and 0 inert.

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
- Shared components use `useTranslate()` / `useLocalization()` from `nextjs-app/shared/lib/translation`; do not import `react-i18next` directly in package source.
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
- **deprecated** → zero consumers (or migrated first) + required `deprecatedReason` naming successors; hidden from `find-component` by default; removal rules + log in [`docs/design-system/deprecation-policy.md`](../../../docs/design-system/deprecation-policy.md)

Do not promote to stable without running validation gates in skill `dt-design-system`. Never build on a deprecated component; its `deprecatedReason` names the successor.

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
