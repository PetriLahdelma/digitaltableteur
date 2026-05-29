# Badge

## Intent
Carry a compact piece of status or category meaning. Badge is the
typographic atom for "one short label, possibly with a state colour, and
sometimes removable." The contract is the visual treatment plus the
optional live-region semantics for dynamic content.

## Interaction contract
- Keyboard: none on the badge itself; the embedded remove button when
  `removable` is a real Button (Enter / Space activate it).
- Pointer: hover on the remove button shows the focus style; click
  dismisses and calls `onRemove`.
- Screen readers: silent by default. With `role="status"` the badge
  becomes a polite live region and announces text changes.

## Do / don't
- Do: pick `design="primary"` for filled, emphasis-bearing tags (status,
  errors) and `"secondary"` for tonal tags (categories, filters).
- Do: pass `role="status"` only when the badge content actually changes
  at runtime. Static tags don't need a live region.
- Don't: rely on colour alone to convey state — pair with the icon (the
  component resolves an icon automatically when `state` is set) or include
  the state word in the badge text.
- Don't: nest a Button inside a Badge. The removable affordance is
  already a Button — multiple interactive children produce ambiguous
  focus and SR behaviour.

## Design notes
- Tokens: state colours come from the `--color-state-*` token family
  (success, info, warning, error); neutral falls back to `--color-text`
  contrast pairs. Border radius is `--radius-md` for default, `--radius-md`
  with `--radius-sm` when `square` is set.
- Figma: https://www.figma.com/design/digitaltableteur/badge — keep state
  naming aligned with the Figma variant set; the auto-resolved icon map
  in `STATUS_ICON_NAMES` is the source of truth in code.
- Translation: the remove button label is `t("badgeRemove")`, ensuring
  EN/FI/SV coverage across the locales bundled with the app.
