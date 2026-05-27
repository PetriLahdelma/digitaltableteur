# ADR 0005: DSharp parity — production baseline, DSharp methodology

## Status
Accepted (2026-05-26)

## Context

The DSharp Design System case study describes a mature system (DTCG tokens, contracts, Storybook tiers, CVA, validation gates). A parity uplift for Digitaltableteur must not copy DSharp **values** (colors, spacing literals, component APIs) into this codebase.

Production already ships real UI: `variables.css`, `@dt/*` components, themes, and pages. That is the baseline.

## Decision

| From DSharp | From Digitaltableteur production |
|-------------|----------------------------------|
| **Methodology** — contract schema, status ladder (alpha → beta → stable), required stories, MDX shape, validator gates, token pipeline shape | **Values** — every color, space, font, and component behavior |
| **Breadth** — which artifact types exist (contract, spec, MDX, foundations stories, drift checks) | **Implementation** — extend existing components; do not replace with DSharp clones |

**Rules:**

1. **Tokens:** `nextjs-app/shared/styles/variables.css` (and theme classes) are the only runtime source. New tokens are added there first. DTCG JSON is an optional export after production is correct, never an import of alien values.
2. **Components:** Existing `@dt/*` implementations are extended toward maturity (contracts, tests, Storybook, CVA where planned). Do not paste DSharp component code or props as-is.
3. **Storybook / CI:** Match DSharp gates (e.g. `validate:components`, beta MDX sections, WIP badge), not DSharp visual design.
4. **Portfolio narrative:** DSharp work is reference and case study only; it does not define Digitaltableteur brand palette.




## Storybook docs (MDX)

In-scope components use **handcrafted** `<Component>.mdx` with `<Meta of={Stories} />` (Carbon-style prose). To avoid Storybook 10 indexing failures:

1. Add `tags: ['!autodocs']` on the CSF meta object.
2. **Do not** also define `parameters.docs.page` on the same component (duplicate docs surface).

The LLM schema block formerly inlined in `docs.page` can move into MDX later if needed.

## Reference benchmarks (methodology only)

DSharp is the **internal case study** for contract shape, Storybook tiers, and validator gates. It is not the only reference. We adopt **patterns**, not palettes or third-party component APIs:

| System | Adopt | Do not adopt |
|--------|--------|----------------|
| **IBM Carbon** | MDX doc structure (usage, style, accessibility), status ladder, prop tables via Controls | Carbon tokens, `@carbon/react` components |
| **Shopify Polaris** | “In production” Example compositions, pattern pages, explicit do/don’t in MDX | Polaris layout primitives, Shopify green |
| **Helsinki Design System (HDS)** | Accessible defaults, Finnish/EN doc parity mindset, foundation stories tied to CSS vars | HDS React package, City of Helsinki brand |
| **Ant Design** | Variant matrices in Storybook, comprehensive argTypes at beta | Ant Design visuals, `antd` dependency |
| **DSharp (portfolio)** | Contract JSON schema, `validate:components`, alpha→beta→stable gates | Quarantined DTCG values, DSharp color ramps |

**Progress metric:** `npm run parity:audit` reports `PARITY_PHASE1_SCORE` (canonical Example story quality for the 27 in-scope entries). Library breadth (contracts per folder) is tracked separately.

## Phased workflow

Work in two phases. Do not skip Phase 1 for “better” DX that changes what production ships.

### Phase 1 — Storybook ↔ production parity (baseline)

Bring Storybook in line with the **live site** across the tier ladder:

- Atoms → Molecules → Organisms → Patterns → Templates

For each in-scope entry:

- Same tokens (`variables.css`), providers, and themes as production.
- Stories reflect **what production actually uses** (canonical Example stories, real compositions).
- Visual and interaction behavior matches production — no drift, no DSharp palette.


### Beta promotion gates (Phase 2)

Before setting `status: "beta"` in `<Component>.contract.json`, the story meta must expose a **documented** Controls surface. `npm run validate:components` enforces:

| Gate | Requirement |
|------|-------------|
| **Block** | `meta.argTypes` exists on the default export meta object (not only on a single story). |
| **Variants** | Every key in `contract.variants` has a matching `meta.argTypes` entry. |
| **Props** | Every locally declared prop on `<Name>Props` is listed in `meta.argTypes`, or listed in `contract.argTypesProxyExempt`, or uses `{ table: { disable: true } }` for slots/HTML passthrough. |
| **Documentation** | Each non-disabled control includes `description`. Variant axes also include `table.defaultValue.summary`. |

Alpha components may omit or thin out argTypes until promotion. Stable uses the same gates as beta.

See `scripts/design-system/validate-components.ts` (argTypes promotion gate) and the Button story for the reference shape.

**Exit criteria:** A reviewer can trust Storybook as a faithful mirror of production before any deliberate API or visual change.

### Phase 2 — Maturity extension (DX, zero regression)

Only after Phase 1 is stable:

- Improve **DX**: props clarity, argTypes, contracts, spec.md, MDX, tests, validator gates (alpha → beta → stable).
- Adopt DSharp **methodology** (contracts, required stories, a11y review notes) while keeping production truth.
- **Zero regressions** on usability or visuals unless explicitly approved — changes are additive (docs, types, tests, gates) or strictly equivalent refactors.

New props, variants, or visual changes are **extensions**, not parity fixes, and need explicit intent (issue/PR note).


## Consequences

- Quarantined draft JSON lives under `foundations/tokens/_wip-scaffold/` until exported from production.
- Parity progress is measured as coverage and quality of production artifacts, not visual match to DSharp.
- Agents and contributors read this ADR before parity or token work.

## Related

- [ADR 0004: Token pipeline](./0004-token-pipeline.md)
- [ADR 0001: Styling stack](./0001-styling-stack.md)
- `foundations/tokens/README.md`
