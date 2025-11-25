# Copilot Instructions for Digitaltableteur

## ⚠️ CRITICAL: Component Creation Rules

**BEFORE creating ANY new component, ALWAYS refer to `docs/LLM_COMPONENT_GENERATION_RULES.md` and `docs/LLM-CRITICAL-REASONING-AND-PLANNING-INSTRUCTIONS.md`**

This comprehensive 10-section guide (12,000+ words) is the authoritative reference for:

1. **Core Architecture & Philosophy** - Design system first, component structure, TypeScript strictness
2. **Styling & CSS Architecture** - CSS Modules, logical properties, design tokens, theme support
3. **Component API Design & Props** - Interface patterns, composition, validation, polymorphic components
4. **Internationalization (i18n)** - 3-language support (EN/FI/SV), translation keys, coverage requirements
5. **React Best Practices & Performance** - Minimal state, useEffect discipline, memoization strategy
6. **Accessibility (a11y) Requirements** - Semantic HTML, ARIA, keyboard navigation, screen reader support
7. **Testing & Quality Assurance** - Vitest + Testing Library, >80% coverage, accessibility testing
8. **Code Quality & Linting** - ESLint, Stylelint, TypeScript, Prettier configuration
9. **Storybook & Documentation** - Story structure, WIP badge system, visual regression
10. **Final Checklist & Template** - Complete pre-commit validation, component generation prompt

**Following these rules ensures every component is consistent, accessible, performant, and production-ready.**

---

## Workflow Requirements

– When creating a new component, ensure it has a corresponding Storybook story and unit tests

- When modifying existing components, update Storybook stories and unit tests as needed
- Always refer to docs/2026_PRD.md for project requirements
- Always refer to docs/2026_ROADMAP.txt for planning, checking long-term goals and progress
- Follow established coding conventions: TypeScript with strict typing, CSS Modules for styling, React functional components with hooks
- Prefer sans-serif fonts for body text and serif fonts for headings
- Maintain consistent spacing and layout using design tokens defined in `variables.css`
- Adhere to accessibility standards: semantic HTML, ARIA roles, keyboard navigation
- Write unit tests for all new components and features
- Ensure 100% translation coverage for all user-facing text
- Update DONNY-CHAT.md with any changes to development practices or architecture with every git commit
  – Update CLAUDE.md with any changes to development practices or architecture with every git commit
- Update copilot-instructions.md with any changes to development practices or architecture with every git commit
- Update README.md with any changes to development practices or architecture with every git commit
- Refresh Storybook visual regression assets (`npm run test:visual`) whenever UI changes affect component rendering
- Prefer CSS logical properties (`margin-inline`, `padding-inline`, `border-inline-start`) over physical directions; convert remaining legacy physical properties when touched.
- Ensure all new components have Storybook stories and accessibility tests
- Storybook stories display a persistent localized WIP badge until a story explicitly opts out via `parameters: { wip: { disabled: true } }`; remove only after accessibility, visual regression, and translation checks pass
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
npm run context7:mcp  # Launch the Context7 MCP server locally (respects CONTEXT7_API_KEY); add --remote-check to ping https://mcp.context7.com/mcp
npm run github:mcp:test  # Test GitHub MCP server configuration and connectivity
npm run figma:mcp:test   # Test Figma MCP server configuration and connectivity
npm run lint         # Lint codebase
npm run format       # Format codebase with Prettier
npm run eslint-fix   # Auto-fix linting issues
```

### Serverless Functions

- **Location**: `/api/` directory (Vercel functions)
- **CORS**: All functions use `cors.js` for cross-origin handling; reference Vercel’s guide when adjusting headers: https://vercel.com/guides/how-to-enable-cors
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
- `src/components/NavMenuList/` - Reusable navigation list abstraction used by `MobileMenu` and future navigational surfaces (encapsulates active route detection, aria-current assignment, styling hooks)
- `src/locales/` - Translation files per language
- `api/` - Vercel serverless functions
- `scripts/` - Build and deployment automation

## Environment Variables

### Required for Development

- `VITE_GA_ID` - Google Analytics tracking
- `FIGMA_TOKEN` - Required for Figma MCP server; Figma Personal Access Token for design file access and analysis
- `EMAILJS_*` - Contact form integration
- `CONTEXT7_API_KEY` - Optional; unlocks higher rate limits for the Context7 MCP runner (managed in Vercel envs, mirrors the `https://context7.com/api/v1` dashboard key and is sent via the `Context7-API-Key` header)
- `GITHUB_MCP_PAT` - Required for GitHub MCP server; GitHub Personal Access Token for repository and API access

### Production Only

- `CV_PASSWORD` - Secure resume download
- `OPENAI_API_KEY` - AI chat functionality

## Code Conventions

- **TypeScript**: Strict mode enabled, use proper typing
- **CSS**: CSS Modules only, no styled-components or CSS-in-JS
- **Imports**: Prefer `@dt/` alias over relative paths
- **Exports**: Default exports for components, named exports for utilities
- **Error Boundaries**: Use `ChunkErrorBoundary` for lazy-loaded components

## Linear Issue Management & Automation (Nov 2025)

### Overview

Linear issues are managed through TypeScript automation scripts located in `scripts/linear/` and library functions in `lib/linear/`. All scripts require `LINEAR_API_KEY` and `LINEAR_TEAM_ID` environment variables in `.env.local`.

### Core Library (`lib/linear/createIssue.ts`)

Provides `createLinearIssue()` function with support for:

- **Title & Description**: Required fields
- **Priority**: 0-3 (P1-P4), where 0=Urgent, 1=High, 2=Medium, 3=Low
- **Labels**: Resolved by name (see `docs/LINEAR_LABELS.md` for available labels)
- **Assignee**: By email (`assigneeEmail`) or ID (`assigneeId`)
- **State**: By name (`stateName`) or ID (`stateId`) - e.g., "In Progress", "Todo", "Done"
- **Project**: Optional `projectId` (defaults to `LINEAR_PROJECT_ID` env var)

**State Support (Added Nov 2025):**

```typescript
await createLinearIssue({
  title: "Implement feature X",
  description: "Detailed description...",
  priority: 1, // P2 (High)
  labelNames: ["design-system", "Improvement"],
  assigneeEmail: "petri@digitaltableteur.com",
  stateName: "In Progress", // New: auto-resolve workflow state
});
```

### Available Scripts

#### Create Issue (Interactive)

```bash
npx tsx scripts/linear/create-issue.ts
```

Interactive CLI wizard that prompts for all fields with validation.

#### Create Issue (Programmatic)

For automated issue creation, create a dedicated script:

```typescript
import {
  createLinearIssue,
  validateLinearEnv,
} from "../../lib/linear/createIssue";

validateLinearEnv();

const result = await createLinearIssue({
  title: "Your issue title",
  description: "Detailed description with markdown support",
  priority: 1,
  labelNames: ["design-system"],
  assigneeEmail: "petri@digitaltableteur.com",
  stateName: "In Progress",
});

console.log(`Created: ${result.identifier} - ${result.url}`);
```

#### Update Issue

```bash
npx tsx scripts/linear/update-issue.ts --issue DIG-16 --state "Done"
npx tsx scripts/linear/update-issue.ts --issue DIG-16 --add-label "ui-app-bug"
npx tsx scripts/linear/update-issue.ts --issue DIG-16 --comment "Completed implementation"
```

Flags:

- `--issue` / `-i`: Issue identifier (e.g., DIG-16)
- `--state` / `-s`: Change workflow state
- `--comment` / `-c`: Add comment
- `--add-label` / `-a`: Add label (repeatable or comma-separated)
- `--remove-label` / `-r`: Remove label (repeatable or comma-separated)

#### Check Issue Details

```bash
npx tsx scripts/linear/check-issue.ts DIG-16
```

Displays current issue state, assignee, priority, labels, and URL.

### Best Practices for LLMs

**When User Requests Ticket Creation:**

1. **Clarify Intent**: If user says "create a ticket", assume they want `stateName: "In Progress"`. If they say "create a todo", use `stateName: "Todo"` or omit state.

2. **Always Set Assignee**: Use `assigneeEmail: "petri@digitaltableteur.com"` by default (project owner).

3. **Choose Appropriate Labels**: Refer to `docs/LINEAR_LABELS.md`:
   - Component work: `design-system`
   - Improvements/enhancements: `Improvement`
   - Bugs: `Bug` or `ui-app-bug`
   - Infrastructure: `automation`, `observability`

4. **Priority Guidelines**:
   - Critical bugs or blockers: P1 (priority: 0)
   - Important features/tasks: P2 (priority: 1)
   - Standard work: P3 (priority: 2)
   - Nice-to-haves: P4 (priority: 3)

5. **Description Format**: Use markdown with:
   - Clear problem statement or goal
   - Acceptance criteria or implementation steps
   - Branch name if applicable
   - Links to related resources

**Example Workflow:**

```typescript
// User: "Create a ticket for implementing X on all pages"
// LLM should create a script or directly call:

const result = await createLinearIssue({
  title: "Implement X component across all pages",
  description: `## Goal\n\nSystematically implement X...\n\n## Pages\n- [ ] Home\n- [ ] About\n\n## Branch\n\`DT-XXX-feat-implement-x\``,
  priority: 1, // P2 - important feature work
  labelNames: ["design-system", "Improvement"],
  assigneeEmail: "petri@digitaltableteur.com",
  stateName: "In Progress", // User said "ticket" not "todo"
});
```

### Troubleshooting

- **"labels not found"**: Check spelling against `docs/LINEAR_LABELS.md` (case-insensitive)
- **"Argument Validation Error"**: Usually caused by invalid `projectId` - omit it to use env default
- **Assignee not set**: Verify email matches Linear workspace user exactly
- **State not applied**: Check workflow state names with `scripts/linear/update-issue.ts --issue <any-issue> --state "<state-name>"`

### Environment Setup

Required in `.env.local`:

```bash
LINEAR_API_KEY=lin_api_...
LINEAR_TEAM_ID=...
LINEAR_PROJECT_ID=...  # Optional, defaults to team's default project
```

### Related Documentation

- Available labels: `docs/LINEAR_LABELS.md`
- Linear API docs: `docs/LINEAR_AUTOMATION.md`
- Label seeding: `scripts/linear/seed-labels.ts`

## Performance Considerations

- **Code Splitting**: Automatic with Vite and React.lazy()
- **Asset Optimization**: Leaflet icons copied to public during build
- **Bundle Analysis**: Vite provides built-in analysis
- **Cache Strategy**: Aggressive filename hashing + manual cache busting

## Chat Markdown Rendering

## Reusable Navigation List Pattern (NavMenuList)

The project introduces a reusable navigation abstraction `NavMenuList` (`src/components/NavMenuList/`). It centralizes:

- Active state logic (exact vs prefix route matching) with `exact?: boolean` per item
- Uniform application of `aria-current="page"` for accessibility when active
- Styling indirection via `listClassName`, `itemClassName`, `activeClassName` props so patterns (e.g., `MobileMenu`, future sidebars) can supply context-specific CSS Modules while keeping logic pure
- Click handling through a single `onNavigate` callback for analytics, menu dismissal, or focus management

Guidelines:

1. Prefer using `NavMenuList` anywhere a vertical or simple navigation stack is needed instead of rewriting `<ul><li><Link/>` logic.
2. Keep route fragments stable; rely on `exact: true` only for root or fully qualified paths where a prefix match would cause false positives.
3. Provide localized `label` strings from i18n; never hard-code user-facing text in stories or patterns outside translation (except Storybook demo stories which may use placeholder labels).
4. For horizontal header navigation, continue existing pattern until migrated; evaluate visual differences before unifying.
5. If adding icon support, extend item type with optional `icon: ReactNode`; keep pure rendering (no side effects) and update tests + stories.

Testing Expectations:

- Unit tests must cover: rendering of all items, active state (exact + prefix), aria-current presence, and custom active class override.
- MobileMenu integration test ensures labels are localized and `aria-current` behavior persists through composition.

Storybook:

- Stories retain WIP badge until a11y + visual + translation checks pass; NavMenuList stories demonstrate default and custom active class usage.

Accessibility:

- `aria-current` only applied to a single matching link; prefix matches should not create multiple active entries; ensure ordering of items prevents ambiguous matches (place longer, more specific prefixes earlier if necessary).

Performance:

- Lightweight functional component; minimal re-renders (depends on parent `items` identity + location changes). Memoization generally not required; optimize only if profiling reveals a hotspot.

Extension Pattern:

When creating variant navigation (e.g., with section dividers), wrap `NavMenuList` and inject extra markup rather than forking core logic.

The `ChatWidget` uses a `MarkdownMessage` component to render assistant/user replies with GitHub-flavored Markdown. Implementation details:

- Library: `react-markdown` + `remark-gfm`
- Security: `skipHtml` prevents unsanitized HTML injection; links get `rel="noopener noreferrer"`
- Styling: Design tokens applied via `MarkdownMessage.module.css` for headings, lists, code blocks, tables
- Fallback: Streaming replies show translated thinking/ellipsis until first text arrives

When modifying markdown rendering:

- Keep raw HTML disabled unless a sanitization layer (rehype-sanitize) is added
- Update tests (`MarkdownMessage.test.tsx`) and Storybook (`MarkdownMessage.stories.tsx`)
- Refresh visual baselines if styling changes (`npm run test:visual`)

## Chat Dynamic Component Injection (User-Triggered Model)

Dynamic component decisions are centralized in the pure transformer `messageProcessor.ts` which outputs `ProcessedMessage.parts` for `ChatMessages.tsx`. Assistant heuristics are disabled; only preceding USER messages can trigger injections.

Trigger flow:

1. User message scanned for tokens `[[openHours]]`, `[[servicesGrid]]` OR multilingual heuristic keywords (EN/FI/SV for hours & services).
2. Matching sets pending flags; user tokens are stripped from rendered text.
3. Next assistant reply consumes flags: tokens + first keyword occurrence removed from assistant text and corresponding components appended (`<OpenHours compact />`, `<ServicesGrid />`).
4. Flags reset to prevent repeated injections.

Sanitization:

- User: remove explicit tokens only (keywords retained for clarity).
- Assistant (on injection): remove explicit tokens AND leading keyword (“Open hours”, “Aukioloajat”, “Öppettider”, “Services”, “Palvelut”, “Tjänster”).
- Assistant without pending flags: tokens/keywords ignored (no component, text preserved except tokens are not expected to appear normally).

Multilingual keyword coverage (user role only): see `messageProcessor.ts` regex definitions for open hours and services.

Extending:

1. Add new token constant + user regex pattern.
2. Add pending flag & assistant consumption branch.
3. Render new component in `ChatMessages.tsx` switch.
4. Unit tests: user token + keyword triggers, assistant sanitization.
5. Integration tests: component presence only after user trigger.
6. Visual regression update if layout changes.

Security:

- User cannot force multiple future injections; only immediate next assistant reply uses flags.
- Whitelist component names; ignore unknown.
- Token echoing by assistant without user trigger does not inject.

Testing:

- `messageProcessor.test.tsx` covers flags & sanitization (EN/FI/SV).
- `ChatMessages.*.test.tsx` covers rendering & absence of keywords/tokens in assistant post-injection.
- Run `npm run test:visual` after changes impacting layout.

## Progressive Enhancement Pattern (Template)

Apply modern CSS features conditionally:

1. Define baseline (fallback) styles normally.
2. Add `@supports(feature)` blocks that layer improved visuals/performance.
3. When a feature replaces a layout property (e.g. gap), provide a `@supports not (feature)` fallback with equivalent spacing (margin shims).
4. Keep accessibility media queries (`@media (prefers-reduced-motion: reduce)`) separate from `@supports`.
5. Use modern color syntax (rgb / alpha percentage, color-mix) only inside supported blocks and supply readable fallbacks.
6. Avoid overusing `will-change`; only inside enhancement blocks when animation or transform present.
7. Document each new enhancement in this file + `CLAUDE.md` at commit time.

Example:

```
.panel { box-shadow: none; }
@supports (backdrop-filter: blur(8px)) {
  .panel { backdrop-filter: blur(8px); box-shadow: 0 4px 24px rgb(0 0 0 / 30%); }
}
```

Spacing:

```
.stack > * + * { margin-top: 1rem; }
@supports (gap: 1rem) {
  .stack { display: flex; flex-direction: column; gap: 1rem; }
  .stack > * + * { margin-top: 0; }
}
```

Navigation with :has():

```
@supports selector(:has(*)) {
  .navItem:has(> .navLink[aria-current="page"]) { outline: 2px solid color-mix(in srgb, var(--color-primary) 40%, transparent); }
}
```

Future view transitions (commented until adopted):

```
/* @supports (view-transition-name: route) { .routeRoot { view-transition-name: route; } } */
```

## Sentry Observability & MCP Integration (Nov 2025)

### Runtime Integration

Sentry initializes in `src/main.tsx` only when `VITE_SENTRY_DSN` exists. Performance tracing via `browserTracingIntegration()`; sampling adjustable with `VITE_SENTRY_TRACES_SAMPLE_RATE`.

### Vite Plugin

`@sentry/vite-plugin` conditionally added in `vite.config.ts` (requires `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`). Optional `SENTRY_RELEASE` for version grouping.

### MCP Command Script

`scripts/sentry-mcp.js` exposes REST queries:

```
node scripts/sentry-mcp.js issues [project] [limit] [--unresolved] [--environment=name]
node scripts/sentry-mcp.js releases [project] [limit]
```

Flags:

- `--unresolved`: filters with `is:unresolved`
- `--environment=name`: narrows issues by environment

### Summary Generation

`scripts/generate-sentry-summary.mjs` produces `public/observability/sentry-summary.json` (top 10 issues) for Storybook/dashboard consumption without live API calls at render.

### Dashboard Component

`src/components/SentrySummaryCard/` fetches summary file and renders localized loading, error, empty, and list states; links open issue permalinks in a new tab.

### Translation Keys

Added `observability.sentry.*` set (title, unresolvedHeading, empty, error.fetch, issue.status, issue.user, issue.firstSeen, issue.lastSeen, issue.open, loading). Ensure all three locales updated together.

### Testing

Unit tests mock fetch scenarios (success/empty/error). Visual regression optional if styling changes; run `npm run test:visual` after major UI adjustments.

### Future Enhancements

- Severity/timeframe filters (e.g., `--level=error`)
- Aggregate metrics (unresolved ratio, average issue age)
- Release health stats (crash-free sessions) integration

Keep this section and `CLAUDE.md` synchronized whenever observability tooling changes.

### Sentry Stub Mode Badge (Nov 2025)

The `SentrySummaryCard` now renders a localized stub badge (`observability.sentry.stubBadge`) when the summary JSON includes `stub: true`. This visually differentiates fallback placeholder data (e.g., missing credentials, forced stub) from a real issue list. The badge appears in both empty and populated states. Tests cover badge presence. When adding future metadata (e.g., release health), avoid overlapping badge semantics; prefer an adjacent icon or secondary badge.

Progressive enhancement: card container applies elevated backdrop styling with `data-surface="elevated"` only for real summaries (non-stub) to subtly distinguish authenticity. This attribute may be extended for theming or variants.

### TypeScript MCP Automation (Nov 2025)

Introduced `scripts/ts-mcp-automation.mjs` to validate `typescript-language-server` availability via a minimal LSP initialize handshake. Outputs `public/observability/ts-mcp-status.json` with `{ ok, generatedAt }` or stub fields when unavailable. NPM scripts:

```bash
npm run ts:mcp:status       # Attempt handshake and write status
npm run ts:mcp:status:stub  # Force stub status
```

Future expansion ideas:

- Parse and expose server version from initialize result.
- Surface diagnostics count for a small in-memory file sample.
- Integrate MCP status into a combined Observability dashboard section.

Keep these instructions and `CLAUDE.md` aligned as MCP automation evolves.

## Design System Card Component (Dec 2025)

The `Card` component (`src/components/Card/`) has been expanded into a reusable design-system primitive inspired by Ant Design while adhering to DT styling tokens and accessibility patterns.

### API Overview

Props:

- `title?: string` Primary heading rendered as `<h3>` (consumer responsible for hierarchy context).
- `subTitle?: string` Uppercase meta label adjacent to title.
- `extra?: React.ReactNode` Right-aligned header region (badges, buttons, etc.).
- `cover?: React.ReactNode` Media slot at top (typically `<img>`). Should include alt text.
- `actions?: CardAction[]` Footer action buttons (`{ key, label, onClick?, disabled? }`).
- `loading?: boolean` Displays skeleton placeholder; user-facing text hidden; localized via `card.loading` key.
- `hoverable?: boolean` Elevation + subtle background shift on pointer hover.
- `bordered?: boolean` Toggles border presence (fallback shadow retained). Defaults to true.
- `size?: 'sm' | 'md' | 'lg'` Adjusts internal padding scale.
- `tabs?: CardTab[]` Optional tablist (`{ key, label, disabled? }`).
- `activeTabKey?: string` Controlled active tab key.
- `defaultActiveTabKey?: string` Uncontrolled initial tab key (falls back to first tab when omitted).
- `onTabChange?: (key: string) => void` Fired after selection (skips disabled tabs).
- `body?: string` Legacy body text convenience (prefer children for rich content).
- `children?: React.ReactNode` Body content region below header / tabs.
- `link?: string` Makes the entire card an anchor; preserves same internal structure. Provide descriptive `linkLabel` for accessibility.
- `icon?: React.ReactNode` Leading icon before title.
- `linkLabel?: string` Accessible label for link variant when title insufficient.
- `className?: string` Style extension hook.

### Accessibility

- Header title marked with `data-card-title` for potential future landmark / outline integration.
- Tablist uses `role="tablist"` and each tab `role="tab"`, `aria-selected` reflects active state, `disabled` uses native attribute. Only one `aria-selected="true"` permitted.
- Loading skeleton uses `role="status"`, `aria-busy="true"`, and localized `aria-label` (`card.loading`). Tests assert presence.
- Action buttons expose keyboard focus with visible outline; disabled actions are inert and have reduced opacity.
- Link variant sets `aria-label` to `linkLabel || title` to ensure context clarity when title is non-descriptive.

### Styling & Tokens

- CSS Module `Card.module.css` defines base `.card` plus state/variant classes: `.hoverable`, `.bordered`, `.unbordered`, size classes `.sm/.md/.lg`.
- Spacing leverages `--space-*` tokens; radius via `--radius-*`.
- Tablist uses gap with fallback margin shim under `@supports not (gap: ...)`.
- Skeleton animation defined with `@keyframes skeleton-pulse` using gradient shimmer; respects progressive enhancement guidelines.
- All text uses either the Title.tsx or Text.tsx component to maintain typographic consistency. You may also use these components within `children` for body content or create a new type of text component if needed, in which case let the user know that you have created it and ensure it follows the design system.

### Internationalization

- Added `card.loading` key to all three locales for skeleton status.
- Avoid hard-coded user-visible strings in stories beyond demo labels; production usage must pull from i18n.

### Testing Expectations

- Unit tests cover: header rendering (title/subTitle/icon/extra), link wrapper semantics, actions present & clickable, loading skeleton accessibility attributes, tab switching (uncontrolled) and `aria-selected` correctness.
- Future tests: controlled tab behavior edge cases (e.g., ignoring internal state), disabled tab non-interaction, keyboard focus traversal.
- Add an accessibility test ensuring only one active tab and buttons reachable via tab sequence.

### Storybook

- Stories: Default, Hoverable, Loading, WithCover, WithActions, Tabbed. WIP badge remains until a11y + visual + translation checks green.
- Tabbed story refactored to a component wrapper to avoid hooks inside inline render (lint compliance).

### Extension Guidelines

Prefer composability: for future badges, metrics, or status chips, supply them via `extra` or within `children` rather than forking core Card logic. For upcoming variants (e.g., selectable cards, radio-group cards), layer interactive state with additional props and ARIA without breaking existing API shape.

### Future Enhancements (Proposed)

- Keyboard arrow navigation between tabs (roving tabindex) for improved ergonomics.
- Optional `headerLevel` prop to customize semantic heading level while keeping style consistent.
- `actionsPlacement` prop (e.g., "start" | "center" | "end") for layout flexibility.
- Integrated focus ring theming via data attributes for dark mode or elevated surfaces.

Keep this section synchronized with `CLAUDE.md` whenever the Card API or behavior evolves.

## Chat Guided Email Workflow (Nov 2025)

The Chat interface includes a deterministic, reducer-driven email composition workflow allowing users to author and send a structured message directly within the conversation. It supports two trigger categories:

1. General intent phrases ("send email", "compose email", "help me write an email" + FI/SV equivalents) → sets `pendingEmailWorkflowGeneral` and injects localized assistant phrase `chatEmailSendPhrase`.
2. Simple standalone keyword ("email" / "sähköposti" / "epost" alone) → sets `pendingEmailWorkflowSimple` and injects `chatEmailSimplePhrase`, which reveals the contact address (`mail@digitaltableteur.com`) then invites composition.

The simple keyword regex is anchored to avoid accidental mid-sentence activation.

### Trigger Detection

Implemented in `messageProcessor.ts` via multilingual regex patterns. Exactly one of the two flags can be set per user message. Flags are consumed on the next assistant turn, which injects the localized phrase and mounts the workflow inline, then resets flags.

### State Machine & Types

- Reducer: `src/components/ChatWidget/emailWorkflow/reducer.ts`
- Types: `src/components/ChatWidget/emailWorkflow/types.ts`
- Draft shape: `EmailDraft` (fields: `intent`, `fullName`, `email`, `phone?`, `message`).

Primary states (shared for both trigger paths):

1. `idle` – No workflow active
2. `compose` – Capture high-level intent/subject
3. `fields` – Sequential collection of structured fields (validators applied per step)
4. `review` – Aggregated draft display with edit options
5. `sending` – Async submission in progress (aria-busy + status text)
6. `success` – Confirmation & summary
7. `error` – Failure with retry/edit controls

Actions are strictly typed; transitions validated to prevent illegal jumps. Edit returns to `fields` preserving previously entered values.

### Components

- `ComposePrompt` – Intent text area
- `FieldPrompt` – Renders current field input + validation message
- `ReviewSummary` – Structured summary of draft contents
- `SendStatus` – Unified sending/success/error presenter

Each component includes:

- `.module.css` using logical properties
- Storybook stories (with WIP badge until a11y & visual baselines pass)
- Unit tests (component rendering & accessibility semantics)

### Validation & Service Layer

- `contactValidation.ts` centralizes validators for email format, required fields, optional phone normalization.
- `contactEmailService.ts` wraps EmailJS send logic; throws `EmailServiceError` with classified codes for user-friendly error messaging.

### Environment Variables

Required for send operations (development & production):

```
VITE_EMAILJS_SERVICE_ID
VITE_EMAILJS_TEMPLATE_ID
VITE_EMAILJS_PUBLIC_KEY
```

Missing values keep workflow usable (draft creation) but sending transitions to error quickly; error messaging must remain localized.

### Internationalization

All workflow strings use the `emailWorkflow.` prefix. Trigger phrase keys (`chatEmailSendPhrase`, `chatEmailSimplePhrase`) must appear in EN, FI, and SV locale files. Translation coverage tests enforce presence.

### Accessibility

- Forms use explicit `<label>` with `htmlFor` and aria-live regions for validation messages as needed.
- Sending state applies `role="status"` + `aria-busy="true"`.
- Focus returns appropriately after edits or retry (tests should assert focus strategy where practical).

### Testing Expectations

- Reducer unit tests: every transition including error + retry + cancel.
- Integration tests: general path (`emailWorkflow.integration.test.tsx`) plus simple keyword path (`emailWorkflow.simpleTrigger.test.tsx`).
- i18n coverage: ensures all `emailWorkflow.*` keys present.
- Visual regression: baseline images for each workflow state story.
- Accessibility: axe checks free of violations; aria-current not misapplied.

### Extension Guidelines

To add new fields or behaviors:

1. Extend `EmailDraft` type and validators.
2. Insert ordered step logic in reducer (avoid breaking existing indices).
3. Localize new strings under `emailWorkflow.fields.<fieldName>`.
4. Update `ReviewSummary` & tests; refresh visual baselines.
5. Document changes here + `README.md` + `CLAUDE.md` in the same commit.

Avoid renaming existing keys—additive naming preserves translation history and reduces churn.

## SocialShare Component with Native Web Share API (Nov 2025)

The `SocialShare` component (`src/components/SocialShare/`) implements progressive enhancement with the Web Share API, providing native mobile sharing experiences while gracefully falling back to clipboard functionality.

### Progressive Enhancement Architecture

**Feature Detection & State Management**

```typescript
const [supportsNativeShare, setSupportsNativeShare] = useState(false);
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  if (typeof window !== "undefined" && "share" in navigator) {
    setSupportsNativeShare(true);
  }
}, []);
```

**Responsive Behavior Patterns**

- Mobile devices: Icon-only buttons for compact alignment with social media icons
- Desktop environments: Full button text with proper spacing
- Feature detection drives conditional rendering between share and copy icons

### Implementation Guidelines

**API Usage**

1. **Native Share Priority**: When Web Share API available, use device native share sheet
2. **Graceful Fallback**: Share failures automatically fall back to clipboard copy
3. **Error Handling**: Catch share cancellations and API errors without disrupting UX

**Responsive Design Integration**

- Leverage Button component's `iconOnly` prop for mobile state management
- Apply CSS logical properties (`margin-inline`) for proper icon alignment
- Use `window.matchMedia("(width < 768px)")` for consistent breakpoint detection

**Translation Coverage**

Required i18n keys:

- `share`: Native share action label
- `copyLinkToClipboard`: Clipboard fallback action label

### Testing Strategy

**Navigator API Mocking**

```javascript
// Remove navigator.share to test unsupported browsers
const originalNavigator = global.navigator;
const mockNavigator = { ...originalNavigator } as any;
delete mockNavigator.share;
Object.defineProperty(global, "navigator", {
  writable: true,
  value: mockNavigator,
});
```

**Test Coverage Requirements**

1. Feature detection for both supported and unsupported browsers
2. Conditional rendering based on device capabilities and API availability
3. Fallback behavior when native share fails or is cancelled
4. Responsive state transitions between mobile and desktop modes
5. Translation key coverage across all supported languages

### Accessibility Standards

- Proper ARIA labels for both native share and clipboard copy actions
- Keyboard navigation support maintained across interaction modes
- Screen reader compatibility with appropriate role attributes
- Toast notification feedback for clipboard copy operations

### Browser Support Matrix

- **iOS Safari 12+**: Full native share sheet integration
- **Chrome Android 61+**: Native share functionality
- **Desktop Browsers**: Clipboard copy fallback only
- **Legacy Mobile**: Standard clipboard copy behavior

### Extension Guidelines

Future enhancements should follow the progressive enhancement pattern:

1. **Feature Detection**: Check for new APIs before implementing
2. **Graceful Degradation**: Ensure fallback paths remain functional
3. **Accessibility**: Maintain keyboard navigation and screen reader support
4. **Testing**: Update test coverage for new feature branches
5. **Documentation**: Update this section and corresponding docs

**Web Share API Level 2 Considerations**

- File sharing support for images and documents
- Share target registration for PWA capabilities
- Enhanced share data validation and custom error messaging

Keep this section synchronized with `README.md` and `CLAUDE.md` whenever native share functionality evolves.

## MCP & Observability Automation (Nov 2025)

### GitHub MCP Server

- Configuration: `mcp.json` → `"github"` entry points at `https://api.githubcopilot.com/mcp/`
- Authentication: Uses `GITHUB_MCP_PAT` environment variable for Personal Access Token
- Script: `scripts/test-github-mcp.mjs` tests connectivity, configuration, and authentication
- Command: `npm run github:mcp:test`
- Documentation: `docs/GITHUB_MCP_SETUP.md` and `docs/VERCEL_GITHUB_MCP_SETUP.md`

**Environment Setup:**

- Local: `.env.local` contains `GITHUB_MCP_PAT=github_pat_...`
- Production: Vercel environment variable `GITHUB_MCP_PAT`
- Testing: Script automatically loads dotenv for local testing

**Available Capabilities:**

- Repository operations and file management
- Issue and pull request management
- GitHub Actions workflow monitoring
- Code security analysis and Dependabot alerts
- Organization and team management

### Figma MCP Server

- Configuration: `mcp.json` → `"figma-developer-mcp"` entry runs as SSE server at `http://localhost:3333/sse`
- Authentication: Uses `FIGMA_TOKEN` environment variable for Personal Access Token
- Script: `scripts/test-figma-mcp.mjs` tests connectivity, configuration, and authentication
- Command: `npm run figma:mcp:test`
- Documentation: `docs/FIGMA_MCP_SETUP.md`
- Package: `figma-developer-mcp` - Start server with `npx figma-developer-mcp`

**Environment Setup:**

- Local: `.env.local` contains `FIGMA_TOKEN=figd_...`
- Production: Vercel environment variable `FIGMA_TOKEN`
- Testing: Script automatically loads dotenv for local testing

**Available Capabilities:**

- Design file analysis and component extraction
- Asset downloading and design token extraction
- Design system documentation and consistency checking
- Design-to-code generation and implementation guidance
- Collaborative design workflow integration

### TypeScript MCP Status

- Script: `scripts/ts-mcp-automation.mjs` performs a minimal `typescript-language-server` handshake.
- Output: `public/observability/ts-mcp-status.json` `{ ok, generatedAt }` or stub when unavailable.
- Commands:

```bash
npm run ts:mcp:status
npm run ts:mcp:status:stub
```

### Sentry Summary

- Script: `scripts/generate-sentry-summary.mjs` OR CLI helper `scripts/sentry-mcp.js`.
- Output: `public/observability/sentry-summary.json` with unresolved production issues (top 10) or stub badge metadata.
- Component: `SentrySummaryCard` consumes JSON, applies stub badge when `stub: true`.

### Translation & Schema Discipline

- All Sentry-related strings use `observability.sentry.*` prefix; MCP future keys should adopt `observability.ts.*`.
- Any schema evolution (adding fields, renaming properties) requires simultaneous updates to: this file, `README.md`, `CLAUDE.md`, relevant tests, and translation files.

### Testing & Visual Regression

- Unit tests must mock fetch scenarios (success, empty, error, stub).
- Update visual snapshots whenever card rendering changes.

### Extension Strategy

Future observability sources (e.g., release health, diagnostics counts) should follow pattern:

1. Generate JSON artifact via script.
2. Render with a pure, localized component.
3. Add i18n keys under logical prefix.
4. Document in all architecture files.

Maintain backward compatibility—avoid deleting fields without deprecation notice and test updates.
