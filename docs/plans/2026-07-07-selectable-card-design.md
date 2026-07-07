# SelectableCard — design

Date: 2026-07-07
Branch: `DT-selectable-card`
Status target: `alpha` (WIP badge; no promotion until a real consumer exists)

## Why

Library parity with the Astryx reference (`@astryxdesign/core/SelectableCard`,
https://astryx.atmeta.com/components/SelectableCard). The card-as-a-choice-tile
pattern (plan pickers, onboarding options, settings tiles) is a common design
system primitive we lack.

This is a **parity** build, not a consumer-driven one. Per the roadmap rule
(components are not promoted past alpha/beta without a genuine prod consumer —
the same bar currently blocking ArticleCard), SelectableCard ships at `alpha`
with the WIP badge and is not promoted until a real screen adopts it.

## Existing building blocks

- `Card` (stable): presentational container — `variant` (default/muted/transparent),
  `href`, header/footer slots (#875), skeleton, `titleProps`/`descriptionProps`.
- `Radio` / `RadioGroup` (beta): native-input single-select. Group API is
  options-array driven (`options`, `value`/`defaultValue`/`onValueChange`,
  `name`, `orientation`, `error`).
- `Checkbox` / `CheckboxGroup` (beta): native-input multi-select.

## Architecture

Two components mirroring the Group/Item convention, but **compound children**
(not options-array) because each card is rich content — title, description,
media, and Card's slots — which a `{value,label}[]` array cannot express. This is
the one deliberate divergence from `RadioGroup`/`CheckboxGroup` house style, and
it is unavoidable given the content model.

```tsx
import { SelectableCardGroup, SelectableCard } from "@dt/SelectableCard";

<SelectableCardGroup type="single" value={plan} onValueChange={setPlan} name="plan">
  <SelectableCard value="starter" title="Starter" description="For solo work" />
  <SelectableCard value="team"    title="Team"    description="Up to 10 seats" />
</SelectableCardGroup>
```

### `SelectableCardGroup`

Owns selection state and exposes it via React context.

| Prop | Type | Notes |
|------|------|-------|
| `type` | `"single" \| "multiple"` | Selection model. Default `"single"`. |
| `value` | `string` (single) / `string[]` (multiple) | Controlled. `""`/`[]` treated as absent. |
| `defaultValue` | same | Uncontrolled initial. |
| `onValueChange` | `(v: string) => void` / `(v: string[]) => void` | Fires with next value. |
| `name` | `string` | Native radio group name (single); auto-generated when omitted. |
| `disabled` | `boolean` | Disables the whole group. |
| `orientation` | `"vertical" \| "horizontal"` | Layout of the card stack. Default `"vertical"`. |
| `error` | `string` | Announced via `role="alert"` + `aria-invalid`, matching RadioGroup. |

The group renders `role="radiogroup"` (single) implicitly via native radios; for
`multiple` it is a labelled `group`. Vocab (`value`/`onValueChange`) is reused
verbatim from RadioGroup so consumers switch between them without relearning.

### `SelectableCard`

| Prop | Type | Notes |
|------|------|-------|
| `value` | `string` (required) | Submitted value / selection key. |
| `disabled` | `boolean` | Per-card disable; choice stays visible. |
| `selected` | `boolean` | Standalone controlled use outside a group (optional). |
| ...Card props | | `variant`, `title`, `description`, `children`, slots pass through to `Card`. |

Reads selected state from group context when present.

## Accessibility

Each card is a `<label>` wrapping a **visually-hidden native `<input>`**
(`type="radio"` for single, `type="checkbox"` for multiple), with `Card` as the
visual. This is preferred over `role="radio"` + roving-tabindex because it buys,
for free and correctly:

- keyboard: Tab into the group, Arrow to move within a single-select set, Space
  to toggle in multiple;
- focus management and `:focus-visible`;
- native form submission (`name`/`value`);
- correct screen-reader semantics.

Consistent with how `Radio`/`Checkbox` already work in this system.

## States (all token-driven; dark / HCB / HCW / forced-colors)

- **Unselected**: normal `Card` surface.
- **Selected**: token ring/border + indicator — radio dot (`single`) or checkmark
  (`multiple`) — so the mode is legible.
- **Focus**: visible ring on the card via the hidden input's `:focus-visible`
  (`:has()`), not just the input.
- **Disabled**: dimmed, `aria-disabled`, non-interactive, still readable.
- **Hover**: subtle surface shift; suppressed under `prefers-reduced-motion` and
  when disabled.

## Files

```
nextjs-app/shared/components/SelectableCard/
  SelectableCard.tsx            Group + Card + context
  SelectableCard.module.css
  SelectableCard.stories.tsx    Single, Multiple, Disabled, WithMedia, Error, ForcedColors
  SelectableCard.test.tsx       selection, keyboard, form name/value, controlled + uncontrolled
  SelectableCard.a11y.test.tsx
  SelectableCard.contract.json  status: alpha
  SelectableCard.spec.md
  schema.json
  index.ts
```

## Verification bar

- `axe` clean in all stories.
- Keyboard drive confirmed live in Storybook (Tab in / Arrow within single / Space toggle).
- 4-mode AT snapshots.
- light / dark / forced-colors.
- getComputedStyle check per selection state (selected ring), not just DOM diff —
  per the `--effects` lesson (a class swap with identical DOM reads as inert).
- Pre-PR gate: typecheck, lint, test, build.

## Out of scope (YAGNI)

- Options-array convenience API (rich content makes it a poor fit).
- Drag-reorder, async loading, nested groups.
