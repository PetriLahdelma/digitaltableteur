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

### ⚠️ CRITICAL: Component Creation Rules

**BEFORE creating ANY new component, ALWAYS refer to `docs/LLM_COMPONENT_GENERATION_RULES.md`**

This comprehensive guide (10 sections, 12,000+ words) covers:

- Core architecture & design system patterns
- CSS Modules & styling requirements (logical properties, design tokens, theme support)
- Component API design & props patterns
- Internationalization (i18n) for 3 languages
- React best practices & performance optimization
- Accessibility (a11y) requirements & testing
- Testing strategy (Vitest, axe-core, >80% coverage)
- Code quality & linting (ESLint, Stylelint, Prettier)
- Storybook & documentation standards
- Complete pre-commit checklist

**Following these rules ensures consistency, accessibility, and quality across all components.**

---

When working with this project, please:

- Maintain test coverage for critical functionality
- Use the `@dt/` component library when available
- Keep Storybook visual regression baselines current and review diffs before merging
- Every Storybook story displays a persistent WIP badge (localized) until the story explicitly opts out via `export const ... = { parameters: { wip: { disabled: true }}}`. Use this to signal audit readiness. Removing the badge should coincide with accessibility + visual + translation verification.

## Architecture Notes

### Logical Properties & Defensive CSS (Nov 2025)

We migrated remaining physical directional properties (margin-left/right, padding-left/right, border-left) to logical equivalents to improve:

3. Reduction of duplication (single `margin-inline` or `padding-inline`).

Key patterns applied:

- Spacing fallbacks: use `margin-inline-start` within gap fallbacks; when both start/end are zero replace with `margin-inline: 0`.
- Borders: `border-inline-start` for blockquote and checkbox checkmark drawing.
- Wide layout compensation: replaced paired `margin-left/right` calc offsets with single `margin-inline`.

Checkbox checkmark shape retained using logical border; geometry unaffected.

- Audit any remaining physical properties in page-specific styles (work subpages, legacy modules) as they evolve.
- Add automated lint autofix suggestions to CONTRIBUTING / instructions.

### Sentry Observability (Nov 2025)

Added Sentry integration for error + performance tracing:

- Vite plugin (`@sentry/vite-plugin`) conditionally enabled when DSN present; source maps generated & uploaded.
- Environment / release: `environment` derives from `import.meta.env.MODE`; optional `release` can be injected via `SENTRY_RELEASE` in CI and echoed to window global `__DT_RELEASE__` if needed before bootstrap.
- Performance sampling: default `tracesSampleRate` 0.05, adjustable via `VITE_SENTRY_TRACES_SAMPLE_RATE`.
- Error boundary wraps `<App />` only when Sentry enabled to avoid extra react tree depth locally.
- Required build-time env vars for plugin: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` (defaults provided for org/project) handled via process environment (not exposed to browser).

Operational Notes:

1. Set `VITE_SENTRY_DSN` in `.env` for production; omit in local dev to skip overhead.
2. CI should export `SENTRY_RELEASE=$(git rev-parse --short HEAD)` before build for release grouping.
3. Source map upload deletes maps afterward (configured) to keep public bundle lean; disable deletion for debugging by removing `filesToDeleteAfterUpload`.
4. Adjust sampling in high-volume scenarios to manage quota.
5. Future MCP server can expose Sentry issue queries; plan: add command server to `mcp.json` that shells out to a small node script using Sentry REST API.

Testing:

- Verify initialization by forcing an error (e.g., temporary throw in a component) and confirming event in Sentry dashboard.
- Performance traces appear when navigation + React render spans occur (instrumentation via `browserTracingIntegration()`).

Internationalization:

Security:

- Do not commit auth token; rely on CI secret injection. DSN safe for client exposure.

- Replace static fallback boundary text with localized variant and add test ensuring translation keys present.

- **Reusable Navigation**: `NavMenuList` centralizes active state (exact/prefix), applies `aria-current="page"`, and exposes styling hooks (`listClassName`, `itemClassName`, `activeClassName`) for patterns like the mobile menu and future sidebars.
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

## Linear Issue Automation (Nov 2025)

Automated Linear issue management via TypeScript scripts in `scripts/linear/`. Core functionality in `lib/linear/createIssue.ts`.

### Creating Issues (For LLMs)

**Critical Decision Point:** When user requests ticket creation:

- "Create a ticket" → `stateName: "In Progress"` + `assigneeEmail: "petri@digitaltableteur.com"`
- "Create a todo" → omit `stateName` or use `"Todo"`

**Template for Programmatic Creation:**

```typescript
import {
  createLinearIssue,
  validateLinearEnv,
} from "../../lib/linear/createIssue";

validateLinearEnv();
const result = await createLinearIssue({
  title: "Short descriptive title (<80 chars)",
  description:
    "Markdown description with context, acceptance criteria, branch name",
  priority: 1, // 0=P1, 1=P2, 2=P3, 3=P4
  labelNames: ["design-system", "Improvement"], // See docs/LINEAR_LABELS.md
  assigneeEmail: "petri@digitaltableteur.com",
  stateName: "In Progress", // NEW: auto-resolve workflow state
});
console.log(`Created ${result.identifier}: ${result.url}`);
```

### Quick Commands

**Check issue status:**

```bash
npx tsx scripts/linear/check-issue.ts DIG-16
```

**Update issue state:**

```bash
npx tsx scripts/linear/update-issue.ts --issue DIG-16 --state "Done"
```

**Add labels:**

```bash
npx tsx scripts/linear/update-issue.ts --issue DIG-16 --add-label "Bug,ui-app-bug"
```

### Label Selection Guide

Refer to `docs/LINEAR_LABELS.md` for full list. Common choices:

- Component/design system work: `design-system`
- Feature enhancements: `Improvement`
- Bugs: `Bug` or `ui-app-bug`
- Infrastructure/tooling: `automation`, `observability`, `linear`

### State Support (Added Nov 2025)

The `createLinearIssue()` function now accepts `stateName` (e.g., "In Progress", "Todo", "Done") or `stateId`. State is auto-resolved against team workflow states. This eliminates the need for separate update calls after creation.

**Before (two-step):**

```typescript
const issue = await createLinearIssue({
  title,
  description,
  priority,
  labelNames,
  assigneeEmail,
});
await updateIssue(issue.id, { stateId: "..." }); // Manual follow-up
```

**After (atomic):**

```typescript
const issue = await createLinearIssue({
  title,
  description,
  priority,
  labelNames,
  assigneeEmail,
  stateName: "In Progress", // One call, correct state immediately
});
```

### Environment Requirements

`.env.local` must contain:

```bash
LINEAR_API_KEY=lin_api_...
LINEAR_TEAM_ID=...
LINEAR_PROJECT_ID=...  # Optional
```

### LLM Best Practices

1. **Assignee Default**: Always set `assigneeEmail: "petri@digitaltableteur.com"` unless specified otherwise.
2. **State Inference**: "ticket" = in progress, "todo" = backlog/todo.
3. **Priority Mapping**: Critical=P1(0), Important=P2(1), Standard=P3(2), Low=P4(3).
4. **Description Format**: Include goals, acceptance criteria, branch name, related docs.
5. **Label Validation**: Check `docs/LINEAR_LABELS.md` before using; script warns if labels missing.

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

### Dependency Maintenance (Nov 2025)

Recent minor/patch updates applied:

- @ai-sdk/gateway / @ai-sdk/openai / @ai-sdk/react bumped within 2.0.x for incremental fixes.
- i18next and react-i18next updated (same major) for improved async loading stability.
- react-router-dom advanced to 7.9.x (internal perf + bug fixes; no API changes affecting current usage).
- Storybook core packages moved from 10.0.2 → 10.0.5 (docs + a11y improvements).
- @typescript-eslint parser & plugin updated (8.33.x → 8.46.x) for enhanced lint rule parity.

All 312 tests pass post-update; translation and a11y coverage unchanged.

**Nov 2025 Dependency Cleanup:**

- Removed unused `react-stack-grid` dependency to eliminate React 16 peer dependency warnings
- Updated Node.js engine constraint from `>=20.19.0 <21` to `>=20.19.0` to support modern Node.js versions (22.x) in Vercel deployments
- Clean dependency tree without legacy React version conflicts

Next candidates (deferred):

- Evaluate Vitest 4.x upgrade after Storybook stabilization.
- Monitor ESLint 9.x adoption; schedule ruleset review before major jump.

### Sentry Automation (Nov 2025)

Automated summary generation introduced:

Scripts:

- `scripts/sentry-automation.mjs` orchestrates env validation, optional project discovery (`list-projects` via MCP), real summary fetch, and stub fallback.
- Falls back to a stub JSON (`stub: true`, reason field) when auth/project unavailable or fetch fails.

NPM Commands:

- `npm run sentry:summary:auto` – Attempt real summary (unresolved + production environment) then write JSON.
- `npm run sentry:summary:stub` – Force stub summary generation regardless of env state.
- `npm run generate:sentry-summary` – Legacy direct summary script for deterministic runs.
- `postbuild` hook triggers `sentry:summary:auto` with fallback to stub to avoid failing CI builds.

JSON Output Location:

- `public/observability/sentry-summary.json`

Stub Detection:

- Consumer components (e.g., `SentrySummaryCard`) can optionally inspect `data.stub` to differentiate real vs placeholder data in future enhancements (not yet implemented in component logic).

Usage Notes:

1. Ensure `.env.local` contains `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` (or allow automation to discover project if absent).
2. For local testing without credentials: run stub script to keep dashboard functional.
3. Adjust environment filtering via `--environment=staging` flag appended to npm scripts if multi-env branching required.

Next Steps:

### Context7 MCP Integration (Nov 2025)

- `mcp.json` now declares a `context7` HTTP server pointing at `https://mcp.context7.com/mcp`. The configuration forwards the `CONTEXT7_API_KEY` environment variable via the `Context7-API-Key` header so we can keep keys in `.env.local` / CI secrets instead of checking them into the repo. Leaving the variable empty still works (anonymous mode) but enforces stricter rate limits. The REST/dashboard surface Context7 exposes lives at `https://context7.com/api/v1`, so that’s the base URL to poke when you need to inspect quotas or rotate keys.
- `npm run context7:mcp -- --remote-check` hits the hosted MCP endpoint (using the same header) to verify connectivity; without the flag the helper still launches the local stdio server via `@upstash/context7-mcp`.
- Donny’s tool loader automatically namespaces remote tools as `context7.<toolName>`, making it obvious when an answer is powered by Context7’s up-to-date documentation. Disable it by removing the config block or unsetting the env var.
- Local debugging shortcut: `npm run context7:mcp -- [extra flags]`. The wrapper spawns `@upstash/context7-mcp` via `npx`, injects `CONTEXT7_API_KEY` unless you already passed `--api-key`, and streams logs directly to your terminal.
- Document the requirement for `CONTEXT7_API_KEY` anywhere environment variables are listed (README, copilot-instructions, donny-chat docs) so future contributors know how to opt in.

- Expose stub indicator in `SentrySummaryCard` header (optional badge).
- Add unit test for stub scenario (pending).

### Design System Card Component (Dec 2025)

The `Card` component has evolved into a central design-system primitive mirroring a refined subset of Ant Design functionality while remaining lightweight and token-driven.

API Summary:

- Title / SubTitle / Extra regions form the header (`<h3>` semantic for title; consumer manages overall document outline).
- Optional `cover` slot renders media at top (image/figure) with enforced block formatting and radius.
- `actions` footer renders mapped buttons with consistent uppercase microcopy styling.
- `tabs` provide contextual segmentation; uncontrolled (`defaultActiveTabKey`) or controlled (`activeTabKey` + `onTabChange`). Disabled tabs inert.
- `hoverable` adds elevation + subtle background shift for interactive affordance.
- `bordered` toggles visible border (default true) while base shadow remains subtle.
- `size` adjusts internal padding scale (`sm`, `md`, `lg`).
- `loading` triggers skeleton placeholder (gradient shimmer, respects reduced motion if future enhancement added) and hides body content. Skeleton uses `role="status"`, `aria-busy="true"`, and localized label (`card.loading`).
- Link variant wraps card in anchor (`link` + optional `linkLabel` for improved accessibility when title insufficient).
- Icon slot precedes title for compact visual identity.

Accessibility:

- Tablist uses `role="tablist"`; each tab has `role="tab"`, `aria-selected`, native `disabled`. Only one `aria-selected="true"` enforced; tests will guard this.
- Action buttons keyboard reachable; visible focus ring via outline.
- Skeleton announced via `aria-label`; future enhancement may add reduced motion fallback (document in instructions when done).
- Entire clickable card anchor variant sets `aria-label` fallback to `title` ensuring context clarity.

Styling:

- CSS Module variants: `.hoverable`, `.bordered`, `.unbordered`, size classes `.sm/.md/.lg`.
- Logical properties used for spacing; gap fallbacks with `@supports not (gap: ...)` margin shim.
- Skeleton animation defined with `@keyframes skeleton-pulse`; design tokens drive color/space/radius.
- Sans-serif typography maintained (project guidance: sans for body; heading uses same sans for consistency inside Card).

Internationalization:

- Added `card.loading` translation key (EN/FI/SV) for skeleton status; no other dynamic strings presently.
- Story labels remain demo-only; production usage retrieves copy from i18n where appropriate.

Testing Status:

- Unit tests cover: actions rendering + click, loading skeleton presence with proper aria, tab switching (uncontrolled), link variant semantics, header composition.
- Pending: Controlled tab edge-case test, single-active-tab a11y test, keyboard navigation refinements (roving tabindex pattern future), visual regression baseline inclusion.

Storybook:

- Stories: Default, Hoverable, Loading, WithCover, WithActions, Tabbed. All retain WIP badge until a11y + visual + translation checks pass.
- Tabbed story refactored to extracted component to satisfy hooks-in-render lint rule.

Future Enhancements:

- Keyboard arrow navigation between tabs (ARIA Authoring Practices alignment).
- Optional `headerLevel` prop to allow semantic variation without styling divergence.
- `actionsPlacement` variants (start/center/end) and possible inline overflow handling (responsive wrap).
- Selectable / radio-group card pattern layering selection state + ARIA.

Maintenance Notes:

- Avoid adding new color variables; rely on existing tokens.
- Ensure further variant additions documented here + in `.github/copilot-instructions.md` simultaneously.
- Update visual snapshots after intentional styling changes (`npm run test:visual -- --updateSnapshot`).

### Chat Email Workflow Inline Injection & Dual Triggers (Nov 2025)

The workflow renders inline within the last assistant message. Two trigger paths:

1. General intent ("send email", "compose email", multilingual variants) → `pendingEmailWorkflowGeneral` → assistant injects `chatEmailSendPhrase`.
2. Simple keyword (standalone "email" / "sähköposti" / "epost") → `pendingEmailWorkflowSimple` → assistant injects `chatEmailSimplePhrase` and reveals `mail@digitaltableteur.com`.

Architectural rationale:

1. Conversational continuity (context preserved inline)
2. Unified rendering path for states (`promptStart`, `collecting*`, `review`, `sending`, `success`, `error`)
3. Deterministic reducer; only side-effect is send on `sending`
4. Accessibility: step wrappers with `data-step`; success uses `data-testid="email-workflow-success"`

Sanitization & Triggering:

- `messageProcessor.ts` sets exactly one pending flag per user message; simple keyword regex anchored.
- Assistant consumes flag, injects phrase, mounts workflow, resets flag.

Testing Adjustments:

- General path test waits for any workflow step (robust to sequence tweaks).
- Simple path test asserts `chatEmailSimplePhrase` presence & success path.
- Success state test id reduces dependence on localized heading text.

Storybook:

- Email workflow stories remain separate for isolated visual regression of each state but production path only shows inline injection.
- WIP badge policy unchanged; remove badge once a11y, translations, and visual baselines validated.

Extending:

- To add fields: extend `EmailDraft`, insert new `collectingField` step in ordered sequence within reducer, update stories, add translations under `emailWorkflow.field.<fieldName>`, and adjust integration test harness (search for data-step selectors).
- Avoid renaming existing translation keys; additive changes simplify coverage maintenance.

### Endpoint Resolution Logic Update (Nov 2025)

The chat widget now treats private network IP hosts (RFC1918 ranges) the same as `localhost` and production domains when selecting the chat endpoint. Motivation: Vite dev server does not expose `/api/chat` locally, causing 404s when accessed via LAN IP (e.g., `192.168.x.x:5173`).

Implementation Details:

```ts
const isLocalLike =
  host === "localhost" ||
  host === "127.0.0.1" ||
  /^192\.168\./.test(host) ||
  /^10\./.test(host) ||
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host);
const isProdDomain =
  host === "digitaltableteur.com" || host === "www.digitaltableteur.com";
if (isLocalLike || isProdDomain) endpoint = REMOTE_CHAT_ENDPOINT;
```

Fallback now always returns the remote endpoint to avoid undefined behavior on arbitrary hosts (e.g., custom tunnel URLs). If a fully local mock is desired, set `VITE_DONNY_CHAT_ENDPOINT` to a local adapter service in `.env.local`.

Testing:

- Added `ChatWidget.endpoint.test.tsx` ensuring component mounts under `localhost` and `192.168.x.x` without throwing (smoke). Future enhancement: expose the resolved endpoint via a data attribute or debug prop for direct assertion.

Operational Notes:

- Remote endpoint is a serverless function with dynamic CORS allowlist; environment-aware origin detection allows development IPs (192.168.x.x, 10.x.x.x, 172.x.x.x) and localhost variants during development, while restricting to digitaltableteur.com domains in production.
- Streaming responses include CORS headers on the initial response for proper cross-origin AI SDK streaming compatibility.
- When adjusting those headers, follow Vercel's official guidance on enabling CORS: https://vercel.com/guides/how-to-enable-cors.
- For offline development or rate-limit isolation, consider a local proxy that mimics response streaming and set env var accordingly.

Future Considerations:

- Provide explicit environment badge in ChatHeader when using remote vs custom endpoint for transparency during QA.
- Add health preflight (small HEAD request) before first message to surface endpoint issues earlier.
- Integrate endpoint choice into observability summary for cross-environment diagnostics.

### SocialShare Component with Native Web Share API (Nov 2025)

The `SocialShare` component implements progressive enhancement with the Web Share API for modern mobile sharing experiences.

**Architecture & Feature Detection**

```typescript
const [supportsNativeShare, setSupportsNativeShare] = useState(false);
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  // Check if native sharing is supported
  if (typeof window !== "undefined" && "share" in navigator) {
    setSupportsNativeShare(true);
  }
}, []);
```

- Feature detection via `"share" in navigator` check
- Mobile detection using `window.matchMedia("(width < 768px)")`
- State-driven conditional rendering for appropriate UI

**Progressive Enhancement Pattern**

1. **Native Share (Mobile + Support)**: Share icon with device native share sheet
2. **Clipboard Copy (Fallback)**: Copy icon with clipboard.writeText() API
3. **Error Handling**: Native share failures gracefully fall back to copy

**Implementation Details**

```typescript
const handleNativeShare = async () => {
  try {
    await navigator.share({ title, url, text: title });
  } catch (error) {
    console.log("Native share failed, falling back to copy");
    handleCopy(); // Graceful fallback
  }
};
```

**Responsive Design Integration**

- Mobile: Icon-only buttons using `Button` component's `iconOnly` mode
- Desktop: Full button with text labels
- CSS logical properties for proper alignment with social media icons

**Testing Strategy**

- Mock `navigator.share` presence/absence via Object.defineProperty manipulation
- Test conditional rendering based on feature availability
- Validate fallback behavior when native share fails
- Comprehensive coverage of both mobile and desktop scenarios

**Accessibility Considerations**

- Proper ARIA labels for both share and copy actions
- Keyboard navigation support maintained
- Screen reader compatibility with role attributes
- Toast notifications for copy success feedback

**Browser Support Matrix**

- **iOS Safari 12+**: Native share sheet integration
- **Chrome Android 61+**: Native share functionality
- **Desktop Browsers**: Clipboard copy fallback
- **Legacy Mobile**: Standard clipboard copy behavior

**Internationalization**

Translation keys added for both share actions:

- `share`: "share" (EN), "jaa" (FI), "dela" (SV)
- `copyLinkToClipboard`: "Copy to clipboard" across languages

**Future Enhancements**

- Web Share API Level 2: File sharing support for images/documents
- Share target registration for PWA capabilities
- Custom share data validation and error messaging
- Analytics integration for share success/failure tracking

The implementation follows Web Platform best practices with feature detection, graceful degradation, and accessibility compliance across all interaction patterns.
