# AnimatedDialog

## Intent
Stand-alone modal with an animated entrance distinct from `Modal`. Used for moments where the motion itself is the design — confirmations, milestone celebrations, severity-coloured prompts.

## Interaction contract
- Keyboard: Tab cycles inside the dialog. Esc dismisses. Focus is trapped until close.
- Pointer: Click outside or on the close button to dismiss (unless `dismissible=false`).
- Screen readers: On open: 'dialog, {title}'. On close: focus returns to the trigger. Severity colour is not announced — semantics come from the title text.

## Do / don't
- Do: Use `severity` for confirmations where the colour is part of the meaning (delete = error, save = success).
- Do: Honour `prefers-reduced-motion` — the component already detects it and skips the animation; do not override.
- Don't: Animate every modal — reserve `AnimatedDialog` for moments where the animation reads as deliberate.
- Don't: Stack two open dialogs — focus management collapses; close the first before opening the second.

## Design notes
- Colors: --color-text, --color-surface-elevated, --color-accent, --color-warning, --color-error, --color-success
- Spacing: --space-internal-12, --space-internal-16
- Radii: --radius-md
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
