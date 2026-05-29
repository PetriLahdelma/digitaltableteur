# IconButton

## Intent
Stand-alone icon button for compact action surfaces (table rows, card corners, toolbars). Enforces an accessible label so the affordance is not silent to assistive tech.

## Interaction contract
- Keyboard: Tab to focus; Enter or Space to activate.
- Pointer: Click activates the underlying button.
- Screen readers: Announced as '{label}, button'. The icon is decorative; the label is the announcement.

## Do / don't
- Do: Pass a real, action-shaped `label` ('Close', 'Edit row', 'Save draft') — not the icon name.
- Do: Use the `ghost` variant by default; reserve `default`/`outline` for emphasis.
- Don't: Omit `label` — there is no fallback announcement.
- Don't: Use for primary marketing CTAs — text + icon is more discoverable; use `Button` with an icon prop.

## Design notes
- Colors: --color-text, --color-surface-elevated
- Spacing: --space-internal-8, --space-internal-12
- Radii: --radius-full
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
