# Next.js App Router - Quick Reference

## Package Identity

**Purpose**: Next.js 16 App Router (production app)  
**Framework**: Next.js 16.2.x with App Router

---

## Setup & Run

```bash
npm run dev            # Dev server at http://localhost:3001
npm run build          # Production build
npm run start          # Start production server
```

---

## Patterns & Conventions

### File Organization

- Pages: `app/*/page.tsx` (server components by default)
- API routes: `app/api/*/route.ts`
- Layouts: `app/layout.tsx` (nested layouts supported)
- Metadata: `generateMetadata()` function or `metadata` export

### Key Patterns

✅ **DO**: Use server components by default

- Example: `app/about/page.tsx` imports `<AboutPageContent />` from `shared/`

✅ **DO**: Add `"use client"` only when using hooks, events, or browser APIs

- Example: `components/ChatWidget/ChatWidget.tsx` uses state → needs `"use client"`

✅ **DO**: Use `generateMetadata` for SEO

- Example: `app/blog/[slug]/page.tsx` exports `generateMetadata()`

✅ **DO**: Use `NEXT_PUBLIC_` prefix for client-side environment variables

- Server: `process.env.OPENAI_API_KEY`
- Client: `process.env.NEXT_PUBLIC_GA_ID`

❌ **DON'T**: Use `<Head>` or `<Helmet>` (not supported in Next.js 13+)
❌ **DON'T**: Use `React.lazy()` (use `next/dynamic` instead)
❌ **DON'T**: Use `react-router-dom` imports (use `next/link` and `next/navigation`)

---

## Touch Points / Key Files

- **Root layout**: `app/layout.tsx` (providers, global metadata)
- **Home page**: `app/page.tsx`
- **Next.js header**: `components/NextHeader.tsx`
- **Mobile menu**: `components/NextMobileMenu.tsx`
- **API routes**: `app/api/chat/route.ts`, `app/api/contact/route.ts`
- **Metadata generators**: `app/robots.ts`, `app/sitemap.ts`

---

## JIT Index Hints

### Find Pages

```bash
find app -name "page.tsx"
find app -name "[*.tsx"  # Dynamic routes
```

### Find API Routes

```bash
find app/api -name "route.ts"
rg -n "export async function (GET|POST)" app/api/
```

### Find Client Components

```bash
rg -n "^['\"]use client['\"]" app/ components/
```

### Find Metadata

```bash
rg -n "export async function generateMetadata" app/
rg -n "export const metadata" app/
```

---

## Common Gotchas

- **Async params**: Route params are now async in Next.js 15+ → use `const slug = (await params).slug`
- **Hydration**: Use `suppressHydrationWarning` on `<html>` for theme/language
- **Imports**: Use `@/` alias for absolute imports from app root
- **CSS Modules**: Always use relative imports (`./Component.module.css`)

---

## Pre-PR Checks

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

---

**See [nextjs-app/shared/components/AGENTS.md](../nextjs-app/shared/components/AGENTS.md) for component patterns.**
