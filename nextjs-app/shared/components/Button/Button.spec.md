# Button

## Intent
Provide the canonical "act" or "navigate-as-action" affordance for the site.
Button is the primary control consumers reach for when they want a user to do
something — submit a form, open a flow, head somewhere intentional. The
visual hierarchy (primary / secondary / tertiary) and the semantic severity
modes (error / warning / success / info) encode importance without forcing
the consumer to author parallel components.

## Interaction contract
- Keyboard: Enter and Space activate; tab order follows DOM order. The
  component never traps or rebinds keys.
- Pointer: hover and active states have explicit visual feedback per
  variant; loading state suppresses click handlers and surfaces a pulse.
- Screen readers: accessible name resolves from `accessibleName`,
  `accessibleNameRef`, or visible `children`; `aria-busy` is announced
  while loading; `aria-disabled` is announced in link mode (anchor) when
  disabled. Inverse mode is purely visual and adds no SR semantics.

## Do / don't
- Do: use `submits` (not raw `type="submit"`) for form submission so the
  contract is grep-able across the codebase.
- Do: pass `href` to render the same visual as an anchor when the destination
  is a URL, not a handler.
- Do: provide `accessibleName` on icon-only buttons. The dev-mode warning
  catches missing names locally; production must not ship without one.
- Don't: pair an icon-only button with a tooltip as the *only* accessible
  name on mobile — tooltips don't fire on touch. Use `accessibleName` too.
- Don't: nest a Button inside another interactive control. Buttons are
  terminal — use a parent `Card` with a single primary action instead.
- Don't: use a Button for inline navigation in body copy. Use **Link**.

## Design notes
- Tokens: variants pull from `--color-primary`, `--color-secondary`,
  `--color-warning-text`, `--color-white`, and the matching contrast tokens
  in `variables.css`. Spacing uses `--space-internal-8` (block) and
  `--space-internal-16` (inline). Radius is `--radius-lg` (rounded mode
  bumps to `--radius-pill`).
- Figma: https://www.figma.com/design/digitaltableteur/button — keep
  variant naming aligned with the Figma component set so designer handoff
  is mechanical.
- Inverse mode samples the nearest non-transparent ancestor background at
  mount and sets `--dt-button-inverse-fg` inline. This works for arbitrary
  nesting depth and updates on resize, scroll, and DOM mutations on the
  ancestor chain.
- Size normalisation: `s` / `m` / `l` legacy values map to `sm` / `md` /
  `lg` so older consumers continue to compile. New code should use the
  modern names.
