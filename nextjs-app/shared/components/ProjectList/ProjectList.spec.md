# ProjectList

## Intent

Get a visitor to a project fast. The card grid sells the work with images;
the list puts every project on one or two screens, scannable by name and
client.

## Layouts

- **Narrow** (under 40rem of the list's own width): thumbnail, title and one
  meta line (client, or discipline when the record names no client, then the
  period), with a trailing arrow.
- **Wide**: aligned columns for project, client, discipline and period under a
  visual column header.
- An optional `tag` (for example the engagement type) sits beside the title
  in both layouts, as a small outlined chip that wraps under a long title.

## Interaction contract

- Keyboard: Tab reaches each row link in order; Enter follows it.
- Screen readers: a named list; one link per row whose name starts with the
  title; the column header is aria-hidden; thumbnails are decorative.
- Touch: :hover styling sits in `@media (hover: hover)`, so one tap opens a row.

## Do / don't

- Do: copy client and period verbatim from the project record.
- Do: keep the same order and filter as the card grid.
- Don't: nest links or buttons inside a row.
- Don't: put more than one tag on a row; the card grid carries the full tag
  set.
- Don't: use it for data the reader sorts; use Table.

## Design notes

- Tokens only; forced colours use Highlight for focus and CanvasText for the
  teaser and tag borders.
- Layout responds to the list's width through a container query.
