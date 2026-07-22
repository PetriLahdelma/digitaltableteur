# Author

## Intent
Documents how **Author** is used in production layouts and Storybook examples.

Reusable byline atom: every detail is an input. `name` plus optional
`imageUrl` (a URL, an imported asset path, or static image data) render the
avatar byline; `profileUrl` turns it into a link. The byline prefix defaults
to the localized "By" (fi "Kirjoittanut", sv "Av") — parity with the native
`dt-author` element — and `bylinePrefix` overrides it for custom attributions
(e.g. "Reviewed by") or a fixed language.

Author composes the Avatar atom and exposes its behavior rather than
re-implementing it: `size` is Avatar's `AvatarSize` (token sizes `sm`/`md`/
`lg`/`xl` canonical, CSS lengths accepted), `name` is passed through as the
avatar's accessible name, and omitting `imageUrl` yields Avatar's initials
fallback.

## Interaction contract
- Keyboard: See **Playground** / **Example** stories and component tests.
- Pointer: Standard click/tap on interactive affordances.
- Screen readers: Verify labels, roles, and live regions in stories.

## Do / don't
- Do: Match the **Example** story composition on Author pages.
- Don't: Bypass design tokens or skip forced-colors verification at beta.

## Design notes
- Tokens: Uses semantic colors/spacing from `variables.css`.
- Figma: Linked from the component contract `figma` URL.
