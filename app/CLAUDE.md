# Next.js App Router - Claude Code Instructions

## Package Identity

**Purpose**: Next.js 16 App Router (production application)  
**Technology**: Next.js 16.2.x, React Server Components, App Router  
**Entry Point**: `app/layout.tsx` (root layout)  
**Parent Context**: Extends [../CLAUDE.md](../CLAUDE.md)

---

## Development Commands

### This Package

```bash
# From project root
npm run dev            # Start Next.js dev server at http://localhost:3001
npm run build          # Build for production
npm run start          # Start production server
```

### Pre-PR Checklist

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

---

## Architecture

### Directory Structure

```
app/
├── layout.tsx              # Root layout (providers, metadata)
├── page.tsx                # Home page
├── globals.css             # Global styles
├── robots.ts               # Robots.txt generator
├── sitemap.ts              # Sitemap.xml generator
├── about/
│   └── page.tsx            # /about route
├── blog/
│   ├── page.tsx            # /blog route
│   └── [slug]/
│       └── page.tsx        # /blog/[slug] dynamic route
├── contact/
│   └── page.tsx            # /contact route
├── work/
│   └── page.tsx            # /work route
└── api/
    ├── chat/
    │   └── route.ts        # POST /api/chat
    └── contact/
        └── route.ts        # POST /api/contact
```

---

## Code Organization Patterns

### Pages

✅ **DO**: Use server components by default

```tsx
// app/about/page.tsx
export default function AboutPage() {
  return <AboutPageContent />; // Imported from shared/components
}
```

❌ **DON'T**: Add `"use client"` unless necessary (state, events, hooks)

### Metadata

✅ **DO**: Use `generateMetadata` for SEO

```tsx
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  return {
    title: `${post.title} | Digitaltableteur`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}
```

❌ **DON'T**: Use `<Head>` or `<Helmet>` (Next.js 13+ doesn't support them)

### Layouts

✅ **DO**: Use nested layouts for shared UI

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <NextHeader />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
```

❌ **DON'T**: Duplicate header/footer in each page

### API Routes

✅ **DO**: Use route handlers with proper HTTP methods

```tsx
// app/api/contact/route.ts
export async function POST(request: Request) {
  const body = await request.json();

  // Validate input
  if (!body.email) {
    return Response.json({ error: "Email required" }, { status: 400 });
  }

  // Process
  await sendEmail(body);

  return Response.json({ success: true });
}
```

❌ **DON'T**: Use legacy `pages/api` directory

### Environment Variables

✅ **DO**: Use `NEXT_PUBLIC_` prefix for client-side vars

```tsx
// Client component
const gaId = process.env.NEXT_PUBLIC_GA_ID;

// Server component/API route
const apiKey = process.env.OPENAI_API_KEY; // No prefix needed
```

❌ **DON'T**: Use `import.meta.env.VITE_*` (Vite-specific)

### Image Optimization

✅ **DO**: Use Next.js `Image` component

```tsx
import Image from "next/image";
import avatar from "/public/images/avatar.jpg";

<Image src={avatar} alt="Petri Lahdelma" width={256} height={256} priority />;
```

❌ **DON'T**: Use plain `<img>` tags (loses optimization)

### Dynamic Imports

✅ **DO**: Use `next/dynamic` for client components

```tsx
import dynamic from "next/dynamic";

const ChatWidget = dynamic(() => import("@/components/ChatWidget"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});
```

❌ **DON'T**: Use `React.lazy()` (causes hydration issues)

### Routing & Navigation

✅ **DO**: Use Next.js `Link` and `useRouter` from `next/navigation`

```tsx
import Link from "next/link";
import { useRouter } from "next/navigation";

<Link href="/about">About</Link>;

// In client component
const router = useRouter();
router.push("/contact");
```

❌ **DON'T**: Use `react-router-dom` (use `next/link` and `next/navigation`)

---

## Key Files

### Core Files (understand these first)

- **`app/layout.tsx`**: Root layout with providers (ThemeProvider, LanguageProvider, ToastProvider)
- **`app/page.tsx`**: Home page (hero, services grid, testimonials)
- **`app/globals.css`**: Global CSS imports and resets
- **`components/NextHeader.tsx`**: Next.js-specific header component
- **`components/NextLayout.tsx`**: Page layout wrapper with i18n
- **`components/NextMobileMenu.tsx`**: Mobile menu with navigation

### Metadata Generation

- **`app/robots.ts`**: Dynamic robots.txt
- **`app/sitemap.ts`**: Dynamic sitemap.xml
- **`app/blog/[slug]/page.tsx`**: Dynamic metadata for blog posts

### Common Patterns

- **Shared components**: Import from `shared/components/` (symlinked from `src/`)
- **Server components**: Default (no `"use client"`)
- **Client components**: Add `"use client"` at top when using hooks, events, or browser APIs

---

## Quick Search Commands

### Find Pages

```bash
# All page routes
find app -name "page.tsx"

# Dynamic routes
find app -name "[*.tsx"

# API routes
find app/api -name "route.ts"
```

### Find Components

```bash
# Next.js-specific components
rg -n "export (function|const|default)" components/Next*.tsx

# Shared components (used in Next.js)
rg -n "import.*from.*shared/components" app/
```

### Find Metadata

```bash
# generateMetadata usage
rg -n "export async function generateMetadata" app/

# Metadata objects
rg -n "export const metadata" app/
```

### Find Client Components

```bash
# Files with "use client"
rg -n "^['\"]use client['\"]" app/ components/
```

---

## Common Gotchas

### Async Params (Next.js 15+)

**Issue**: Route params are now async

```tsx
// ❌ DON'T (old pattern)
export default function Page({ params }: Props) {
  const slug = params.slug;
}

// ✅ DO (Next.js 15+)
export default async function Page({ params }: Props) {
  const slug = (await params).slug;
}
```

### Hydration Mismatches

**Issue**: Theme/language applied client-side causes mismatch

**Solution**: Use `suppressHydrationWarning` on `<html>` tag

```tsx
<html lang="en" suppressHydrationWarning>
```

### Server vs Client Components

**Issue**: Using hooks in server components

**Solution**: Add `"use client"` directive OR extract client logic to separate component

```tsx
// ❌ DON'T
export default function Page() {
  const [state, setState] = useState(); // Error: hooks in server component
}

// ✅ DO
("use client");
export default function Page() {
  const [state, setState] = useState(); // Works
}
```

### Import Paths

**Issue**: Relative imports break

**Solution**: Use `@/` alias for absolute imports from app root

```tsx
// ❌ DON'T
import Header from "../../../components/Header";

// ✅ DO
import Header from "@/components/Header";
```

### CSS Modules in Next.js

**Issue**: Webpack (Next.js) vs Vite resolve CSS differently

**Solution**: Always use relative imports

```tsx
// ✅ Works in both
import styles from "./Component.module.css";

// ❌ Avoid
import styles from "@/styles/Component.module.css";
```

---

## Pre-PR Checks

Run before creating a PR:

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Ensure:

- ✅ No TypeScript errors
- ✅ No lint errors
- ✅ Tests pass
- ✅ Build succeeds
- ✅ No hydration warnings in browser console
- ✅ Metadata renders correctly (check `<head>` in production build)

---

## Testing in Next.js Context

### Server Components

- Cannot test with traditional React testing libraries
- Use E2E tests (Playwright) for server component logic
- Extract business logic to separate functions and test those

### Client Components

- Test with Vitest + Testing Library (as usual)
- Mock Next.js navigation: `jest.mock('next/navigation')`

### Metadata

- Check generated `<head>` tags in production build
- Use browser DevTools to inspect `<meta>` tags

---

**End of app/CLAUDE.md** — For components see [nextjs-app/shared/components/AGENTS.md](../nextjs-app/shared/components/AGENTS.md). Skill: [dt-nextjs-app](../.claude/skills/dt-nextjs-app/SKILL.md).
