# Tabs redesign — design spec

**Date:** 2026-07-07
**Component:** `nextjs-app/shared/components/Tabs` (status: beta, zero production consumers)
**Goal:** Replace the dated boxed/segmented look with the Astryx tab aesthetic
(`Tab` / `TabList` / `TabMenu`), keeping digitaltableteur theming (tokens, Satoshi).

## Reference aesthetic (Astryx, measured)

- Underline-first tablist: `<nav>` flex, faint 1px bottom rail, ~33px tall.
- Tab: 14px label, `0 12px` padding, 4px icon gap, 32px row.
- Unselected: neutral gray (`rgb(163,163,163)`), weight 400.
- Selected: near-white (`rgb(250,250,250)`), weight 600.
- Indicator: 2px bar (`astryx-tab-indicator`) sitting on the rail at `bottom: -1px`.
- Optional leading icon + trailing count badge ("Inbox 3").

Mapped to DT: unselected `--secondary-text-color` weight 500 → selected
`--color-primary` weight 600; indicator/rail from `--color-primary` /
`--color-border`; Satoshi via `--font-text`.

## Decisions (approved)

- **Variants:** keep all three (`default`, `pills`, `underline`), restyled.
- **Item API:** add optional `icon` + `count`.
- **Indicator:** animated slide, disabled under `prefers-reduced-motion`.
- **Pills thumb:** raised white surface (not primary fill).
- **API shape:** keep the array `tabs={[]}` API (no `Tab`/`TabList` split).
- **Out of scope:** TabMenu overflow dropdown (future).

## Architecture

### Shared sliding indicator
A single absolutely-positioned `.indicator` element per tablist. Its `left` /
`width` are measured from the selected tab via refs + `ResizeObserver`, and
re-measured on `activeTab` change and web-font load. One mechanism, reshaped per
variant:

- **underline** → 2px bar on the bottom rail, `--color-primary`.
- **pills** → full-height raised thumb (`--color-white` + subtle shadow) on a
  `--color-light-bg` track.
- **default** → full-height filled segment (`--color-primary`) inside an
  enclosed bordered container.

Transition tokenized; **removed under `prefers-reduced-motion`** (snaps).
Measurement runs client-side only; SSR renders with the indicator hidden until
the first measure (no layout jump because it fades/uses opacity gating).

### Variants
- **underline:** faint 1px `--color-border` rail; muted labels; selected
  `--color-primary` weight 600 + sliding 2px indicator; hover brightens label.
- **pills:** `--color-light-bg` track, `--radius-lg`, `4px` padding; raised
  white thumb slides behind the selected label; selected label `--color-primary`.
- **default (enclosed):** `inline-flex` + `fit-content` so the 1px
  `--color-border` container **hugs the tabs** (fixes today's full-width border
  bug); `--radius-lg`, `overflow: hidden`; 1px dividers between tabs; sliding
  primary thumb; selected label `--color-white`.

### Tab item
```ts
interface TabItem {
  key: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode | string; // leading, rendered via @dt/Icon (decorative)
  count?: number;                  // trailing count pill
}
```
Row layout: `[icon] label [count]`, gap scales with size. Count pill: reuse
`@dt/Badge` if its API fits a compact numeric pill; otherwise a local `.count`
span in primary tint (muted-tint unselected, primary/white on filled thumb).

### Sizes
`sm` / `md` / `lg` scale padding-block/inline, label font-size, icon size, and
count size. Targets ≈ `28 / 32 / 36`px rows.

### A11y / states (unchanged contract)
- `role="tablist"` / `role="tab"`, `aria-selected`, `aria-controls`, roving
  `tabIndex`, ArrowLeft/Right/Home/End + Enter/Space.
- `:focus-visible` 2px `--color-primary` ring, offset 2px.
- `:active` `scale(0.97)` (dropped under reduced-motion).
- `forced-colors` block: selected stays distinguishable (Highlight / CanvasText).
- Leading icon and count are decorative/`aria-hidden` where they would otherwise
  pollute the tab's accessible name (label remains the name).

## Deliverables
- `Tabs.tsx` — icon/count rendering, indicator refs + measurement.
- `Tabs.module.css` — full rewrite (three variants + shared indicator).
- `Tabs.stories.tsx` — variants, sizes, icon+count, disabled, playground,
  ForcedColors; DT theming.
- `Tabs.test.tsx` — keep keyboard/selection coverage; add icon/count render +
  indicator-present assertions.
- `Tabs.contract.json` + `schema.json` — document `icon` / `count`.
- `__a11y-snapshots__` — regenerated (4-mode).
- `Tabs.spec.md` — refreshed.

## Verification
- Storybook screenshots before/after per variant + size, light/dark.
- `axe` clean (a11y test: error), keyboard nav, reduced-motion, forced-colors.
- `npm run typecheck && lint && test` for the component; contract/consumer gates.
