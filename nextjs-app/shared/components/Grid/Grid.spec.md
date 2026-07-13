# Grid

## Intent

Use **Grid** for two-dimensional layouts whose rows and columns both matter.
Numeric columns create equal tracks; template strings describe asymmetric
tracks. Use Stack or FlexBox for single-axis flow.

## Interaction contract

- Grid adds no interaction or ARIA semantics of its own.
- DOM order remains the keyboard and screen-reader order; do not use visual
  placement to imply a different reading order.

## Responsive contract

- `columns` and `gap` are the base values. Add `tabletColumns`/`tabletGap`,
  `desktopColumns`/`desktopGap`, `wideColumns`/`wideGap`, and
  `ultraColumns`/`ultraGap` at 768/1024/1440/1920px.
- Omitted values inherit through the previous rung, so set only the points
  where the layout changes.
- Numeric responsive columns render as `repeat(n, minmax(0, 1fr))`; template
  strings pass through unchanged.
- With no responsive props, Grid preserves the scalar inline API and numeric
  `repeat(n, 1fr)` output used before the responsive props were added.

## Do / don't

- Do: Use responsive props on Grid instead of creating page-specific grid wrappers or duplicating token breakpoints in consumer stylesheets.
- Do: Wrap only spanning children in `Grid.Item` with `span` or `rowSpan`.
- Don't: Replace the flat responsive props with object syntax; the flat API is the published compatibility boundary.
- Don't: Size grid cells with child widths or use Grid for a one-dimensional sequence.

## Design notes

- Breakpoints mirror the layout tokens in `variables.css`; media queries repeat
  their fixed values because CSS custom properties cannot be used in queries.
- Prefer spacing tokens in gap strings.
- Figma: Linked from the component contract `figma` URL.
