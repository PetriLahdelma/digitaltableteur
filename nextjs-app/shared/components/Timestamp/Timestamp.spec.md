# Timestamp

## Intent
Renders a single date or time value as human-readable text: relative ("2 hours
ago") for recency, absolute ("29 Nov 2025") for precision, or `auto` to show
relative until the value ages past `autoThreshold` and then switch to the full
date. System variants emit ISO-style strings for logs and developer surfaces.
It exists so timestamps read consistently across the site instead of each
surface hand-rolling `Intl` calls.

## Interaction contract
- Keyboard: not interactive; nothing is focusable.
- Pointer: hovering relative output reveals a native tooltip (`title`) with the
  full medium date + short time, so the precise moment stays discoverable.
- Screen readers: renders a semantic `<time>` with a machine-readable
  `dateTime` (ISO 8601) attribute; date-only input stays `YYYY-MM-DD`, while
  instants are canonicalized. Relative and `auto` output derives from
  render-time "now", so `suppressHydrationWarning` absorbs a legitimate
  server/client one-tick difference.

## Do / don't
- Do use `muted` tone for secondary metadata (list rows, card footers) and
  `default` when the value carries body-text weight.
- Do pin `now` in stories and tests for deterministic relative output.
- Do use the `system_*` formats for developer-facing surfaces (logs, dev tools)
  where an unambiguous ISO string matters more than locale formatting.
- Don't wrap it in another `<time>` or add a redundant `title`; it owns both.
- Don't use `live` for values that will not change meaningfully while on screen
  (absolute dates) — it only re-renders relative/auto output.

## Design notes
- Tokens: `--color-text` (default tone) and `--color-muted` (muted tone); the
  size ladder maps 1:1 onto the shared Text type scale so it aligns inline with
  surrounding copy. No spacing tokens — it is a pure inline element.
- Locale: defaults to the active site language (`useLocalization`); pass
  `locale` to override. All formatting goes through `Intl`, so it localizes
  without translation keys.
- Date-only ISO values are parsed as calendar dates rather than UTC instants,
  preventing users west of UTC from seeing the previous day.
- Figma: none — presentation is entirely the type scale + text color roles,
  so there is no dedicated Figma node to mirror.
