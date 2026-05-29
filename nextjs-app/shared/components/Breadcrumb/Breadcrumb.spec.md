# Breadcrumb

## Intent
Show the user a clickable path back to parents of the current page so
deep-link arrivals (search results, shares) can orient themselves
without using the browser back button or rebuilding the URL by hand.
The trail is the lightest navigation primitive in the system —
deliberately quiet visually so it doesn't compete with the page title.

## Interaction contract
- Keyboard: Tab moves through links in DOM order. The trailing
  current-page item is not focusable.
- Pointer: clicking any non-current item navigates to its `href`. The
  current item is not clickable.
- Screen readers: the wrapper is announced as "Breadcrumb, navigation"
  (label is translated per locale). The ordered list announces its
  size, then each link in sequence. The current item is announced as
  plain text.

## Do / don't
- Do: keep the last item label short. It mirrors the page title and
  appears in the AT linear reading order before the `<h1>`.
- Do: pass an i18n'd `aria-label` per locale. The default English
  literal is a development convenience.
- Don't: include the home icon as a separate item. Use `label: 'Home'`
  with `href: '/'` so the AT user hears a word, not a glyph.
- Don't: skip levels to make the trail shorter. If the user is at
  `/work/acme`, the parent must be `/work`, not `/`.
- Don't: render the breadcrumb above a hero — it gets lost. Place it
  immediately above the page title so it forms a single "where am I"
  block.

## Design notes
- Tokens: each link uses `--font-size-text-s`, inline padding
  `--space-internal-8`, and `--color-text-muted`. The current item uses
  `--color-text` for slightly higher emphasis without a link affordance.
- Figma: https://www.figma.com/design/digitaltableteur/breadcrumb —
  single variant; separator is a literal slash.
- The separator is rendered as `<span aria-hidden>/`; no visual
  alternative is supported (no chevron variant) until a real consumer
  needs one.
- Empty `items` returns `null` — this is intentional so the consumer
  can call `<Breadcrumb items={derivedTrail} />` without an explicit
  length check.
