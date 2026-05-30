# Copilot Instructions for Digitaltableteur

## 📚 Documentation Hierarchy

This project uses a **three-layer agent instruction system**:

- **`AGENT_INDEX.md`** → Master map (areas, skills, deep references)
- **`CLAUDE.md`** → Short router for Claude Code (~200 lines)
- **`AGENTS.md`** → Short router for generic agents
- **`.claude/skills/dt-*/SKILL.md`** → Workflow skills (on-demand activation)
- **`.github/copilot-instructions.md`** → This file, optimized for GitHub Copilot

**Area instructions** (load when working in that directory):

- `app/AGENTS.md` + `app/api/AGENTS.md` → Next.js App Router & API routes
- `nextjs-app/shared/components/AGENTS.md` → Design system rules
- `nextjs-app/shared/patterns/AGENTS.md` → Layout patterns
- `scripts/AGENTS.md` → Automation patterns
- `digitaltableteur-blog/AGENTS.md` → Sanity CMS / blog

**Architecture guide:** `docs/AGENT_WORKFLOW.md`

**When working in a specific directory, read its AGENTS.md and matching dt-* skill.**

---

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
npm run build         # Production build (auto-generates blog manifest pre-step)
npm run storybook     # Component development and testing
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

1. `npm run build` - Vite build with hash-based filenames (pre-step generates blog manifest)
2. `npm run cache-bust` - Adds version metadata and .nojekyll
3. `npm run deploy` - Deploys to GitHub Pages with CNAME preservation

## Sanity Article Workflow (Dec 2025)

- Blog article discovery uses a build-time manifest at `nextjs-app/shared/data/blogManifest.ts`.
- The manifest is auto-generated:
  - Before build via `prebuild`; after local MDX edits run `npm run generate:blog` (or `npm run dev:full`).
  - After running `scripts/publish-from-sanity.sh` for single or bulk publishes.
- If articles don’t appear, run `node scripts/generate-blog-manifest.mjs` manually or restart dev.
- Keep MDX sources under `content/posts/` for inclusion.

## File Organization

- `src/components/` - Reusable UI components (exported via `index.ts`)
- `src/pages/` - Route components with lazy loading
- `src/patterns/` - Layout patterns (Header, Footer)
- `src/components/NavMenuList/` - Reusable navigation list abstraction used by `MobileMenu` and future navigational surfaces (encapsulates active route detection, aria-current assignment, styling hooks)
- `src/locales/` - Translation files per language
- `api/` - Vercel serverless functions
- `scripts/` - Build and deployment automation

Important path rule:

- Always create files under `nextjs-app/shared/components/<ComponentName>/` and export via `index.ts` for `@dt/<ComponentName>`.

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

## Linear Issue Management & Automation (Dec 2025 - Updated)

### Overview

Linear issues are managed through TypeScript automation scripts located in `scripts/linear/` and library functions in `lib/linear/`. All scripts require `LINEAR_API_KEY` and `LINEAR_TEAM_ID` environment variables in `.env.local`.

### New Features (Dec 2025)

Based on Linear API updates from Sept-Dec 2025 changelog:

1. **Label Descriptions** - Labels now support optional descriptions for better triage intelligence
2. **State History** - Complete audit trail of all state transitions with timestamps and actors
3. **Semantic Search** - Natural language search across issues, projects, and documents
4. **Project Templates** - Create projects from pre-defined templates via API
5. **Issue Subscriptions** - Subscribe users to issues via email

### Core Library (`lib/linear/createIssue.ts`)

Provides enhanced functions:

**`createLinearIssue()`** - Create issues with full metadata:

- **Title & Description**: Required fields
- **Priority**: 0-3 (P1-P4), where 0=Urgent, 1=High, 2=Medium, 3=Low
- **Labels**: Resolved by name (see `docs/LINEAR_LABELS.md` for available labels)
- **Assignee**: By email (`assigneeEmail`) or ID (`assigneeId`)
- **State**: By name (`stateName`) or ID (`stateId`) - e.g., "In Progress", "Todo", "Done"
- **Project**: Optional `projectId` (defaults to `LINEAR_PROJECT_ID` env var)

**`createLabelWithDescription()`** - NEW: Create labels with descriptions:

```typescript
await createLabelWithDescription({
  name: "accessibility",
  description: "Accessibility and WCAG compliance issues",
  color: "#4FC3F7",
});
```

**`createProjectFromTemplate()`** - NEW: Instantiate projects from templates:

```typescript
await createProjectFromTemplate({
  name: "Q1 2026 Design System Audit",
  templateId: "template_abc123",
  leadId: "user_xyz",
  targetDate: "2026-03-31",
});
```

**`subscribeToIssue()`** - NEW: Subscribe users via email:

```typescript
await subscribeToIssue("issue_id", "petri@digitaltableteur.com");
```

**`semanticSearch()`** - NEW: Natural language search:

```typescript
const results = await semanticSearch("button accessibility bugs");
// Returns: Array<{ id, identifier?, title, type }>
```

### Available Scripts

#### Create Issue (Interactive)

```bash
npm run linear:new
```

#### Check Issue Details (WITH STATE HISTORY)

```bash
npm run linear:check DIG-16
```

Output now includes complete state transition history:

```
📋 Issue: DIG-123
   State: Done

📊 State History:
   Created → Todo (Dec 1, by Petri)
   Todo → In Progress (Dec 2, by Petri)
   In Progress → Done (Dec 5, by Petri)
```

#### Semantic Search (NEW)

```bash
npm run linear:search "button accessibility bugs"
```

Natural language search across all Linear content types.

#### Subscribe to Issue (NEW)

```bash
npm run linear:subscribe --issue <issueId> --email petri@digitaltableteur.com
```

#### Create Project from Template (NEW)

```bash
npm run linear:project
```

Interactive prompts for project name, template ID, lead, target date.

#### Update Issue

```bash
npm run linear:update --issue DIG-16 --state "Done"
npm run linear:update --issue DIG-16 --add-label "ui-app-bug"
npm run linear:update --issue DIG-16 --comment "Completed"
```

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

## Enhanced Collision Detection for Menus (Nov 2025)

Both `Avatar` and `SplitButton` components implement sophisticated collision detection algorithms following industry standards from Material UI, Headless UI, Reka UI, and jQuery UI.

### Implementation Features

**Industry Standard Compliance:**

1. **Viewport Margins** (12px buffer from screen edges)
   - Prevents menus from touching screen boundaries
   - Material UI uses 16px, we use 12px for tighter layouts
   - Applied to all four directions (top, right, bottom, left)

2. **Smart Flipping**
   - Automatically flips menu position when insufficient space
   - Priority order: preferred → opposite → larger space
   - Vertical: bottom (preferred) → top → larger space
   - Horizontal: right (preferred) → left → larger space

3. **Nudging/Fitting**
   - When neither direction has full space, chooses side with more room
   - Menu becomes scrollable or partially visible on optimal side
   - Prevents unnecessary flipping that would worsen visibility

**Technical Implementation:**

```typescript
const viewportMargin = 12; // Buffer from edges
const gutter = 8; // Trigger-to-menu spacing

// Calculate space with margins
const spaceLeft = wrapperRect.left - viewportMargin;
const spaceRight = viewportWidth - wrapperRect.right - viewportMargin;

// Smart placement with fallback chain
if (hasRoomInPreferredDirection) {
  placement = "preferred"; // e.g., bottom for vertical
} else if (hasRoomInOppositeDirection) {
  placement = "opposite"; // e.g., top for vertical
} else {
  // Nudge: choose direction with more space
  placement = largerSpace > smallerSpace ? "preferred" : "opposite";
}
```

**CSS Implementation:**

```css
/* Avatar & SplitButton use data attributes for positioning */
.menu[data-placement="top"] {
  top: auto;
  bottom: calc(100% + 0.5rem);
}

.menu[data-placement="bottom"] {
  top: calc(100% + 0.5rem);
  bottom: auto;
}
```

**Testing Requirements:**

Edge cases to verify:

- Small viewports (mobile screens)
- Near corners (trigger at screen edges)
- Partial overlaps (nudging behavior)
- Nested menus (SplitButton sub-menus)
- Scrolled containers
- Window resize events

### Comparison to Industry Standards

| Feature              | Material UI | Reka UI      | Our Implementation |
| -------------------- | ----------- | ------------ | ------------------ |
| Viewport Margins     | 16px        | Configurable | 12px               |
| Flipping             | ✅          | ✅           | ✅                 |
| Nudging              | ✅          | ✅           | ✅                 |
| Collision Boundaries | ✅          | ✅           | Planned            |
| Real-time Resize     | ✅          | ✅           | ✅                 |

**Future Enhancements:**

- Collision boundaries (respect parent containers)
- Configurable viewport margins
- Prefer direction prop hints
- Scroll detection for positioned containers

Keep synchronized with `README.md` and `CLAUDE.md` when collision detection evolves.

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

## Sentry Observability & MCP Integration (Dec 2025)

### Runtime Integration

Sentry initializes in `src/main.tsx` only when `VITE_SENTRY_DSN` exists. Performance tracing via `browserTracingIntegration()`; sampling adjustable with `VITE_SENTRY_TRACES_SAMPLE_RATE`.

### Vite Plugin

`@sentry/vite-plugin` conditionally added in `vite.config.ts` (requires `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`). Optional `SENTRY_RELEASE` for version grouping.

### Official Sentry MCP Server (Dec 2025 - Updated)

- **Configuration**: `mcp.json` → `"sentry"` entry points at `https://mcp.sentry.dev/mcp`
- **Authentication**: OAuth (recommended, no token management) or STDIO mode with `SENTRY_ACCESS_TOKEN`
- **Script**: `scripts/test-sentry-mcp.mjs` tests connectivity, configuration, OAuth readiness, and lists 16+ tools
- **Command**: `npm run sentry:mcp:test`
- **Documentation**: `docs/SENTRY_MCP_SETUP.md`

**Available Capabilities (16+ Tools)**:

**High-Priority Operations:**

- **Issue & Error Management**: `get_issue_details`, `search_issues`, `search_errors_in_file` (search by file path - unique to MCP!), `list_dsns`, `create_dsn`
- **Seer AI Integration**: `invoke_seer` (automated root cause analysis), `get_seer_fix_status`, `get_seer_fix_details` (AI-generated fix recommendations)
- **Organization & Projects**: `list_organizations`, `list_projects`, `create_project`, `list_teams`
- **Release & Performance**: `query_releases`, `query_performance`, `custom_queries`

**MCP vs Legacy REST Scripts:**

- Official MCP: 16+ tools, OAuth, Seer AI, file-specific error search, natural language interface
- Legacy scripts (`scripts/sentry-mcp.js` renamed to `sentry-rest-api` in `mcp.json`): 3 commands (issues, releases, list-projects), API token required, best for CI/CD pipelines

**When to Use Each:**

- **Official MCP** (`"sentry"`): Interactive debugging, AI-assisted workflows, Seer integration, exploring issues with natural language
- **Legacy REST Scripts** (`"sentry-rest-api"`): CI/CD summaries, automated reporting, Storybook dashboard data

**Environment Setup:**

- OAuth mode (recommended): No environment variables needed, authentication handled by MCP client
- STDIO mode (optional): `.env.local` contains `SENTRY_ACCESS_TOKEN=sntryu_...` (requires scopes: org:read, project:read, project:write, team:read, team:write, event:write)

**Usage Examples:**

```plaintext
"Show me recent unresolved issues in Sentry"
"Search Sentry for errors in components/UserProfile.tsx"
"Use Seer to analyze Sentry issue PROJ-123 and propose a fix"
"Create a new Sentry project for 'mobile-app'"
```

### Legacy REST API Scripts (Renamed for Clarity)

`scripts/sentry-mcp.js` remains available for CI/CD workflows:

```bash
node scripts/sentry-mcp.js issues [project] [limit] [--unresolved] [--environment=name]
node scripts/sentry-mcp.js releases [project] [limit]
node scripts/sentry-mcp.js list-projects [limit]
```

**Renamed to `sentry-rest-api` in `mcp.json`** to differentiate from official MCP server.

### Summary Generation

`scripts/generate-sentry-summary.mjs` produces `public/observability/sentry-summary.json` (top 10 issues) for Storybook/dashboard consumption without live API calls at render. Uses legacy REST API.

### Dashboard Component

`src/components/SentrySummaryCard/` fetches summary file and renders localized loading, error, empty, and list states; links open issue permalinks in a new tab.

### Translation Keys

Added `observability.sentry.*` set (title, unresolvedHeading, empty, error.fetch, issue.status, issue.user, issue.firstSeen, issue.lastSeen, issue.open, loading, stubBadge). Ensure all three locales updated together.

### Testing

- Unit tests mock fetch scenarios (success/empty/error)
- Visual regression optional if styling changes; run `npm run test:visual` after major UI adjustments
- MCP connectivity test: `npm run sentry:mcp:test`

### Seer AI Integration

Sentry's purpose-built AI agent for deep issue analysis and automated debugging. Accessible via official MCP:

- **Invoke Seer**: `"Use Seer to analyze Sentry issue PROJ-123"`
- **Check Status**: `"What's the status of the Seer analysis for issue BACKEND-456?"`
- **Get Recommendations**: `"Show me the fix recommendations from Seer"`

**MCP + Seer Workflow**: Use MCP to search/identify issues → Invoke Seer for automated analysis → Get AI-generated fix recommendations → Apply fixes with combined context.

### Future Enhancements

- Severity/timeframe filters (e.g., `--level=error`)
- Aggregate metrics (unresolved ratio, average issue age)
- Release health stats (crash-free sessions) integration
- Wrapper scripts for common Seer workflows

Keep this section and `CLAUDE.md` synchronized whenever observability tooling changes.

### Sentry Stub Mode Badge (Nov 2025)

The `SentrySummaryCard` now renders a localized stub badge (`observability.sentry.stubBadge`) when the summary JSON includes `stub: true`. This visually differentiates fallback placeholder data (e.g., missing credentials, forced stub) from a real issue list. The badge appears in both empty and populated states. Tests cover badge presence. When adding future metadata (e.g., release health), avoid overlapping badge semantics; prefer an adjacent icon or secondary badge.

Progressive enhancement: card container applies elevated backdrop styling with `data-surface="elevated"` only for real summaries (non-stub) to subtly distinguish authenticity. This attribute may be extended for theming or variants.

## Vercel MCP Integration (Dec 2025)

### Configuration

- **Server URL**: `mcp.json` → `"vercel"` entry points at `https://mcp.vercel.com` (general endpoint)
- **Project-Specific URL**: `mcp.json` → `"vercel-digitaltableteur"` entry points at `https://mcp.vercel.com/team_xAQPZijqEITmCiXPLv47MSw0/prj_4ae9xxLxjt3bk5zvzBUhSXRRPaGw` (automatic context for digitaltableteur_next project)
- **Authentication**: OAuth (no token management, automatic via MCP client)
- **Script**: `scripts/test-vercel-mcp.mjs` tests connectivity, configuration, OAuth readiness, lists 10+ tools
- **Command**: `npm run vercel:mcp:test`
- **Documentation**: `docs/VERCEL_MCP_SETUP.md`

### Available Capabilities (10+ Tools)

**Public Tools (No Auth Required)**:

- `search_documentation` - Search Vercel documentation for specific topics (2500 token default)

**Authenticated Tools**:

**Project Management**:

- `list_teams` - List all teams you're a member of
- `list_projects` - List all Vercel projects for a team
- `get_project` - Get detailed project information (framework, domains, latest deployment)

**Deployment Operations**:

- `list_deployments` - List deployments with filters (since/until timestamps)
- `get_deployment` - Get detailed deployment information (build status, regions, metadata)
- `get_deployment_build_logs` - Get build logs for debugging failed deployments
- `deploy_to_vercel` - Deploy current project to Vercel

**Domain Management**:

- `check_domain_availability_and_price` - Check domain availability and pricing
- `buy_domain` - Purchase domain with registrant information

**Access & Authentication**:

- `get_access_to_vercel_url` - Create temporary shareable links for protected deployments
- `web_fetch_vercel_url` - Fetch content from Vercel deployments (with auth if needed)

**CLI Support**:

- `use_vercel_cli` - Get help with Vercel CLI commands

### Project-Specific Configuration

**Your Project**: digitaltableteur_next

- **Project ID**: `prj_4ae9xxLxjt3bk5zvzBUhSXRRPaGw`
- **Organization ID**: `team_xAQPZijqEITmCiXPLv47MSw0`
- **MCP Server**: `vercel-digitaltableteur` (configured in mcp.json)

**Benefits of Project-Specific MCP**:

- ✅ **Automatic Context** - No need to specify project/team in prompts
- ✅ **Improved Performance** - Direct project access, faster responses
- ✅ **Better Error Handling** - Project-specific context for clearer errors
- ✅ **Simplified Prompts** - Just say "deploy" or "show logs" without project names

**When to Use Which Server**:

- Use `vercel` (general) when working across multiple projects or teams
- Use `vercel-digitaltableteur` (project-specific) when working on digitaltableteur_next

### Usage Examples

**With Project-Specific MCP** (vercel-digitaltableteur):

```plaintext
"Show me the latest deployment"          # ✅ Automatic project context
"Why did the build fail?"                 # ✅ Uses digitaltableteur_next
"List all deployments from last week"    # ✅ Filtered to current project
```

**With General MCP** (vercel):

```plaintext
"List all my Vercel projects"
"Show me all teams I'm a member of"
```

**Documentation Search** (no auth, either server):

```plaintext
"Search Vercel docs for Next.js caching"
"How do I set up environment variables in Vercel?"
```

**Deployment Analysis**:

```plaintext
"List recent deployments for digitaltableteur"
"Why did my last deployment fail?"
"Show me the build logs for deployment abc-123"
```

**Domain Management**:

```plaintext
"Check if digitaltableteur.fi is available"
"Buy the domain mysite.com"
```

**Protected Access**:

```plaintext
"Create a shareable link for myapp.vercel.app"
"Fetch content from the protected API endpoint"
```

### Testing

- Test connectivity: `npm run vercel:mcp:test`
- Validates: Server accessibility, mcp.json configuration, OAuth readiness, project-specific config (`.vercel/project.json`)
- Lists all 10+ available tools by category

### VS Code with GitHub Copilot Setup

**Installation (One-Click):**

[Add to VS Code](vscode:mcp/install?%7B%22name%22%3A%22Vercel%22%2C%22url%22%3A%22https%3A%2F%2Fmcp.vercel.com%22%7D)

**Manual Installation:**

1. Open Command Palette (`Ctrl+Shift+P` on Windows/Linux or `Cmd+Shift+P` on macOS)
2. Run: `MCP: Add Server`
3. Select `HTTP`
4. Enter details:
   - URL: `https://mcp.vercel.com`
   - Name: `Vercel`
5. Select `Global` or `Workspace` (choose Workspace for project-specific config)
6. Click `Add`

**Authorization Flow:**

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run: `MCP: List Servers`
3. Select `Vercel`
4. Click `Start Server`
5. When dialog appears: `The MCP Server Definition 'Vercel' wants to authenticate to Vercel MCP` → Click `Allow`
6. When popup asks: `Do you want Code to open the external website?` → Click `Cancel`
7. You'll see: `Having trouble authenticating to 'Vercel MCP'? Would you like to try a different way? (URL Handler)` → Click `Yes`
8. Click `Open` and complete the Vercel sign-in flow

**Project-Specific Server (Optional):**

For automatic project context, add a second server:

1. Command Palette → `MCP: Add Server`
2. Select `HTTP`
3. Enter details:
   - URL: `https://mcp.vercel.com/team_xAQPZijqEITmCiXPLv47MSw0/prj_4ae9xxLxjt3bk5zvzBUhSXRRPaGw`
   - Name: `Vercel Digitaltableteur`
4. Select `Workspace` (recommended for project-specific)
5. Follow same authorization flow

**Troubleshooting:**

- If authorization fails, try the URL Handler method (step 7 above)
- Check that your VS Code is up-to-date (MCP support requires recent version)
- Verify you're signed into Vercel in your default browser
- Check MCP server status: Command Palette → `MCP: List Servers`

### Integration with Deployment Workflow

Complements existing Vercel setup:

- GitHub Actions → Vite build → GitHub Pages (static assets)
- Vercel serverless functions in `api-legacy-vercel-functions/`
- Environment variables managed in Vercel dashboard

**Use Cases**:

- Debug build logs when deployments fail
- Search Vercel docs without leaving IDE
- List and analyze projects across teams
- Check domain availability and purchase
- Monitor deployment status and history

### Security Best Practices

- ✅ Always verify endpoint: `https://mcp.vercel.com`
- ✅ Only use trusted MCP clients (Claude Code, Cursor, VS Code, etc.)
- ⚠️ OAuth grants AI system same access as your Vercel account
- ✅ Enable human confirmation for tool execution
- ⚠️ Beware prompt injection attacks ("ignore all instructions and...")
- ✅ Review permissions during OAuth authorization

Keep this section and `CLAUDE.md` synchronized whenever Vercel MCP configuration changes.

## Docker MCP Integration (Dec 2025)

### Configuration

- **Server Type**: Local command-based MCP server
- **Command**: `npx @docker/mcp-server`
- **Setup**: VS Code MCP Catalog → Search "Docker" → Add to Workspace
- **Script**: `scripts/test-docker-mcp.mjs` tests Docker daemon, MCP config, lists 30+ tools
- **Command**: `node scripts/test-docker-mcp.mjs`
- **Documentation**: `docs/DOCKER_MCP_SETUP.md`
- **Requirement**: Docker Desktop or Docker Engine running

### Available Capabilities (30+ Tools)

**Container Management (9 tools)**:

- `list_containers` - List all or filtered containers
- `start_container` - Start a stopped container
- `stop_container` - Stop a running container
- `restart_container` - Restart a container
- `remove_container` - Remove a container
- `get_container_logs` - View container logs (streaming)
- `inspect_container` - Get detailed container information
- `exec_in_container` - Execute commands in a running container
- `get_container_stats` - View CPU, memory, network usage

**Image Management (8 tools)**:

- `list_images` - List all Docker images
- `pull_image` - Pull image from registry (Docker Hub, etc.)
- `build_image` - Build image from Dockerfile
- `tag_image` - Tag an image with new name/version
- `remove_image` - Remove an image
- `inspect_image` - Get detailed image information
- `get_image_history` - View image layer history
- `prune_images` - Remove unused images

**Network Management (6 tools)**:

- `list_networks` - List all Docker networks
- `create_network` - Create a new network
- `remove_network` - Remove a network
- `connect_to_network` - Connect container to network
- `disconnect_from_network` - Disconnect container from network
- `inspect_network` - Get detailed network information

**Volume Management (5 tools)**:

- `list_volumes` - List all Docker volumes
- `create_volume` - Create a new volume
- `remove_volume` - Remove a volume
- `inspect_volume` - Get detailed volume information
- `prune_volumes` - Remove unused volumes

**Docker Compose (4 tools)**:

- `compose_up` - Start services from docker-compose.yml
- `compose_down` - Stop and remove services
- `compose_logs` - View service logs
- `compose_ps` - List services

**System & Info (3 tools)**:

- `get_docker_info` - Docker daemon information
- `get_docker_version` - Get Docker version
- `prune_system` - Clean up unused resources (images, containers, networks, volumes)

### VS Code Setup

**Installation via MCP Catalog (Recommended)**:

1. Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Run: `MCP: Show Catalog`
3. Search: "Docker"
4. Click: "Add to Workspace" (or "Add Globally")
5. VS Code automatically configures the server

**Manual Setup**:

1. Command Palette → `MCP: Add Server`
2. Select `Command`
3. Enter details:
   - Name: `docker`
   - Command: `npx`
   - Args: `@docker/mcp-server`
4. Select `Workspace` (recommended)
5. Click `Add`

**Verification**:

- Command Palette → `MCP: List Servers`
- Should see `docker` with status "Running" (when Docker daemon active)

### Akaunting-Specific Usage

Your project uses Akaunting with Docker Compose. Common operations:

**Start Akaunting**:

```
"Start Akaunting services with docker-compose"
"Start the Akaunting application"
```

**Monitor & Debug**:

```
"Show logs for akaunting-app"
"Why is Akaunting not responding?"
"Show CPU and memory usage for Akaunting containers"
"Inspect the akaunting-app container"
```

**Database Operations**:

```
"Execute database backup in Akaunting"
"Run migrations in Akaunting"
"Connect to Akaunting database shell"
```

**Service Management**:

```
"Restart Akaunting services"
"Stop the Akaunting database"
"Show status of Akaunting containers"
```

### Usage Examples

**Container Operations**:

```
"List all running Docker containers"
"Show logs for container akaunting-app"
"Start the akaunting-app container"
"Execute 'php artisan migrate' in akaunting-app"
"Show CPU usage for all containers"
```

**Image Operations**:

```
"List all Docker images"
"Pull the latest nginx image"
"Build image from akaunting/Dockerfile"
"Remove unused Docker images"
```

**Network & Volume**:

```
"List all Docker networks"
"Create a new network called akaunting-net"
"List all Docker volumes"
"Show details for volume akaunting-data"
```

**Docker Compose**:

```
"Start services from akaunting/docker-compose.yml"
"Show logs for all Akaunting services"
"Stop Akaunting services"
```

**System Maintenance**:

```
"Show Docker system information"
"What Docker version am I running?"
"Clean up all unused Docker resources"
```

### Testing

Run the test script:

```bash
node scripts/test-docker-mcp.mjs
```

**Checks**:

- ✅ Docker daemon running
- ✅ MCP configuration (mcp.json or VS Code settings)
- ✅ Docker environment info (containers, images, volumes, networks)
- ✅ Lists all 30+ available tools
- ✅ Provides usage examples

### Integration with Development Workflow

**Complements Existing Setup**:

- Akaunting Docker Compose setup in `akaunting/`
- Local development with Docker containers
- MCP provides AI-assisted container management

**Use Cases**:

- Quick container status checks without leaving IDE
- AI-assisted troubleshooting of Docker issues
- Log analysis and debugging
- Resource monitoring and optimization
- Automated Docker operations via natural language

### Security Best Practices

- ✅ **Review commands** before executing in containers (exec access is powerful)
- ⚠️ **Destructive operations** (remove, prune) - verify before confirming
- ✅ **Use workspace-specific** config to limit scope
- ⚠️ **Volume deletion** is permanent - back up data first
- ✅ **Enable human confirmation** for critical operations
- ⚠️ **Prompt injection** - beware malicious instructions in logs/outputs

### Troubleshooting

**"Docker daemon not running"**:

- Start Docker Desktop
- Or: `brew services start docker` (macOS)
- Or: `sudo systemctl start docker` (Linux)

**"Docker MCP not showing"**:

- Command Palette → `MCP: List Servers`
- If absent → `MCP: Show Catalog` → Add Docker
- Restart VS Code

**"Cannot connect to Docker daemon"**:

- Verify: `docker info`
- Check socket: `ls -la /var/run/docker.sock` (Linux)
- Add to group: `sudo usermod -aG docker $USER` (Linux)

**"MCP tools not responding"**:

- Stop server: `MCP: Stop Server` → `docker`
- Restart: `MCP: Start Server` → `docker`
- Check logs: `MCP: Show Server Logs` → `docker`

Keep this section and `CLAUDE.md` synchronized whenever Docker MCP configuration changes.

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

## Context7 MCP Integration (Dec 2025)

### Configuration

- **Server URL**: `mcp.json` → `"context7"` entry points at `https://mcp.context7.com/mcp` (remote HTTP endpoint)
- **Authentication**: API key via `Context7-API-Key` header (optional - higher rate limits when provided)
- **Tools**: 2 core tools explicitly configured: `resolve-library-id`, `get-library-docs`
- **Script**: `scripts/context7-mcp.js` for local server testing (legacy)
- **Command**: `npm run context7:mcp` (local server with --remote-check option)
- **Documentation**: No dedicated doc file yet (consider creating `docs/CONTEXT7_MCP_SETUP.md`)

### Available Capabilities (2 Tools)

**resolve-library-id**:

- **Purpose**: Resolves general library names to Context7-compatible library IDs
- **Input**: `libraryName` (required) - The name of the library to search for (e.g., "Next.js", "React", "MongoDB")
- **Output**: List of matching libraries with:
  - Context7-compatible library ID (format: `/org/project` or `/org/project/version`)
  - Benchmark Score (quality indicator, 100 is highest)
  - Code Snippets count (available code examples)
  - Source Reputation (High, Medium, Low, or Unknown)
  - Available versions list
- **Usage**: **MUST be called before `get-library-docs`** unless user provides explicit library ID in query

**get-library-docs**:

- **Purpose**: Fetches documentation for a specific library using Context7-compatible ID
- **Inputs**:
  - `context7CompatibleLibraryID` (required) - Exact library ID from `resolve-library-id` (e.g., `/mongodb/docs`, `/vercel/next.js`)
  - `topic` (optional) - Focus docs on specific topic (e.g., "routing", "hooks", "authentication")
  - `page` (optional, default 1) - Page number for pagination (1-10); try page=2, page=3 with same topic if context insufficient
- **Output**: Up-to-date documentation content with code examples
- **Rate Limits**: Higher with API key (optional), basic rate limits without

### Workflow Pattern

**Standard Documentation Lookup**:

1. User asks: "How do I use Next.js App Router?"
2. AI calls `resolve-library-id` with `libraryName: "Next.js"`
3. AI selects best match (highest benchmark score, most snippets, High reputation)
4. AI calls `get-library-docs` with resolved ID (e.g., `/vercel/next.js`) and `topic: "App Router"`
5. If insufficient, try `page: 2` with same topic

**With Explicit Library ID**:

- User provides: "Show me docs for `/mongodb/docs` about aggregation"
- AI skips `resolve-library-id`, directly calls `get-library-docs` with ID and topic

**Selection Criteria** (from resolve-library-id):

- Name similarity to query (exact matches prioritized)
- Description relevance to query intent
- Documentation coverage (higher Code Snippet counts preferred)
- Source reputation (High or Medium more authoritative)
- Benchmark Score (quality indicator)

### Usage Examples

**Library Discovery**:

```
"Find the Context7 library ID for React"
"What libraries are available for TypeScript?"
"Show me documentation options for MongoDB"
```

**Direct Documentation Lookup**:

```
"How do I use Next.js server actions?"  # → resolve-library-id("Next.js") → get-library-docs("/vercel/next.js", topic="server actions")
"Show me Prisma migration examples"  # → resolve-library-id("Prisma") → get-library-docs(resolved_id, topic="migrations")
"What are the best practices for React hooks?"  # → resolve-library-id("React") → get-library-docs(resolved_id, topic="hooks")
```

**With Explicit IDs** (skip resolution):

```
"Get docs for /mongodb/docs about indexes"
"Show me /vercel/next.js documentation on caching"
```

**Pagination for Deep Topics**:

```
"Show me more about Next.js routing"  # If first response insufficient
→ AI automatically tries page=2, page=3 with same topic
```

### Environment Setup

**Optional (for higher rate limits)**:

- Local: `.env.local` contains `CONTEXT7_API_KEY=...`
- Production: Vercel environment variable `CONTEXT7_API_KEY`
- Without key: Basic rate limits apply (still functional)

**Testing**:

```bash
npm run context7:mcp              # Start local server
npm run context7:mcp -- --remote-check  # Ping remote endpoint
```

### Integration with Development Workflow

**Complements Existing Documentation Tools**:

- Sanity MCP: Content management and blog documentation
- GitHub MCP: Repository-specific code context
- Context7 MCP: **External library/framework documentation** (NEW capability)

**Use Cases**:

- Real-time library documentation lookup without leaving IDE
- Up-to-date API references (no stale docs)
- Code examples and best practices for popular frameworks
- Quick answers about library-specific patterns
- Exploring unfamiliar libraries during development

### Best Practices

**Tool Call Order**:

1. Always call `resolve-library-id` first (unless explicit ID provided)
2. Review match quality (benchmark score, snippet count, reputation)
3. Select most relevant library from results
4. Call `get-library-docs` with resolved ID + optional topic
5. Use pagination if initial response insufficient

**Topic Specificity**:

- Be specific: "authentication with JWT" > "authentication"
- Use library terminology: "App Router" (Next.js), "aggregation" (MongoDB)
- Try variations if first attempt returns generic content

**Pagination Strategy**:

- Start with page=1 (default)
- If content insufficient or cuts off mid-section, try page=2
- Maintain same topic across page requests for continuity
- Max pagination: 1-10 (consider refining topic if reaching high pages)

### Configuration Best Practices

**mcp.json Structure**:

```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp",
      "tools": ["get-library-docs", "resolve-library-id"], // ← CRITICAL: Explicit tool list
      "env": {
        "CONTEXT7_API_KEY": "<YOUR_CONTEXT7_API_KEY>"
      },
      "headers": {
        "Context7-API-Key": "{{CONTEXT7_API_KEY}}"
      },
      "description": "Context7 MCP Server - 2 tools: resolve-library-id (find library IDs), get-library-docs (fetch docs with topic/page pagination)"
    }
  }
}
```

**Why `tools` Array Matters**:

- Some MCP clients require explicit tool declaration
- Prevents ambiguity about available capabilities
- Enables tool-level filtering/scoping
- Matches official Context7 documentation pattern

### Troubleshooting

**"No results from resolve-library-id"**:

- Try broader search term: "React" instead of "React Hooks"
- Check spelling of library name
- Some libraries may not be indexed yet

**"get-library-docs returns generic content"**:

- Add specific `topic` parameter
- Try pagination (page=2, page=3) for deeper sections
- Verify library ID format: `/org/project` or `/org/project/version`

**"Rate limit exceeded"**:

- Add `CONTEXT7_API_KEY` for higher limits
- Spread requests over time
- Cache frequently accessed documentation locally

**"Library version not found"**:

- Use `resolve-library-id` to check available versions
- Omit version to get default/latest docs
- Format: `/org/project/v1.2.3` (check exact version format)

### Future Enhancements (Planned)

- Wrapper script: `scripts/test-context7-mcp.mjs` for connectivity testing
- Documentation: `docs/CONTEXT7_MCP_SETUP.md` comprehensive guide
- Dashboard: Context7 status card in Storybook observability
- Caching: Local cache of frequently requested library docs
- Analytics: Track most-used libraries for project insights

### Official Resources

- GitHub: https://github.com/upstash/context7
- MCP Package: `@upstash/context7-mcp`
- Remote Endpoint: https://mcp.context7.com/mcp
- API Dashboard: https://context7.com/api/v1 (API key management)

Keep this section and `CLAUDE.md` synchronized whenever Context7 MCP configuration changes.

## Storybook MCP Addon (Dec 2025)

### Overview

The `@storybook/addon-mcp` provides an MCP (Model Context Protocol) server that helps AI agents develop UI components more efficiently. It enables a workflow where agents automatically generate and link example stories for each UI component, providing visual verification, documentation, and component tests.

### Configuration

- **Server URL**: Runs at `http://localhost:6006/mcp` when Storybook dev server is active
- **Addon**: Added to `.storybook/main.ts` addons array
- **Transport**: HTTP (streamable-http)
- **Toolsets**: Dev Tools (enabled by default) + Docs Tools (experimental, requires feature flag)

### Available Toolsets

**Dev Tools** (Always Available):

1. **`get-ui-building-instructions`** - Provides agents with standardized instructions for UI component development:
   - Writing Storybook stories using CSF3 format
   - Component development best practices
   - Story linking requirements
   - Ensures agents follow project conventions

2. **`get-story-urls`** - Retrieves direct URLs to specific stories:
   - Input: `absoluteStoryPath`, `exportName`, optional `explicitStoryName`
   - Output: Direct story URL (e.g., `http://localhost:6006/?path=/story/example-button--primary`)
   - Enables agents to visually verify components

**Docs Tools** (Experimental - Requires Feature Flag):

1. **`list-all-components`** - Lists all available components with metadata:
   - Component names, file paths, export names
   - Available stories for each component
   - Enables component discovery

2. **`get-component-documentation`** - Fetches detailed component documentation:
   - Component API (props, types)
   - Usage examples from stories
   - JSDoc comments and TypeScript types

### Installation

The addon is already installed and configured in `.storybook/main.ts`:

```typescript
addons: [
  "@storybook/addon-docs",
  "@storybook/addon-a11y",
  "@storybook/addon-mcp",
],
```

### Enabling Docs Tools (Optional)

To enable experimental Docs Tools, update `.storybook/main.ts`:

```typescript
export default {
  addons: [
    {
      name: "@storybook/addon-mcp",
      options: {
        toolsets: {
          dev: true, // Story URLs and UI instructions
          docs: true, // Component manifest and documentation
        },
        experimentalFormat: "markdown", // or 'xml'
      },
    },
  ],
  features: {
    experimentalComponentsManifest: true, // Required for docs toolset
  },
};
```

**Note**: Docs Tools only supported in React-based Storybook setups.

### Configuring AI Agents

**GitHub Copilot** (Already integrated via workspace):
No additional configuration needed. The MCP server is automatically discovered when Storybook is running.

**Claude Code** (Manual setup):

```bash
claude mcp add storybook-mcp --transport http http://localhost:6006/mcp --scope project
```

**Other MCP Clients** (Cursor, Cline, Zed, Continue):
Add to your MCP configuration:

```json
{
  "storybook-mcp": {
    "type": "http",
    "url": "http://localhost:6006/mcp"
  }
}
```

### Selective Toolset Configuration

You can configure which toolsets are available via headers:

```json
{
  "storybook-mcp": {
    "url": "http://localhost:6006/mcp",
    "type": "http",
    "headers": {
      "X-MCP-Toolsets": "docs" // Only enable docs tools
    }
  }
}
```

Options: `"dev"`, `"docs"`, or `"dev,docs"` (comma-separated)

### Usage Examples

**Dev Tools**:

```
"Get UI building instructions for this project"
"Show me the URL for the Button primary story"
"I need to see all variants of the Card component"
```

**Docs Tools** (with feature flag enabled):

```
"List all available components in the design system"
"Show me the documentation for the Button component"
"What props does the Card component accept?"
"Find all components that have a 'loading' state"
```

### Agent Prompt Recommendation

Add to your agent's system or project prompt:

```
Before doing any UI, frontend or React development, ALWAYS call the storybook MCP server to get further instructions.
```

This ensures agents use Storybook tools automatically during component development.

### Workflow Integration

**Complements Existing Tools**:

- Context7 MCP: External library documentation
- GitHub MCP: Repository code context
- Storybook MCP: **Internal component documentation and visual verification**

**Use Cases**:

- Automated story generation for new components
- Visual verification links during development
- Component API exploration without leaving IDE
- Design system discovery and consistency checks
- Ensuring all components have proper Storybook coverage

### Testing

**Verify MCP Server**:

```bash
npm run storybook  # Start Storybook on port 6006
# Then visit http://localhost:6006/mcp in browser
# Should see addon status page with available toolsets
```

**Test with curl**:

```bash
curl -X POST http://localhost:6006/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

### Best Practices

**Story Development**:

1. Agent calls `get-ui-building-instructions` to understand project conventions
2. Agent creates component with multiple story variants
3. Agent uses `get-story-urls` to provide visual verification links
4. Developer can immediately see and test the component in Storybook

**Component Discovery** (with Docs Tools):

1. Agent calls `list-all-components` to find relevant components
2. Agent uses `get-component-documentation` for detailed API information
3. Agent follows existing patterns from similar components
4. Ensures consistency across design system

### Troubleshooting

**"MCP server not responding"**:

- Ensure Storybook is running: `npm run storybook`
- Verify port: Check `.storybook/main.ts` for custom port configuration
- Check browser: Visit `http://localhost:6006/mcp` to see status page

**"Docs tools not available"**:

- Enable feature flag: `features: { experimentalComponentsManifest: true }`
- React-only: Docs tools only work with React-based Storybook setups
- Restart Storybook after configuration changes

**"Agent not using tools"**:

- Add explicit prompt: "Get UI building instructions from Storybook"
- Use Agent mode (not Chat mode) in IDEs like VSCode/Cursor
- Ensure using Claude Sonnet 4.5 or better for reliable tool usage

### Official Resources

- GitHub: https://github.com/storybookjs/mcp
- Package: `@storybook/addon-mcp`
- Documentation: https://github.com/storybookjs/mcp/tree/main/packages/addon-mcp

Keep this section and `CLAUDE.md` synchronized whenever Storybook MCP configuration changes.

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

- Configuration: `mcp.json` → **Three connection methods**:
  1. **`"figma"`** (Remote) - `https://mcp.figma.com/mcp` (HTTP, OAuth, **recommended**)
  2. **`"figma-desktop"`** (Desktop) - `http://127.0.0.1:3845/mcp` (HTTP, desktop app)
  3. **`"figma-developer-mcp"`** (Developer) - `http://localhost:3333/sse` (SSE, token-based)
- Authentication:
  - **Remote**: OAuth (browser login, most secure, no setup)
  - **Desktop**: Automatic via Figma desktop app (requires Dev Mode enabled)
  - **Developer**: Uses `FIGMA_TOKEN` environment variable (Personal Access Token)
- Script: `scripts/test-figma-mcp.mjs` tests connectivity, configuration, and authentication
- Command: `npm run figma:mcp:test`
- Documentation: `docs/FIGMA_MCP_SETUP.md`
- Package: `figma-developer-mcp` - Start server with `npx figma-developer-mcp` (Developer MCP only)

**Connection Methods:**

1. **Remote MCP** (Recommended):
   - ✅ No desktop app required
   - ✅ OAuth authentication (secure, no token management)
   - ✅ Link-based access (copy Figma URL → paste in prompt)
   - ✅ Works anywhere (CI/CD, remote work)
   - 🎯 Best for: Teams, automation, general use

2. **Desktop MCP**:
   - ✅ Real-time selection-based access (select in Figma → prompt)
   - ✅ Offline capable
   - ✅ Automatic authentication via desktop app
   - ⚠️ Requires Figma desktop app + Dev Mode enabled
   - ⚠️ Requires Dev or Full seat on paid plans
   - 🎯 Best for: Interactive design-to-code workflows

3. **Developer MCP** (Legacy):
   - ✅ Full programmatic API control
   - ⚠️ Requires running `npx figma-developer-mcp` server
   - ⚠️ Token management required
   - 🎯 Best for: Custom scripts, advanced automation

**Environment Setup:**

- Local (Remote/Desktop): No environment variables needed (OAuth or app login)
- Local (Developer): `.env.local` contains `FIGMA_TOKEN=figd_...`
- Production (Developer): Vercel environment variable `FIGMA_TOKEN`
- Testing: Script automatically loads dotenv for local testing

**Available Capabilities:**

- Design file analysis and component extraction
- Asset downloading and design token extraction
- Code generation from frames (with Code Connect support)
- Make prototype resources (code context from prototypes)
- Design system documentation and consistency checking
- Design-to-code generation and implementation guidance
- Collaborative design workflow integration

**Rate Limits:**

- Starter/View/Collab seats: 6 tool calls per month
- Dev/Full seats (paid plans): Tier 1 API rate limits (per minute, same as REST API)

**Usage Examples:**

Remote MCP (link-based):

```
"Implement this design: https://www.figma.com/design/abc123?node-id=1-2"
"Extract design tokens from [Figma URL]"
```

Desktop MCP (selection-based):

```
"Convert my current Figma selection to React"
"Generate CSS for the selected component"
```

Developer MCP (API-based):

```
"List all components in file d8nFs8A5KcjbFr6KkwZV4H5K"
"Export icons from the design system"
```

### Sanity MCP Server (Dec 2025)

- Configuration: `mcp.json` → `"sanity"` entry points at `https://mcp.sanity.io` (remote HTTP server)
- Authentication: **OAuth by default** (expires after 7 days), optional `SANITY_TOKEN` for token-based auth
- Script: `scripts/test-sanity-mcp.mjs` tests connectivity, configuration, token/OAuth setup, and Client API
- Command: `npm run sanity:mcp:test`
- Documentation: `docs/SANITY_MCP_SETUP.md` and `docs/SANITY_MIGRATION.md`

**Environment Setup:**

- Local: `.env.local` optionally contains `SANITY_TOKEN=sk...` (token auth), plus `SANITY_PROJECT_ID`, `SANITY_DATASET`
- Production: Vercel environment variables `SANITY_TOKEN`, `SANITY_PROJECT_ID`, `SANITY_DATASET`
- OAuth: Default authentication method (no env vars required), MCP clients prompt for credentials
- Testing: Script tests both OAuth-ready state and token-based authentication

**Available Capabilities (40+ Tools):**

**High-Priority Operations:**

- **Document Operations**: `create_document`, `update_document`, `patch_document`, `transform_document`, `translate_document`, `publish_document`, `unpublish_document`, `delete_document`
- **Version Management**: `create_version`, `version_replace_document`, `version_discard_document`, `version_unpublish_document`
- **GROQ & Queries**: `get_groq_specification`, `query_documents`
- **Semantic Search**: `semantic_search`, `list_embeddings_indices`
- **Image Operations**: `transform_image` (AI-powered generation/transformation)
- **Release Management**: `list_releases`, `create_release`, `edit_release`, `schedule_release`, `publish_release`, `archive_release`, `unarchive_release`, `unschedule_release`, `delete_release`

**Supporting Operations:**

- **Project & Schema**: `list_projects`, `get_project_studios`, `get_schema`, `list_workspace_schemas`, `get_context`
- **Dataset Management**: `list_datasets`, `create_dataset`, `update_dataset`
- **Migration & Documentation**: `sanity_migration_guide`, `migrate_schema`, `migrate_content`, `search_docs`, `read_docs`, `list_learn_docs`, `read_learn_docs`

**Integration with Existing Scripts:**

Your project has comprehensive Sanity automation in `scripts/sanity-migration/`:

- ✅ Existing: `sanity:parse-posts`, `sanity:convert`, `sanity:upload`, `sanity:sync-from-remote`, `sanity:cleanup-legacy`
- ❌ MCP-exclusive: Semantic search, GROQ assistance, translations, version/release management
- 🎯 Recommendation: Use existing scripts for batch migrations, use MCP for interactive editing and workflows

**Authentication Troubleshooting:**

- OAuth sessions expire after 7 days; refresh automatically in compatible clients
- Token rotation: Create tokens at https://www.sanity.io/manage
- Clear stuck sessions: VS Code (`Authentication: Remove Dynamic Authentication Providers`), Cursor (`Cursor: Clear All MCP Tokens`)

**Future Wrapper Scripts (Planned):**

```bash
npm run sanity:semantic-search <query>  # Embeddings-based content discovery
npm run sanity:groq <nl-query>          # Natural language → GROQ query
npm run sanity:translate <doc-id> <lang> # Translate document with formatting preservation
npm run sanity:version:create <doc-id> <release-id>  # Create document version
npm run sanity:release:schedule <release-id> <datetime>  # Schedule release
```

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
