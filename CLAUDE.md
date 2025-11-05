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

Dynamic parsing lives in the pure transformer `src/components/ChatWidget/messageProcessor.ts` converting raw `UIMessage` objects into `ProcessedMessage` parts consumed by `ChatMessages.tsx`.

Current model: USER-triggered only (assistant heuristics disabled).

Flow:

1. User message scanned for explicit tokens `[[openHours]]`, `[[servicesGrid]]` OR multilingual heuristic keywords (EN/FI/SV for hours/services).
2. If matched, a pending flag (openHours / services) is set; user text is sanitized (tokens removed, keywords retained for transparency).
3. The NEXT assistant message consumes pending flags: assistant text is sanitized (token + first matching keyword removed) and the appropriate component(s) appended (`<OpenHours compact />`, `<ServicesGrid />`).
4. Flags reset after consumption; assistant cannot self-trigger by echoing keywords/tokens.

Assistant sanitization ensures that when a component is injected, duplicate leading semantic phrases (e.g., “Aukioloajat”, “Öppettider”, “Open hours”, “Palvelut”, “Tjänster”, “Services”) and any raw tokens are removed from the assistant's visible text, leaving the component as the singular representation.

Multilingual keyword coverage (user role only now):

- Open hours EN: open hours, business hours, closing time, opening time, hours of operation, operating times
- Open hours FI: aukioloajat, aukioloaika, sulkemisaika, avaamisaika, tänään auki
- Open hours SV: öppettider, öppet, stängningstid, öppningstid, dagens öppettider
- Services EN: services, capabilities, offerings, what do you offer, what services do you provide
- Services FI: palvelut, palveluja, palveluita, mitä tarjoatte, palvelunne
- Services SV: tjänster, era tjänster, vad erbjuder ni, erbjudanden

Security:

- User tokens stripped before rendering.
- Only whitelisted component names rendered.
- Single assistant reply per trigger prevents replay.

Extending further:

1. Add new token + regex to user trigger block in `messageProcessor.ts`.
2. Introduce pending flag and consumption logic.
3. Append component in assistant branch with sanitization.
4. Update `ChatMessages.tsx` render switch.
5. Add unit + integration tests; refresh visual baselines if UI shifts.
6. Provide translations and Storybook story.

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
