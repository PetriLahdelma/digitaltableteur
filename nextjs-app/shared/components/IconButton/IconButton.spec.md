# IconButton

## Intent
Stand-alone icon button for compact action surfaces (table rows, card corners, toolbars). Enforces an accessible label so the affordance is not silent to assistive tech. Wraps `@dt/Button` in its rounded icon-only form — css-less by design — so weight, tone, and surface stay in lockstep with Button.

## Interaction contract
- Keyboard: Tab to focus; Enter or Space to activate.
- Pointer: Click activates the underlying button.
- Screen readers: Announced as '{label}, button'. The icon is decorative; the label is the announcement.
- Tooltip: `tooltip` renders a native title for sighted hover reassurance; it never replaces `label` as the accessible name.

## Do / don't
- Do: Pass a real, action-shaped `label` ('Close', 'Edit row', 'Save draft') — not the icon name.
- Do: Stay on the default `tertiary` variant in toolbars and chrome; reserve `primary`/`secondary` for emphasis.
- Don't: Omit `label` — there is no fallback announcement.
- Don't: Use for primary marketing CTAs — text + icon is more discoverable; use `Button` with an icon prop.

## API notes
- 2026-07-03 (Astryx Phase 3 batch 1): variant vocabulary aligned to platinum conventions. `default`/`ghost`/`outline` were replaced by `primary`/`tertiary`/`secondary` (same visuals; the old default `ghost` maps to the new default `tertiary`). `tone`, `surface`, `tooltip`, and string icon names now pass through to Button.

## Design notes
- No own stylesheet: all styling delegates to `Button.module.css` (rounded icon-only form).
- Colors: --color-text, --color-surface-elevated
- Spacing: --space-internal-8, --space-internal-12
- Radii: --radius-full
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-icon-button
- Catalog status: **beta**, API aligned during the Astryx Phase 3 content sweep on 2026-07-03.
