```
 _____   _______
|  __ \ |__   __|
| |  | |   | |
| |  | |   | |
| |__| |   | |
|_____/    |_|

```

# Digitaltableteur

> "Iteration beats perfection—ship today, learn tomorrow, refine forever."

Digitaltableteur is a hybrid monorepo portfolio website featuring both Next.js 16 (production) and Vite (legacy) applications. Built with React 19 and TypeScript 6.x, it showcases a comprehensive design system, multi-language support (EN/FI/SV), AI-powered chat interface, and enterprise-grade tooling including Sentry observability, Linear issue management, and MCP (Model Context Protocol) integrations.

## 🚀 Features

### Core Architecture

- **Hybrid Monorepo**: Next.js 16 App Router (production) + Vite 6.4 (legacy) in parallel migration
- **AI Documentation System**: Hierarchical CLAUDE.md/AGENTS.md structure optimized for AI assistants
- **Design System**: 50+ components with CSS Modules, design tokens, Storybook, and visual regression testing
- **Type Safety**: TypeScript 6.x strict mode with comprehensive interfaces and JSDoc documentation

### User Experience

- **Multi-language Support**: Complete i18n with English, Finnish, and Swedish (100% translation coverage)
- **AI Chat Interface**: OpenAI-powered chat with guided email workflow, dynamic component injection, markdown rendering
- **Responsive Design**: Mobile-first with progressive enhancement (backdrop-filter, gap, :has() selector)
- **Progressive Web App**: Service worker caching, offline support, native share API integration
- **Accessibility**: WCAG AA compliant with axe-core testing, semantic HTML, ARIA attributes, keyboard navigation

### Content & Media

- **Blog Platform**: Sanity CMS integration with MDX, syntax highlighting, reading time estimates
- **Secure CV Download**: Password-protected with API validation and rate limiting
- **Image Optimization**: Next.js Image component, lazy loading, responsive srcset generation
- **Contact Integration**: EmailJS with guided multi-step workflow, validation, and accessibility

### Developer Experience

- **Storybook 10**: Component development with WIP badge system, visual regression testing
- **Testing**: Vitest + Testing Library (>80% coverage target), accessibility tests, E2E with Playwright
- **MCP Integrations**: GitHub, Figma, Context7, TypeScript LSP, Sentry for AI-assisted development
- **Linear Automation**: Programmatic issue creation/update, label management, state workflows
- **Sentry Observability**: Error tracking, performance monitoring, release health, MCP query interface

### Performance & SEO

- **Code Splitting**: Dynamic imports with React.lazy() (Vite) and next/dynamic (Next.js)
- **Bundle Optimization**: Tree shaking, minification, aggressive cache busting with content hashes
- **SEO**: Dynamic metadata with generateMetadata(), sitemap.xml, robots.txt, structured data
- **Analytics**: Google Analytics 4 integration with privacy controls

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or compatible package manager

### Installation

```bash
# Clone repository
git clone https://github.com/PetriLahdelma/digitaltableteur.git
cd digitaltableteur

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Environment Configuration

Required for development:

```bash
# Analytics
VITE_GA_ID=G-XXXXXXXXXX                      # Google Analytics 4

# Email Services
VITE_EMAILJS_SERVICE_ID=service_xxx
VITE_EMAILJS_TEMPLATE_ID=template_xxx
VITE_EMAILJS_PUBLIC_KEY=xxx

# MCP Servers (optional for enhanced AI features)
FIGMA_TOKEN=figd_xxx                         # Figma design access
GITHUB_MCP_PAT=github_pat_xxx               # GitHub operations
CONTEXT7_API_KEY=xxx                         # Context7 documentation access

# Linear Issue Management (optional)
LINEAR_API_KEY=lin_api_xxx
LINEAR_TEAM_ID=xxx
LINEAR_PROJECT_ID=xxx

# Akaunting Accounting (optional, self-hosted)
AKAUNTING_API_USERNAME=admin@digitaltableteur.com
AKAUNTING_API_PASSWORD=xxx
AKAUNTING_COMPANY_ID=1
```

Production only:

```bash
CV_PASSWORD=xxx                              # Secure resume download
OPENAI_API_KEY=sk-xxx                        # AI chat functionality
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx                        # Source map upload
```

See `.env.example` for complete list with descriptions.

## ⚒️ Development

### Development Servers

```bash
# Next.js dev server (production app)
npm run dev                    # http://localhost:3001

# Storybook component development
npm run storybook              # http://localhost:6010
```

### Code Quality & Testing

```bash
# Type checking
npm run typecheck              # TypeScript validation across project

# Linting
npm run lint                   # ESLint + Stylelint
npm run lint:fix               # Auto-fix linting issues

# Testing
npm test                       # Run all tests (Vitest)
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report (>80% target)
npm run test:a11y              # Accessibility tests (axe-core)
npm run test:visual            # Visual regression (Playwright + Storybook)

# Pre-commit validation (run before PR)
npm run typecheck && npm run lint && npm test && npm run build
```

### MCP & Automation

```bash
# GitHub MCP Server
npm run github:mcp:test        # Test connectivity and authentication

# Figma MCP Server
npm run figma:mcp:test         # Test connectivity and authentication

# Context7 MCP Server
npm run context7:mcp           # Launch locally (respects CONTEXT7_API_KEY)
npm run context7:mcp -- --remote-check  # Test remote endpoint

# TypeScript LSP Status
npm run ts:mcp:status          # Validate TypeScript language server
npm run ts:mcp:status:stub     # Generate stub status

# Linear Issue Management
npx tsx scripts/linear/create-issue.ts              # Interactive issue creation
npx tsx scripts/linear/update-issue.ts --issue DIG-16 --state "Done"
npx tsx scripts/linear/check-issue.ts DIG-16        # Display issue details

# Sentry Observability
node scripts/sentry-mcp.js issues digitaltableteur 10 --unresolved
npm run generate-sentry-summary                      # Generate dashboard data
```

## 🏗 Build & Deployment

### Build Commands

```bash
# Next.js production build
npm run build                  # Output: .next/

# Storybook static build
npm run build-storybook        # Output: storybook-static/
```

### Deployment

```bash
# Vite to GitHub Pages
npm run deploy                 # Build + gh-pages deployment

# Vite + Storybook visual diffs
npm run deploy-with-storybook  # Deploy with visual regression report

# Manual cache busting
npm run cache-bust             # Add version metadata + .nojekyll

# Vercel (production - automatic on push to main)
vercel --prod
```

**Hybrid Deployment Strategy**:

- **Vite App**: GitHub Pages (`https://digitaltableteur.com`)
- **Next.js App**: Vercel (`https://nextjs-app.vercel.app`)
- **Serverless Functions**: Vercel (`/api/*` routes)
- **Routing**: Vercel rewrites route specific paths to Next.js (see `vercel.json`)

### Build Optimizations

**Vite Build**:

- Tree-shaken JavaScript bundles with content hashes
- Minified CSS with vendor prefixes and logical properties
- Compressed images and fonts
- Service worker for offline caching (Workbox)
- Aggressive cache busting with filename hashing

**Next.js Build**:

- Server-side rendering (SSR) for SEO
- Static generation for blog posts
- Image optimization with Next.js Image component
- API routes as Vercel serverless functions
- Automatic code splitting per route

## 🤖 AI Documentation System

### Hierarchical Structure

The project uses a **hierarchical CLAUDE.md/AGENTS.md system** optimized for AI assistants:

```
Root Documentation (Universal Rules)
├── CLAUDE.md (380 lines)          # Comprehensive authority for Claude Code
├── AGENTS.md (150 lines)          # Quick reference for generic agents
└── .github/copilot-instructions.md  # GitHub Copilot specific

Subdirectory Documentation (Specific Context)
├── app/CLAUDE.md + AGENTS.md      # Next.js App Router patterns
├── shared/components/CLAUDE.md + AGENTS.md  # Component library rules
├── api-legacy-vercel-functions/AGENTS.md    # Serverless patterns
├── docs/AGENTS.md                 # Documentation navigation
└── scripts/AGENTS.md              # Automation patterns

Claude Code Configuration
├── .claude/settings.json          # Hooks (auto-format, safety checks)
└── .claude/commands/              # Custom slash commands
    ├── review.md                  # Comprehensive code review
    ├── fix-issue.md               # GitHub issue workflow
    ├── create-component.md        # Component generation
    └── create-linear-issue.md     # Issue creation
```

### Key Features

**CLAUDE.md** (Claude Code Authority)

- 200-400 lines per file
- Treated as immutable system rules
- Read hierarchically (up from CWD + discovers subdirectories)
- Comprehensive patterns with file examples

**AGENTS.md** (Generic AI Quick Reference)

- 100-200 lines per file
- JIT (Just-In-Time) indexing with search commands
- Minimal duplication, maximum efficiency
- Copy-paste ready commands

**Claude Code Enhancements**

- **Hooks**: Auto-format (Prettier), dangerous command blocking
- **Custom Commands**: `/review`, `/fix-issue`, `/create-component`, `/create-linear-issue`
- **Token Efficiency**: 60-80% reduction per query vs monolithic docs

### Usage

**Claude Code** (automatic):

```
/review                         # Comprehensive code review
/fix-issue 123                  # Analyze and fix GitHub issue
/create-component Button        # Generate component (5 files)
/create-linear-issue Implement X  # Create Linear issue
```

**Generic AI Agents** (manual reference):

```bash
cat AGENTS.md                           # Root rules
cat app/AGENTS.md                       # Next.js patterns
cat shared/components/AGENTS.md         # Component rules
```

**Documentation**:

- [Migration Guide](AI-DOCUMENTATION-MIGRATION-GUIDE.md)
- [System Summary](AI-DOCUMENTATION-SYSTEM-SUMMARY.md)
- [Visual Tree](AI-DOCUMENTATION-TREE.txt)

## 🎨 Design Asset Management

### Fetch Figma design

If you need the raw design data, you can download the Figma file as JSON. Set the
`FIGMA_TOKEN` environment variable with your personal access token, then run:

```bash
npm run fetch-figma
```

Synchronizes design tokens and assets from Figma using the API.
The file is saved as `figma.json` in the project root.

### SEO & Content Generation

```bash
npm run generate:sitemap    # Generate XML sitemap
npm run generate:llms       # Create LLM-friendly content index
npm run generate:alt-text   # Generate accessibility descriptions (requires OPENAI_API_KEY)
```

`generate:alt-text` streams local image bytes to the OpenAI Vision API so it can describe the actual artwork; add `OPENAI_API_KEY` (and optionally `OPENAI_ALT_MODEL`) to `.env.local` before running, or append `--force` to regenerate every `<img>` alt attribute.

### Sanity Blog Publishing

**Quick Publish Workflow:**

```bash
# Publish single article from Sanity
npm run sanity:publish-single <article-slug>

# Publish all articles
npm run sanity:publish
```

- See [`docs/SANITY_PUBLISHING_AUTOMATION.md`](docs/SANITY_PUBLISHING_AUTOMATION.md) for the complete automated publishing workflow
- See [`docs/SANITY_MIGRATION.md`](docs/SANITY_MIGRATION.md) for the full migration workflow (React → Sanity via `sanity:parse-posts` / `sanity:convert` / `sanity:upload`, Sanity → MDX via `sanity:sync-from-remote`, redirects generation, cleanup helpers)

## 🏗 Architecture

### Hybrid Monorepo Structure

```
digitaltableteur/
├── app/                       # Next.js 16 App Router (production)
│   ├── layout.tsx             # Root layout with providers
│   ├── page.tsx               # Home page (server component)
│   ├── about/page.tsx         # Route pages
│   ├── blog/[slug]/page.tsx   # Dynamic routes
│   └── api/*/route.ts         # API routes (Vercel functions)
│
├── src/                       # Vite app (legacy, being phased out)
│   ├── App.tsx                # React Router configuration
│   ├── pages/                 # Route components (to be migrated)
│   └── components/            # Component library
│
├── shared/                    # Symlinked shared code
│   ├── components/            # Design system (from src/components)
│   ├── hooks/                 # Custom React hooks
│   ├── styles/                # Design tokens & global styles
│   └── locales/               # i18n translation files
│
├── api-legacy-vercel-functions/  # Serverless functions
│   ├── cors.js                # CORS middleware
│   ├── openai-chat.js         # AI chat endpoint
│   ├── save-contact.js        # Contact form handler
│   └── download-cv.js         # Secure CV download
│
├── scripts/                   # Automation & tooling
│   ├── linear/                # Issue management
│   ├── sentry-mcp.js          # Observability queries
│   └── generate-*.js          # Code generation
│
├── docs/                      # Documentation
│   ├── LLM_COMPONENT_GENERATION_RULES.md (12,000+ words)
│   ├── NEXTJS_MIGRATION_PLAN.md
│   ├── LINEAR_AUTOMATION.md
│   └── *_MCP_SETUP.md         # MCP integration guides
│
└── .claude/                   # Claude Code configuration
    ├── settings.json          # Hooks (auto-format, safety)
    └── commands/              # Custom slash commands
```

### Technology Stack

**Frontend**

- React 19: Concurrent features, Suspense, automatic batching
- TypeScript 6.x: Strict mode, decorators, import attributes
- Next.js 16.2.x: App Router, Server Components, Streaming SSR
- Vite 6.4: Lightning-fast HMR, optimized production builds
- React Router 7: Client-side routing with lazy loading (Vite app)

**Styling & Design**

- CSS Modules: Scoped styling with consistent naming conventions
- Design Tokens: CSS custom properties in `src/styles/variables.css`
- Progressive Enhancement: `@supports` queries for modern features
- Logical Properties: `margin-inline`, `padding-block` (RTL-ready)
- Responsive Design: Mobile-first with breakpoint system

**State & Data**

- React Hooks: useState, useEffect, useContext, custom hooks
- i18next: Internationalization with React bindings
- EmailJS: Contact form email delivery
- OpenAI API: GPT-4 chat with function calling

**Backend Services**

- Vercel Serverless: Node.js functions with CORS middleware
- GitHub Pages: Static site hosting with custom domain
- Sanity CMS: Headless blog content management
- Sentry: Error tracking and performance monitoring

**Developer Tools**

- Storybook 10: Component development and documentation
- Vitest: Unit testing with jsdom environment
- Testing Library: User-centric testing utilities
- Playwright: Visual regression testing via Storybook
- ESLint + Stylelint: Code quality enforcement
- Prettier: Consistent code formatting

**AI & Automation**

- MCP (Model Context Protocol): GitHub, Figma, Context7, TypeScript LSP
- Linear API: Programmatic issue management
- Sentry REST API: Observability queries and dashboards
- Claude Code: Custom commands and hooks for AI pair programming

## 📱 Component Features

### Native Share Integration

The `SocialShare` component implements progressive enhancement with the Web Share API:

**Native Share Support**

- Detects Web Share API availability on mobile devices
- Provides seamless sharing via device native share sheet
- Falls back gracefully to clipboard copying when unavailable

**Responsive Design**

- Icon-only mode on mobile devices for compact display
- Full button text on desktop environments
- Proper alignment with other social media icons

**Progressive Enhancement**

- Feature detection for `navigator.share` availability
- Automatic fallback to clipboard copy functionality
- Error handling for share failures with retry mechanism

**Accessibility**

- ARIA labels for both native share and copy actions
- Keyboard navigation support
- Screen reader friendly with appropriate role attributes

**Browser Support**

- Modern mobile browsers: Native share functionality
- Desktop browsers: Clipboard copy fallback
- Legacy browsers: Standard clipboard copy behavior

The implementation follows Web Share API best practices with proper error handling and provides a consistent user experience across all device types.

## ⚙️ Testing & Quality

### Testing Stack

```bash
npm test                         # Run all tests
npm run test:watch               # Watch mode
npm run test:coverage            # Generate coverage reports
npm run test:a11y                # Accessibility testing
npm run test:visual              # Visual regression tests
npm run test:visual:update       # Update visual baselines
```

**Test Suite Coverage**:

- **Unit Tests**: Component behavior, props, state management (>80% coverage requirement)
- **Integration Tests**: Chat workflows, email forms, navigation patterns
- **Accessibility Tests**: axe-core on all pages and Storybook stories
- **Visual Regression**: Playwright screenshots via Storybook test-runner
- **Translation Coverage**: Ensures all i18n keys exist in EN/FI/SV

**Testing Libraries**:

- Vitest + jsdom: Fast unit testing with React support
- Testing Library: User-centric component testing
- axe-core: Automated accessibility auditing
- Playwright: Visual regression and E2E capabilities

### Code Quality

```bash
npm run lint                     # ESLint + Stylelint
npm run lint:fix                 # Auto-fix linting issues
npm run format                   # Prettier formatting
npm run typecheck                # TypeScript validation
```

**Quality Standards**:

- ESLint: TypeScript strict mode, React best practices, a11y rules
- Stylelint: CSS Modules standards, logical properties enforcement
- Prettier: 2-space indentation, single quotes, trailing commas
- TypeScript: No implicit any, strict null checks, unused variables blocked

### Observability

**Sentry Integration**:

```bash
npm run sentry:issues            # Query unresolved issues
npm run sentry:releases          # List recent releases
npm run generate:sentry-summary  # Generate JSON summary
```

**MCP Testing**:

```bash
npm run github:mcp:test          # Test GitHub MCP connectivity
npm run figma:mcp:test           # Test Figma MCP connectivity
npm run ts:mcp:status            # Validate TypeScript LSP
```

### Component Development

**Storybook**:

```bash
npm run storybook                # Launch Storybook dev server
npm run build-storybook          # Build static Storybook
npm run storybook:deploy         # Deploy to GitHub Pages
```

**WIP Badge System**:

- All stories display a localized "Work in Progress" badge by default
- Badge removed via `parameters: { wip: { disabled: true } }` after passing:
  - ✅ Accessibility tests (axe-core violations = 0)
  - ✅ Visual regression (no unexpected diffs)
  - ✅ Translation coverage (all keys in EN/FI/SV)

## 🌐 Internationalization

The site supports three languages with complete translation coverage:

- **English (EN)**: Primary language with full content
- **Finnish (FI)**: Native language support
- **Swedish (SV)**: Regional language support

**Structure**:

- Translation files: `nextjs-app/shared/locales/{en,fi,sv}/translation.json`
- Namespace organization for maintainability
- 100% coverage requirement enforced by tests

**Usage**:

- Always wrap user-facing text with `useTranslation()` hook
- Use nested object notation like `"navigation.home"` for organization
- Update all three locale files simultaneously before merging

## 🔐 Security & Performance

**Security Measures**:

- Password-protected content delivery
- Environment-based configuration with `.env.local` (gitignored)
- CORS-enabled API endpoints with strict origin validation
- Sanitized user inputs and XSS protection
- No secrets in version control (see `.gitignore`)

**Performance Optimizations**:

- Code splitting with dynamic imports and React.lazy()
- Image optimization and lazy loading
- Service worker caching strategy (Vite app)
- Bundle analysis and tree shaking
- Compressed asset delivery with Brotli/Gzip
- Aggressive filename hashing for cache busting

## 🚀 Build & Deployment

### Production Builds

**Next.js App**:

```bash
npm run build                    # Build Next.js app (production)
npm run start                    # Start Next.js production server
```

**Vite App** (legacy):

```bash
npm run build                    # Vite production build
npm run preview                  # Preview Vite production build
npm run cache-bust               # Manual cache busting
```

### Deployment Strategy

**Hybrid Deployment**:

- **Vercel**: Hosts Next.js app + serverless API functions
  - Automatic deployments from `main` branch
  - Environment variables managed in Vercel dashboard
  - Edge functions for auth, API routes, webhooks

- **GitHub Pages**: Hosts legacy Vite app + Storybook
  - Manual deployment via `npm run deploy`
  - Custom domain: `digitaltableteur.com`
  - Aggressive cache busting with hashed filenames

**Deployment Commands**:

```bash
npm run deploy                   # Deploy Vite app to GitHub Pages
npm run deploy-with-storybook    # Deploy with visual diff report
npm run storybook:deploy         # Deploy Storybook standalone
npm run generate:sitemap         # Generate sitemap.xml
```

### Cache Strategy

**Vite Build**:

- Automatic filename hashing for JS/CSS assets
- Manual cache-bust script adds version metadata
- `.nojekyll` file prevents GitHub Pages Jekyll processing

**Next.js Build**:

- Built-in asset hashing and optimization
- `Cache-Control` headers configured via `next.config.ts`
- Vercel CDN handles cache invalidation

### Environment Variables

**Production (Vercel)**:

- All secrets stored in Vercel project settings
- Separate preview/production environments
- Automatic NEXT*PUBLIC* prefix for client-side vars

**Production (GitHub Pages)**:

- Public environment variables in GitHub Secrets
- Deploy workflow injects variables at build time
- No server-side secrets (static hosting only)

## 🚀 CI/CD Pipeline

**GitHub Actions**:

- **Automated Testing**: ESLint, Stylelint, and Vitest on every PR
- **Preview Deployments**: Automatic staging environments for pull requests
- **Production Deployment**: Automated builds and cache busting

**Branch Protection**:

- Required status checks for code quality
- 1 approval required for `main` branch
- Squash commits on merge
- Delete branch after merge

## 🤝 Contributing

### Development Guidelines

- **TypeScript**: Use strict typing for all new components and functions
- **CSS Modules**: Follow existing pattern with design tokens (never inline styles)
- **Internationalization**: Add translations for all user-facing text (EN/FI/SV)
- **Component Creation**: Always read `docs/LLM_COMPONENT_GENERATION_RULES.md` first
- **Storybook**: Include `.stories.tsx` for every component
- **Testing**: Maintain >80% test coverage, include accessibility tests
- **Documentation**: Update CLAUDE.md, AGENTS.md, README.md, and copilot-instructions.md together

### Workflow

1. **Fork** the repository
2. **Create Branch**: Follow naming convention from `docs/BRANCH_NAMING.md`
   ```bash
   git checkout -b DT-XXX-feat-description
   ```
3. **Develop**: Make changes following conventions above
4. **Quality Checks**:
   ```bash
   npm run typecheck && npm run lint && npm test && npm run build
   ```
5. **Commit**: Use Conventional Commits format
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push**: Push to your branch
   ```bash
   git push origin DT-XXX-feat-description
   ```
7. **Pull Request**: Open PR with detailed description
8. **Review**: Address feedback and ensure CI passes
9. **Merge**: Squash commits on merge, delete branch after

### Pre-commit Checklist

Before creating a PR:

- ✅ All tests passing (`npm test`)
- ✅ No TypeScript errors (`npm run typecheck`)
- ✅ No linting issues (`npm run lint`)
- ✅ Production build succeeds (`npm run build`)
- ✅ Translation coverage complete (EN/FI/SV)
- ✅ Storybook stories added for new components
- ✅ Visual baselines updated if UI changed (`npm run test:visual:update`)
- ✅ Documentation updated (README, CLAUDE.md, AGENTS.md)

## 📁 Folder overview

- **src/** – application source code
- **public/** – static assets and the HTML template
- **.storybook/** – Storybook configuration files
- **dist/** – compiled production build (generated after running `npm run build`)
- **node_modules/** – project dependencies installed via npm

## 📚 Learn More

### Project Documentation

**AI Documentation System**:

- [Migration Guide](AI-DOCUMENTATION-MIGRATION-GUIDE.md) - Complete guide to CLAUDE.md/AGENTS.md hierarchy
- [System Summary](AI-DOCUMENTATION-SYSTEM-SUMMARY.md) - Statistics and file overview
- [Visual Tree](AI-DOCUMENTATION-TREE.txt) - ASCII diagram of documentation structure
- [Root CLAUDE.md](CLAUDE.md) - Comprehensive authority for Claude Code
- [Root AGENTS.md](AGENTS.md) - Quick reference for generic AI agents

**Critical References**:

- [Component Generation Rules](docs/LLM_COMPONENT_GENERATION_RULES.md) - 12,000+ word authority on component creation
- [Critical Reasoning & Planning](docs/LLM-CRITICAL-REASONING-AND-PLANNING-INSTRUCTIONS.md) - Planning workflows
- [Next.js Migration Plan](docs/NEXTJS_MIGRATION_PLAN.md) - Vite → Next.js migration strategy
- [Linear Automation](docs/LINEAR_AUTOMATION.md) - CLI scripts, AI-enhanced issue intake, MCP integration
- [Linear VS Code Integration](docs/LINEAR_VSCODE_INTEGRATION.md) - Extension setup, hybrid workflows, keyboard shortcuts
- [GitHub MCP Setup](docs/GITHUB_MCP_SETUP.md) - GitHub MCP server configuration
- [Figma MCP Setup](docs/FIGMA_MCP_SETUP.md) - Figma MCP server configuration

**Setup & Guides**:

- [Storybook Deployment](docs/STORYBOOK_DEPLOYMENT.md) - Visual regression setup
- [EmailJS Setup](docs/EMAILJS_SETUP.md) - Contact form configuration
- [Branch Naming](docs/BRANCH_NAMING.md) - Branch naming conventions
- [Sanity Migration](docs/SANITY_MIGRATION.md) - Blog migration workflow

### Technology Documentation

**Frontend**:

- [React 19](https://react.dev/) - UI framework
- [Next.js 16](https://nextjs.org/) - React framework with App Router
- [Vite](https://vitejs.dev/) - Build tool and development server
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [React Router](https://reactrouter.com/) - Client-side routing (Vite app)

**Styling & Design**:

- [CSS Modules](https://github.com/css-modules/css-modules) - Scoped CSS
- [Storybook](https://storybook.js.org/) - Component development
- [Figma](https://www.figma.com/) - Design files and tokens

**Internationalization**:

- [i18next](https://www.i18next.com/) - i18n framework
- [react-i18next](https://react.i18next.com/) - React bindings

**Testing & Quality**:

- [Vitest](https://vitest.dev/) - Unit testing
- [Testing Library](https://testing-library.com/) - Component testing
- [Playwright](https://playwright.dev/) - Visual regression
- [axe-core](https://github.com/dequelabs/axe-core) - Accessibility testing

**Backend & Deployment**:

- [Vercel](https://vercel.com/docs) - Next.js hosting + serverless
- [GitHub Pages](https://pages.github.com/) - Static site hosting
- [Sanity](https://www.sanity.io/docs) - Headless CMS
- [Sentry](https://docs.sentry.io/) - Error tracking

**Automation & AI**:

- [Linear API](https://developers.linear.app/) - Issue management
- [MCP](https://modelcontextprotocol.io/) - Model Context Protocol
- [Claude Code](https://claude.ai/) - AI pair programming

## ✉️ Chat Email Workflow

The Chat interface includes a guided, multi-step email composition workflow triggered by natural phrasing. Two trigger paths exist:

1. General intent (e.g. “Send email”, “Help me send an email” / FI / SV variants) → assistant injects localized `chatEmailSendPhrase` and invites composition.
2. Simple keyword (standalone "email" / "sähköposti" / "epost") → assistant injects localized `chatEmailSimplePhrase`, reveals `mail@digitaltableteur.com`, then asks if you want to start composing.

Both converge to the same reducer-driven flow; only initial phrasing differs. The simple path uses an anchored regex so incidental mentions ("I like email workflows") are ignored.

### Trigger & Detection

`messageProcessor.ts` sets one of two pending flags (`pendingEmailWorkflowGeneral` or `pendingEmailWorkflowSimple`) based on multilingual regex matches. `ChatWidget` consumes exactly one flag on the next assistant turn, injects the phrase key (`chatEmailSendPhrase` or `chatEmailSimplePhrase`), mounts workflow UI inline, then resets the flag.

### State Machine Overview

Reducer file: `src/components/ChatWidget/emailWorkflow/reducer.ts`
Types: `src/components/ChatWidget/emailWorkflow/types.ts`

States (simplified):

- `idle` – Workflow not active
- `compose` – Initial free-form intent capture (subject / purpose)
- `fields` – Sequential structured field collection (name, email, phone (optional), message body)
- `review` – User reviews aggregated draft, can edit any field
- `sending` – Async submission in progress (aria-busy applied)
- `success` – Confirmation + summary displayed
- `error` – Error state with retry and edit options

Transitions are deterministic and validated; editing returns to `fields` with preserved data. Cancellation cleanly resets to `idle`.

### Components

- `ComposePrompt` – Captures initial intent/subject
- `FieldPrompt` – Renders current required field input with validation hints
- `ReviewSummary` – Summarizes all collected fields before send
- `SendStatus` – Displays sending, success, or error feedback

All components are in `src/components/ChatWidget/emailWorkflow/` and follow the standard pattern with `.stories.tsx` and `.test.tsx` coverage. Styling leverages existing design tokens and CSS Modules; accessible labels and descriptions use i18n keys.

### Validation & Service Abstractions

- `contactValidation.ts` – Shared field validators (name, email format, message length, optional phone)
- `contactEmailService.ts` – EmailJS send wrapper that throws typed errors (`EmailServiceError`) enabling granular retry messaging

### Environment Variables

Add the following to your development `.env` (prefixed for Vite):

```
VITE_EMAILJS_SERVICE_ID=<your_service_id>
VITE_EMAILJS_TEMPLATE_ID=<your_template_id>
VITE_EMAILJS_PUBLIC_KEY=<your_public_key>
```

These are used by the workflow and by the traditional contact form. Missing variables gracefully prevent send actions (error state surfaced to user).

### Internationalization

All user-visible workflow text uses the `emailWorkflow.*` key prefix (e.g. `emailWorkflow.compose.heading`, `emailWorkflow.fields.name.label`, `emailWorkflow.status.success.title`). Ensure additions update all three locale files (`en`, `fi`, `sv`) before merging—translation coverage tests will fail otherwise.

### Accessibility

- Each prompt uses semantic form controls and associates labels via `htmlFor`
- Sending state applies `role="status"` + `aria-busy="true"` with localized progress text
- Error state exposes retry action with clear focus order and no keyboard traps
- Review list uses structured markup (definition list or grouped paragraphs) for screen reader clarity

### Testing Expectations

- Reducer unit tests: all major transitions (compose -> fields -> review -> sending -> success/error) including edit & cancel
- Integration tests: general path (`emailWorkflow.integration.test.tsx`) and simple keyword path (`emailWorkflow.simpleTrigger.test.tsx`)
- i18n coverage: all `emailWorkflow.*` keys present across locales
- Visual regression: Storybook snapshots for each state (update intentionally when layout changes)
- Accessibility tests: no axe violations in workflow stories and pages

### Extension Guidelines

To extend with additional fields or optional attachments:

1. Add new field to `EmailDraft` type and validators
2. Insert field step logic into reducer (order matters for progression)
3. Localize new strings under `emailWorkflow.fields.<fieldName>.*`
4. Update `ReviewSummary` rendering & tests
5. Refresh visual baselines and translation coverage

Prefer additive changes over altering existing field semantics to avoid breaking previously localized content.

### Maintenance

Any architectural or trigger behavior changes MUST update this README, `.github/copilot-instructions.md`, `CLAUDE.md`, and `docs/donny-chat.md` together.

## 🛡️ Observability Automation

Automated scripts produce lightweight JSON artifacts consumed by UI components (e.g., summary cards) and Storybook dashboards without live API calls at render time:

- Sentry Summary: `public/observability/sentry-summary.json` (generated via `scripts/generate-sentry-summary.mjs` or `scripts/sentry-mcp.js` commands)
- TypeScript MCP Status: `public/observability/ts-mcp-status.json` (generated via `scripts/ts-mcp-automation.mjs`)

### Commands

```
npm run ts:mcp:status       # Perform LSP handshake and write status JSON
npm run ts:mcp:status:stub  # Force stub status JSON (no handshake)
```

The Sentry summary script runs with project + filter options (unresolved production issues). A stub mode is available when credentials are absent; UI distinguishes stub data via a badge.

### Integration Notes

- `SentrySummaryCard` reads and renders Sentry JSON with localized loading/error/empty states
- Future observability components should follow the same decoupled pattern: build-time or on-demand JSON generation + pure rendering
- Keep translation keys (`observability.sentry.*`, future `observability.ts.*`) synchronized across locales

### Maintenance Requirement

Whenever observability schemas evolve (new fields, renamed properties) update README, `.github/copilot-instructions.md`, and `CLAUDE.md` concurrently. Tests must be added or adjusted to cover new states (e.g., stub detection, additional metadata rendering).

## 🤖 MCP Tooling

Donny’s serverless chat handler automatically loads every MCP server declared in `mcp.json`. In addition to the local TypeScript language server and Sentry helper, the repository now includes the hosted [Context7 MCP server](https://github.com/upstash/context7) so assistant prompts can pull the latest framework/library docs without leaving the conversation.

- `mcp.json` → `"context7"` entry points at `https://mcp.context7.com/mcp` and sends the `Context7-API-Key` header (value resolved from `CONTEXT7_API_KEY`). Leave the env unset for anonymous/low-rate usage.
- A convenience runner is available for local debugging:  
  `npm run context7:mcp -- [optional flags]`
  - Append `--remote-check` to ping the hosted Context7 MCP endpoint. The helper automatically injects the `Context7-API-Key` header using `CONTEXT7_API_KEY`.
- Set `CONTEXT7_API_KEY` in `.env.local` or your shell profile (the secret lives in Vercel’s project envs) to benefit from higher rate limits and private library access. The script automatically injects the key unless you pass `--api-key` manually.
- The REST API that powers Context7 lives at `https://context7.com/api/v1`; use that base URL whenever you need to inspect account status or manage keys outside the dashboard.

`api/donny-tools.ts` names each tool as `<server>.<toolName>`, so Context7 capabilities appear under the `context7.*` namespace when connected. This keeps downstream prompts explicit and makes it easy to disable the server by removing the config block if needed.

### GitHub MCP Server

The [official GitHub MCP Server](https://github.com/github/github-mcp-server) provides AI tools with direct access to GitHub's platform capabilities.

- `mcp.json` → `"github"` entry points at `https://api.githubcopilot.com/mcp/` and sends the `Authorization: Bearer` header (value resolved from `GITHUB_MCP_PAT`)
- **Setup Required**: Create a GitHub Personal Access Token at [GitHub Settings](https://github.com/settings/personal-access-tokens/new) and set `GITHUB_MCP_PAT` environment variable
- **Available Toolsets**: Repository operations, issue management, pull requests, GitHub Actions, code security, and more
- Test your configuration: `npm run github:mcp:test`
- Comprehensive setup guide: [docs/GITHUB_MCP_SETUP.md](docs/GITHUB_MCP_SETUP.md)

**Capabilities include:**

- Repository browsing and file operations
- Issue and pull request management
- GitHub Actions workflow monitoring
- Code security analysis and Dependabot alerts
- Team collaboration and organization management

GitHub capabilities appear under the `github.*` namespace when connected, maintaining the same explicit tool naming pattern.

### Figma MCP Server

The [figma-developer-mcp](https://www.npmjs.com/package/figma-developer-mcp) provides AI tools with direct access to Figma's design platform for design-to-code workflows.

- `mcp.json` → `"figma-developer-mcp"` entry runs as SSE server at `http://localhost:3333/sse`
- **Setup Required**: Create a Figma Personal Access Token at [Figma Settings](https://www.figma.com/settings) and set `FIGMA_TOKEN` environment variable
- **Server Management**: Start with `npx figma-developer-mcp` before using MCP features
- Test your configuration: `npm run figma:mcp:test`
- Comprehensive setup guide: [docs/FIGMA_MCP_SETUP.md](docs/FIGMA_MCP_SETUP.md)

**Capabilities include:**

- Design file analysis and component extraction
- Asset downloading and design token extraction
- Design system documentation and consistency checking
- Design-to-code generation and implementation guidance
- Collaborative design workflow integration

Figma capabilities appear under the `figma.*` namespace when connected, enabling AI assistants to interact with your design files and generate implementation code directly from Figma designs.

### Additional Docs

- [Branch Naming Guidelines](docs/BRANCH_NAMING.md)
