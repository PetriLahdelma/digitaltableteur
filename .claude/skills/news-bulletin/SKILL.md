---
name: news-bulletin
description: >-
  Maintain the homepage news bulletin (three topical slots above the footer).
  Use when the user asks to add, replace, remove, or update a bulletin item,
  or says "news bulletin", "bulletin slot", or "top of mind" homepage snippets.
---

# News bulletin skill

## Source of truth

`nextjs-app/shared/data/news-bulletin.ts` — **exactly three** entries in `NEWS_BULLETIN_ITEMS`.

**Always sync copy and badge type from Figma** — never invent GO-award or other placeholder content.

Figma reference: [DT-Site-stuff node 310:899](https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=310-899&m=dev)

| Figma layer | Node | Badge kind | Body (as of design) |
|-------------|------|------------|---------------------|
| First | 310:898 | `percent` (`50%`) | Bandwidth during summertime, 2026 |
| Second | 310:897 | `npm` (`v2.0.0`) | Rhythmguard 2.0 out now |
| Group 20 | 310:896 | `placeholder` | Lorem ipsum dolor isit |

## Item shape

```ts
{
  id: "rhythmguard-2",
  figmaRef: "310:897",
  badge: { kind: "npm", version: "v2.0.0" },
  body: "Rhythmguard 2.0 out now",
  link: {
    kind: "external",
    href: "https://www.npmjs.com/package/stylelint-plugin-rhythmguard",
  },
}
```

### Badge kinds

| `badge.kind` | When to use |
|--------------|-------------|
| `percent` | Lime circle + value (Figma “First”) |
| `npm` | npm-style version pill (Figma “Second”) |
| `placeholder` | Grey 48×48 until final art (Figma “Group 20”) |
| `image` | Exported raster/SVG under `public/images/news-bulletin/` |

## Commands (user intent → action)

| User says | You do |
|-----------|--------|
| "List bulletins" / "what's on the bulletin" | Read data file; summarize id, badge kind, body, link kind |
| "Replace bulletin **rhythmguard-2** with …" | Find by `id`, update fields; keep array length 3 |
| "New bulletin about X" (no id) | Ask which slot to replace **or** replace slot 3 first; never exceed 3 items |
| "Make **bandwidth-summer-2026** link to /blog/foo" | Set `link: { kind: "internal", href: "/blog/foo" }` |
| "Make **bulletin-slot-3** static text only" | Set `link: { kind: "static" }` |
| "Remove **bulletin-slot-3**" | **Do not** delete — replace that slot with new content (count must stay 3) |

## After editing

1. Run `npm run typecheck`
2. Run `npm test -- --run nextjs-app/shared/data/news-bulletin.test.ts nextjs-app/shared/patterns/NewsBulletin/NewsBulletin.test.tsx`
3. Visually check homepage above footer against Figma 310:899 (full viewport width, 24px between cards, 32px badge→copy)

## Do not

- Add a fourth slot
- Store bulletin copy only in translation JSON without updating `news-bulletin.ts`
- Substitute unrelated content (e.g. Grand One awards) when Figma shows different topics
- Assume slots 1–2 are placeholders — they are real content unless the user says otherwise
