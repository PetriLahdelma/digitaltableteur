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

Digitaltableteur is a modern React TypeScript portfolio website built with Vite, featuring internationalization,
responsive design, secure content delivery, and a comprehensive design system. The project showcases creative work,
technical articles, and provides multi-language support across English, Finnish, and Swedish.

## 🚀 Features

- **Multi-language Support**: Complete i18n implementation with English, Finnish, and Swedish translations
- **Responsive Design**: Mobile-first approach with adaptive layouts for all device sizes
- **Secure CV Download**: Password-protected resume download with real-time validation
- **Design System**: Comprehensive component library with consistent styling and theming
- **Blog Platform**: Dynamic article system with lazy loading and SEO optimization
- **Contact Integration**: EmailJS-powered contact form with validation
- **Performance Optimized**: Vite build system with code splitting and asset optimization
- **Accessibility**: WCAG compliant components with proper ARIA support
- **SEO Ready**: React Helmet integration with dynamic meta tags and sitemap generation

## 🏁 Getting Started

### Prerequisites

- Node.js (recommended: latest LTS version)
- npm or yarn package manager

### Installation

Install dependencies:

```bash
npm install
```

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Configure the following environment variables:

- EmailJS credentials for contact form functionality
- VITE_GA_ID for Google Analytics tracking
- FIGMA_TOKEN for design asset synchronization
- CV_PASSWORD for secure resume download (production only)

## ⚒️ Development

Set `REACT_APP_GA_ID` to your Google Analytics measurement ID if you want to collect usage statistics.

### Start the development server

```bash
npm start
```

```bash
npm run dev
```

The application will be available at http://localhost:5173 with hot module replacement.

### Run Storybook

```bash
npm run storybook
```

Browse components at http://localhost:6006 for isolated development and testing.

### 🏗 Build & Deployment

```bash
npm run build
```

Generates optimized assets in the dist directory with:

Tree-shaken JavaScript bundles
Minified CSS with vendor prefixes
Compressed images and fonts
Service worker for offline caching

### Deployment

```bash
npm run deploy
```

Automatically builds and deploys to GitHub Pages with:

CNAME file configuration for custom domain
Cache busting with content hashes
Dotfiles preservation for GitHub Pages compatibility

## 🔧 Development Tools

### Code Quality

Run all code quality checks with:

```bash
npm run lint
```

Runs comprehensive checks including:

- ESLint: TypeScript and React best practices
- Prettier: Consistent code formatting
- Stylelint: CSS standards with strict color value enforcement

### Testing

```bash
npm test
```

Executes Vitest test suite with:

Component unit tests
Integration testing
Coverage reporting

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
npm run generate:alt-text   # Generate accessibility descriptions
```

## 🏗 Architecture

Frontend Stack

- React 18: Modern React with concurrent features
- TypeScript 5.8: Full type safety and developer experience
- Vite 6.3: Lightning-fast build tooling and HMR
- React Router 7: Client-side routing with lazy loading
- i18next: Internationalization with namespace support
- Framer Motion: Smooth animations and transitions

Styling & Design

- CSS Modules: Scoped styling with consistent naming
- Design Tokens: CSS custom properties for theming
- Responsive Design: Mobile-first with breakpoint system
- Component Library: Reusable @dt/ components with TypeScript

Backend Services

- Vercel Serverless: API endpoints for secure operations
- EmailJS: Contact form email delivery
- GitHub Pages: Static site hosting with custom domain
- Service Worker: Offline caching with Workbox

Security Features

- Password Protection: Secure CV download with API validation
- CORS Configuration: Proper cross-origin resource sharing
- Environment Isolation: Secure credential management
- Content Security: Sanitized user inputs and XSS protection

## 🌐 Internationalization

The site supports three languages with complete translation coverage:

- English (EN): Primary language with full content
- Finnish (FI): Native language support
- Swedish (SV): Regional language support

Translation files are located in locales with namespace organization for maintainability.

## 🔐 Security & Performance

Security Measures

- Password-protected content delivery
- Environment-based configuration
- CORS-enabled API endpoints
- Sanitized user inputs

Performance Optimizations

- Code splitting with dynamic imports
- Image optimization and lazy loading
- Service worker caching strategy
- Bundle analysis and tree shaking
- Compressed asset delivery

## 🚀 CI/CD Pipeline

GitHub Actions

- Automated Testing: ESLint, Stylelint, and Vitest on every PR
- Preview Deployments: Automatic staging environments for pull requests
- Production Deployment: Automated builds and cache busting

Branch Protection

- Required status checks for code quality
- Review requirements for main branch
- Automated preview environments for collaboration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: git checkout -b feature/amazing-feature
3. Commit changes: git commit -m 'Add amazing feature'
4. Push to branch: git push origin feature/amazing-feature
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new components
- Follow the existing CSS Modules pattern
- Add translations for all user-facing text
- Include Storybook stories for new components
- Maintain test coverage for critical functionality

## 📁 Folder overview

- **src/** – application source code
- **public/** – static assets and the HTML template
- **.storybook/** – Storybook configuration files
- **dist/** – compiled production build (generated after running `npm run build`)
- **node_modules/** – project dependencies installed via npm

## 📚 Learn More

### Project Docs

- [Storybook Deployment Guide](docs/STORYBOOK_DEPLOYMENT.md)
- [EmailJS Setup & Troubleshooting](docs/EMAILJS_SETUP.md)

- [Vite Documentation](https://vitejs.dev/) - Build tool and development server
- [React Documentation](https://react.dev/) - Frontend framework
- [React Router](https://reactrouter.com/) - Client-side routing
- [i18next](https://www.i18next.com/) - Internationalization framework
- [Storybook](https://storybook.js.org/) - Component development environment

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
