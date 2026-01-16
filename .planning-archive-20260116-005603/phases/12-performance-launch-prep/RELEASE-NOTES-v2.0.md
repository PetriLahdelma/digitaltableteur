# Release Notes - Digitaltableteur v2.0

**Release Date:** January 2026
**Code Name:** Phoenix
**Branch:** `DT-153-feat/CLAUDE-md-UPDATE`

---

## Overview

Version 2.0 represents a complete rebuild of the Digitaltableteur platform on modern technologies. This release migrates from Vite/React to Next.js 15 with React 19, implements a comprehensive design system, and establishes production-ready infrastructure.

---

## Highlights

### New Technology Stack

- **Next.js 15** with App Router for server-side rendering and routing
- **React 19** with new concurrent features and improved performance
- **Tailwind CSS 4** for utility-first styling
- **TypeScript 5.9** with strict mode enabled
- **Storybook 10** for component development and documentation

### Design System

- 80+ reusable UI components
- CSS Modules with design tokens
- Dark/light theme support with system preference detection
- Responsive design across all breakpoints
- WCAG 2.1 AA accessibility compliance

### Internationalization

- Full support for English (EN), Finnish (FI), and Swedish (SV)
- 947 translation keys with 100% coverage
- Language persistence across sessions
- Automated translation validation

### Performance Optimizations

- Next.js Image optimization for automatic WebP/AVIF conversion
- Code splitting with dynamic imports
- Font subsetting with `next/font`
- Critical CSS inlining
- Lazy loading for below-fold content

---

## New Features

### Pages

- **Home** - Redesigned hero with gradient animations, services grid
- **About** - Personal bio with interactive elements
- **Work/Portfolio** - Case studies with rich media
- **Blog** - MDX-powered articles with syntax highlighting
- **Contact** - Form with real-time validation and honeypot protection
- **Privacy Policy** - GDPR-compliant with data practices disclosure
- **Accessibility Statement** - WCAG compliance documentation
- **AI Use Policy** - Transparency on AI assistance

### Components

- `Button` - Multiple variants (primary, secondary, tertiary, semantic states)
- `Card` - Flexible card layout with image support
- `Modal` - Accessible dialog with focus trapping
- `Toast` - Notification system with auto-dismiss
- `Title/Text` - Typography components with semantic HTML
- `Input/Select/TextArea` - Form primitives with validation
- `Icon` - SVG icon system with 50+ icons
- `Badge` - Status indicators with removable option
- `ThemeProvider` - Global theme management
- And 70+ more...

### Integrations

- **Sanity CMS** - Headless content management
- **EmailJS** - Contact form delivery
- **OpenAI** - AI chat widget (optional)
- **Sentry** - Error tracking and monitoring
- **Google Analytics** - Privacy-respecting analytics
- **Vercel** - Deployment and hosting

---

## Breaking Changes

### Migration from Vite

Projects using the legacy Vite app (`/src` directory) should migrate to the Next.js app. The Vite configuration remains for backward compatibility during transition.

### API Routes

API endpoints have moved from `/api-legacy-vercel-functions` to Next.js App Router routes in `/app/api/`:

| Old Path | New Path |
|----------|----------|
| `/api/chat` | `/app/api/chat/route.ts` |
| `/api/contact` | `/app/api/contact/route.ts` |
| `/api/gdpr/*` | `/app/api/gdpr/*/route.ts` |

### Component Imports

Import paths have changed for design system components:

```tsx
// Old
import { Button } from 'src/components/Button';

// New
import { Button } from '@dt/Button';
// or
import { Button } from 'nextjs-app/shared/components/Button';
```

---

## Known Issues

See [KNOWN-ISSUES.md](./KNOWN-ISSUES.md) for detailed tracking.

**Critical:**
- Production build requires `--legacy-peer-deps` due to Sanity/React 19 peer dependency conflict

**High:**
- Visual regression tests may be flaky in CI (re-run on failure)

---

## Upgrade Instructions

### For Developers

1. Pull latest from `main` branch
2. Run `npm install --legacy-peer-deps`
3. Run `npm run typecheck && npm run lint && npm test`
4. Start dev server: `npm run dev`

### Environment Variables

Ensure these variables are set in `.env.local`:

```env
# Required
NEXT_PUBLIC_GA_ID=your-ga-id
CV_PASSWORD=your-cv-password

# Optional (for full functionality)
OPENAI_API_KEY=your-openai-key
MONGODB_URI=your-mongodb-uri
SENTRY_DSN=your-sentry-dsn
```

---

## Dependencies

### Added
- `next@15.x`
- `react@19.x`
- `tailwindcss@4.x`
- `@ai-sdk/react`
- `@sanity/image-url`
- `framer-motion`
- `i18next`
- `react-i18next`

### Updated
- `typescript@5.9`
- `eslint@9.x`
- `vitest@3.x`

### Removed
- `vite` (moved to devDependencies)
- Legacy routing packages

---

## Testing

### Test Coverage

| Type | Status |
|------|--------|
| TypeScript | Pass |
| ESLint | Pass |
| Stylelint | Pass |
| Unit Tests | Pass (with browser mode caveats) |
| Translation Coverage | 100% |
| Accessibility | WCAG 2.1 AA |

### Commands

```bash
npm run typecheck          # TypeScript
npm run lint               # ESLint
npm test                   # Vitest
npm run validate:translations  # i18n coverage
npm run verify:pages       # Page rendering (requires server)
```

---

## Documentation

- [CLAUDE.md](/CLAUDE.md) - Development guidelines
- [LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md) - Launch verification
- [KNOWN-ISSUES.md](./KNOWN-ISSUES.md) - Issue tracking
- [docs/LLM_COMPONENT_GENERATION_RULES.md](/docs/LLM_COMPONENT_GENERATION_RULES.md) - Component standards

---

## Contributors

- **Development:** Digitaltableteur Team
- **AI Assistance:** Claude Opus 4.5

---

## What's Next

### v2.1 (Planned)

- Google Analytics Consent Mode v2 integration
- Enhanced blog search and filtering
- Portfolio project detail pages
- Performance monitoring dashboard

### v3.0 (Roadmap)

- Multi-tenant support
- CMS integration improvements
- Advanced animation system
- Mobile app companion

---

*This release notes document was generated as part of Phase 12-2 Launch Preparation.*
