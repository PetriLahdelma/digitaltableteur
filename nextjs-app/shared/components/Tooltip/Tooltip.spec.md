# Tooltip

## Intent
Supplementary hints for focusable controls — most often icon-only
buttons that keep their own accessible name while the tooltip carries
the visible phrase. Composed Radix primitive set: `TooltipProvider`
(shared open delay) > `Tooltip` (open state) > `TooltipTrigger asChild`
around the real control + portaled `TooltipContent`.

## Interaction contract
- Keyboard: opens on focus of the trigger (no pointer needed); `Escape`
  dismisses without moving focus. The trigger stays in the normal tab
  sequence; the content is never focusable.
- Pointer: opens on hover after the provider's `delayDuration`
  (default 200ms); closes on leave.
- Screen readers: Radix links the content to the trigger via
  `aria-describedby` — the tooltip describes, it never names. The
  trigger must carry its own accessible name (e.g. IconButton `label`).

## Do / don't
- Do: wrap the real Button/IconButton with `asChild` so it receives the
  tooltip wiring directly.
- Do: share one `TooltipProvider` per surface so adjacent hints open
  instantly once one is shown.
- Don't: put links, buttons, or any interactive content inside the
  bubble — unreachable by keyboard and touch.
- Don't: attach tooltips to non-focusable elements; hover-only hints
  exclude keyboard and touch users.
- Don't: promote to stable without production consumer evidence.

## Design notes
- Tokens: bubble surface/text and radius come from `variables.css` via
  Tooltip.module.css; fade/scale enter animation drops under
  `prefers-reduced-motion`.
- `side` sets preferred placement (top default); Radix flips it when
  out of room. `sideOffset` tunes the gap (4px default).
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-tooltip
