# Claude AI Assistant

This file serves as a reference for Claude AI interactions with the Digitaltableteur project.

## Project Context

Digitaltableteur is a modern React TypeScript portfolio website built with Vite, featuring:

- Multi-language support (EN/FI/SV)
- Responsive design with CSS Modules
- Component library with Storybook
- Secure CV download functionality
- Blog platform with SEO optimization
- Contact form integration

## Development Guidelines

When working with this project, please:

- Use TypeScript for all new components
- Follow the existing CSS Modules pattern
- Add translations for user-facing text in all three languages
- Include Storybook stories for new components
- Maintain test coverage for critical functionality
- Use the `@dt/` component library when available
- Keep Storybook visual regression baselines current and review diffs before merging

## Architecture Notes

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: CSS Modules with design tokens
- **Routing**: React Router with lazy loading
- **I18n**: i18next with namespace organization
- **Testing**: Vitest with coverage reporting
- **Deployment**: GitHub Pages with Vercel serverless functions

### Chat Markdown Support

Assistant and user messages are rendered as GitHub-flavored Markdown using `react-markdown` and `remark-gfm` within a dedicated `MarkdownMessage` component. Raw HTML is skipped for safety; links are annotated with `rel="noopener noreferrer"`. Extend this component to add syntax highlighting or sanitized HTML if future requirements emerge.

### Dynamic Component Injection Architecture

Dynamic parsing lives in the pure transformer `src/components/ChatWidget/messageProcessor.ts` which converts raw `UIMessage` objects into `ProcessedMessage` parts consumed by `ChatMessages.tsx`.

Supported assistant-only injections:

- Explicit token `[[openHours]]` – splits text and interleaves `<OpenHours compact />` wherever placed.
- Heuristic open hours mention – appends `<OpenHours compact />` once if token absent.
- Explicit token `[[servicesGrid]]` – injects a single `<ServicesGrid />` (first token only) interleaved with surrounding text.
- Heuristic services mention – appends `<ServicesGrid />` once if no explicit token was used.

User messages: any occurrence of `[[openHours]]` or `[[servicesGrid]]` is stripped; no component injection (prevents privilege escalation).

Reinstatement note: `[[servicesGrid]]` + heuristic were previously removed but restored to provide contextual summaries of core offerings when the assistant deems it helpful.

Extending further:
1. Add token & heuristic branch in `messageProcessor.ts` returning `{ kind: "component", name: "YourComponent" }`.
2. Add render case in `ChatMessages.tsx` switch.
3. Create unit tests (`messageProcessor.test.tsx`) and integration tests (`ChatMessages.<component>.test.tsx`).
4. Ensure translations & Storybook story exist; refresh visual baselines if layout changes.

## Common Tasks

- Start dev server: `npm run dev`
- Run Storybook: `npm run storybook`
- Build for production: `npm run build`
- Run tests: `npm test`
- Lint code: `npm run lint`
- Run accessibility checks: `npm run test:a11y`
- Execute visual regression tests: `npm run test:visual`
- Update visual baselines after intentional UI changes: `npm run test:visual -- --updateSnapshot`

## File Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Route components
- `src/locales/` - Translation files
- `src/styles/` - Global styles and variables
- `public/` - Static assets

## Workflow requirements

– Update CLAUDE.md with everyt git commit

## Visual Regression Testing

- Storybook visual regression tests capture per-story screenshots via Playwright and compare them with `pixelmatch` snapshots stored in `__visual__/snapshots/__reference__`.
- Failing snapshots generate diff assets under `__visual__/diffs/__diff_output__`. Running `npm run test:visual` refreshes the public `visual-diff/report.json` consumed by Storybook.
- The “Overview / Test Health Overview” story displays current diff thumbnails and shows a placeholder message when no changes are detected.
