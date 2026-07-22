# AuthorBio

## Intent
Documents how **AuthorBio** is used in production layouts and Storybook examples.

Reusable biography molecule with two input paths:

- **Direct input** (reusable path): pass `name`, `imageUrl` (URL, imported
  asset path, or static image data), `role`, `bio` (markdown after the first
  paragraph; the first paragraph renders as the lead), and `email`.
- **Registry lookup** (site convenience): pass `slug` to resolve the same
  fields from the site's authors registry. Direct props override registry
  fields per field; empty strings fall back to the registry value.

With no resolvable `name` the component renders nothing — unknown slug and
empty direct input behave identically.

## Interaction contract
- Keyboard: See **Playground** / **Example** stories and component tests.
- Pointer: Standard click/tap on interactive affordances.
- Screen readers: Verify labels, roles, and live regions in stories.

## Do / don't
- Do: Match the **Example** story composition on AuthorBio pages.
- Don't: Bypass design tokens or skip forced-colors verification at beta.

## Design notes
- Tokens: Uses semantic colors/spacing from `variables.css`.
- Figma: Linked from the component contract `figma` URL.
