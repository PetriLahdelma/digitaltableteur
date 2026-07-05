# Card header/footer slots — design

**Date:** 2026-07-05
**Component:** `nextjs-app/shared/components/Card` (stable, rebuilt in #831)
**Status:** approved (brainstorming), ready for implementation plan

## Goal

Extend the stable Card to support the pictured "action card": a title, a badge,
a contextual (overflow) menu, body text, a special/**destructive** action, and
1–2 action buttons on the right. Do it with **four symmetric, generic, optional
slots** without breaking the existing minimal API or its philosophy — *Card is
the surface; consumers supply styled primitives (Badge / Menu / Button)*.

Reference mock: header `[ Card title | Badge  ⋮ ]`, body copy, footer
`[ Destructive .......... No  Yes ]`.

## Approach

Additive, all-optional props on the existing stable component. Card supplies
*positions*; consumers compose the styled primitives. Nothing existing changes;
the three current consumers (Pseo pages) are untouched and their AT snapshots do
not move.

Header and footer become symmetric two-region rows:

```
[ headerStart …………… headerEnd ]      ← header
[ footerStart …………… footerEnd ]      ← footer
```

Each region is a generic `ReactNode` slot that can hold several things (e.g.
`headerEnd = <><Badge/><Menu/></>`, `footerEnd = <><Button>No</Button><Button>Yes</Button></>`).

## API additions (`CardProps`) — all optional, all `React.ReactNode`

| Prop | Region | Notes |
|------|--------|-------|
| `headerStart` | header, leading | Defaults to the built-in `title` heading block when omitted. When provided, it **replaces** the auto title block (consumer renders their own leading content, and owns the heading for the outline). |
| `headerEnd` | header, trailing | Badge / metadata / menu, right-aligned. Canonical replacement for `extra`. Precedence: `headerEnd ?? extra`. |
| `footerStart` | footer, leading | The special/destructive action, pinned left. |
| `footerEnd` | footer, trailing | The 1–2 action buttons, pinned right. |

### Unchanged / legacy

- `title` / `titleProps` — render the semantic heading into the header-start
  region **when `headerStart` is not provided**. Common path stays
  `title="Card title"`.
- `description` / `descriptionProps` — its own row below the header (unchanged).
- `extra` — **soft-deprecated** (`@deprecated` JSDoc) alias that feeds the
  header-end region (`headerEnd ?? extra`). Kept working for the live consumers;
  docs point to `headerEnd`.
- `variant` / `padding` / `as` / `link` / `linkLabel` / `loading` / `children` —
  unchanged.

## Layout

**Header** renders when any of `headerStart | title | headerEnd | extra` is set:

- `.header`: flex row, `justify-content: space-between`, `align-items: center`
  (matches the mock, single-line title). `gap` from the space scale.
- `.headerStart`: `flex: 1; min-width: 0` — the title block or custom content.
- `.headerEnd`: `flex-shrink: 0`, inner flex row with a small `gap`,
  `align-items: center` — badge + menu hug the right.

**Footer** renders when `footerStart || footerEnd`:

- `.footer`: flex row, `flex-wrap: wrap`, `gap`, `margin-block-start` = a space
  token so it clears the body. **No divider** (matches the mock).
- `.footerStart`: inner flex row (`gap`), sits left.
- `.footerEnd`: inner flex row (`gap`), `margin-inline-start: auto` so it hugs
  the right edge **even when `footerStart` is absent** (buttons-only → right;
  destructive-only → left). Wraps below on narrow cards, each side staying
  grouped.

## Behavior & constraints

- **Backward compatible:** every new prop is optional; existing stories render
  byte-identically (none use the new props), so their AT snapshots don't move.
- **`link` × action-footer are mutually exclusive.** A stretched anchor cannot
  wrap interactive buttons (already a `forbiddenUse`; nested interactives under
  an `<a>` is an a11y trap). Rule: if `link` is set **and** (`footerStart ||
  footerEnd`) is present, Card **suppresses the stretched anchor** and
  `console.warn`s in dev. Documented in `forbiddenUse`, plus a note that
  interactive header content (a menu) must not be combined with `link` either
  (consumer responsibility — we can't introspect a `ReactNode`).
- **No motion** added by Card; reduced-motion unaffected.

## Accessibility

- Card itself stays non-focusable and role-less (unchanged). Header/footer are
  layout `<div>`s with no roles.
- The menu trigger and the buttons carry their own semantics. The `ActionCard`
  story shows the Menu trigger with a real accessible name ("More options").
- Heading outline: `title` still renders a real heading; when a consumer uses
  `headerStart` custom content they own the heading — documented in
  `bestPractices` ("keep a heading in `headerStart`").
- Forced-colors: rows are layout-only; the card border stays; badge / menu /
  buttons own their own HCM treatment.

## Implementation surface

- **`Card.tsx`**: add the four slot props; compute `resolvedHeaderStart =
  headerStart ?? titleBlock`, `resolvedHeaderEnd = headerEnd ?? extra`;
  `hasHeader = Boolean(resolvedHeaderStart || resolvedHeaderEnd)`;
  `hasFooter = Boolean(footerStart || footerEnd)`; link-vs-footer guard with dev
  `console.warn`. `@deprecated` JSDoc on `extra`.
- **`Card.module.css`**: `.headerStart`, `.headerEnd` (generalise the current
  `.header`/`.extra`), `.footer`, `.footerStart`, `.footerEnd`; gap + footer
  top-margin tokens.
- **`Card.contract.json`**: add the four props; `slots` → `["headerStart",
  "headerEnd", "footerStart", "footerEnd", "extra"]`; update `anatomy` (header
  start/end regions, new Footer row) and `usage` (footer for actions;
  destructive left / actions right; link ⊥ action-footer; keep a heading in
  `headerStart`). Card **stays stable** — additive change, re-verified.
- **`Card.stories.tsx`**: new **`ActionCard`** story reproducing the mock
  exactly (title, `Badge tone="info"` + info icon, `Menu` three-dot,
  description, `footerStart` = `Button variant="primary" tone="error"` with an X
  icon "Destructive", `footerEnd` = `Button variant="secondary"` "No" +
  `Button` "Yes"). Controls kept 100% via mapped presets for the new
  composite slots.
- **`Card.test.tsx`**: headerStart default (title) vs override; `headerEnd`
  renders and `extra` alias still feeds the region; `footerStart`/`footerEnd`
  render with `footerEnd` right-aligned; `link` suppressed + warns when a footer
  slot is present; axe on the composed action card.
- **Verification (stable gate):** `validate:components`, `check:contract-props`,
  `check:consumers`, `audit:controls --only Card --effects` (100% / 0 inert),
  bootstrap AT snapshots for the new story + 4-mode compare-clean, light/dark/
  forced-colors screenshot of `ActionCard`, then typecheck / lint / lint:css /
  vitest / build.

## Out of scope (YAGNI)

- A footer divider prop (compose a `Divider` in `children` if ever needed).
- Media / cover / tabs (deleted in #831, stay deleted).
- A baked-in "destructive" concept — destructive is just a `Button tone="error"`
  the consumer passes; Card provides the position, not the styling.
- A dedicated `menu` corner slot — folded into `headerEnd` per the approved
  two-region-header decision.
