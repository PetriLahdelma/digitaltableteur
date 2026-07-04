# Card

## Intent
A quiet, bordered surface for discrete, self-contained content — modeled on
Astryx's Card: the container owns background, hairline border, radius, and
padding, and *nothing else*. Structure (headers, dividers, footers, media)
comes from composition with Title, Text, Divider, Stack, and FlexBox rather
than from props. A thin content layer (`title`, `description`, `extra`,
`link`, `loading`) covers the production patterns without reintroducing the
old prop zoo (cover/tabs/actions/badges/status messages were used by zero
consumers and are gone).

## Interaction contract
- Keyboard: a plain card is not focusable. `link` mode renders one anchor
  (named by `linkLabel ?? title`) stretched across the surface; Enter
  follows it and the focus ring draws around the card frame.
- Pointer: `link` mode darkens the hairline on hover as the affordance;
  plain cards have no hover state.
- Screen readers: `title` is a real heading (level via `titleProps.level`,
  default 3). A linked card announces "link" once — the stretched anchor is
  the only interactive element the card itself contributes. The loading
  state announces via `role="status"` + `aria-busy="true"` and renders
  skeleton lines.

## Do / don't
- Do: compose structure — `<Card>` + Title/Text children, `<Divider>` when
  a section split carries meaning, a `<FlexBox justify="space-between">`
  row as a footer.
- Do: pass `linkLabel` on linked cards whose `title` is ambiguous out of
  context ("Read more" is the failure mode).
- Do: use `titleProps.level` to keep the document outline correct (grids of
  cards under a section heading typically use level 3).
- Do: keep padding consistent across sibling cards in a grid; pick one
  `padding` step per surface.
- Don't: nest interactive controls inside a `link`-mode card — use a plain
  card with a single Button instead.
- Don't: default to cards for visual grouping; headings and Stack rhythm
  group content without the visual weight (Astryx guidance, adopted).
- Don't: nest cards in cards.

## Design notes
- Tokens: `--color-surface` (default bg), `--color-light-bg` (muted),
  `--color-border-light` (hairline; darkens to `--color-border` on link
  hover), radius from the component-level `--card-radius` (12px), padding
  steps from the internal space scale (12/16/24px).
- All variants keep a transparent 1px border so switching variants never
  causes layout jitter (Astryx trick).
- The title renders at Title `xxs` — cards are surfaces, not pages; weight
  carries the hierarchy, not size.
- Dark/high-contrast themes come free through the tokens; forced-colors
  keeps the physical border.
- The `link` mode resets link text decoration inside the card (no site
  squiggle across the frame) and never injects `target="_blank"`.

## Status
stable — API simplified 2026-07-04 (Astryx-shaped clean break; consumers
migrated in the same PR: Pseo pages, SentrySummaryCard, ComplianceCard).
