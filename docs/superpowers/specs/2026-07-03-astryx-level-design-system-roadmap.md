# Roadmap: Digitaltableteur DS to Astryx level

**Date:** 2026-07-03
**Target decided:** maximally customized Storybook (no separate public docs app). Tiered component scope (~54 core full treatment). Doc registries + public MCP route. Live previews + prop knobs (no Monaco playground).
**Reference:** [Astryx](https://astryx.atmeta.com/components), source at [facebook/astryx](https://github.com/facebook/astryx) (MIT).

---

## 1. What "Astryx level" actually is

Reverse-engineering `facebook/astryx` shows the polish comes from five mechanisms, none of which is Storybook (their Storybook is a plain internal harness with one theme decorator; the public site is a custom Next.js app):

1. **Colocated doc sidecars.** Every component ships `<Name>.doc.mjs`: `usage.description`, `usage.bestPractices` (each `{guidance: true|false, description}` rendered as Do/Don't), `usage.anatomy` (named parts, required flags), typed `props` with defaults and serializable slot examples (`{__element: 'Icon', props: {...}}`), `playground.defaults`, `theming.vars`, `keywords`. Plus `docsDense`, a token-budgeted variant written for AI agents.
2. **A fixed two-tab page anatomy.** Overview: live showcase in a themed card, then "Usage" (prose + copyable import), then "Best practices" (Do/Don't table), then "Examples" (each a real `.tsx` file, live-rendered, with Description/Code tabs). Properties: a sticky live preview wired to a props table whose right column IS the control panel (Required/Optional groups, default bolded inside the enum union, callbacks auto-wired back to state so controlled components stay interactive).
3. **Examples as real runnable files, triple-used**: live render, copy-ready source, CLI scaffold. Never duplicated into markdown.
4. **AI surface fed from the same registries as the human docs**: an MCP route with exactly two tools (budgeted `search` with a keyword index, full `get` with example source), and a CLI `--json` capability manifest. Same data, so it cannot drift.
5. **Enforcement**: build-time extraction fails on missing fields (e.g. missing `displayName` throws), drift-guard tests, and nightly "vibe tests" measuring whether agents can build with the system.

DT already has stronger enforcement than Astryx in several places (contrast gate, rhythmguard, contract drift, 4-theme snapshot matrix, promotion lifecycle with production-evidence requirements). The gap is almost entirely **doc content depth per component** and **the presentation frame**.

## 2. Gap analysis (DT today vs the bar)

| Dimension | Astryx | DT today | Gap |
|---|---|---|---|
| Doc data per component | `.doc.mjs`: usage, do/don't, anatomy, playground defaults, keywords, dense AI variant | `contract.json` v2: variants, slots, a11y flags, figma, consumers, composesWith; MDX spec prose (133 components) | No bestPractices/anatomy/keywords/dense/playground-defaults fields; MDX prose quality uneven ("honest doc debt") |
| Docs page anatomy | Fixed premium template, two tabs, sticky knobs preview | Storybook default docs, `!autodocs` on most stories, MDX freeform | No shared template; per-component MDX drifts |
| Live examples | Real .tsx, live + code + description | Stories exist (137 components) but Default/Playground/Example/ForcedColors pattern is test-oriented, not reader-oriented | Examples need curation as documentation, with descriptions |
| Prop knobs | PlaygroundPropsTable + sticky preview | Storybook Controls (native) exists but buried in default layout | Frame work, not new tech |
| Theming docs | Per-component CSS vars declared in doc sidecar | 171 tokens, 4 themes, DTCG, token specimens in foundations MDX | No per-component "which tokens does this consume" section |
| AI surface | MCP (search/get) + CLI manifest + docsDense | agent-manifest.json (1.2 MB), storybook addon-mcp, zod catalog | No public route; manifest is one blob, not budgeted briefs; no dense variant |
| Search | Command palette + keyword index | Storybook default search (title match only) | Keywords land in MCP + tags; Storybook search stays title-based (accepted limitation) |
| Eval | Vibe tests nightly | agent:eval in CI | Out of scope for now (declined) |

## 3. Architecture decisions

### 3.1 Doc data layer: extend contract v2 (not a new sidecar)

Add optional fields to `scripts/design-system/contract.schema.v2.json`:

```jsonc
{
  "displayName": "Button",
  "keywords": ["button", "cta", "submit", "action", "loading"],
  "usage": {
    "description": "1-3 sentence markdown: what it is, when to use it.",
    "bestPractices": [ { "guidance": true, "description": "..." } ],  // 6-8 per component, mix of do and don't
    "anatomy": [ { "name": "Label", "required": true, "description": "..." } ]
  },
  "playground": { "defaults": { "children": "Click me", "variant": "primary" } },
  "theming": { "vars": [ { "name": "--button-radius", "description": "...", "default": "var(--radius-sm)" } ] },
  "dense": "action trigger w/ 3 variants x 5 tones, sm/md/lg, loading state"  // <=200 chars, agent-facing
}
```

Rationale: contracts already have drift gates (`check:contract-drift --strict`), sync tooling (`sync:contract-props`), and feed agent-manifest. A second sidecar file would recreate Astryx's problem space without their reasons (they needed `.mjs` for JS-native docs; we are already JSON + zod).

New validator tier rules in `validate:components`:
- **Tier 1 components**: `usage.description`, >=6 `bestPractices` (>=2 with `guidance: false`), `anatomy` (when composite), `keywords` (>=4), `playground.defaults`, `dense` are REQUIRED for beta and above.
- **Tier 2**: `usage.description` + `keywords` + `dense` required; rest optional.
- Slot examples use the Astryx serializable element descriptor: `{"__element": "Icon", "props": {"name": "check"}}`, resolved by a small `resolveElements.tsx` in the Storybook frame.

### 3.2 The Storybook frame (the "custom frame" replication)

Storybook 10 gives us three customization surfaces. Plan per surface:

**A. Docs page template (the big one).** Replace the default autodocs page with a DT template registered once in `.storybook/preview.tsx` (`parameters.docs.page`), enabled per story via `tags: ["autodocs"]`. The template reads the component's contract (imported by stories already) and renders, in order:

1. `<DocHeader>`: displayName, status pill (alpha/beta/stable, reusing WipBadge tones), group, "since" version, Figma link from contract.
2. `<ShowcaseStage>`: the `Default` story rendered full-width inside a surface card, honoring the theme/locale/forced-colors toolbar globals. 16:9 min-height desktop, 160px mobile. Error-boundaried.
3. `<ImportBlock>`: copyable `import { Button } from "@dt/Button";` derived from contract name.
4. `<UsageSection>`: `usage.description` markdown.
5. `<BestPractices>`: two-column Do/Don't cards from `usage.bestPractices` (green check / red cross, Astryx renders this as a Guidance table; we use DT Card + Icon).
6. `<AnatomySection>`: Element / Required / Description table (Astryx has the data but leaves it unwired on-page; we wire it, it is cheap and differentiating).
7. `<ExamplesSection>`: every story tagged `"example"` rendered as an ExampleBlock: name, description (`parameters.docs.description.story`), live canvas, Code toggle (`<Canvas withToolbar sourceState="hidden">` equivalent via `Source`), "Open in canvas" link to the story.
8. `<PropsSection>`: `<Controls of={PlaygroundStory}>` bound to the `Playground` story: this is Storybook's native equivalent of Astryx's props-table-as-control-panel, with live two-way knobs. Group required props first via argTypes ordering from contract.
9. `<ThemingSection>`: table of `theming.vars` + the tokens the component consumes (extracted by a build step grepping the component's `.module.css` for `var(--*)` against token-catalog.json; this is data we can generate, Astryx hand-authors it).
10. `<A11ySection>`: contract a11y flags (forcedColors verified, focus behavior, ARIA pattern link) + axe status from the test artifacts.
11. `<RelatedSection>`: `composesWith` chips linking to sibling docs (relationship-graph.json already exists).

All 11 blocks live in `.storybook/blocks/` as normal DT-styled React components (dogfooding: build them FROM Button/Card/Badge/Tabs/Icon, like Astryx builds its docs chrome from itself).

**B. Manager chrome.** `manager.ts` theme upgrade (Satoshi, DT color tokens light+dark), `manager-head.html` CSS for what the theming API cannot reach (sidebar density, group headers, status dots). Sidebar re-grouped Astryx-style via story titles: `Actions/Button`, `Forms/TextInput`, `Feedback/Toast`, `Navigation/Tabs`, `Layout/Grid`, `Content/Avatar`, `Site/...` (Tier 2), `Foundations/...`. Add `sidebar.renderLabel` to append status dots (stable = solid, beta = hollow, alpha = muted).

**C. Preview chrome.** Keep the existing 7 decorators. Add: docs-mode stage decorator (padding + surface background so every example sits on a consistent canvas), and a `docs.source.transform` that strips boilerplate (the Astryx copyright-strip pattern, ours strips story scaffolding).

**Landing page:** `00-Components.mdx` gallery: one card per Tier 1 component (name, dense one-liner, mini live preview or static thumbnail, status). This is the "/components" index feel inside Storybook.

Accepted limitations vs the real Astryx frame (documented so nobody chases them):
- Storybook search stays title-match; keyword search is served by the MCP route instead.
- No URL-shareable knob state beyond Storybook's native `args` URL params (which actually cover most of it).
- Manager chrome theming has hard limits; we go as far as theme API + CSS injection allows, no manager forking.

### 3.3 Public MCP route

`app/api/mcp/route.ts` in the Next.js app (mcp-handler, streamable HTTP, no SSE), two tools, Astryx-shaped:

- `search(query, limit=8)`: scores over generated registries (name exact=100, prefix=90, substring=85, keyword=90, all-words=75), demotes sub-components below parents, returns budgeted briefs (~1.5k tokens each): name, group, dense description, import line, up to 6 key props, related, and a `hint` string teaching the follow-up `get` call.
- `get(name, section?)`: full contract + usage + theming + the `Example` stories' source code (read at build time into the registry) + composesWith.

Feed both from a new build artifact `docs-registry.json` generated by extending `build:tokens`/manifest pipeline: contracts (with new fields) + story source extraction. Add a drift-guard test: every Tier 1 component present in registry with all required fields, MCP `get` snapshot per stable component.

The existing 1.2 MB agent-manifest stays for repo-internal agents; the MCP route serves budgeted views of the same data.

### 3.4 Enforcement (keeping it Astryx-level once reached)

- `validate:components` tier rules (3.1) wired into pre-push + PR workflow.
- `check:catalog-coverage` extended: Tier 1 requires >=3 `example`-tagged stories with descriptions.
- Docs-page smoke test: test-runner visits each Tier 1 docs page, asserts the 11 blocks render (catches contract/story mismatches the unit layer cannot see, per the Vitest CSS-module-proxy lesson).
- MCP route contract test in CI.

## 4. Phases

Each phase is 1-3 PRs, merged before the next starts (per repo workflow rules). Verification gate per PR: `typecheck && lint && test && build` plus the phase's own new gate.

| Phase | Content | Size |
|---|---|---|
| **0. Consolidation & hygiene** | Resolve duplicates/stubs before documenting them (4.1 below). | M |
| **1. Doc data layer** | Contract schema v2.1 fields, validator tiers, `resolveElements`, backfill script stubs (empty-but-valid fields for all Tier 1). | M |
| **2. Storybook frame** | 11 doc blocks, autodocs template, manager theme/CSS, sidebar regroup, landing gallery. Prove on the 8 platinum atoms end to end. | L |
| **3. Per-component content sweep** | The meticulous part: author doc data + curated examples per Tier 1 component (section 5). Batched by category, one PR per category. | XL |
| **4. MCP route** | docs-registry build step, `app/api/mcp/route.ts`, search/get, drift tests. | M |
| **5. Promotion wave** | Run release:gate per finished component; target: Tier 1 all beta+, >=25 stable (from 10). | M |
| **6. Backlog (declined for now)** | CLI manifest, vibe tests, fi/sv doc translations, Monaco playground. | - |

### 4.1 Phase 0 detail: consolidation candidates (decide, then document once)

These would otherwise get documented twice or as stubs:

- **Heading vs Title**: two heading components. Title is stable/platinum; fold Heading's API into Title or mark Heading deprecated. Do not write docs for both.
- **TextLink vs Link vs NavLink**: Link is stable. Define the split (Link = semantic inline, NavLink = nav-aware active state) and either absorb TextLink or deprecate it.
- **Modal vs AnimatedDialog vs Lightbox**: three overlay components, only Modal fully tested. Decide the overlay family story (Astryx: Dialog + Overlay + Lightbox with shared layer system). Document the family on one page with sub-pages.
- **Toast vs Toaster**: Toaster is the alpha imperative host. Document as one "Toast" entry (Astryx pattern: component + hook documented together).
- **SplitButton**: exempt stub (index.ts only). Build it properly in Phase 3 (Astryx has no SplitButton; ours pairs with Button) or delete the stub.
- **Inputs**: umbrella directory. Dissolve into the individual input docs; keep only as internal shared styles if needed.
- **IconButton**: missing `.module.css` and test; platinum Button conventions apply (`variant` x `tone`, `sm/md/lg`). Astryx treats IconButton as a first-class separate component; we do the same.
- **CheckboxField vs Checkbox vs CheckboxGroup / FormField vs FormGroup**: define the field-wrapper convention once (this was the deferred "field-error owner call" from the council audit; it blocks form docs).

## 5. Per-component plans (Tier 1: 65 entries reviewed, ~54 remain after Phase 0 merges/dissolutions)

**Definition of Astryx-grade (the checklist every Tier 1 component must pass).** Referenced below as steps D1-D10; per-component entries list only their deltas and specifics.

- **D1 API audit**: props conform to platinum conventions (`variant` = weight, `tone` = semantic, `sm/md/lg`, `surface`, unprefixed booleans); fix or codemod deviations.
- **D2 Contract v2.1 data**: displayName, keywords (>=4), usage.description, >=6 bestPractices (>=2 don'ts), anatomy (composites), playground.defaults, dense.
- **D3 Examples**: 3-6 `example`-tagged stories, each with a one-sentence description, covering variants, sizes, states, and one composition-in-context.
- **D4 Playground story**: full Controls coverage; every public prop knob-able or explicitly excluded in argTypes; required props seeded from playground.defaults.
- **D5 Theming section data**: consumed tokens verified against token-catalog; component-level CSS vars declared if any.
- **D6 A11y**: axe clean in all 4 themes, forced-colors story verified, contract a11y flags filled, keyboard interaction documented.
- **D7 Tests**: unit + interaction (play) for stateful behavior; static CSS-class test where `styles.x` references exist (Vitest proxy guard).
- **D8 Missing artifacts** from the audit matrix filled (.module.css, .test, .mdx as applicable).
- **D9 i18n**: any user-facing strings through i18next with en/fi/sv keys.
- **D10 Promotion**: pass `release:gate` (production consumer evidence, figma link) then bump status.

Current-state flags below come from the 2026-07-02 audit matrix. "clean" = all artifact columns present.

### 5.1 Actions (5)

| Component | Status | Deltas and specifics |
|---|---|---|
| **Button** | stable, clean | D2/D3 only. Examples: Variants, Tones, Sizes, WithIcon, Loading, FullWidth. API extras to evaluate vs Astryx: async `clickAction` with auto-loading (they ship it; we have AdaptiveLoadingButton doing this as a separate component; decide merge vs keep, document the answer in bestPractices), `endContent` slot. Anatomy: Icon / Label / EndContent / Spinner. |
| **IconButton** | beta; no css, no test | Full D1-D10. Write `.module.css` (currently unstyled or inline?); square aspect, `label` prop as aria-label REQUIRED (Astryx pattern), tooltip integration. Examples: Variants, Sizes, WithTooltip, InToolbar. |
| **AdaptiveLoadingButton** | beta, clean | Phase 0 decision: fold into Button as `clickAction`/`loading` behavior or keep and document the split in both components' bestPractices. If kept: Examples: AsyncSubmit, Interruptible, ErrorRecovery. |
| **SplitButton** | stub | Build or delete (4.1). If built: primary action + menu, full D1-D10, anatomy: PrimaryAction / Divider / MenuTrigger / Menu. |
| **Tag** | ~~beta; no css, no test~~ **DELETED (Phase 3 batch 1, 2026-07-03)** | Resolution of the "clarify Tag vs Badge" question: platinum Badge already absorbed the whole surface (variant x tone, `removable` chip mode, auto status icons; keywords include "tag"/"chip"/"filter"). Tag was a legacy Tailwind duplicate with hardcoded colors and no catalog-surface consumers — deleted per the Phase 0 never-document-duplicates principle. Use Badge. |

### 5.2 Typography & content (10)

| Component | Status | Deltas and specifics |
|---|---|---|
| **Text** | stable, clean | D2/D3. Examples: Sizes (7-step), Weights, Tones, Truncation, Prose-in-context. Anatomy trivial: skip. Uppercase-size migration check (platinum leftover: ~400 uppercase usages). |
| **Title** | stable, clean | D2/D3. Examples: Levels (h1-h6 via `as`), Sizes-decoupled-from-level, OnDark surface. bestPractice don't: "don't skip heading levels for visual size; use size prop". Absorb Heading (4.1). |
| **Display** | beta; no css, no test | D8, then D2/D3. Position vs Title in dense line (display = hero-scale). |
| **Prose** | alpha; tsx+index only | Full build-out: stories, css audit, tests. This is the long-form typography wrapper; examples: Article, WithCodeBlocks, WithMedia. |
| **List** | beta, clean (platinum-adjacent, #780 fonts done) | D2/D3. Examples: Ordered, Unordered, Description, Interactive (if supported). |
| **Badge** | stable, clean | D2/D3. Examples: Tones, Sizes, WithIcon, AsCount, InButtonEndSlot (cross-links Button). |
| **Icon** | stable, clean | D2/D3. Examples: Sizes, Tones, Decorative-vs-informative (aria), CustomIcon registration. Keywords must include phosphor names people search. |
| **Avatar** | beta, clean | D2/D3. Examples: Sizes, Fallback-initials, WithImage, Group (if AvatarGroup absent, note as backlog; Astryx ships one). |
| **CodeSnippet** | beta, clean | D2/D3. Examples: Languages, Copyable, Inline-vs-block. |
| **CodeBlockWindow** | beta, clean | Document as composition of CodeSnippet + MacWindowFrame; anatomy section is the value here. |

### 5.3 Forms (18)

Family-level prerequisite: the field-wrapper convention (4.1). All form docs share a "Forms" foundation page: label/helper/error wiring, validation states, layout.

| Component | Status | Deltas and specifics |
|---|---|---|
| **TextInput** | beta; no css, no test | D8 (css likely delegated to Inputs umbrella; extract on dissolution), full D1-D10. Examples: States (default/error/success/disabled), WithPrefixSuffix, Sizes, ControlledVsUncontrolled. |
| **TextArea** | beta, clean | D2/D3. Examples: AutoGrow, CharCount, States. |
| **Select** | beta, clean | D2/D3. Examples: Basic, Groups, Disabled-options, States. Document native-select vs Combobox decision in bestPractices. |
| **Checkbox** | beta, clean (platinum set) | D2/D3. Examples: States, Indeterminate, WithDescription. |
| **CheckboxField** | beta; no css, no test | Phase 0 wrapper decision, then either dissolve or D8+D2/D3. |
| **CheckboxGroup** | beta, clean | D2/D3. Examples: Vertical/Horizontal, SelectAll-indeterminate, Validation. |
| **Radio / RadioGroup** | beta, clean | Document as one family page. Examples: Basic, WithDescriptions, Card-style (if supported), Validation. |
| **Switch** | beta, clean (platinum set) | D2/D3. bestPractice: switch = immediate effect, checkbox = submitted choice. Examples: Basic, WithLabel, Loading (if supported). |
| **Combobox** | **DONE (Phase 3 batch 3, 2026-07-03)** | isDisabled -> disabled clean break (component + option + optionsFromSelectChildren). Examples shipped: AsyncOptions, WithError, Disabled, KeyboardSelection (FreeSolo not supported — documented as a don't). |
| **MultiCombobox** | **DONE (Phase 3 batch 3, 2026-07-03)** | isDisabled -> disabled clean break. Examples shipped: TokenizedSelection (Example), MaxItems, Overflow, KeyboardMultiSelect. Cross-links Badge (Tag deleted in batch 1). |
| **PhoneInput** | **DONE (Phase 3 batch 3, 2026-07-03)** | TextInput-parity fixes: useId ids (was label-text ids), required marker reflects required prop (was error), error no longer leaks into label tooltip, error via HelperText + aria-describedby/aria-invalid (was bare span). + required/id/defaultCountry props. Examples: CountryDefault, WithError, InternationalNumbers. |
| **FileUpload** | **DONE (Phase 3 batch 3, 2026-07-03)** | Size-error fallback localized (fileUploadSizeError en/fi/sv). Examples: SelectAndClear, SizeRejection, Editorial. DragDrop/Multiple/Progress not supported by the component — feature backlog, not doc scope. |
| **FormField** | beta; no css | Wrapper convention owner (4.1). Anatomy is the key deliverable: Label / Control / HelperText / ErrorText slots. |
| **FormGroup** | beta; no css, no test | D8 or dissolve into FormField docs. |
| **Label** | stable, clean | D2/D3 light (atom). bestPractice: always tie htmlFor; never placeholder-as-label. |
| **HelperText** | beta, clean | D2/D3 light. Document tone inheritance from field state. |
| **GroupLabel** | beta, clean | D2/D3 light. Position vs Label in dense lines. |
| **Inputs** (umbrella) | beta | Dissolve (4.1). |

### 5.4 Feedback & status (10)

| Component | Status | Deltas and specifics |
|---|---|---|
| **AlertBanner** | **DONE (Phase 3 batch 4, 2026-07-03)** | Astryx Banner parity shipped: `action` slot + `icon` override added; dismiss strings localized (en/fi/sv, EN output unchanged). Examples: Info, Warning, Dismissible (keyboard play), WithAction. |
| **Toast** (+Toaster) | **DONE (Phase 3 batch 4, 2026-07-03)** | Toaster DELETED (Tailwind duplicate host; app mounted two toast systems). `providers/ToastProvider` is the single imperative host; `showToast(message, number \| {tone, duration, position})` extended back-compatibly; ContactFormEditorial + TailwindTest migrated. Hook documented in the contract usage block. Examples: Tones, Placement, ProviderDriven. WithAction/Promise-toast not supported by the component — documented as don'ts, feature backlog. |
| **Progress** | **DONE (Phase 3 batch 4, 2026-07-03)** | `indeterminate` mode added (sweeping bar, aria-valuenow dropped, reduced-motion slows not freezes). Examples: Determinate, Indeterminate, WithLabel, Sizes. |
| **Spinner** | **DONE (Phase 3 batch 4, 2026-07-03)** | Family triad documented in dense + bestPractices (Spinner <=1s-unknown, Progress known/long, Skeleton layouts). Examples: Sizes, WithVisibleLabel (AppLoading pattern). |
| **BusyIndicator** | **DELETED (Phase 3 batch 4, 2026-07-03)** | Dedup call resolved by deletion: off-convention s/m/l sizes, determinate dots duplicated Progress, 2 consumers. AppLoading -> Spinner lg + visible label; SecureCVDownload -> Spinner sm + Icon check-circle. Never documented (never-document-duplicates principle, same as Tag). |
| **Skeleton** | **DONE (Phase 3 batch 4, 2026-07-03)** | Group moved structure -> feedback (loading family). Examples: TextLines, Card, Avatar, Shapes, ComposedPage (single labelled status wrapping aria-hidden composition), Static. |
| **Tooltip** | **DONE (Phase 3 batch 4, 2026-07-03; stays alpha)** | Contract was alpha (audit matrix said beta). `side` prop exposed on TooltipContent; subParts + anatomy authored; keyboard contract (focus opens, Escape dismisses, aria-describedby) asserted in play + unit tests. Examples: Placements, WithIconButton, Delay, Example (keyboard play). lightDark/forcedColors verification pending before beta promotion. |
| **Modal** | beta, clean | Overlay family owner (4.1). Examples: Sizes, Scrollable, Form-in-modal, Confirmation. a11y: focus trap, return focus, Escape. |
| **AnimatedDialog** | beta; no test | Fold into Modal docs as motion variant, or document delta only. |
| **Lightbox** | alpha; no stories/test | Full build-out under overlay family. Examples: ImageGallery, Zoom, Keyboard-nav. |

### 5.5 Navigation (9)

| Component | Status | Deltas and specifics |
|---|---|---|
| **Link** | stable, clean | D2/D3. Examples: Tones, Underline-styles, External (rel/target + icon), OnDark. |
| **NavLink** | beta; no css, no test | D8, D2/D3. Active-state contract with Next.js routing documented. |
| **TextLink** | beta; no css, no test | Phase 0: absorb into Link or justify in dense lines. |
| **Breadcrumb** | beta, clean | D2/D3. Examples: Basic, Collapsed-middle, WithIcons. a11y: nav landmark + aria-current. |
| **Tabs** | beta, clean (platinum set) | D2/D3. Examples: Basic, Controlled (URL-synced like our own docs frame will use), WithIcons, Overflow. |
| **Pagination** | beta; no css, no test | D8, D2/D3. Astryx trick to replicate: wire `onPageChange(page)` back to knob state so the docs preview is actually clickable. |
| **SkipLink** | beta; no test | D7, D2 light. |
| **LanguageSwitcher** | beta, clean | D2/D3. Showcase piece for the i18n story (en/fi/sv); example embeds locale toolbar interplay. |
| **TableOfContents** | alpha; tsx+index only | Full build-out or Tier 2 demotion (it is blog-specific; recommend Tier 2). |

### 5.6 Layout & structure (13)

Layout primitives get a shared "Layout" foundation page with a composed example (the Astryx "Form Layout" pattern); individual pages stay lean.

| Component | Status | Deltas and specifics |
|---|---|---|
| **Card** | stable, clean | D2/D3. Examples: Variants, Clickable (whole-card link a11y pattern), Media, Composed. Council-audit "Card split" owner call lands here (Phase 0). |
| **Container** | beta; no test | D7, D2 light. Examples: Widths, Bleed. |
| **Grid** | beta, clean | D2/D3. Examples: Responsive-columns, AutoFit, WithCards. |
| **FlexBox** | beta; no css | D2 light. Note: css-less by design (style props); verify and document that. |
| **Stack** | beta; no css, no test | Same as FlexBox; add D7. |
| **Center / Spacer** | beta; no css, no test | D2 light each; one shared examples page ("layout utilities"). |
| **Section** | beta; no css, no test | D8 check, D2 light. |
| **Divider** | beta, clean | D2 light. Examples: Orientations, WithLabel. |
| **AspectRatio** | beta; no css, no test | D2 light, D7. |
| **Accordion** | beta, clean | D2/D3. Examples: Single, Multiple, Controlled, FAQ-composition. a11y: button+region pattern. |
| **ExpandableSection** | beta; no test | Clarify vs Accordion (single disclosure vs group) in dense lines; D7. |
| **MacWindowFrame** | beta, clean | D2 light (it is a showcase chrome, keep but mark decorative). |
| **Modal** counted in 5.4. | | |

### 5.7 Tier 2 (listing-level treatment, ~60 components)

Site/marketing blocks (ArticleCard, PersonCard, Testimonial, ServiceCard, Hero variants, ContactForm family, ChatWidget, Donny family, SocialShare, Gallery, etc.): require only D2-lite (usage.description, keywords, dense) + existing story + status honesty. They appear in the sidebar under `Site/` groups and in MCP search (demoted below Tier 1 like Astryx demotes sub-components). The `Enhanced*` alpha orphans (EnhancedAuthorCard, EnhancedContactForm, EnhancedPersonCard: tsx+index only) get a Phase 0 keep-or-delete decision each.

**Excluded from catalog surface:** client one-offs (Intrum, Tulli, VertaaUX, KnobSmithAudio, NewThingsCo, FinnishTransportAgency), pages/, __templates__, ui/ (shadcn internals), TailwindTest, RawView.

## 6. Sequencing inside Phase 3 (content sweep)

Batches sized to one PR each, ordered so shared conventions are settled before dependents:

1. Actions + Typography core (Button, IconButton, Tag, Text, Title, Badge, Icon) - conventions showcase, proves the frame.
2. Forms family (after wrapper decision): Label, HelperText, FormField, TextInput, TextArea, Select, Checkbox*, Radio*, Switch.
3. Advanced inputs: Combobox, MultiCombobox, PhoneInput, FileUpload.
4. Feedback: AlertBanner, Toast, Progress, Spinner, Skeleton, Tooltip. **DONE 2026-07-03** (+ Toaster and BusyIndicator deleted).
5. Overlays: Modal family, Lightbox.
6. Navigation: Link family, Breadcrumb, Tabs, Pagination, SkipLink, LanguageSwitcher.
7. Layout: Card, Grid, Container, Stack/FlexBox/Center/Spacer, Accordion, Divider, AspectRatio, Section.
8. Content: Avatar, List, Prose, CodeSnippet, CodeBlockWindow, Display.
9. Tier 2 D2-lite sweep (scriptable: backfill dense lines + keywords, one PR).

## 6.5 Astryx catalog gap analysis (2026-07-03, from astryx.atmeta.com/components)

Full diff of the Astryx public catalog against ours. Three buckets:

**Added as new DT primitives (gap-fill PR, alpha + WIP badge, full artifact set):**

| Astryx | DT component | Notes |
|---|---|---|
| Kbd | **Kbd** | Semantic `<kbd>` keycap, sm/md/lg on the text ladder. |
| Status Dot | **StatusDot** | tone x size + pulse; label mandatory (visible or sr-only). |
| Empty State | **EmptyState** | Composes Title/Text/Icon; sm/md/lg; action slot. |
| Button Group | **ButtonGroup** | role=group; attached (segmented) or spaced. Action cluster only — no selection state. |
| Avatar Group | **AvatarGroup** | Resolves the 5.2 backlog note; overlap stack + "+N" bubble. |

**Already covered (no duplicate will be documented):** Selector→Select, Typeahead→Combobox, Tokenizer/Multi Selector→MultiCombobox, File Input→FileUpload, Field→FormField, Radio List→RadioGroup, Dialog→Modal, Banner→AlertBanner, Progress Bar→Progress, Outline→TableOfContents, Top Nav→SiteHeader, Tab List→Tabs, Breadcrumbs→Breadcrumb, Code/Code Block→CodeSnippet/CodeBlockWindow, Collapsible→ExpandableSection/Accordion, Markdown→MarkdownMessage, Heading→Title, App Shell→Layout, Clickable Card→Card (clickable pattern), Chat family→ChatWidget/Donny family, VisuallyHidden→VisuallyHidden.

**Declined / backlog (each is a project, not a batch item; revisit only with a concrete consumer):** Table (+ its seven hooks), Calendar / Date / DateRange / DateTime / Time inputs, Number Input, Slider, Popover / Hover Card / Overlay primitives, Command Palette, Power Search, Carousel, Segmented Control (Toggle Button / Toggle Button Group — ButtonGroup deliberately excludes selection state), Toolbar, Dropdown Menu / More Menu (SplitButton menu covers current needs), Side Nav / Top Nav Mega Menu, Resize Handle, Tree List, Blockquote / Citation / Thumbnail / Timestamp / Token, Metadata List / Overflow List.

## 7. Risks and mitigations

- **Content authoring is the real cost** (300+ bestPractices entries, 200+ examples). Mitigate: author in batches with the collaborative editorial process (per feedback memory: no isolated-subagent copywriting; draft in main thread, user reviews per batch).
- **Docs page template vs Storybook upgrades**: pin the docs-blocks API surface we depend on; smoke test catches breakage.
- **Contract schema change ripples** (sync:contract-props scope footgun noted in memory): schema fields are additive and optional at v2.1; validator tiers enforce presence, not schema.
- **Storybook-only ceiling**: accepted consciously. If the public-frame ambition returns, the doc data layer (Phase 1) and content (Phase 3) transfer 1:1; only the frame (Phase 2) is Storybook-specific.

## 8. Success criteria

- Every Tier 1 component page shows all 11 blocks with real content; zero placeholder prose.
- `validate:components` enforces tier rules; CI green.
- MCP `search("button")` returns a budgeted brief with import line and hint; `get("Button")` returns usage + examples source.
- >=25 components stable (from 10) via release:gate.
- Storybook sidebar mirrors the category taxonomy with status dots; landing gallery live.
