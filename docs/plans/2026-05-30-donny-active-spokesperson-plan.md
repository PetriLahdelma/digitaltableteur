# Donny Active Spokesperson Plan

> Created: 2026-05-30  
> Status: concept and implementation plan  
> Scope: make Donny an active Digitaltableteur spokesperson who can guide, navigate, spotlight, and explain the site without becoming intrusive.

## Executive Decision

Build a **Narrated Site Action System** for Donny.

Donny should stop behaving like a static floating chat box and start behaving like a restrained site docent: he listens, diagnoses intent, recommends the right Digitaltableteur offer or proof point, and can then guide the visitor to the exact page, section, or piece of content that answers the need.

The core interaction should be:

1. User asks or implies a need.
2. Donny answers briefly in brand voice.
3. Donny calls the right data tool to avoid guessing.
4. Donny calls a browser action tool only when the user intent justifies it.
5. The page moves to the right place.
6. The correct element is underlined or spotlighted.
7. Donny summarizes why that element matters and offers the next step.

This plan deliberately separates **knowledge tools** from **browser action tools**. Server tools can retrieve services, projects, pricing, contact details, and page targets. Client tools can navigate, scroll, highlight, annotate, and prefill local UI. The model should not invent selectors, routes, prices, project data, or page behavior.

## Current State Evidence

- Donny already uses Vercel AI SDK streaming through `streamText`, `convertToModelMessages`, `stepCountIs(3)`, and `toUIMessageStreamResponse` in [app/api/chat/route.ts](/Users/petrilahdelma/SAPDevelop/digitaltableteur/app/api/chat/route.ts:131).
- Server-side static tools already exist in [app/api/donny-tools.ts](/Users/petrilahdelma/SAPDevelop/digitaltableteur/app/api/donny-tools.ts:95), including `studio.openHours`, `studio.services`, `studio.projectShowcase`, `studio.navigateTo`, and `studio.contactCard`.
- The current `studio.navigateTo` validates internal paths and returns a URL, but it does not actually execute browser navigation by itself; it returns `{ navigated, url }` from the server in [app/api/donny-tools.ts](/Users/petrilahdelma/SAPDevelop/digitaltableteur/app/api/donny-tools.ts:402).
- The current prompt says "`studio.navigateTo` ... navigates their browser directly" in [app/api/chat-shared.ts](/Users/petrilahdelma/SAPDevelop/digitaltableteur/app/api/chat-shared.ts:119), which is not true in the current UI contract.
- Chat rendering converts tool results to a `NavigateLink` and `ProjectCards` in [nextjs-app/shared/components/ChatWidget/messageProcessor.ts](/Users/petrilahdelma/SAPDevelop/digitaltableteur/nextjs-app/shared/components/ChatWidget/messageProcessor.ts:113), then renders the navigation result as a link in [nextjs-app/shared/components/ChatWidget/ChatMessageBubble.tsx](/Users/petrilahdelma/SAPDevelop/digitaltableteur/nextjs-app/shared/components/ChatWidget/ChatMessageBubble.tsx:85).
- The client currently looks for legacy `tool-invocation` parts to resolve avatar state in [nextjs-app/shared/components/ChatWidget/ChatWidget.tsx](/Users/petrilahdelma/SAPDevelop/digitaltableteur/nextjs-app/shared/components/ChatWidget/ChatWidget.tsx:569). AI SDK UI documentation now shows typed tool part names like `tool-getWeatherInformation`, with states such as `input-streaming`, `input-available`, `output-available`, and `output-error`.
- Current component injection relies partly on hidden tokens and regex heuristics in [nextjs-app/shared/components/ChatWidget/messageProcessor.ts](/Users/petrilahdelma/SAPDevelop/digitaltableteur/nextjs-app/shared/components/ChatWidget/messageProcessor.ts:3) and [nextjs-app/shared/components/ChatWidget/messageProcessor.ts](/Users/petrilahdelma/SAPDevelop/digitaltableteur/nextjs-app/shared/components/ChatWidget/messageProcessor.ts:173).
- Donny already has proximity awareness through `[data-donny-interest]` in [nextjs-app/shared/components/ChatWidget/ChatToggle.tsx](/Users/petrilahdelma/SAPDevelop/digitaltableteur/nextjs-app/shared/components/ChatWidget/ChatToggle.tsx:12), but it only changes avatar expression.
- There are existing page anchors and interest markers that can become the first target registry: `services`, `design-sprints`, `work`, `contact-cta`, `pricing-packages-title`, and `contact-form` appear across the homepage, pricing, and contact surfaces.

## External API Guidance Used

Context7 returned current Vercel AI SDK guidance from the official Vercel AI repository:

- `streamText` in a Next.js route can return `result.toUIMessageStreamResponse()` for `useChat` clients.
- AI SDK UI renders streamed tool calls through typed message parts like `tool-<toolName>`.
- Client-side tools can be handled with `useChat({ onToolCall, sendAutomaticallyWhen })`.
- Tool outputs should be submitted with `addToolOutput` from `onToolCall`, and docs warn not to await `addToolOutput` to avoid deadlocks.
- `lastAssistantMessageIsCompleteWithToolCalls` can automatically continue the conversation after client-side tool outputs are available.

Relevant docs:

- https://github.com/vercel/ai/blob/main/content/docs/04-ai-sdk-ui/03-chatbot-tool-usage.mdx
- https://github.com/vercel/ai/blob/main/content/cookbook/01-next/90-render-visual-interface-in-chat.mdx
- https://github.com/vercel/ai/blob/main/content/docs/09-troubleshooting/05-tool-invocation-missing-result.mdx

## Product Definition

### What "Active Spokesperson" Means

Donny is not a general chatbot. Donny is the on-site representative of Digitaltableteur.

He should be able to:

- identify what the visitor probably needs;
- explain Digitaltableteur's approach with confidence and specificity;
- connect abstract visitor needs to concrete offers;
- show relevant work and proof;
- move the visitor to the correct page or section;
- underline or spotlight the exact information being referenced;
- open a guided contact or brief-writing path when the user is ready;
- remember the immediate page context without storing sensitive data.

He should not:

- hijack navigation without clear intent;
- use generic AI assistant language;
- over-explain every page;
- make hidden content appear only through chat;
- invent selectors, metrics, pricing, or project facts;
- trap focus, obscure key page content, or create accessibility debt.

### Spokesperson Voice Contract

Donny should speak as Digitaltableteur's guide, not as "an AI assistant."

Use:

- "I can show you the package that fits this."
- "That sounds like a design-system audit problem."
- "The useful proof is the SAP Build Apps work. I can open it and point to the scale."
- "This is the part to look at: fixed scope, 4 weeks, adoption playbook."

Avoid:

- "As an AI..."
- "I can browse the website for you."
- "Here is some information I found."
- "Please click this link" when Donny can perform the action safely.

### Consent Levels

Donny should choose actions based on user intent.

| Level | Trigger | Donny behavior |
| --- | --- | --- |
| Passive | User is browsing near relevant CTAs | Avatar expression or subtle chip only; no chat opening |
| Suggestive | User asks broad question | Answer + offer a button: "Show me" |
| Directed | User says "show me", "take me", "where is", "open" | Navigate or scroll automatically, then spotlight |
| Transactional | User asks to contact, book, send brief, submit details | Ask for confirmation before prefill or submit |
| Sensitive | External URL, personal data, destructive action | Refuse, ask clarification, or stay read-only |

## Experience Principles

1. **Useful before magical.** Every action must reduce effort or increase clarity.
2. **Narrate the movement.** Donny should say what he is doing before the page changes.
3. **Never point vaguely.** If Donny references information, he should target a registered page element.
4. **No arbitrary selectors.** The model can only reference whitelisted target IDs.
5. **Keep the user in control.** Highlight can be cleared, chat can be minimized, and navigation never targets external URLs.
6. **Motion is optional.** Reduced motion gets instant scroll and static underline.
7. **Content and UI stay in sync.** Tool outputs come from canonical project, consulting, and page-target data.
8. **No hallucinated authority.** If a tool has no answer, Donny says so and offers the next best path.

## Recommended Architecture

### 1. Site Action Registry

Create a typed registry that maps semantic target IDs to routes, safe selectors, labels, descriptions, and allowed highlight modes.

Suggested file:

- `nextjs-app/shared/data/donny-site-actions.ts`

Example shape:

```ts
export type DonnyTargetId =
  | "home.services"
  | "home.services.designSystems"
  | "home.designSprints"
  | "home.componentSchema"
  | "home.work"
  | "home.clients"
  | "home.contactCta"
  | "pricing.comparison"
  | "pricing.packages"
  | "pricing.package.uxSprint"
  | "pricing.package.aiReadyDesignOps"
  | "pricing.package.designSystemLiftOff"
  | "work.index"
  | "work.project.sapBuildApps"
  | "work.project.helsinkiDesignSystem"
  | "contact.form"
  | "contact.location";

export type DonnyHighlightMode = "underline" | "spotlight" | "pulse" | "focus";

export interface DonnyTarget {
  id: DonnyTargetId;
  route: string;
  selector: string;
  label: string;
  summary: string;
  allowedModes: DonnyHighlightMode[];
  fallbackTargetId?: DonnyTargetId;
}
```

Rules:

- `selector` must be a static selector controlled by the codebase, preferably `[data-donny-target="..."]`.
- `route` must start with `/`.
- Targets must cover desktop and mobile layouts.
- Target summaries must be public content only.
- Registry tests must fail if a target points to an external URL or an empty selector.

### 2. Page Markers

Add stable target markers to important sections and cards.

Suggested attributes:

```tsx
<section id="services" data-donny-target="home.services">
<article data-donny-target="home.services.designSystems">
<section id="design-sprints" data-donny-target="home.designSprints">
<section id="component-schema" data-donny-target="home.componentSchema">
<section id="work" data-donny-target="home.work">
<section data-donny-target="home.clients">
<section id="contact-cta" data-donny-target="home.contactCta">
```

Pricing markers:

```tsx
<section data-donny-target="pricing.comparison">
<section id="pricing-packages-title" data-donny-target="pricing.packages">
<article data-donny-target="pricing.package.designSystemLiftOff">
<article data-donny-target="pricing.package.aiReadyDesignOps">
<article data-donny-target="pricing.package.uxSprint">
```

Contact markers:

```tsx
<div id="contact-form" data-donny-target="contact.form">
<section data-donny-target="contact.location">
```

Project markers:

```tsx
<main data-donny-target={`work.project.${project.slug}`}>
<section data-donny-target={`work.project.${project.slug}.overview`}>
<section data-donny-target={`work.project.${project.slug}.proof`}>
```

Do not use generated selectors that depend on CSS module hashes.

### 3. Browser Action Bus

Create a single client-side action executor. Donny should not directly manipulate DOM from message rendering.

Suggested files:

- `nextjs-app/shared/components/DonnyActionProvider/DonnyActionProvider.tsx`
- `nextjs-app/shared/components/DonnyActionProvider/DonnyActionProvider.module.css`
- `nextjs-app/shared/components/DonnyActionProvider/DonnySpotlightOverlay.tsx`
- `nextjs-app/shared/components/DonnyActionProvider/useDonnyActions.ts`
- `nextjs-app/shared/components/DonnyActionProvider/index.ts`

Mount it once in `NextLayout`, near `ChatWidget`.

Responsibilities:

- validate target ID against the registry;
- validate route starts with `/`;
- use Next router for internal navigation;
- wait for route completion and hydration;
- find target element by registry selector;
- scroll into view;
- apply underline or spotlight state;
- announce action through an `aria-live` region;
- return focus only when appropriate;
- expose clear/reset action;
- track executed tool call IDs so rerenders do not repeat effects.

### 4. Tool Part Normalizer

Replace the brittle `tool-invocation` assumption with a normalizer that supports both current AI SDK UI part style and any legacy message parts already stored in `localStorage`.

Suggested file:

- `nextjs-app/shared/components/ChatWidget/toolParts.ts`

Responsibilities:

- normalize `part.type === "tool-invocation"` legacy parts;
- normalize typed AI SDK UI parts like `tool-studio.projectShowcase` and `tool-client.showPageTarget`;
- expose `toolName`, `toolCallId`, `state`, `input`, `output`, and `errorText`;
- provide helpers for `input-streaming`, `input-available`, `output-available`, and `output-error`;
- keep all tool output rendering in one path.

Acceptance:

- Existing stored messages still render.
- New AI SDK v6-style typed tool parts render.
- Avatar state and action execution both consume the same normalized shape.

### 5. Tool Taxonomy

#### Server Knowledge Tools

These tools can execute on the server. They retrieve canonical content and propose safe next steps.

Keep and refine:

- `studio.openHours`
- `studio.services`
- `studio.projectShowcase`
- `studio.contactCard`

Add:

1. `studio.consultingPackages`

   Purpose: return packages from `CONSULTING_PACKAGES` in `nextjs-app/shared/data/consulting-catalog.ts`.

   Output includes `id`, `name`, `priceRangeEur`, `duration`, `description`, `targetId`, `contactServiceParam`.

2. `studio.matchNeed`

   Purpose: map a visitor problem to the right service, package, proof, and target.

   Input:

   ```ts
   {
     problem: string;
     currentPath?: string;
     locale?: "en" | "fi" | "sv";
   }
   ```

   Output:

   ```ts
   {
     recommendedServiceId: string;
     recommendedPackageId?: string;
     confidence: "high" | "medium" | "low";
     rationale: string;
     suggestedTargets: DonnyTargetId[];
     suggestedProjects: string[];
     qualifyingQuestion?: string;
   }
   ```

3. `studio.siteTargets`

   Purpose: expose the safe target registry to the model in compact form.

   Input:

   ```ts
   {
     route?: string;
     intent?: "pricing" | "services" | "proof" | "contact" | "work" | "location";
   }
   ```

   Output:

   ```ts
   {
     targets: Array<{
       id: DonnyTargetId;
       route: string;
       label: string;
       summary: string;
       allowedModes: DonnyHighlightMode[];
     }>;
   }
   ```

4. `studio.contentSpotlight`

   Purpose: choose a safe target for an explanation.

   Input:

   ```ts
   {
     userNeed: string;
     preferredRoute?: string;
     currentPath?: string;
   }
   ```

   Output:

   ```ts
   {
     targetId: DonnyTargetId;
     reason: string;
     narration: string;
     fallbackTargetId?: DonnyTargetId;
   }
   ```

#### Client Browser Tools

These tools should be declared in the AI SDK tool set without server `execute`, then handled in the client with `useChat({ onToolCall })`.

1. `client.showPageTarget`

   Purpose: navigate, scroll, and highlight a whitelisted target.

   Input:

   ```ts
   {
     targetId: DonnyTargetId;
     mode: "navigate" | "scroll" | "highlight";
     highlightMode?: DonnyHighlightMode;
     narration?: string;
     requiresConfirmation?: boolean;
   }
   ```

   Output:

   ```ts
   {
     ok: boolean;
     targetId: DonnyTargetId;
     route: string;
     action: "navigated" | "scrolled" | "highlighted" | "skipped";
     reason?: string;
   }
   ```

2. `client.clearPageTarget`

   Purpose: remove current underline or spotlight.

   Output:

   ```ts
   { ok: boolean }
   ```

3. `client.prefillContactIntent`

   Purpose: prefill local contact flow fields, never submit.

   Input:

   ```ts
   {
     serviceId?: string;
     packageId?: string;
     messageDraft?: string;
     sourceTargetId?: DonnyTargetId;
   }
   ```

   Output:

   ```ts
   {
     ok: boolean;
     targetId: "contact.form";
     prefilledFields: string[];
   }
   ```

4. `client.capturePageContext`

   Purpose: give Donny current non-sensitive page context.

   Output:

   ```ts
   {
     path: string;
     locale: "en" | "fi" | "sv";
     visibleTargetIds: DonnyTargetId[];
     lastInterest?: string;
   }
   ```

   This tool must not capture form values, typed drafts, cookies, local storage, or arbitrary DOM text.

### 6. Chat UI Components

Add explicit UI for actionful tool calls.

Suggested components under `nextjs-app/shared/components/ChatWidget/`:

- `DonnyActionCard.tsx`
- `DonnyActionCard.module.css`
- `DonnyActionCard.test.tsx`
- `ToolResultProjectCards.tsx`
- `ToolResultOfferCards.tsx`
- `ToolStatus.tsx`

`DonnyActionCard` should display:

- pending state: "Finding the right section..."
- action state: "Opening Pricing..."
- success state: "Highlighted: Design System Lift-Off"
- failure state: "I could not find that section, but here is the link."
- controls: "Clear highlight", "Open in new tab" where useful.

Do not use text-only pills for core actions if an icon would communicate more clearly; use existing `Icon`/lucide conventions.

## Tool Call Choreography

### Flow A: User asks broad service question

User:

> What do you actually do?

Donny:

> We help product teams turn design systems into working infrastructure: tokens, components, governance, and AI-ready workflows. I can show you the clearest overview.

Tool sequence:

1. `studio.services({})`
2. `studio.siteTargets({ intent: "services", route: "/" })`
3. `client.showPageTarget({ targetId: "home.services", mode: "navigate", highlightMode: "spotlight" })`

Result:

- Homepage services section scrolls into view.
- Services section receives a visible but restrained spotlight.
- Chat shows a compact services card.

### Flow B: User asks about a specific proof point

User:

> Have you done enterprise design systems?

Donny:

> Yes. The strongest proof is SAP Build Apps and Helsinki Design System. SAP shows enterprise scale; Helsinki shows public-sector accessibility.

Tool sequence:

1. `studio.projectShowcase({ category: "design-systems", limit: 2 })`
2. If user says "show me SAP" or initial phrasing is explicitly directed:
   `client.showPageTarget({ targetId: "work.project.sapBuildApps", mode: "navigate", highlightMode: "spotlight" })`

Result:

- Chat shows project cards.
- Directed intent opens the case study and highlights the project hero or proof section.

### Flow C: User asks pricing

User:

> What would a design system engagement cost?

Donny:

> For a defined design-system foundation, the closest package is Design System Lift-Off: four weeks, fixed scope, and an adoption playbook. I can underline the package.

Tool sequence:

1. `studio.consultingPackages({})`
2. `studio.matchNeed({ problem: "design system engagement cost" })`
3. `client.showPageTarget({ targetId: "pricing.package.designSystemLiftOff", mode: "navigate", highlightMode: "underline" })`

Result:

- Pricing page opens.
- Design System Lift-Off package is underlined.
- Chat card shows price range, duration, and "Start from this package" CTA.

### Flow D: User wants contact

User:

> I want to talk about this.

Donny:

> I can open the contact form and prefill the project type. You can review everything before sending.

Tool sequence:

1. `studio.contactCard({})`
2. `client.showPageTarget({ targetId: "contact.form", mode: "navigate", highlightMode: "focus" })`
3. Optional after user confirms:
   `client.prefillContactIntent({ packageId: "design-system-lift-off", messageDraft: "We are interested in..." })`

Result:

- Contact page opens.
- Contact form gets focus or spotlight.
- No form submission happens automatically.

### Flow E: User is browsing near a CTA

Trigger:

- Cursor or focus is near `[data-donny-interest="design-sprint"]`.

Donny behavior:

- Avatar reacts.
- Optional small accessible nudge after delay: "Want help choosing the right sprint?"
- Chat does not open automatically.
- No tool call fires until user opens chat or clicks the nudge.

## Prompt Instructions

Replace the current tool guidance with a stricter spokesperson and action policy.

Suggested prompt block:

```text
You are Donny, Digitaltableteur's active site spokesperson and design-systems intake guide.

Your job:
- understand what the visitor needs;
- connect that need to Digitaltableteur's services, packages, work, and contact paths;
- use tools before making claims about projects, packages, availability, page locations, or contact details;
- when useful, guide the visitor to the exact page target and explain why it matters.

Voice:
- concise, confident, warm, specific;
- speak as Digitaltableteur's guide, not as a generic AI assistant;
- do not say "as an AI";
- do not over-apologize;
- ask one clarifying question only when the next step is genuinely ambiguous.

Action policy:
- Use knowledge tools before recommending services, packages, pricing, or work.
- Use client.showPageTarget only when the visitor asks to see, open, find, compare, navigate, or when the action clearly reduces effort.
- Before navigation, briefly state what you are about to do.
- Never navigate to external URLs.
- Never invent target IDs. Use studio.siteTargets or studio.contentSpotlight if unsure.
- Never invent project, price, or package details.
- Do not submit forms. You may prefill a form only after confirmation and the user must review it.
- After a browser action, summarize what was highlighted and why it answers the question.
```

Fix the current inaccurate `studio.navigateTo` wording in [app/api/chat-shared.ts](/Users/petrilahdelma/SAPDevelop/digitaltableteur/app/api/chat-shared.ts:119). Either rename it to a server-side `studio.resolveNavigationTarget` or make the true browser action happen through a client tool.

## Implementation Plan

### Phase 1: Contracts and Registry

Files:

- Create `nextjs-app/shared/data/donny-site-actions.ts`
- Create `nextjs-app/shared/data/donny-site-actions.test.ts`
- Update `nextjs-app/shared/data/index.ts`

Work:

1. Define `DonnyTargetId`, `DonnyTarget`, `DonnyHighlightMode`, and `DONNY_SITE_TARGETS`.
2. Add helper functions:
   - `getDonnyTarget(id)`
   - `getDonnyTargetsByRoute(route)`
   - `getDonnyTargetsByIntent(intent)`
   - `isSafeDonnyRoute(route)`
3. Add tests for:
   - every target has a unique ID;
   - every route starts with `/`;
   - every selector is a static `[data-donny-target="..."]` or known ID selector;
   - fallback IDs exist;
   - target IDs used by tools are valid.

Acceptance:

- Registry can be imported by server tools and client action bus.
- No arbitrary CSS selector can enter a client action.

### Phase 2: Page Markers

Files likely touched:

- `nextjs-app/shared/components/pages/Home/HomePage.tsx`
- `nextjs-app/shared/patterns/ServicesSection/ServicesSection.tsx`
- `nextjs-app/shared/components/ServiceCard/ServiceCard.tsx`
- `nextjs-app/shared/patterns/DesignSprintsSection/DesignSprintsSection.tsx`
- `nextjs-app/shared/patterns/HighlightSection/HighlightSection.tsx`
- `nextjs-app/shared/patterns/WorkMagneticField/WorkMagneticField.tsx`
- `nextjs-app/shared/patterns/PricingPageContent/PricingPageContent.tsx`
- `nextjs-app/shared/patterns/ContactPageContentEditorial/ContactPageContentEditorial.tsx`
- project detail patterns under `nextjs-app/shared/patterns/ProjectDetailTemplate/`

Work:

1. Add `data-donny-target` to route sections.
2. Add target IDs to key cards and package articles.
3. Ensure targets exist in all responsive layouts.
4. Avoid wrapping text in new markup solely for highlight unless required.
5. Keep content unchanged in this phase.

Acceptance:

- `document.querySelector(target.selector)` works after navigating to each target route.
- No visual changes when no target is active.

### Phase 3: Browser Action Provider

Files:

- Create `nextjs-app/shared/components/DonnyActionProvider/`
- Update `nextjs-app/shared/components/NextLayout/NextLayout.tsx`

Work:

1. Implement `DonnyActionProvider` with an action queue.
2. Implement `useDonnyActions` with:
   - `showPageTarget(input)`
   - `clearPageTarget()`
   - `prefillContactIntent(input)`
   - `capturePageContext()`
3. Use Next router for navigation.
4. Wait for the target element with bounded retries.
5. Scroll with `scrollIntoView`; if Lenis exposes a public scroll API in the provider, use that instead.
6. Apply `[data-donny-active="true"]` and a generated annotation ID to the target.
7. Render `DonnySpotlightOverlay` for `spotlight` and CSS underline for `underline`.
8. Respect `prefers-reduced-motion`.
9. Add an `aria-live="polite"` status region.
10. Clear highlight on route change, escape, explicit clear, or after a timeout if configured.

Acceptance:

- An action executes exactly once per `toolCallId`.
- Highlight does not move layout.
- Keyboard users can clear highlight.
- Screen readers receive an announcement.
- Reduced motion disables animated scroll and pulsing.

### Phase 4: AI SDK Tool Integration

Files:

- Update `app/api/donny-tools.ts`
- Update `app/api/chat/route.ts`
- Update `app/api/chat-shared.ts`
- Create `nextjs-app/shared/components/ChatWidget/toolParts.ts`
- Update `nextjs-app/shared/components/ChatWidget/ChatWidget.tsx`
- Update `nextjs-app/shared/components/ChatWidget/messageProcessor.ts`

Work:

1. Keep `streamText`, `convertToModelMessages`, and `toUIMessageStreamResponse` because they match AI SDK UI guidance and current code.
2. Add client-side browser tools to the tool set without server `execute`.
3. Configure `useChat` with `onToolCall`.
4. Use `addToolOutput` for client tool outputs. Do not await `addToolOutput` inside `onToolCall`.
5. Add `sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls` only if follow-up assistant narration after client action is required.
6. Normalize tool parts before rendering or avatar state derivation.
7. Delete or deprecate hidden token component injection once equivalent explicit tools exist.
8. Update avatar state to consume normalized tool state, not only `tool-invocation`.

Acceptance:

- Server tools still stream rich UI.
- Client browser tools execute in the browser.
- Tool output states render cleanly in chat.
- Old stored conversations do not crash.
- Donny no longer claims server-side navigation is browser navigation unless it is actually executed client-side.

### Phase 5: Tool Result UI

Files:

- `nextjs-app/shared/components/ChatWidget/DonnyActionCard.tsx`
- `nextjs-app/shared/components/ChatWidget/ToolResultProjectCards.tsx`
- `nextjs-app/shared/components/ChatWidget/ToolResultOfferCards.tsx`
- `nextjs-app/shared/components/ChatWidget/ChatMessageBubble.tsx`
- `nextjs-app/shared/components/ChatWidget/ChatWidget.module.css`

Work:

1. Move project-card rendering out of `ChatMessageBubble` into a dedicated renderer.
2. Add action-card rendering for `client.showPageTarget`.
3. Add offer-card rendering for package tools.
4. Make action cards compact enough for mobile.
5. Provide clear status labels:
   - "Looking up the right page"
   - "Opening Pricing"
   - "Highlighted Design System Lift-Off"
   - "Could not find that section"
6. Keep all labels in `nextjs-app/shared/locales/{en,fi,sv}/translation.json`.

Acceptance:

- Chat does not show raw JSON.
- Tool states are understandable while streaming.
- Action cards pass axe tests.

### Phase 6: Active Spokesperson Behaviors

Files:

- `nextjs-app/shared/components/ChatWidget/ChatToggle.tsx`
- `nextjs-app/shared/components/ChatWidget/ChatWidget.tsx`
- possibly new `nextjs-app/shared/components/ChatWidget/useDonnyNudges.ts`

Work:

1. Extend current `data-donny-interest` behavior into a lightweight nudge system.
2. Track only non-sensitive interaction context:
   - current path;
   - locale;
   - last `data-donny-interest`;
   - visible target IDs;
   - whether chat has been opened this session.
3. Add cooldowns:
   - max one proactive nudge per page view;
   - max three proactive nudges per session;
   - no nudge while user is typing, form-filling, or chat is open.
4. Add context-specific nudge copy:
   - near pricing: "Want help choosing a package?"
   - near work: "Want me to find the relevant case study?"
   - near contact: "I can help turn your idea into a short brief."
5. Use avatar expression first; show text only after delay.

Acceptance:

- Donny feels present but not pushy.
- No layout shift.
- No focus stealing.
- Nudges are dismissed and remembered for the session.

### Phase 7: Contact and Brief Flow

Files:

- `nextjs-app/shared/components/ChatWidget/emailWorkflow/*`
- `nextjs-app/shared/components/EnhancedContactForm/*`
- `nextjs-app/shared/patterns/ContactPageContentEditorial/ContactPageContentEditorial.tsx`

Work:

1. Keep the existing email workflow reducer, but connect it to structured intent.
2. Add a "brief builder" state that collects:
   - problem;
   - current system maturity;
   - desired outcome;
   - timeline;
   - budget range;
   - relevant package;
   - relevant proof/project.
3. Let Donny prefill contact fields after confirmation.
4. Never auto-submit.
5. Provide a review step before sending.

Acceptance:

- Visitor can go from question to reviewed contact brief without leaving the guided flow.
- All fields are editable.
- PII is not sent to the model unless already typed into chat by the user.

### Phase 8: Observability

Add analytics events that do not include free-text user content.

Events:

- `donny_tool_called`
- `donny_action_requested`
- `donny_action_completed`
- `donny_action_failed`
- `donny_highlight_cleared`
- `donny_nudge_shown`
- `donny_nudge_dismissed`
- `donny_contact_prefill_started`
- `donny_contact_prefill_confirmed`

Properties:

- `toolName`
- `targetId`
- `route`
- `action`
- `success`
- `failureReason`
- `locale`

Do not log:

- chat transcript;
- email address;
- phone number;
- contact message;
- free text problem statement unless explicitly anonymized.

## Acceptance Criteria

### Functional

- "Show me pricing" opens `/pricing`, scrolls to packages, and highlights `pricing.packages`.
- "Which package fits a design system rebuild?" uses `studio.matchNeed`, shows package data, opens `/pricing`, and underlines `pricing.package.designSystemLiftOff`.
- "Show me SAP work" uses `studio.projectShowcase`, renders project cards, and on directed intent opens `/work/sap-build-apps` or a registered project target.
- "Where can I contact you?" uses `studio.contactCard`, opens `/contact`, and highlights `contact.form`.
- If the target is missing, Donny reports a graceful fallback and renders a normal link.
- No client action can navigate outside Digitaltableteur internal routes.
- No arbitrary selector from the model is executed.

### UX

- Every browser movement is narrated before it happens.
- Highlight has a clear visual style on light, dark, HCB, and HCW themes.
- User can clear the highlight.
- Proactive nudges never open chat automatically.
- Mobile action cards fit inside the chat panel without horizontal scrolling.

### Accessibility

- Highlight announcement uses `aria-live="polite"`.
- Focus is not stolen for informational highlights.
- Transactional steps can move focus only to the relevant form control after user intent.
- Escape clears active spotlight if chat is not consuming Escape to close.
- Reduced motion disables animated scroll and pulsing.
- All action cards pass axe.

### Internationalization

- All visible new strings exist in EN, FI, and SV translation files.
- Target labels can be localized or resolved through translation keys.

### Performance

- No new runtime dependency.
- Action provider adds minimal JS and lazy-loads optional overlay if possible.
- Target lookup uses direct selectors from registry, not page-wide text scanning.

### Security

- Prompt injection cannot override allowed routes, selectors, or target IDs.
- External URLs are rejected.
- Contact prefill never submits.
- Tool outputs do not expose raw internal JSON in chat.
- PII is excluded from analytics.

## Verification Plan

### Unit Tests

Add or update tests for:

- `donny-site-actions.test.ts`
- `toolParts.test.ts`
- `messageProcessor.test.tsx`
- `ChatWidget.behavior.test.tsx`
- `DonnyActionProvider.test.tsx`
- `DonnyActionCard.test.tsx`
- `donny-tools.test.ts`

Test cases:

- route sanitizer rejects `https://`, `//evil.com`, `/javascript:alert(1)`;
- target resolver rejects unknown target IDs;
- typed AI SDK tool parts render;
- legacy `tool-invocation` parts still render;
- client action executes once per `toolCallId`;
- missing target falls back gracefully;
- action cards have no axe violations;
- reduced motion branch avoids animated behavior.

### Integration Tests

Use mocked chat messages and route state to verify:

- `client.showPageTarget` navigates and highlights;
- `client.clearPageTarget` removes highlight;
- `client.prefillContactIntent` opens contact and pre-populates local state only after confirmation;
- `studio.matchNeed` maps service problems to package and target;
- project lookup always happens before project claims.

### E2E / Browser Tests

Scenarios:

1. Ask "show me the design system package".
2. Wait for `/pricing`.
3. Assert package target is visible and highlighted.
4. Press "Clear highlight".
5. Assert highlight is removed.

Scenarios:

1. Ask "show me SAP work".
2. Assert project card renders.
3. Ask "take me there".
4. Assert work route opens and project target is visible.

Scenarios:

1. Ask "I want to contact you about AI DesignOps".
2. Assert contact route opens.
3. Assert contact form target is highlighted.
4. Assert form is not submitted.

Run desktop and mobile.

### Manual QA

- Light, dark, HCB, HCW.
- Reduced motion.
- Keyboard only.
- Screen reader smoke check.
- Mobile chat open while target is highlighted.
- Cookie modal present and absent.
- Slow route transition.
- Missing target fallback.

### Commands

Standard checks after implementation:

```bash
npm run typecheck
npm run lint
npm test -- ChatWidget messageProcessor DonnyActionProvider donny-site-actions
npm run test:a11y
npm run build
```

For visual behavior:

```bash
npm run dev
# then run Playwright or agent-browser against the scenarios above
```

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Donny feels pushy | Consent levels, cooldowns, no auto-open, no auto-navigation except directed intent |
| Model invents selectors | Only accept registry target IDs; client validates everything |
| Tool part format mismatch | Add normalizer for AI SDK typed parts and legacy parts |
| Repeated navigation on rerender | Track executed `toolCallId`s in a ref/session state |
| Highlight obscures content | Prefer underline for text, spotlight only for large sections, mobile-specific offsets |
| Accessibility regression | Live region, keyboard clear, reduced motion, axe tests |
| Contact prefill creates privacy concern | Confirmation before prefill, no auto-submit, no analytics with PII |
| Chat transcript localStorage repeats old tool outputs | Store text only; keep action executions ephemeral |
| Page target missing after content changes | Registry tests plus E2E scenarios |

## Alternatives Considered

### Option A: Better Prompt Only

Improve Donny's system prompt and tool descriptions without adding a browser action layer.

Pros:

- fastest;
- low code risk.

Cons:

- still cannot truly navigate or underline content;
- continues mismatch between prompt and behavior;
- depends on hidden tokens and links.

Rejected as insufficient.

### Option B: Server Tool Returns Links and Cards Only

Keep all tools server-executed and render better cards.

Pros:

- safe;
- no browser side effects;
- easy to test.

Cons:

- Donny remains a chat assistant, not a site spokesperson;
- user still does the work of finding the page section;
- cannot create "look here" moments.

Rejected as too static for the stated goal.

### Option C: Narrated Site Action System

Use server tools for knowledge and client tools for browser actions, all constrained by a typed target registry.

Pros:

- creates the intended active guide experience;
- keeps actions safe and testable;
- aligns with AI SDK client-side tool guidance;
- gives Donny a signature interaction pattern.

Cons:

- largest implementation;
- requires careful a11y and route testing.

Chosen.

## ADR

### Decision

Implement Donny as a narrated site-action guide using a typed target registry, server-side knowledge tools, and client-side browser action tools.

### Drivers

- Donny must actively guide users to the right content.
- Browser actions must be safe, internal, reversible, and accessible.
- Tool calls must integrate into chat without exposing raw JSON or requiring users to click plain links.
- The implementation must align with the current Vercel AI SDK UI tool-call model.

### Alternatives Considered

- Prompt-only improvement.
- Server-only richer cards.
- Full narrated client/server action system.

### Why Chosen

The narrated action system is the only option that makes Donny materially less static while preserving safety and control. It turns existing Digitaltableteur content into an interactive guided experience instead of adding another decorative chat layer.

### Consequences

- More code than a prompt update.
- Requires adding stable `data-donny-target` markers across important pages.
- Requires tests for route safety, target resolution, tool part parsing, and browser behavior.
- Unlocks future guided flows: audit finder, package recommender, case-study docent, and brief builder.

### Follow-ups

- After the foundation ships, rewrite Donny's first-run greeting and suggested prompts around the new action capabilities.
- Add CMS or content-manifest integration if project and package data move fully to Sanity.
- Consider a small "guided tour" mode only after the action system proves useful in analytics.

## Implementation Staffing

Recommended direct implementation lanes:

1. **Frontend executor:** action provider, highlights, chat UI renderers.
2. **API/tool executor:** server tools, prompt, AI SDK client tool integration.
3. **Test engineer:** registry tests, ChatWidget tests, E2E scenarios.
4. **UX/accessibility reviewer:** motion, focus, screen reader behavior, intrusive-nudge audit.

Do not split page-marker work across many agents unless the registry contract is merged first; otherwise target IDs will drift.

