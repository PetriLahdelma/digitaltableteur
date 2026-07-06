# ArticleShareSection

## Intent
End-of-article share section: X, LinkedIn and Facebook share links plus a copy-link button, under an optional heading.

## Interaction contract
- Keyboard: Tab reaches each share link and the copy-link button; Enter/Space activates them
- Pointer: social links open the platform share dialog in a new tab; the copy button writes the URL to the clipboard
- Screen readers: every icon-only control has an aria-label; icons are aria-hidden; the copy button's label switches to "Link copied!" on success

## Do / don't
- Do: pass the article `url` and `title`; choose `layout` (horizontal | vertical)
- Do: hide the heading with `showTitle={false}` for compact rails
- Don't: invent parallel primitives inside this folder
- Don't: use for arbitrary pages — this is the blog article template slot

## Design notes
- Tokens: Tailwind utilities mapped to theme tokens; the copied confirmation uses green-800 ink for AA
- Figma: https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1043-110
