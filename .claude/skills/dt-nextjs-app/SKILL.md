---
name: dt-nextjs-app
description: >-
  Builds and fixes Digitaltableteur Next.js 16 App Router pages, layouts, metadata,
  OG images, sitemap, and robots under app/. Use when the user says "add a page",
  "opengraph", "OG image", "generateMetadata", "page.tsx", "layout.tsx", "sitemap",
  "async params", or edits app/ routes. Do NOT use for UI component internals
  (use dt-design-system) or app/api route handlers (use dt-api-routes).
metadata:
  version: 1.1.0
  category: nextjs
---

# Next.js App Router workflow

## Instructions

### Step 1: Load context

Read [`references/area-guide.md`](references/area-guide.md) and [`app/AGENTS.md`](../../app/AGENTS.md).

Keep `page.tsx` thin — import content from `@dt` or `@dt-pages`.

### Step 2: Page checklist

CRITICAL before committing:

- Server component by default; `"use client"` only for hooks/events/browser APIs
- `generateMetadata` or `metadata` export
- OG via colocated `opengraph-image.tsx` — never hardcode `logo512.png` in metadata
- Next.js 16 async params: `const slug = (await params).slug`
- `Image` from `next/image`, not raw `<img>`
- CSS Modules: relative import `./Component.module.css`

### Step 3: OG image (if missing)

Add `app/<route>/opengraph-image.tsx` using `app/lib/og-image-utils.tsx`.

Blog posts: hero image when available; generated card as fallback.

### Step 4: Verify

```bash
npm run dev:next
npm run typecheck && npm run lint && npm test && npm run build:next
```

Visual check:

```bash
npx agent-browser open http://localhost:3000/<route>
npx agent-browser screenshot ./check.png
```

See [`docs/AGENT_BROWSER_GUIDE.md`](../../docs/AGENT_BROWSER_GUIDE.md).

---

## Examples

### Example 1: New static page

User says: "Add a /pricing page"

Actions:

1. Create `app/pricing/page.tsx` (server component)
2. Add `app/pricing/opengraph-image.tsx`
3. Import page content from `@dt-pages` or shared patterns
4. Add EN/FI/SV metadata strings
5. Build + visual screenshot

### Example 2: Fix Slack preview showing old logo

User says: "OG image is wrong for /contact"

Actions:

1. Check page metadata for hardcoded `logo512.png` — remove it
2. Ensure `opengraph-image.tsx` exists colocated with route
3. Rebuild and verify with `curl -I` or social debugger

---

## Troubleshooting

### Hydration mismatch on theme/language

Cause: client-only theme/i18n applied before hydration.

Solution: `suppressHydrationWarning` on root `<html>` in `app/layout.tsx`.

### params.slug is undefined

Cause: Next.js 16 made route params async.

Solution:

```tsx
export default async function Page({ params }: Props) {
  const slug = (await params).slug;
}
```

### React.lazy / react-router-dom errors

Cause: Vite legacy patterns imported in App Router.

Solution: use `next/dynamic` and `next/link` / `next/navigation` only.

---

## Boundaries

- MUST NOT use `React.lazy()`, `<Head>`, or `react-router-dom`
- MUST NOT use `import.meta.env.VITE_*`
