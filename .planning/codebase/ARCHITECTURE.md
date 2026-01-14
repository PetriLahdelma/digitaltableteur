# Architecture

> System design, patterns, and data flow for Digitaltableteur.

**Last Updated**: 2026-01-14

---

## System Design

### Hybrid Monorepo (Next.js + Vite Legacy)

The codebase is a **mid-transition monorepo** bridging two build systems:

| System | Status | Purpose |
|--------|--------|---------|
| Next.js 15 | **Production** | App Router, SSR/SSG |
| Vite | Legacy | Being phased out |
| Sanity Studio | Active | Headless CMS |

```
Root package.json (monorepo orchestrator)
├─ Next.js app (app/, nextjs-app/)
├─ Vite app (legacy, vite-app/)
└─ Sanity Blog (digitaltableteur-blog/)
```

---

## Design Patterns

### 1. Component-Driven Design System

- **77 reusable UI components** in `nextjs-app/shared/components/`
- **Atomic design**: Base components → Composite components
- **CSS Modules only**: No inline styles
- **Folder-per-component**: Strict structure

### 2. React Server Components (RSC)

- **Default**: Server Components (zero JS overhead)
- **Client Components**: Isolated with `"use client"` directive
- **Streaming**: Progressive rendering with Suspense

### 3. Provider Pattern

```
<NextThemeProvider>
  <I18nProvider>
    <ToastProvider>
      <CookieConsentProvider>
        {children}
      </CookieConsentProvider>
    </ToastProvider>
  </I18nProvider>
</NextThemeProvider>
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│              Request Flow (Server → Client)              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  User Request (Next.js Route)                          │
│         ↓                                              │
│  Server Component (RSC)                                │
│         ├─ Fetch from MongoDB (contacts, GDPR)        │
│         ├─ Fetch from Sanity (blog posts)             │
│         ├─ Generate metadata (SEO, JSON-LD)           │
│         └─ Render static HTML                         │
│         ↓                                              │
│  Stream Response to Client                             │
│         ├─ Minimal hydration                          │
│         └─ Provider rehydration (i18n, theme)         │
│         ↓                                              │
│  Client Components (Interactive)                       │
│         ├─ Forms (contact, file upload)               │
│         ├─ Chat widget (streaming AI)                 │
│         └─ Galleries, accordions, tabs                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Data Sources

| Source | Purpose | Access Pattern |
|--------|---------|----------------|
| Sanity CMS | Blog, portfolio | SDK pull |
| MongoDB | Contacts, GDPR | Server-side |
| Environment | Config, API keys | Build-time |

---

## State Management

**Approach**: React Context + Hooks (no Redux/Zustand)

| Context | Purpose |
|---------|---------|
| `NextThemeProvider` | Dark/light mode |
| `I18nProvider` | Language (EN/FI/SV) |
| `ToastProvider` | Notifications |
| `CookieConsentProvider` | GDPR cookies |

**Local State**: `useState()` in client components

---

## Rendering Strategy

| Strategy | Usage | Implementation |
|----------|-------|----------------|
| **SSR** | Default | React Server Components |
| **ISR** | Blog, portfolio | `revalidatePath()` |
| **CSR** | Chat, forms | `"use client"` |
| **Dynamic** | Always fresh | `dynamic = "force-dynamic"` |

---

## API Architecture

### REST + Streaming (Vercel Edge/Serverless)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat` | POST | AI chat (streaming) |
| `/api/contact` | POST | Form submission |
| `/api/download-cv` | GET | Resume (auth) |
| `/api/gdpr/delete-data` | POST | Data deletion |
| `/api/llms.txt` | GET | AI crawler info |

### API Security

- CORS headers per endpoint
- Rate limiting (3 req/15min per IP)
- Prompt injection guards
- MongoDB query sanitization
- CSP headers (strict in production)

---

## Security Architecture

### Defense Layers

1. **Input**: Validation (Zod), sanitization (mongo-sanitize, DOMPurify)
2. **Transport**: HTTPS, strict CSP, CORS whitelist
3. **Storage**: MongoDB TLS, no secrets in code
4. **Output**: HTML entity escaping, JSON-LD sanitization

### Headers

- HSTS (2 years, preload)
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- Referrer-Policy: strict-origin-when-cross-origin

---

## Performance Optimizations

| Technique | Implementation |
|-----------|----------------|
| Server Components | Zero JS by default |
| Image optimization | Next.js Image |
| Code splitting | Dynamic imports |
| CSS Modules | No runtime overhead |
| Font optimization | Preload critical fonts |

---

## Monitoring

| Service | Purpose |
|---------|---------|
| Sentry | Error tracking (10% traces, 100% errors) |
| Vercel Analytics | Performance metrics |
| Google Analytics | User behavior |

---

## Deployment

- **Platform**: Vercel
- **Strategy**: Serverless functions
- **Regions**: Auto-scaled
- **Rollback**: Instant via Vercel dashboard
