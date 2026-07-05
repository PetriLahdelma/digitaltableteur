# Design: Breadcrumb overflow collapse (ellipsis Menu)

**Date:** 2026-07-05
**Status:** validated design, implemented
**Trigger:** long trails run out of horizontal room; the current (last) level must always stay visible. Owner-approved decisions: **automatic width-based collapse by default, with a static prop override**, keeping **as many leading items as fit** plus the current item, collapsing the overflow into an ellipsis dropdown that reuses the shared `Menu` primitive.

## API

```tsx
<Breadcrumb
  items={items}
  underline="always | hover | none"   // (Link contract, #862)
  maxItems={number}                    // static override; 0/unset = auto
  collapseLabel="Show N hidden levels" // a11y name for the ellipsis trigger
/>
```

- **Default (auto):** the trail measures itself against its container and collapses only when it overflows, always showing the current item and as many leading items as fit; the overflowed middle levels move into an ellipsis Menu. Re-measures on resize (`ResizeObserver`), so it re-expands when there is room.
- **Static override:** `maxItems` (a positive number below the item count) collapses deterministically without measuring — the first `maxItems − 2` leading items and the current stay visible. `0`/unset selects the automatic path (also the no-op value the Controls args-enhancer seeds).
- **Ellipsis element:** an `<li>` wrapping a "…" button that triggers the `Menu`; collapsed links render as `MenuItem href` (real `role=menuitem` anchors), linkless levels as disabled items. The glyph flips to a chevron while open (CSS on Radix `[data-state="open"]`).

## Measurement

`computeLeadingCount({ itemWidths, ellipsisWidth, listGap, available })` is a pure function (unit-tested): it returns how many leading items to show before the ellipsis, or `null` to show everything. Widths come from an off-screen, `inert` + `aria-hidden` clone of the full trail rendered only when there are more than three items and no `maxItems`, measured in an isomorphic layout effect + `ResizeObserver`. First paint shows the full trail, then it collapses on the client — standard for responsive breadcrumbs.

## A11y & degradation

The `<nav><ol>` structure stays for visible items; the ellipsis trigger carries an accessible name and Radix's `aria-haspopup`/`aria-expanded`; hidden links stay keyboard-reachable in the menu. Never collapses when everything fits or when there are three or fewer items; degrades to `first / … / current` rather than dropping the current level.

## Testing

- `computeLeadingCount` — pure unit tests (overflow, exact-fit, degenerate, unmeasured).
- Static `maxItems` path — jsdom (deterministic): collapse shape, ellipsis menu opens with the hidden links, custom `collapseLabel`.
- Auto width path — verified in a real browser (Storybook `Responsive` story in a 340px container + a Playwright probe): collapses only on overflow, re-expands when wide.
