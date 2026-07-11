# TableOfContents

## Intent

Render an in-article navigation list for h2/h3 headings so readers can scan and
jump between sections without leaving the article context.

## Interaction contract

- Keyboard: Tab reaches the mobile disclosure trigger and every heading button.
- Pointer: The trigger expands/collapses the mobile list; heading buttons jump to
  the matching section.
- Screen readers: The root is a `nav` landmark labelled "Table of Contents";
  the active heading exposes `aria-current="location"`.

## API

| Prop | Type | Notes |
| --- | --- | --- |
| `items` | `TOCItem[]` | Ordered h2/h3 headings. |
| `activeId` | `string | null` | Heading id currently in view. |
| `sticky` | `boolean` | Enables tablet-and-up sticky positioning. |
| `onItemClick` | `(id: string) => void` | Parent-owned scroll handler. |
| `className` | `string` | Optional root classes. |

## Do / don't

- Do: Pair with `useTableOfContents` in article templates.
- Do: Keep item text identical to the rendered heading text.
- Don't: Use for primary site navigation.
- Don't: Pass arbitrary nesting levels without expanding `TOCItem`.

## Design notes

- Uses existing article typography and Tailwind token utilities.
- Figma: not linked yet; keep the contract alpha until forced-colors and AT
  verification are captured.
