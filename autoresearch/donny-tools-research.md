# Donny Chatbot Tools — Research & Design Catalog

## Baseline
Current tools: 3 (`studio.openHours`, `studio.services`, `studio.contactCard`)
SDK: AI SDK v6 (`ai@6.0.143`, `@ai-sdk/react@3.0.145`)
Architecture: `streamText` → `toUIMessageStreamResponse()` → `useChat` on client

---

## SDK v6 Capabilities Available

| Feature | How to Use | Impact |
|---------|-----------|--------|
| Multi-step tool calls | `stopWhen: stepCountIs(3)` | Chain tools (browse → qualify → book) |
| Client-side tools | Omit `execute`, use `addToolResult()` | Page navigation, scroll, user confirmations |
| Per-tool strict schemas | `strict: true` | Guaranteed valid tool inputs from OpenAI |
| Rich tool result rendering | Match `toolInvocation.toolName` in message parts | Render React components per tool |
| Structured output | `output: Output.object(schema)` | Typed final responses with suggested actions |
| Agent abstraction | `ToolLoopAgent` with `needsApproval` | Human-in-the-loop for sensitive actions |
| Input examples | `inputExamples` on tool definition | Better LLM understanding of complex schemas |

---

## Tool Concepts (10 tools, priority-ordered)

### 1. `studio.projectShowcase` — Interactive Project Cards
**What:** Browse and display rich project cards inside chat with thumbnail, description, tags, client, duration, and live URL.
**Trigger:** "Show me your design system work" / "What projects have you done?" / "Show me VertaaUX"
**SDK feature:** Server-side tool with `outputSchema` → client renders `<ProjectCard>` component from tool result
**Competitor inspiration:** Klarna rich product cards, Vercel AI SDK generative UI pattern
**Implementation:**
- Tool input: `{ query?: string, category?: "design-systems" | "ux-design" | "branding" | "illustration", slug?: string }`
- Tool output: Array of `{ title, slug, description, thumbnail, tags, client, duration, liveUrl, category }`
- Execute: Filters `projects` array from `data/projects.ts`
- Client: Renders `EnhancedProjectCard` or custom `ChatProjectCard` per result
**Priority:** Critical — this is the #1 missing capability for a portfolio chatbot

### 2. `studio.qualifyLead` — Conversational Lead Qualification
**What:** Structured qualification flow — asks about project type, timeline, budget range, then summarizes fit.
**Trigger:** "I have a project" / "I need help with..." / "What would it cost?"
**SDK feature:** Multi-step tool calls (`stopWhen: stepCountIs(5)`), structured output with `Output.object(schema)`
**Competitor inspiration:** Landbot + Calendly qualification gates, Intercom Fin
**Implementation:**
- Tool input: `{ projectType?: string, timeline?: string, budgetRange?: string, description?: string }`
- Tool output: `{ qualified: boolean, fit: "excellent" | "good" | "exploratory", suggestedService: string, nextStep: string }`
- Execute: Scores inputs against service offerings, returns fit assessment
- Client: Renders a summary card with "Book a call" CTA when qualified
**Priority:** Critical — direct revenue impact

### 3. `studio.navigateTo` — Client-Side Page Navigation
**What:** Navigate the user to a specific page or scroll to a section, triggered by conversation context.
**Trigger:** "Take me to the work page" / "Show me the contact form" / "Go to VertaaUX case study"
**SDK feature:** **Client-side tool** (no `execute` on server) — client handles via `addToolResult()` + `router.push()`
**Competitor inspiration:** Chatbase client-side custom actions
**Implementation:**
- Tool input: `{ destination: string, section?: string }` — destination is a path like "/work/vertaaux" or "/contact"
- No server execute — client receives tool call, performs `router.push(destination)`, optionally scrolls to `#section`
- Client calls `addToolResult({ toolCallId, result: { navigated: true } })` to continue conversation
**Priority:** High — transforms chatbot from passive Q&A to active concierge

### 4. `studio.caseStudySearch` — RAG Over Portfolio Content
**What:** Search across project descriptions, blog posts, and case study content to answer specific questions with cited sources.
**Trigger:** "How did you approach the Helsinki Design System?" / "What accessibility work have you done?" / "Tell me about your SAP experience"
**SDK feature:** Server-side tool, multi-step (search → synthesize), output includes citation links
**Competitor inspiration:** Perplexity inline citations, Stripe docs RAG
**Implementation:**
- Tool input: `{ query: string, sources?: ("projects" | "blog" | "services")[] }`
- Tool output: `{ answer: string, citations: { title: string, url: string, excerpt: string }[] }`
- Execute: Searches project data + donny-context + any blog content; returns relevant excerpts with source URLs
- Client: Renders answer with clickable footnote citations
**Priority:** High — builds trust through evidence-backed responses

### 5. `studio.bookCall` — Calendly Embed After Qualification
**What:** Renders an inline Calendly scheduling widget inside the chat after lead qualification.
**Trigger:** After `qualifyLead` returns positive, or "I'd like to book a call" / "When are you available for a meeting?"
**SDK feature:** Client-side tool — renders Calendly iframe in chat, reports back booking confirmation
**Competitor inspiration:** Landbot + Calendly, Chatbase Calendly integration
**Implementation:**
- Tool input: `{ meetingType?: "discovery" | "consultation", prefilledName?: string, prefilledEmail?: string }`
- Client-side: Renders `<InlineCalendly url="..." prefill={...} />` component
- On booking complete: Calendly fires event, client calls `addToolResult()` with booking details
**Priority:** High — closes the conversion loop inside the chat

### 6. `studio.processTimeline` — Interactive Design Process Visualization
**What:** Renders a visual timeline of the design/development process — Discovery → Research → Design → Build → Launch.
**Trigger:** "What's your design process?" / "How do you approach projects?" / "Walk me through a typical engagement"
**SDK feature:** Server-side tool → client renders SVG/CSS timeline component
**Competitor inspiration:** Claude Artifacts inline visualizations, Accern Rhea widget-based UI
**Implementation:**
- Tool input: `{ focus?: "design-sprint" | "full-engagement" | "design-system" | "audit" }`
- Tool output: `{ phases: { name, duration, activities, deliverables }[], totalWeeks: number }`
- Execute: Returns phase data for the requested engagement type
- Client: Renders `<ProcessTimeline phases={result.phases} />` with animated step indicators
**Priority:** Medium — differentiator for design consultancy positioning

### 7. `studio.techStack` — Technology Expertise Browser
**What:** Shows the technology stack and expertise areas with proficiency indicators.
**Trigger:** "What technologies do you use?" / "Do you work with React?" / "What's your stack?"
**SDK feature:** Server-side tool with categorized output
**Competitor inspiration:** Portfolio sites with interactive tech grids
**Implementation:**
- Tool input: `{ category?: "frontend" | "backend" | "design" | "ai" | "devops" }`
- Tool output: `{ categories: { name, technologies: { name, icon, proficiency, yearsUsed, highlight }[] }[] }`
- Execute: Returns filtered tech stack data
- Client: Renders tech badges/chips organized by category
**Priority:** Medium — common prospect question, currently answered with generic text

### 8. `studio.pricingEstimate` — Ballpark Project Estimator
**What:** Provides rough pricing ranges based on project type, scope, and complexity — not exact quotes but enough to qualify budget fit.
**Trigger:** "How much does a design system cost?" / "What's the budget for a UX audit?" / "Pricing?"
**SDK feature:** Server-side tool with `needsApproval: false` (no sensitive data), structured output
**Competitor inspiration:** Chatbase pricing tools, SaaS pricing calculators
**Implementation:**
- Tool input: `{ serviceType: "design-system" | "ux-audit" | "brand-identity" | "full-redesign" | "design-sprint", complexity?: "small" | "medium" | "enterprise" }`
- Tool output: `{ range: { min: number, max: number, currency: "EUR" }, typical: string, includes: string[], note: string }`
- Execute: Returns range from pricing matrix (not exact — "Starting from €X")
- Client: Renders pricing card with range bar, includes list, and "Discuss your project" CTA
**Priority:** Medium — removes friction from budget conversations

### 9. `studio.recentActivity` — What's New Feed
**What:** Shows recent projects, blog posts, speaking events, or open-source contributions.
**Trigger:** "What have you been working on?" / "Any recent projects?" / "What's new?"
**SDK feature:** Server-side tool pulling from git history, project data, or blog feed
**Competitor inspiration:** GitHub activity feeds, personal site "now" pages
**Implementation:**
- Tool input: `{ type?: "projects" | "blog" | "all", limit?: number }`
- Tool output: `{ items: { type, title, date, url, summary }[] }`
- Execute: Aggregates from projects data (sorted by recency), blog posts if available
- Client: Renders activity feed cards with icons and relative dates
**Priority:** Low — nice-to-have for returning visitors

### 10. `studio.compareServices` — Side-by-Side Service Comparison
**What:** Renders a structured comparison table of two or more service offerings.
**Trigger:** "What's the difference between a design sprint and a full redesign?" / "Compare your services"
**SDK feature:** Server-side tool → client renders comparison table component
**Competitor inspiration:** Klarna product comparison, SaaS pricing comparison tables
**Implementation:**
- Tool input: `{ services: string[] }` (2-3 service names)
- Tool output: `{ comparison: { dimension: string, values: Record<string, string> }[], recommendation?: string }`
- Execute: Builds comparison matrix from service data
- Client: Renders `<ComparisonTable>` with highlighted differences
**Priority:** Low — useful but niche trigger

---

## Architecture Changes Needed

### Server (app/api/chat/route.ts)
1. Add `stopWhen: stepCountIs(3)` to `streamText` params for multi-step
2. Keep `toolChoice: 'auto'` (default)

### Tools (app/api/donny-tools.ts)
3. Add new tools to `staticTools` object
4. Extract project data access into shared functions

### Client (ChatWidget)
5. Add tool result component renderer — switch on `toolInvocation.toolName`
6. Implement client-side tools (#3 navigateTo, #5 bookCall) via `addToolResult()`
7. Add `ChatProjectCard`, `ChatPricingCard`, `ChatProcessTimeline`, `ChatComparisonTable` components

### System Prompt (app/api/chat-shared.ts)
8. Update tool instructions to guide Donny on when to use each tool
9. Add personality guidelines for qualification flow

---

## Implementation Priority

**Phase 1 — Core (ship first):**
- #1 `studio.projectShowcase` — the table-stakes portfolio chatbot feature
- #3 `studio.navigateTo` — active concierge, client-side tool
- Multi-step enablement (`stopWhen: stepCountIs(3)`)

**Phase 2 — Conversion:**
- #2 `studio.qualifyLead` — revenue driver
- #5 `studio.bookCall` — closes the loop
- #4 `studio.caseStudySearch` — trust builder with citations

**Phase 3 — Polish:**
- #6 `studio.processTimeline` — differentiator
- #7 `studio.techStack` — common question
- #8 `studio.pricingEstimate` — removes friction

**Phase 4 — Nice-to-have:**
- #9 `studio.recentActivity`
- #10 `studio.compareServices`
