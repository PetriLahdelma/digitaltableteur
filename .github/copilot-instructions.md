# Copilot Instructions for Digitaltableteur

## Workflow Requirements

- Prefer sans-serif fonts for body text and serif fonts for headings
- Maintain consistent spacing and layout using design tokens defined in `variables.css`
- Adhere to accessibility standards: semantic HTML, ARIA roles, keyboard navigation
- Write unit tests for all new components and features
- Ensure 100% translation coverage for all user-facing text
- Update DONNY-CHAT.md with any changes to development practices or architecture with every git commit
  – Update CLAUDE.md with any changes to development practices or architecture with every git commit
- Update copilot-instructions.md with any changes to development practices or architecture with every git commit
- Refresh Storybook visual regression assets (`npm run test:visual`) whenever UI changes affect component rendering
- Ensure all new components have Storybook stories and accessibility tests
- Follow i18n practices for all user-facing text
- Do not generate new colour varriables unless spefifically requested to do so

## Project Architecture

This is a **React TypeScript portfolio website** built with Vite, featuring multi-language support and serverless functions. The architecture follows a component-driven approach with CSS Modules and a comprehensive design system.

### Key Patterns

- **Component Structure**: Every component follows the pattern: `ComponentName/ComponentName.tsx`, `ComponentName.module.css`, `ComponentName.stories.tsx`, `ComponentName.test.tsx`, `index.ts`
- **Import Alias**: Use `@dt/ComponentName` instead of relative imports (configured in `vite.config.ts`)
- **Lazy Loading**: All page components are lazy-loaded in `App.tsx` for optimal performance
- **CSS Modules**: Styling uses CSS Modules with design tokens, never inline styles

## Internationalization (i18n)

- **3 Languages**: English (default), Finnish, Swedish
- **Structure**: `src/locales/{en,fi,sv}/translation.json`
- **Usage**: Always wrap user-facing text with `useTranslation()` hook
- **Keys**: Use nested object notation like `"navigation.home"` for organization

## Development Workflow

### Critical Commands

```bash
npm run dev           # Development server with HMR
npm run storybook     # Component development and testing
npm run build         # Production build
npm run deploy        # Deploy to GitHub Pages
npm run deeploy-with-storybook  # Deploy with Storybook visual diffs
npm test              # Run all tests including accessibility
npm run test:a11y     # Specific accessibility testing
npm run cache-bust    # Manual cache busting for deployment
npm run test:visual   # Run visual regression tests
npm run check-title-case.js  # Ensure proper title casing in headings
npm run generate-alt-text.js  # Generate alt text for images
npm run generate-llms-txt.js  # Generate alt text using LLM
npm run generate-sitemap  # Generate sitemap.xml
npm run genrate-visual-report  # Generate visual regression report
npm run lint         # Lint codebase
npm run format       # Format codebase with Prettier
npm run eslint-fix   # Auto-fix linting issues
```

### Serverless Functions

- **Location**: `/api/` directory (Vercel functions)
- **CORS**: All functions use `cors.js` for cross-origin handling
- **Available APIs**: OpenAI chat, contact form, secure CV download
- **Security**: Environment variables for API keys and secrets

## Component Development

### Storybook Integration

- Every component **must** have a `.stories.tsx` file
- Stories serve as both documentation and testing
- Use the Kitchen Sink story pattern for comprehensive examples

### Accessibility Requirements

- All components tested with `axe-core` in `accessibility-pages.test.tsx`
- Use semantic HTML and proper ARIA attributes
- Test with `npm run test:a11y` before committing

### Testing Strategy

- **Unit Tests**: Component behavior and props
- **Accessibility Tests**: Automated a11y checks on all pages and stories
- **Translation Coverage**: Ensures all user-facing text is internationalized
- **Visual Regression**: `npm run test:visual` captures Storybook screenshots; update baselines with `npm run test:visual -- --updateSnapshot` when UI changes are intentional
- **Environment**: Vitest with jsdom for React component testing

## Visual Regression Testing

- Visual tests run via the Storybook test runner using Playwright and `pixelmatch`-based snapshot diffing
- Diff artifacts land in `__visual__/diffs/__diff_output__` and are published to `public/visual-diff/report.json`
- The Storybook “Overview / Test Health Overview” story surfaces active visual diffs; when no diffs exist, it renders a placeholder state

## Deployment & Cache Busting

### GitHub Pages + Vercel Hybrid

- **Static Assets**: Deployed to GitHub Pages with aggressive cache busting
- **Serverless Functions**: Deployed to Vercel for API endpoints
- **Cache Strategy**: File hashes in Vite build + manual cache-bust scripts

### Build Process

1. `npm run build` - Vite build with hash-based filenames
2. `npm run cache-bust` - Adds version metadata and .nojekyll
3. `npm run deploy` - Deploys to GitHub Pages with CNAME preservation

## File Organization

- `src/components/` - Reusable UI components (exported via `index.ts`)
- `src/pages/` - Route components with lazy loading
- `src/patterns/` - Layout patterns (Header, Footer)
- `src/locales/` - Translation files per language
- `api/` - Vercel serverless functions
- `scripts/` - Build and deployment automation

## Environment Variables

### Required for Development

- `VITE_GA_ID` - Google Analytics tracking
- `FIGMA_TOKEN` - Design asset synchronization
- `EMAILJS_*` - Contact form integration

### Production Only

- `CV_PASSWORD` - Secure resume download
- `OPENAI_API_KEY` - AI chat functionality

## Code Conventions

- **TypeScript**: Strict mode enabled, use proper typing
- **CSS**: CSS Modules only, no styled-components or CSS-in-JS
- **Imports**: Prefer `@dt/` alias over relative paths
- **Exports**: Default exports for components, named exports for utilities
- **Error Boundaries**: Use `ChunkErrorBoundary` for lazy-loaded components

## Performance Considerations

- **Code Splitting**: Automatic with Vite and React.lazy()
- **Asset Optimization**: Leaflet icons copied to public during build
- **Bundle Analysis**: Vite provides built-in analysis
- **Cache Strategy**: Aggressive filename hashing + manual cache busting
