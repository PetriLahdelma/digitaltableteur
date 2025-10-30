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

## File Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Route components
- `src/locales/` - Translation files
- `src/styles/` - Global styles and variables
- `public/` - Static assets

## Workflow requirements

– Update
