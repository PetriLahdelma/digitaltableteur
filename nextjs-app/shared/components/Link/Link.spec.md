# Link

## Intent
Render an inline navigation anchor with a sanitised `href`, an automatic
external-link affordance, a visible focus ring, and token-driven colour. Link's
contract is "navigate safely, with the right screen-reader context, and survive
theme and forced-colors changes."

## Interaction contract
- Keyboard: Enter activates (native anchor). Tab follows DOM order; the focus
  ring is `focus-visible` only.
- Pointer: click navigates; colour transitions on hover and the shared wavy
  underline reveals.
- Screen readers: native anchor semantics. External destinations render a
  trailing icon labelled "External link"; pass `target="_blank"` to open a new
  tab, and the component then auto-adds `rel="noopener noreferrer"`.

## Do / don't
- Do: rely on the component's URL sanitisation; it rewrites unsafe protocols to
  `#`. Don't pre-sanitise.
- Do: pass `target="_blank"` only when leaving the site; `rel` is added
  automatically.
- Don't: use Link for actions. Buttons are for actions; anchors are for
  navigation.
- Don't: override the underline via inline styles; the token-driven treatment
  owns it.

## Design notes
- Colour: `--link-color`, with a `color` transition on `--duration-fast` /
  `--ease-out-cubic`; the underline is the shared `wavyUnderline` utility.
- Focus: tokenized `focus-visible` ring (`--focus-ring-*`) with a 2px offset.
- Size: `sm | md | lg` set the font-size and icon gap; the external icon scales
  with the link size.
- Security: the allowed-protocol list (`http`, `https`, `mailto`, `tel`) is
  deliberately narrow; adding one requires a security review.
