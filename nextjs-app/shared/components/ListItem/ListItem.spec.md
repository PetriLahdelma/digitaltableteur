# ListItem

## Intent
Presentational row primitive for menus, selects, comboboxes, command
palettes, and generic lists. ListItem renders the visual anatomy — a leading
icon, a truncating label, end-aligned meta, a trailing icon, and a selection
check — and nothing else. It never owns role, focus, or events; the consumer
supplies the interactive wrapper (a Radix `Item`, a native `li`/`option`, or
a `button`) around it.

## Interaction contract
- Keyboard: none. ListItem has no keyboard behavior of its own; the
  interactive wrapper handles focus and key events (arrow navigation,
  Enter/Space activation).
- Pointer: none. Hover/press/highlight are pure CSS treatments
  (`:hover`, `:active`, `.highlighted`, `[data-highlighted]`); ListItem
  attaches no pointer handlers.
- Screen readers: `meta` is exposed to assistive tech (no `aria-hidden`) —
  it frequently carries information the user needs (a keyboard shortcut, a
  status, a value). `icon`, `trailingIcon`, and the `selected` check are
  `aria-hidden="true"`: they are decorative restatements of state the
  wrapper already conveys (or should convey) via `aria-selected` /
  `aria-checked`. `selected` and `highlighted` are visual-only props; they do
  not set any ARIA attribute themselves.

## Do / don't
- Do: wrap ListItem in the element that owns interaction (Radix
  `Item`/`MenuItem`, a native `li`/`option`, or a `button`) and let that
  element carry `role`, `tabIndex`, and handlers.
- Do: use `meta` for content the user needs (a `Kbd` shortcut, a
  `StatusDot`, a value) and reserve `trailingIcon` for purely decorative
  glyphs like a chevron.
- Do: pair `disabled` with `aria-disabled` on the wrapper — the token swap
  is visual only and does not announce anything by itself.
- Don't: add `role`, `tabIndex`, or `onClick` directly to ListItem — that
  duplicates (and can conflict with) the wrapper's semantics.
- Don't: treat `selected`/`highlighted` as a substitute for real ARIA state
  on the wrapper (`aria-selected`, `aria-checked`, `data-highlighted`).

## Design notes
- Tokens: `--color-dark`, `--color-neutral-bg`, `--color-primary`,
  `--color-muted`, `--color-error`, `--color-error-text`,
  `--color-disabled-placeholder`, `--space-internal-4/8/12`, `--radius-md`,
  `--font-text`, `--font-size-text-s/xs`, `--line-height-normal`.
- `tone="destructive"` swaps text/icon color to `--color-error` and tints the
  hover/highlight background with it; on that tinted surface the label deepens
  to `--color-error-text` so it stays AA (the base error red is only ~3.9:1
  there). Disabled uses the canonical `--color-disabled-placeholder` token,
  never opacity.
- Hover, active, and parent-driven highlight (`.highlighted` or a wrapping
  `[data-highlighted]`, as Radix menus set) share one visual treatment, so
  ListItem looks correct whether the highlight comes from its own state prop
  or from an ancestor.
- `icon` and `trailingIcon` glyphs are clamped to a fixed size (1rem / 0.875rem)
  so labels column-align across rows with and without an icon.
- Forced colors: the row text maps to `CanvasText`; disabled maps to
  `GrayText`; the highlighted state maps to `Highlight`/`HighlightText`
  including its icon/meta/trailingIcon children.
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-list-item
