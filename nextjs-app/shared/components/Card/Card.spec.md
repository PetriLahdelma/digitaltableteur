# Card

## Intent
Provide a single, well-tokenised container for grouped content so that
marketing, work, and settings surfaces don't grow one-off card components.
Card absorbs visual variance (variants, sizes, hover/border/loading) and
composition variance (cover / header / body / tabs / actions / footer) so
consumers stop reinventing tiles.

## Interaction contract
- Keyboard: a non-interactive card is not focusable. `interactive` or
  `onClick` makes the card a focusable `role="button"` with Enter / Space
  activation. `link` mode delegates to the anchor — Enter follows.
- Pointer: hover state only activates when `hoverable` is set. Click on
  the whole surface only fires when the card is interactive *or* linked.
- Screen readers: the title carries the heading, the body is read as
  normal prose, and an interactive card announces "button". A linked card
  announces "link" with `linkLabel ?? title` as the accessible name. The
  loading skeleton announces "loading" via `role="status"` +
  `aria-busy="true"`.

## Do / don't
- Do: pass `linkLabel` on linked cards whose `title` is ambiguous out of
  context. "Read more" titles are the failure mode — the AT user lands on
  "link, read more" with no anchor.
- Do: pick exactly one of `link`, `interactive`, or no-op. Mixing them
  produces double-announcement and broken navigation.
- Do: use `titleProps.level` to keep the document outline correct. A grid
  of cards inside a `<section>` typically uses `level=3`; a single hero
  card might use `level=2`.
- Don't: nest interactive controls inside a `link`-mode card. Use a
  non-link card with a single primary Button instead.
- Don't: hide critical state in `extra`. Right-aligned slots are easy to
  miss on narrow viewports — surface state in `statusMessage` so the
  layout has a defined home for it.
- Don't: stretch the variant set to encode marketing themes. Compose
  themes at the surface level; keep Card's variants purely structural.

## Design notes
- Tokens: surfaces pull from `--color-surface`, `--color-surface-muted`,
  and `--color-surface-emphasis`. Borders use `--color-border`. Elevation
  uses `--shadow-sm` (default) / `--shadow-md` (hoverable). Spacing is
  `--space-internal-16` (md), `--space-internal-12` (sm), `--space-internal-24`
  (lg). Radius is `--radius-lg`.
- Figma: https://www.figma.com/design/digitaltableteur/cards — variant
  naming maps 1:1 to the `variant` prop, and size names map sm/md/lg/full.
- Status messages render through a separate semantic role so a noisy
  inline error doesn't get swallowed by the header's heading semantics.
- Tab-in-card uses the same `<Tabs />` primitive (no fork) and forwards
  size: `sm` → `sm`, `md` → `md`, `lg` → `lg`, `full` → `md`.
- The `link` mode never injects `target="_blank"` automatically — consumers
  pass that through props if needed; the safety wiring (`rel="noopener"`)
  lives inside `<Link>` already.
