# ToastStack

## Intent
Keep concurrent transient messages visible together instead of letting the
newest replace the rest. The motivating case: switching UI language on an
English-only article fires both "language changed" and the content-language
notice — with a single Toast slot the confirmation was never seen. ToastStack
owns the fixed docking that a lone Toast handles itself and lays the toasts
out with the newest nearest the docked edge.

## Interaction contract
- Keyboard: the stack never captures focus; individual toasts follow the
  Toast contract (no dismiss button, timer-driven).
- Pointer: the wrapper is `pointer-events: none` so it never blocks the page;
  children restore `pointer-events: auto`.
- Screen readers: each toast keeps its own live region (`status` or `alert`
  per tone), so concurrent messages announce independently — the reason the
  stack renders multiple Toast instances rather than swapping one message.
- Overflow: at most `max` (default 5) toasts render; older ones wait
  unrendered, and because a Toast's timer only runs while rendered, bursts
  drain oldest-first instead of being dropped.

## Do / don't
- Do: drive it from the app `ToastProvider` — `showToast` appends and the
  provider renders one stack per active position.
- Do: give every toast a stable `id`; dismissal and list identity depend on it.
- Don't: mount more than one ToastStack at the same position; their fixed
  wrappers would overlap. Group by position instead.
- Don't: use it for persistent or compliance-critical messaging — toasts
  auto-dismiss (AlertBanner or Modal own those cases).

## Design notes
- The stack owns fixed placement; toasts render with the `inline` prop so
  their own position classes never fight the wrapper. Bottom docks use
  `column-reverse` so appending keeps the newest toast nearest the edge.
- Spacing uses `--space-internal-8` between toasts and the same
  `--space-layout-24` screen-edge offset a lone Toast uses, so a single-item
  stack is visually identical to a bare Toast.
- No entry/exit animation beyond Toast's own opacity/translate transition;
  reduced-motion inherits Toast's handling.

## Status
Alpha. Not yet a `@digitaltableteur/react` export; the app imports it via
`@dt/ToastStack` (allowlisted in the registry-resolution guard) until it is
promoted onto the published surface.
