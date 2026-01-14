# Structure

> Directory layout and module organization for Digitaltableteur.

**Last Updated**: 2026-01-14

---

## Root Directory

```
digitaltableteur/
│
├── app/                           # Next.js 15 App Router (production)
├── nextjs-app/shared/             # Shared design system
├── providers/                     # React Context providers
├── api-legacy-vercel-functions/   # Legacy serverless functions
├── digitaltableteur-blog/         # Sanity CMS studio
├── scripts/                       # Automation scripts (40+)
├── docs/                          # Documentation (69+ files)
├── .storybook/                    # Storybook configuration
├── akaunting/                     # Self-hosted accounting (Docker)
├── content/                       # Static markdown/MDX
├── sanity-output/                 # Cached Sanity exports
└── vite-app/                      # Legacy Vite (being sunset)
```

---

## Next.js Routes (`app/`)

```
app/
├── page.tsx                   # Home (/)
├── layout.tsx                 # Root layout (providers, metadata)
├── globals.css                # Global CSS
│
├── about/page.tsx             # /about
├── blog/                      # /blog routes
│   ├── page.tsx               # Blog listing
│   └── [slug]/page.tsx        # Dynamic blog article
├── contact/page.tsx           # /contact form
├── work/                      # Portfolio pages
│   ├── page.tsx               # /work (index)
│   └── [project]/page.tsx     # Individual projects
│
├── api/                       # API route handlers
│   ├── chat/route.ts          # AI chat streaming
│   ├── contact/route.ts       # Contact form submission
│   ├── download-cv/route.ts   # Resume download (auth)
│   ├── gdpr/delete-data/route.ts  # GDPR deletion
│   ├── save-contact/route.ts  # Legacy contact save
│   ├── llms.txt/route.ts      # AI crawler info
│   └── test-health/           # Health check endpoints
│
├── lib/                       # App-specific utilities
│   ├── structuredData.ts      # JSON-LD schema
│   ├── mongodb.ts             # MongoDB connection
│   └── promptGuardrails.ts    # AI safety checks
│
├── components/                # Next.js-specific components
│   ├── NextLayout.tsx
│   ├── NextHeader.tsx
│   └── HtmlLangSync.tsx
│
├── blog/postMetadata.ts       # Blog metadata manager
├── sitemap.ts                 # Dynamic sitemap
└── robots.ts                  # Dynamic robots.txt
```

---

## Shared Design System (`nextjs-app/shared/`)

```
nextjs-app/shared/
├── components/                # 77+ UI components
│   ├── Button/
│   ├── Card/
│   ├── Title/
│   ├── Text/
│   ├── Input/
│   ├── ContactForm/
│   ├── Gallery/
│   ├── Accordion/
│   ├── Tabs/
│   ├── Modal/
│   ├── Toast/
│   ├── CookieConsent/
│   └── ... (70+ more)
│
├── patterns/                  # 11 layout patterns
│   ├── Grid/
│   ├── FlexBox/
│   ├── Hero/
│   ├── Sidebar/
│   └── ...
│
├── hooks/                     # Custom React hooks
│   └── usePersistentTheme.ts
│
├── styles/                    # Design tokens
│   ├── variables.css          # CSS custom properties
│   ├── fonts.css              # Font imports
│   ├── typography.css         # Text scale
│   └── grain.css              # Visual texture
│
├── locales/                   # Translations
│   ├── en/translation.json    # English
│   ├── fi/translation.json    # Finnish
│   └── sv/translation.json    # Swedish
│
├── types/                     # Shared TypeScript interfaces
├── utils/                     # Utilities (sanitize, dates)
├── lib/                       # Cookie consent, helpers
├── data/                      # Static data (mock, fixtures)
├── assets/                    # Icons, images, SVGs
└── stories/                   # Storybook stories
```

---

## Component Structure (Mandatory)

Every component MUST follow this structure:

```
ComponentName/
├── ComponentName.tsx          # Main component (default export)
├── ComponentName.module.css   # CSS Modules styling
├── ComponentName.stories.tsx  # Storybook stories
├── ComponentName.test.tsx     # Unit tests
├── index.ts                   # Barrel export
└── [optional files]
    ├── ComponentName.a11y.test.tsx      # A11y tests
    ├── ComponentName.behavior.test.tsx  # Behavioral tests
    └── schema.json                      # LLM generation schema
```

---

## Providers (`providers/`)

```
providers/
├── I18nProvider.tsx           # i18next configuration
├── NextThemeProvider.tsx      # Dark/light mode
├── ToastProvider.tsx          # Notifications
└── CookieConsentProvider.tsx  # GDPR cookie banner
```

---

## Scripts (`scripts/`)

```
scripts/
├── sanity-migration/          # Blog migration tools
├── linear/                    # Linear issue integration
├── fetch-figma.js             # Figma component fetch
├── generate-blog-manifest.mjs # Blog metadata generation
└── [40+ other automation scripts]
```

---

## Documentation (`docs/`)

```
docs/
├── LLM_COMPONENT_GENERATION_RULES.md     # Component bible
├── LLM-CRITICAL-REASONING-AND-PLANNING-INSTRUCTIONS.md
├── NEXTJS_MIGRATION_PLAN.md              # Migration guide
├── COMPREHENSIVE_SECURITY_AUDIT_*.md     # Security audits
├── ACCESSIBILITY_AND_ISSUES_REPORT.md
└── [69+ documentation files]
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js settings (MDX, CSP, aliases) |
| `tsconfig.json` | TypeScript (strict mode, path aliases) |
| `.eslintrc.cjs` | ESLint rules |
| `.stylelintrc.json` | CSS linting (design tokens) |
| `vitest.config.mts` | Test runner |
| `playwright.config.ts` | E2E tests |
| `sanity.config.ts` | Sanity CMS client |
| `sentry.*.config.ts` | Error tracking (3 files) |
| `mcp.json` | MCP server configuration |

---

## Path Aliases

| Alias | Path | Usage |
|-------|------|-------|
| `@dt/*` | `./nextjs-app/shared/components/*` | Components |
| `@dt-pages/*` | `./nextjs-app/shared/components/pages/*` | Page components |
| `@/*` | Root directory | General imports |

---

## Legacy Code Locations

```
# Being phased out (do not add new code here)
├── vite-app/                    # Old Vite app
├── api-legacy-vercel-functions/ # Old API routes
├── nextjs-app/shared/vite-pages/ # Legacy Vite routes
└── src/                         # Symlink for compatibility
```

---

## Entry Points

| Entry | File | Purpose |
|-------|------|---------|
| Web App | `app/layout.tsx` | Root layout with providers |
| Home Page | `app/page.tsx` | Hero, services, testimonials |
| Storybook | `.storybook/main.ts` | Component library |
| API | `app/api/**/*.ts` | Serverless endpoints |
| CMS Studio | `digitaltableteur-blog/` | Sanity editing |
