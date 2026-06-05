# Modal

## Intent
Interrupt the page flow when the user must respond before continuing.
Modal is the only primitive in the system that captures focus, dims
the page, and demands acknowledgement. For anything quieter use Toast
or AlertBanner; for anything bigger (a full task) use a dedicated
route.

## Interaction contract
- Keyboard: Tab cycles focus inside the modal — `inert` on the
  background makes outside elements unreachable. Escape calls
  `onClose`. Enter activates the focused button.
- Pointer: clicking the backdrop (outside the modal surface) calls
  `onClose`. Clicks inside the modal do not propagate to the backdrop.
  The close icon button (when shown) calls `onClose`.
- Screen readers: opening the modal announces the dialog name (from
  `aria-labelledby={title}` or the fallback `aria-label="Dialog"`). The
  role implies announcement — no extra `aria-live` is wired.

## Do / don't
- Do: always pass a `title`. Title-less modals are a bad AT experience;
  the user lands on "Dialog" with no context.
- Do: pass `description` for supporting copy (maps to `aria-describedby`,
  shadcn `DialogDescription` parity). Prefer `description` over a lone
  `<p>` child when the body is a single sentence.
- Do: pick the severity that matches the message. `error` and
  `warning` flip the role to `alertdialog`, which carries an implicit
  assertive announcement.
- Do: render destructive actions with `variant="error"` and pair them
  with a tertiary Cancel. The user should be able to back out without
  thinking.
- Don't: nest a Modal inside another Modal. AT focus order becomes
  ambiguous and the `inert` attribute applies once. If you need a
  second confirmation step, swap content in place inside the existing
  modal.
- Don't: render a Modal lazily (e.g. only mount it when `isOpen`).
  Mount it always; control via `isOpen`. Lazy mounting breaks focus
  restoration because the unmount happens before the focus restore.
- Don't: add `aria-live` to the dialog root. The role implies
  announcement; doubling it causes "dialog dialog" or double message
  reads.

## Design notes
- Tokens: surface uses `--color-surface`; overlay uses
  `var(--color-overlay)` with `--color-overlay-alpha` opacity. Padding
  is `--space-internal-24`; radius is `--radius-lg`. Severity icon
  colour pulls from `--color-<severity>-text`.
- Figma: https://www.figma.com/design/digitaltableteur/modal — four
  severities, two layouts (with / without close icon), three title
  sizes.
- The component is a `createPortal` to `document.body` so backdrop and
  inert handling don't interfere with parent stacking contexts.
- Severity → role mapping is one-way: setting `severity="warning"`
  sets the role; there is no override. The decision is intentional —
  consumers shouldn't pick the role separately from the severity.
- The default OK button is rendered only when `footer` is `undefined`
  and `isLoading` is false. Pass `footer={null}` to suppress the OK
  without supplying alternative actions.

## shadcn Dialog migration

| shadcn | @dt/Modal |
|--------|-----------|
| `open` / `onOpenChange` | `isOpen` / `onClose` — keep modal mounted; toggle `isOpen` |
| `DialogTitle` | `title` |
| `DialogDescription` | `description` (preferred) or `children` |
| `DialogFooter` + actions | `footer` slot with `@dt/Button` |
| `DialogContent severity="error"` | `severity="error"` (`alertdialog` role) |
| `DialogTrigger asChild` | **Defer** — wrap trigger in local state until a composable API ships |
