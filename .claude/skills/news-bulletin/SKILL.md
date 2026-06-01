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

Figma reference: [DT-Site-stuff node 310:899](https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=310-899&m=dev)

## Item shape

```ts
{
  id: "go-24",
  badge: {
    src: "/images/news-bulletin/go-24.svg",
    alt: "Grand One 2024",
    width: 88,
    height: 56,
  },
  body: "K-Ruoka app, Best use of data, 2024",
  link: { kind: "external", href: "https://…" }
  // kind: "internal" | "external" | "static"
}
```

Badge assets live under `public/images/news-bulletin/`. Export updated marks from Figma when art changes.

## Commands (user intent → action)

| User says | You do |
|-----------|--------|
| "List bulletins" / "what's on the bulletin" | Read data file; summarize id, badge alt, body, link kind |
| "Replace bulletin **go-24** with …" | Find by `id`, update fields; keep array length 3 |
| "New bulletin about X" (no id) | Ask which slot to replace **or** replace the oldest / first id; never exceed 3 items |
| "Make **go-22** a link to /work/foo" | Set `link: { kind: "internal", href: "/work/foo" }` |
| "Make **go-22** static text only" | Set `link: { kind: "static" }` |
| "Remove **go-23**" | **Do not** delete — replace that slot with new content (count must stay 3) |

## After editing

1. Run `npm run typecheck`
2. Run `npm test -- --run nextjs-app/shared/data/news-bulletin.test.ts nextjs-app/shared/patterns/NewsBulletin/NewsBulletin.test.tsx`
3. Visually check homepage above footer against Figma 310:899

## Do not

- Add a fourth slot
- Store bulletin copy only in translation JSON without updating `news-bulletin.ts`
- Use text-only badges — always `badge.src` + `badge.alt` per Figma
