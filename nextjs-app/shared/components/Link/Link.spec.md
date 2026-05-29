# Link

## Intent
Render an inline navigation anchor with sanitised `href`, automatic
external-link affordances, and token-driven hover / focus / visited
styling. Link's contract is "navigate safely, with the right SR context,
and survive theme + forced-colors changes."

## Interaction contract
- Keyboard: Enter activates (native anchor behaviour). Tab follows DOM
  order. No custom keys.
- Pointer: click navigates. External destinations open in a new tab when
  `target="_blank"`.
- Screen readers: native anchor semantics. External links append a
  visually-hidden "(opens in a new window)" when `target="_blank"` so SR
  users get the context before the browser switches tabs.

## Do / don't
- Do: rely on the component's URL sanitisation. Don't pre-sanitise — the
  component handles invalid protocols by rewriting to `#`.
- Do: pass `target="_blank"` only when leaving the site. The `rel`
  attribute is added automatically.
- Don't: use Link for actions. Buttons are for actions; anchors are for
  navigation. Mixing them confuses keyboard and SR users.
- Don't: override the underline via inline styles. The token-driven
  `text-decoration` is part of the contract.

## Design notes
- Tokens: link colour and hover follow `--color-link` and
  `--color-link-hover`; visited uses `--color-link-visited`. Forced-
  colors mode uses the system `LinkText` / `VisitedText` keywords.
- Figma: https://www.figma.com/design/digitaltableteur/link — keep the
  external-icon and size tokens aligned with the Figma component variants.
- The sanitisation list (`http`, `https`, `mailto`, `tel`) is deliberately
  narrow. Adding a protocol requires a security review.
