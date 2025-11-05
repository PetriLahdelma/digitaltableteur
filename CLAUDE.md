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
- Every Storybook story displays a persistent WIP badge (localized) until the story explicitly opts out via `export const ... = { parameters: { wip: { disabled: true }}}`. Use this to signal audit readiness. Removing the badge should coincide with accessibility + visual + translation verification.

## Architecture Notes

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: CSS Modules with design tokens
- **Routing**: React Router with lazy loading
- **I18n**: i18next with namespace organization
- **Testing**: Vitest with coverage reporting
- **Deployment**: GitHub Pages with Vercel serverless functions

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
