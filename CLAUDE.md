# Digitaltableteur - Claude Code Instructions

> **Authoritative source** for development guidelines. Subdirectories contain specialized CLAUDE.md files that extend these rules.

## Project Identity

| Attribute | Value |
|-----------|-------|
| **Type** | Hybrid monorepo (Next.js 15 production + Vite legacy) |
| **Stack** | React 19, TypeScript 5.9, Next.js 15.5, Storybook 10 |
| **Architecture** | Component-driven design system, CSS Modules, i18next (EN/FI/SV) |
| **Hosting** | Vercel serverless |
| **Migration** | Mid-transition Vite → Next.js (see `docs/NEXTJS_MIGRATION_PLAN.md`) |

---

## Critical References

**Before creating ANY component, read:**
- [`docs/LLM_COMPONENT_GENERATION_RULES.md`](docs/LLM_COMPONENT_GENERATION_RULES.md) - Component bible (12,000+ words)
- [`docs/LLM-CRITICAL-REASONING-AND-PLANNING-INSTRUCTIONS.md`](docs/LLM-CRITICAL-REASONING-AND-PLANNING-INSTRUCTIONS.md) - Planning methodology

**Subdirectory guides:**
- [`app/CLAUDE.md`](app/CLAUDE.md) - Next.js App Router patterns
- [`api-legacy-vercel-functions/AGENTS.md`](api-legacy-vercel-functions/AGENTS.md) - Serverless functions
- [`scripts/AGENTS.md`](scripts/AGENTS.md) - Automation scripts
- [`docs/AGENTS.md`](docs/AGENTS.md) - Documentation index

---

## Quick Start Commands

```bash
# Development
npm run dev                # Next.js dev server (localhost:3000)
npm run storybook          # Component dev (localhost:6010)
npm test                   # Vitest tests
npm run typecheck          # TypeScript validation
npm run lint               # ESLint + Stylelint

# Quality gates (run before PR)
npm run typecheck && npm run lint && npm test && npm run build

# Visual & Accessibility
npm run test:visual        # Visual regression (Playwright)
npm run test:a11y          # Accessibility tests (axe-core)

# Content & CMS
npm run sanity:dev         # Sanity CMS studio
npm run sanity:publish     # Publish from Sanity
```

---

## Project Structure

```
digitaltableteur/
├── app/                           # Next.js 15 App Router (production)
│   ├── page.tsx                   # Home page
│   ├── about/page.tsx             # About page
│   ├── blog/[slug]/page.tsx       # Dynamic blog posts
│   ├── contact/page.tsx           # Contact form
│   ├── work/page.tsx              # Portfolio
│   ├── api/                       # API routes
│   │   ├── chat/route.ts          # AI chat (streaming)
│   │   ├── contact/route.ts       # Contact form submission
│   │   └── gdpr/delete-data/      # GDPR data deletion
│   ├── layout.tsx                 # Root layout
│   ├── sitemap.ts                 # Dynamic sitemap
│   └── robots.ts                  # Dynamic robots.txt
│
├── nextjs-app/shared/             # Shared design system
│   ├── components/                # 80+ UI components
│   ├── hooks/                     # Custom React hooks
│   ├── patterns/                  # Layout patterns
│   ├── locales/                   # Translations (EN/FI/SV)
│   └── styles/                    # Design tokens & variables
│
├── providers/                     # Context providers
│   ├── I18nProvider.tsx           # Internationalization
│   ├── NextThemeProvider.tsx      # Theme switching
│   ├── ToastProvider.tsx          # Notifications
│   └── CookieConsentProvider.tsx  # GDPR consent
│
├── api-legacy-vercel-functions/   # Legacy serverless functions
├── digitaltableteur-blog/         # Sanity CMS studio
├── scripts/                       # 40+ automation scripts
├── docs/                          # 69+ documentation files
├── .storybook/                    # Storybook configuration
└── akaunting/                     # Self-hosted accounting (Docker)
```

---

## Component Structure (Non-Negotiable)

Every component MUST have this structure:

```
ComponentName/
├── ComponentName.tsx          # Functional component
├── ComponentName.module.css   # CSS Modules (never inline styles)
├── ComponentName.stories.tsx  # Storybook with WIP badge
├── ComponentName.test.tsx     # Vitest + axe-core tests
└── index.ts                   # Barrel export
```

**Location:** Always create in `nextjs-app/shared/components/` unless platform-specific.

---

## Code Quality Rules

### MUST (Required)

- Write TypeScript in strict mode (no `any` without justification)
- Include tests for all components (unit + accessibility)
- Run pre-commit: `npm run typecheck && npm test && npm run lint`
- Use CSS Modules exclusively (never inline styles except dynamic `backgroundImage`)
- Ensure 100% translation coverage (EN/FI/SV)
- Update Storybook stories for UI changes
- Use design tokens from `nextjs-app/shared/styles/variables.css`
- Reuse existing components (Title, Text, Button, Card, Icon, Grid, FlexBox)

### MUST NOT (Forbidden)

- Use `@ts-ignore` (fix types properly)
- Bypass ESLint errors without justification
- Hardcode colors (use CSS custom properties)
- Create standalone component files (always folder structure)
- Commit secrets, API keys, or tokens
- Remove WIP badge without a11y + visual + translation verification

### SHOULD (Best Practices)

- Use functional components with hooks (no class components)
- Prefer CSS logical properties (`margin-inline`, `padding-block`)
- Keep functions under 50 lines
- Lazy-load routes with `dynamic()` in Next.js
- Use `React.lazy()` with `Suspense` in Vite

---

## Styling Rules

### CSS Modules Only

```css
/* GOOD - Use design tokens and logical properties */
.component {
  padding-inline: var(--space-layout-16);
  margin-block-end: var(--space-layout-24);
  color: var(--color-text);
  font-family: var(--font-sans);
}

/* BAD - Hardcoded values and physical properties */
.component {
  padding-left: 16px;
  margin-bottom: 24px;
  color: #333;
}
```

### Component Reuse

```tsx
// GOOD - Use design system components
<Card>
  <Title level={2} terminals="sans">Heading</Title>
  <Text as="p" terminals="sans">Body text</Text>
  <Button variant="primary">Action</Button>
</Card>

// BAD - Raw HTML elements
<div>
  <h2 className={styles.title}>Heading</h2>
  <p className={styles.text}>Body text</p>
  <button className={styles.button}>Action</button>
</div>
```

---

## Internationalization (i18n)

**Languages:** English (EN), Finnish (FI), Swedish (SV)
**Framework:** i18next + react-i18next
**Translation files:** `nextjs-app/shared/locales/{en,fi,sv}/translation.json`

```tsx
// Using translations
import { useTranslation } from "react-i18next";

function Component() {
  const { t } = useTranslation();
  return <Title>{t("pageTitle")}</Title>;
}
```

**Requirement:** 100% coverage across all three languages before shipping.

---

## Testing Strategy

| Type | Framework | Location | Command |
|------|-----------|----------|---------|
| Unit | Vitest + Testing Library | Colocated `.test.tsx` | `npm test` |
| Accessibility | axe-core | Component tests | `npm run test:a11y` |
| Visual Regression | Playwright | `__visual__/snapshots/` | `npm run test:visual` |
| E2E | Playwright | Storybook runner | `npm run test:visual` |

**Coverage target:** >80%

---

## API Routes (Next.js)

### Chat API (`app/api/chat/route.ts`)
- Streaming responses with Vercel AI SDK
- Rate limiting, prompt injection guards
- Token counting validation

### Contact API (`app/api/contact/route.ts`)
- Form validation, MongoDB persistence
- Rate limiting, GDPR compliance

### GDPR API (`app/api/gdpr/delete-data/route.ts`)
- Data deletion by email
- Weekly automated cleanup

---

## Environment Variables

### Development (`.env.local`)
```bash
NEXT_PUBLIC_GA_ID=          # Google Analytics
NEXT_PUBLIC_EMAIL_*=        # EmailJS credentials
FIGMA_TOKEN=                # Figma MCP access
GITHUB_MCP_PAT=             # GitHub operations
```

### Production (Vercel)
```bash
CV_PASSWORD=                # Secure resume download
OPENAI_API_KEY=             # AI chat
MONGODB_URI=                # Data persistence
SENTRY_DSN=                 # Error tracking
AI_GATEWAY_URL=             # LLM routing
```

**Never commit secrets. Use `.env.local` (gitignored).**

---

## MCP Integrations

Configured in `mcp.json`:

| Server | Purpose |
|--------|---------|
| **Figma** | Design file access, component extraction |
| **GitHub** | Repository operations, issues, PRs |
| **TypeScript** | Language server for LSP features |
| **Sentry** | Error tracking, releases |
| **Vercel** | Deployment, build logs |
| **Context7** | Documentation search |
| **Sanity** | CMS operations, GROQ queries |
| **Akaunting** | Accounting API (self-hosted) |

---

## Git Workflow

### Branch Naming
```
DT-XXX-feat-description    # Feature
DT-XXX-fix-description     # Bug fix
DT-XXX-docs-description    # Documentation
```

### Commit Format (Conventional Commits)
```
feat: add user authentication
fix: resolve login redirect issue
docs: update API documentation
refactor: simplify form validation
test: add accessibility tests for Modal
```

### PR Requirements
- All tests passing
- Type checks passing
- Lint clean
- 1 approval required
- Squash on merge
- Delete branch after merge

---

## Security

### Content Security Policy
- **Development:** Permissive (allows HMR, DevTools)
- **Production:** Strict (blocks XSS/injection, trusted domains only)

### Security Headers
- HSTS (2 years, preload)
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera/mic/geo disabled

### Input Validation
- `mongo-sanitize` for MongoDB queries
- `isomorphic-dompurify` for HTML sanitization
- Rate limiting on sensitive endpoints
- Prompt injection guards for AI chat

---

## Quick Find Commands

```bash
# Find component
rg -n "export.*function.*" nextjs-app/shared/components/

# Find route
find app -name "page.tsx" -o -name "route.ts"

# Find translation key usage
rg -n "t\(\"" nextjs-app/ app/ | grep -v ".test.tsx"

# Find API endpoint
rg -n "export async function (GET|POST)" app/api/

# Check for unused dependencies
npx depcheck
```

---

## Troubleshooting

### Framer Motion + Strict Mode Error
```
Cannot read properties of null (reading 'removeChild')
```
**Solution:** Wrap animations in `<AnimatePresence mode="wait">` with unique `key` props.

### Hydration Mismatch
**Solution:** Add `suppressHydrationWarning` to `<html>` tag for theme/language differences.

### Next.js 15 Async Params
```tsx
// Old (broken)
export default function Page({ params }) {
  const slug = params.slug;
}

// New (Next.js 15+)
export default async function Page({ params }) {
  const slug = (await params).slug;
}
```

---

## Tool Permissions

| Action | Permission |
|--------|------------|
| Read any file | Yes |
| Write code files | Yes |
| Run tests/lint/typecheck | Yes |
| Create/update issues | Yes |
| Query Sentry errors | Yes |
| Edit `.env` files | Ask first |
| Force push | Ask first |
| Delete databases | Ask first |
| Run production migrations | Ask first |

---

## Maintenance

When changing development practices:

1. Update this `CLAUDE.md`
2. Update relevant subdirectory `CLAUDE.md`/`AGENTS.md`
3. Update `.github/copilot-instructions.md`
4. Update `README.md` if user-facing
5. Run `npm test` to verify
6. Commit all changes together

---

**End of CLAUDE.md** — See subdirectory files for specialized guidance.
