# Stack

> Technology stack for Digitaltableteur - Languages, frameworks, and key dependencies.

**Last Updated**: 2026-01-14

---

## Languages & Versions

| Language | Version | Purpose |
|----------|---------|---------|
| TypeScript | 5.9.3 | Primary language (strict mode) |
| JavaScript | ES2017+ | Target compilation |
| CSS | CSS3 | Styling (via CSS Modules) |
| MDX | 3.x | Blog content & documentation |

- **Node.js**: 20.19.0 (CI/CD)
- **npm**: Package manager (lockfile: package-lock.json)

---

## Core Frameworks

| Framework | Version | Role |
|-----------|---------|------|
| **Next.js** | 15.5.9 | Production SSR/SSG (App Router) |
| **React** | 19.2.3 | UI library (Server Components) |
| **Vite** | 6.4.1 | Legacy development build |

### Next.js Configuration

- **Compiler**: SWC (built-in, replaces Babel)
- **Routing**: App Router (file-based)
- **Rendering**: Hybrid SSR/SSG/ISR/CSR
- **MDX**: @next/mdx 16.0.10

---

## Styling

| Tool | Version | Purpose |
|------|---------|---------|
| CSS Modules | Built-in | Component styling |
| PostCSS | Built-in | CSS processing |
| Stylelint | 16.26.1 | CSS linting |
| styled-components | 6.1.19 | Limited usage |

### Design Tokens

Located in `nextjs-app/shared/styles/variables.css`:

- **Typography**: `--font-title`, `--font-text`, `--font-size-*`
- **Colors**: `--color-primary`, `--color-success`, `--accent-*`
- **Spacing**: `--space-internal-*`, `--space-layout-*`
- **Border Radius**: `--radius-sm/md/lg`

---

## State Management & Animation

| Library | Version | Purpose |
|---------|---------|---------|
| React Context | Built-in | App state (theme, i18n, toast) |
| Framer Motion | 12.23.26 | Animations & transitions |
| Vercel AI SDK | 5.0.115 | AI chat state |

---

## Internationalization (i18n)

| Package | Version | Purpose |
|---------|---------|---------|
| i18next | 25.7.3 | Core translation framework |
| react-i18next | 15.7.4 | React bindings |
| i18next-browser-languagedetector | 8.2.0 | Auto language detection |

**Supported Languages**: English (EN), Finnish (FI), Swedish (SV)

---

## Content & Markdown

| Package | Version | Purpose |
|---------|---------|---------|
| @mdx-js/react | 3.1.1 | MDX runtime |
| @mdx-js/loader | 3.1.1 | Webpack loader |
| remark-gfm | 4.0.1 | GitHub-flavored markdown |
| react-markdown | 10.1.0 | Markdown rendering |
| prismjs | 1.30.0 | Code highlighting |

---

## UI Components

| Package | Version | Purpose |
|---------|---------|---------|
| @phosphor-icons/react | 2.1.10 | Icon library |
| react-icons | 5.5.0 | Additional icons |
| react-phone-number-input | 3.4.14 | Phone input |
| chart.js | 4.5.1 | Charts |
| react-chartjs-2 | 5.3.1 | React chart bindings |
| leaflet | 1.9.4 | Maps |
| react-leaflet | 5.0.0 | React map bindings |

---

## Testing

| Package | Version | Purpose |
|---------|---------|---------|
| Vitest | 4.0.16 | Unit test runner |
| @testing-library/react | 16.3.1 | Component testing |
| @testing-library/jest-dom | 6.9.1 | DOM matchers |
| @testing-library/user-event | 14.6.1 | User interaction |
| jest-axe | 10.0.0 | Accessibility testing |
| vitest-axe | 0.1.0 | Vitest axe integration |
| Playwright | 1.57.0 | E2E & visual regression |
| @vitest/coverage-v8 | 4.0.16 | Coverage reporting |

---

## Component Development

| Package | Version | Purpose |
|---------|---------|---------|
| Storybook | 10.1.10 | Component library |
| @storybook/react-vite | 10.1.11 | React + Vite integration |
| @storybook/addon-a11y | 10.1.10 | Accessibility addon |
| @storybook/addon-docs | 10.1.10 | Documentation |
| @storybook/test-runner | 0.24.2 | Story testing |

---

## Code Quality

| Package | Version | Purpose |
|---------|---------|---------|
| ESLint | 9.39.2 | JavaScript/TypeScript linting |
| eslint-config-next | 16.1.1 | Next.js rules |
| eslint-config-prettier | 10.1.8 | Prettier compatibility |
| Stylelint | 16.26.1 | CSS linting |

---

## Monitoring & Performance

| Package | Version | Purpose |
|---------|---------|---------|
| @sentry/nextjs | 10.31.0 | Error tracking |
| lighthouse | 12.8.2 | Performance auditing |

---

## Security & Validation

| Package | Version | Purpose |
|---------|---------|---------|
| mongo-sanitize | 1.1.0 | MongoDB injection prevention |
| isomorphic-dompurify | 2.35.0 | HTML sanitization |
| libphonenumber-js | 1.12.31 | Phone validation |

---

## Database & APIs

| Package | Version | Purpose |
|---------|---------|---------|
| mongodb | 7.0.0 | MongoDB driver |
| pg | 8.16.3 | PostgreSQL driver |
| @ai-sdk/openai | 5.0.x | OpenAI integration |
| @sanity/client | 7.13.2 | Sanity CMS client |

---

## Build & Runtime

| Package | Version | Purpose |
|---------|---------|---------|
| dotenv | 17.2.3 | Environment variables |
| @vercel/node | 5.5.16 | Serverless utilities |
| node-fetch | 3.3.2 | HTTP fetching |

---

## Key Scripts

```bash
# Development
npm run dev           # Next.js dev server (localhost:3000)
npm run storybook     # Component dev (localhost:6010)

# Quality
npm run typecheck     # TypeScript validation
npm run lint          # ESLint + Stylelint
npm test              # Vitest tests

# Build
npm run build         # Production build
npm run build:next    # Next.js only
```

---

## Version Policy

- **Major Updates**: Quarterly review
- **Security Patches**: Immediate (within 48h)
- **Dependency Audit**: Weekly via `npm audit`
