# ListItem design spec

Date: 2026-07-17. Status: approved by owner (brainstorm session).

## Purpose

A standalone, presentational row primitive for menus, selects, palettes, and
lists. It renders the row visuals only: leading icon, label, end-aligned
secondary content, trailing icon, selection check, state treatments, and a
destructive tone. Consumers own semantics (role, focus, events). Menu adopts
it immediately; Select, Combobox, and CommandPalette can adopt it in later
trials.

The native web-component twin `dt-list-item` ships in the same trial, and the
`dt-menu` and `dt-split-button` panel rows are refactored to compose it.

## Anatomy

```
[icon] [label ......................] [meta] [trailingIcon | selected check]
```

- `icon`: leading, in a fixed gutter so labels column-align across rows.
- label (`children`): flexible, truncates with ellipsis, never wraps.
- `meta`: end-aligned secondary content in smaller muted type. Accepts plain
  text or composed DS content: `Badge`, `Kbd`, `StatusDot`, a value string.
- `trailingIcon`: after meta (chevron, external-link, etc.).
- `selected`: renders the check indicator in the trailing position.

## React API

New component folder `nextjs-app/shared/components/ListItem/` with the full
scaffold (`.tsx`, `.module.css`, `.stories.tsx`, `.test.tsx`,
`.contract.json`, `.spec.md`, `index.ts`, a11y snapshots).

```ts
export interface ListItemProps {
  children: React.ReactNode;          // primary label
  icon?: React.ReactNode;             // leading icon node
  meta?: React.ReactNode;             // end-aligned secondary content
  trailingIcon?: React.ReactNode;     // rendered after meta
  selected?: boolean;                 // visual check indicator, trailing position
  tone?: "neutral" | "destructive";   // default "neutral"
  disabled?: boolean;                 // visual disabled treatment
  highlighted?: boolean;              // parent-driven active row
  className?: string;
}
```

Renders a non-semantic styled row (no role, no tabindex, no event handlers).
The interactive wrapper supplies semantics: Radix `DropdownMenu.Item`,
`<button>`, `<li>`, or an option element.

### States

Each state applies per tone (`neutral`, `destructive`):

- default
- hover (`:hover` on the row)
- highlighted (prop, and ancestor `[data-highlighted]` via a descendant
  selector so Radix menus get row states without prop plumbing)
- active/press (`:active`)
- disabled (uses the canonical `--color-disabled-*` tokens, never opacity)

Focus rings belong to the interactive wrapper, not to ListItem.

### Destructive tone

`tone="destructive"`: label and icons use the error color; hover and
highlighted backgrounds use an error-tinted `color-mix`. Intended for
deletions and other destructive actions.

### Sizing

One size in this trial: the current 2.5rem menu row (min-block-size 2.5rem,
padding-block `--space-internal-8`, padding-inline `--space-internal-12`,
radius `--radius-md`, gap `--space-internal-8`, font `--font-size-text-s`).
`sm`/`lg` steps stay additive later per the locked API conventions
(variant x tone, sm/md/lg, unprefixed booleans).

## Accessibility

- `meta` is exposed to AT (NOT `aria-hidden`). The current Menu `trailing`
  slot hides its content from AT; ListItem fixes that for textual content.
- `icon`, `trailingIcon`, and the `selected` check are decorative
  (`aria-hidden="true"`).
- `selected` is visual only. Semantic selection (`aria-checked`,
  `aria-selected`) belongs to the consumer.
- Disabled styling comes from tokens; the consumer carries `aria-disabled`.
- axe assertion in the unit tests per the scaffold.

## Menu consumption (additive)

`MenuItem` and `MenuSubTrigger` keep their existing APIs and render
`<ListItem>` internally.

- New passthrough props on `MenuItem`: `meta`, `trailingIcon`, `selected`,
  `tone`.
- Existing `trailing` prop stays as a deprecated alias mapped onto `meta`
  (additive mandate, no breaking changes).
- `MenuSubTrigger` renders its chevron through `trailingIcon`.
- SplitButton inherits everything through Menu.

## Native twin and refactors

- New `dt-list-item` element in `packages/web-components/src/native/`:
  slots `icon`, default (label), `meta`, `trailing-icon`; attributes
  `selected`, `tone`, `disabled`, `highlighted`. Shadow styles mirror
  `ListItem.module.css` 1:1, restating anything the shadow boundary filters
  out (box-sizing, inherited typography). Registered in the fleet config
  with contract, stories, and manifest entries.
- `dt-menu` and `dt-split-button` panel rows are refactored to compose
  `dt-list-item` internally. Their items-JSON APIs do not change.
- Menu and SplitButton are enforced in the rendered-parity roster: the
  refactor lands only when their pairs re-verify pixel-identical against the
  updated React twins. ListItem itself gets paired React and native stories
  and enrolls in the roster on arrival.

## Stories and verification

- Stories cover every slot combination (icon only, meta text, Badge, Kbd,
  StatusDot, value, trailingIcon, selected) and the state x tone matrix,
  including a destructive example and a canonical `Example` showcase story
  named exactly `Example` (rendered-parity pairing is exact-name).
- React and native stories are authored as replicas (same args, content,
  canvas layout) per docs/design-system/rendered-parity.md.
- Gates: unit + axe tests, `validate:components`, story-name parity,
  `check:rendered-parity` for ListItem, Menu, and SplitButton,
  `build:tokens` + `check:contract-props` + `check:consumers`, full local
  gate (typecheck, lint, tests, build) before merge.
- Export from `@digitaltableteur/react` (additive) per the consumption
  mandate. EN/FI/SV keys for any user-facing story copy.

## Out of scope

- Select, Combobox, CommandPalette, and LanguageSwitcher adoption (later
  trials, one component per trial).
- `sm`/`lg` size steps.
- Interactive semantics inside ListItem (kept consumer-owned by design).
