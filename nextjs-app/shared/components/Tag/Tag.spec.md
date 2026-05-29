# Tag

## Intent
Render a single category, status, or filter label. Visual sibling of `Badge` — `Tag` is the lighter catalog atom used by content surfaces (article meta, filter pills).

## Interaction contract
- Keyboard: Static: none. Removable: dismiss control is a real button — Enter/Space activates, Tab moves to it from the surrounding context.
- Pointer: Click on the dismiss control removes the tag; the body of the tag is non-interactive unless wrapped in a link or button by the caller.
- Screen readers: Static tag announces its text. Removable tag announces 'Remove {label}, button' when the dismiss control is focused.

## Do / don't
- Do: Use for article categories, filter pills, status chips in lists.
- Do: Pair with the matching semantic color when the tag conveys success/warning/error state.
- Don't: Use as a button — `Tag` is metadata, not an action surface. Use `Button` for actions.
- Don't: Stack more than ~6 tags in a row without wrapping — readability collapses; use a `Select` instead.

## Design notes
- Colors: --color-text, --color-surface-elevated, --color-border-light
- Spacing: --space-internal-4, --space-internal-8
- Radii: --radius-sm
- Typography: --font-size-sm
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
