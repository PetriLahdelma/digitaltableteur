# Figma ↔ contract parity audit

> Generated 2026-07-10 by diffing all 164 component/pattern contracts against the DT-Site-stuff
> Figma file (PC2UPdYwm8qGt6ZTg0AakF). Re-derive with the method in the Appendix. This is the
> working plan for the Figma parity uplift; tick batches as they land.

## Agreed bar (owner sign-off 2026-07-10)

- **Components (atoms/molecules/organisms): full contract parity.** Every contract variant axis
  represented in Figma (as variant properties, or as component properties where an axis is
  geometry/placement-only, e.g. Toast.position, Grid.align — deliberate call per component),
  component properties for text/boolean/instance-swap slots, all visual properties bound to DT
  variables, verified in all 4 theme modes (Light/Dark/HCB/HCW).
- **Patterns: full variant sets too** (owner chose full fidelity over representative frames).
- **Typography: Syne is retired everywhere** — code has been Satoshi-only since the Satoshi
  unification (app/fonts.ts: single typeface, no separate heading face). All Figma text styles,
  components, and canvas labels move to Satoshi; the size ramp must be re-derived from
  variables.css tokens, not copied from the old Syne styles.
- Expected-variant counts below are upper bounds from axis products; the per-batch build decides
  variant-vs-property modelling per axis and records it in the component description.

## Summary

| Category | Count |
|---|---:|
| Contracts audited (excl. deprecated Hero) | 163 |
| Linked to a real Figma node, no issues found by scan | 26 |
| Linked but drifted (fonts / bindings / variant coverage) | 30 |
| Linked to a dead node | 1 (ContactInquiryPanel → 664:33 deleted) |
| Exists in Figma but contract still has placeholder link | 2 (NavLink → 516:3146, DonnyAvatar → 492:1578) |
| No Figma counterpart at all | 104 (46 stable · 33 beta · 25 alpha) |
| Syne text styles to migrate | 7 (entire Display/Heading ramp) |
| Wrong mono font | Kbd (DM Mono), NewsBulletin (Red Hat Mono) — code uses --font-mono = Source Code Pro stack |

## A. Missing entirely — stable (46, by consumers)

| Contract | Tier | Consumers | Contract axes |
|---|---|---:|---|
| Container | atom | 12 | size(5) |
| EnhancedProjectCard | molecule | 12 | aspectRatio(4) |
| Icon | atom | 12 | size(7) |
| List | molecule | 12 | size(7) |
| ReadingProgress | molecule | 12 | — |
| Section | atom | 12 | spacing(7) × background(4) |
| GridBlock | pattern | 12 | — |
| PageLayout | pattern | 12 | — |
| ProcessBlock | pattern | 12 | — |
| StoryBlock | pattern | 12 | — |
| AuthorBio | molecule | 10 | — |
| Stack | atom | 9 | align(4) |
| IconButton | atom | 7 | variant(3) × tone(5) × surface(3) × size(3) |
| LanguageSwitcher | molecule | 7 | — |
| ValueCard | molecule | 7 | variant(3) |
| Pagination | molecule | 5 | — |
| PhoneInput | molecule | 5 | — |
| HeroSection | pattern | 5 | align(3) |
| WorkPreviewSection | pattern | 5 | layout(3) |
| Combobox | molecule | 4 | — |
| ContactFormEditorial | organism | 4 | — |
| ExpandableSection | molecule | 4 | — |
| FormFieldEditorial | molecule | 4 | — |
| MultiCombobox | molecule | 4 | — |
| ServiceCard | molecule | 4 | variant(4) |
| SkipLink | atom | 4 | — |
| SocialShare | molecule | 4 | variant(2) |
| AboutPageContent | pattern | 4 | — |
| TeamBlock | pattern | 4 | — |
| CategoryFilter | molecule | 3 | variant(3) × size(3) |
| SecureCVDownload | molecule | 3 | — |
| SiteTree | molecule | 3 | — |
| Skeleton | atom | 3 | variant(5) |
| ContactPageContentEditorial | pattern | 3 | — |
| DesignSprintsSection | pattern | 3 | — |
| HighlightSection | pattern | 3 | variant(4) × size(3) |
| HomeHero | pattern | 3 | — |
| PricingPageContent | pattern | 3 | — |
| ServicesSection | pattern | 3 | — |
| FlexBox | atom | 2 | align(5) |
| ContactHero | pattern | 2 | — |
| ProofBlock | pattern | 2 | — |
| ServicesBlock | pattern | 2 | — |
| WorkMagneticField | pattern | 2 | — |
| FormField | molecule | 1 | — |
| Grid | atom | 1 | align(17) |

### Missing — beta (33, all 0-consumer)

ArticleCard, AspectRatio, Author, Center, ClientLogoMarquee, ComplianceCard, CookieConsent, Designerman, Display, EmailSignatureGenerator, Gallery, GroupLabel, ImagePlaceholder, LinkedInQuoteCard, LocationCard, MCPActionButton, MacWindowFrame, MarkdownMessage, NavMenuList, NextLayout, OpenHours, PersonCard, SentrySummaryCard, ServicesGrid, SkillsGrid, Spacer, Testimonial, ThemeProvider, Tooltip, TransformingActionInput, WipBadge, FadeIn, Footer

Beta components need a real Figma node before any future promotion; build on demand or alongside
their tier batch.

### Missing — alpha (25)

CommandPalette, FilterChip, SegmentedControl, SelectableCard, SocialIconLink, ToastStack, AboutHero, ArticleHero, ArticleLayout, ArticlePageTemplate, BlogHero, BlogIndexContent, CVDownloadSection, ContentSection, ManifestoSection, ProjectDetailLayout, ProjectDetailTemplate, ProjectHero, ProjectMetaSection, RelatedPosts, RelatedProjects, StatsSection, ValuesSection, WorkCTA, WorkHero

Alpha needs Figma only at alpha→beta promotion (validator hard-requires a node then). The six
component-tier alphas (CommandPalette, SegmentedControl, SelectableCard, SocialIconLink,
FilterChip, ToastStack) are the ones with a promotion path; the 19 page-template alphas follow
the patterns decision.

## B. Linked but drifted (30)

boundRatio = fraction of scanned nodes carrying at least one variable binding (rough signal, not
a gate). variants a/b = Figma variants vs axis-product upper bound.

| Contract | Status | Consumers | Issues |
|---|---|---:|---|
| BlogMediaImage | stable | 12 | weak bindings (0); variants 1/2 (fit:2) |
| Button | stable | 12 | variants 108/135 (variant:3 x tone:5 x surface:3 x size:3) |
| HelperText | stable | 12 | weak bindings (0.45) |
| Label | stable | 12 | weak bindings (0.4) |
| Link | stable | 12 | weak bindings (0.46); variants 6/9 (size:3 x underline:3) |
| Menu | stable | 12 | weak bindings (0.44); variants 1/3 (align:3) |
| Text | stable | 12 | weak bindings (0.43); variants 3/7 (size:7) |
| Title | stable | 12 | Syne typography; weak bindings (0.45); variants 5/7 (size:7) |
| CTASection | stable | 12 | variants 1/2 (align:2) |
| ArticleContent | stable | 10 | weak bindings (0); variants 1/3 (size:3) |
| Avatar | stable | 10 | variants 6/16 (variant:2 x size:8) |
| ArticleShareSection | stable | 9 | weak bindings (0); variants 1/2 (layout:2) |
| Toast | stable | 9 | variants 5/72 (size:3 x tone:4 x position:6) |
| Divider | stable | 6 | weak bindings (0.4) |
| Modal | stable | 6 | Syne typography; variants 1/4 (severity:4) |
| ProjectCard | stable | 6 | weak bindings (0); variants 1/8 (aspectRatio:4 x titlePosition:2) |
| Tabs | stable | 6 | weak bindings (0.42); variants 1/9 (variant:3 x size:3) |
| BlogCategoryFilter | stable | 5 | weak bindings (0); variants 1/9 (variant:3 x size:3) |
| BlogGrid | stable | 5 | weak bindings (0); variants 1/3 (layout:3) |
| Select | stable | 5 | variants 4/6 (size:6) |
| AlertBanner | stable | 4 | weak bindings (0.3) |
| ProjectGallery | stable | 4 | weak bindings (0); variants 1/27 (columns:3 x gap:3 x aspectRatio:3) |
| Card | stable | 3 | variants 4/12 (variant:3 x padding:4) |
| EmptyState | stable | 3 | Syne typography |
| WorkGrid | stable | 3 | weak bindings (0); variants 1/12 (columns:3 x aspectRatio:4) |
| NewsBulletin | stable | 3 | wrong mono font |
| Accordion | beta | 0 | variants 1/6 (type:2 x variant:3) |
| Kbd | beta | 0 | wrong mono font |
| RadioGroup | beta | 0 | variants 1/12 (orientation:2 x size:6) |
| SplitButton | beta | 0 | variants 9/27 (variant:3 x surface:3 x size:3) |

Notable: the whole blog/work organism cluster (ProjectCard, ProjectGallery, WorkGrid, BlogGrid,
BlogCategoryFilter, BlogMediaImage, ArticleContent, ArticleShareSection) has **zero variable
bindings** — hardcoded fills throughout. TextInput's Figma set is named `Inputs` (rename to
TextInput during its batch).

## C. Quick wires

- NavLink (stable) → existing set 516:3146 (2 variants; needs parity pass + contract URL).
- DonnyAvatar (beta) → existing component 492:1578 (needs contract URL).
- ContactInquiryPanel (stable, 5 consumers) → node 664:33 was deleted; rebuild in Patterns.

## D. Typography migration (Syne → Satoshi)

- **All 7 heading/display text styles are Syne** (Display/display-xl 192 ExtraBold … Heading/title-s 36 Bold).
  Replace with Satoshi styles sized from the variables.css type-scale tokens.
- Syne inside components: Title (set 370:12), Modal (384:13), EmptyState (1014:192).
- Syne canvas labels: Foundations 12, Atoms 25, Molecules 21 (incl. the cap/* caption convention
  — CodeSnippet/CodeBlockWindow captions copied it 2026-07-10 and need the same sweep), Views 6, Design WIP 1.
- Mono fixes: Kbd (DM Mono → Source Code Pro), NewsBulletin badge (Red Hat Mono → Source Code Pro).
  Code source of truth: --font-mono: source-code-pro, menlo, … (variables.css).

## E. Canvas hygiene (delete/rename during tier batches)

Unnamed/junk nodes: `Component 1` (949:1774, 970:1810), `Component 2` (949:1791),
`Group 1/2/3` (949:1801, 949:1802, 999:2035), `Badge/Card/Badge/Primary/None/Property 45`
(1151:2835), `image 3` (1151:2830), `nav` (516:3098 — likely SiteHeader scratch),
`Line 1` (1038:2701). Views and Design WIP pages are non-DS scratch (Inter/SF Mono/Moderat
mockups) — out of scope, leave as-is.

## Batch plan (each batch = Figma work + contract URL updates + gate + PR)

> **Resuming in a fresh session:** read this section top to bottom, then the "FIGMA PARITY"
> entries in the session memory (MEMORY.md → project_promotion_workflow.md) for the build
> recipe, exemplar nodes (CodeSnippet 1161-2809, CodeBlockWindow 1164-257), and the Figma API
> gotchas. Load the `figma:figma-use` + `figma:figma-generate-library` skills before any
> `use_figma` call. Every PR that wires nodes must lower the `check:figma-links` ceiling in
> `scripts/design-system/figma-links.baseline.json`. Captions are `cap/<Name>` **Satoshi**
> Bold 22 (the old Syne caption convention is retired).

- [x] **B0 Typography foundation** — DONE #1070 (2026-07-10). All 7 Syne text styles migrated
  in place to Satoshi Bold + 120% line-height (in-place style edits propagate to styled nodes);
  3 missing heading styles added (title-xxl 112 / title-xs 28 / title-xxs 22 from token maxima);
  Syne swept from Foundations/Atoms/Molecules/Patterns canvases; Kbd DM Mono and NewsBulletin
  Red Hat Mono → Source Code Pro. Views + Design WIP are non-DS scratch, deliberately skipped.
- [x] **B1 Quick wires + hygiene** — DONE #1070. NavLink → 516-3146, DonnyAvatar → 492-1578
  (contracts + story links), Figma set `Inputs` renamed TextInput, `check:figma-links` ratchet
  wired into pre-push (stable-placeholder ceiling; lower it in every wiring PR). Canvas junk
  deletion deferred to tier batches (instances must be checked first).
- [x] **B2a Atoms parity (except Button/IconButton)** — DONE #1071. Remodeled: Title/Text (7-size
  contract ramp, clamp-maxima px, color/title + copy-color bound), Link (size × underline 3×3),
  Avatar (16 = image/initials × 8 rem sizes; legacy 56px LG rescaled to 3rem/48),
  Label/HelperText/Divider rebound to CSS tokens. Built + wired: Container 1178-1654,
  Icon 1176-1658, Section 1178-1712 (28 variants), Stack 1176-1676, FlexBox 1176-1698,
  Skeleton 1177-1652, SkipLink 1177-1644, Grid 1177-1654 (align modelled as prop). Ceiling
  46 → 38. Figma API gotchas (resize resets hug sizing; variable-bound paints drop paint
  opacity — use a node-opacity wash layer; shared TEXT property propagates characters) are
  recorded in the session memory (project_promotion_workflow.md).
- [x] **B2b Button remodel + IconButton** — DONE (2026-07-10). Button 406:1569 remodeled in
  place to the full contract product variant × tone × surface × size = 135 variants (single set,
  not sub-sets: instances can toggle surface, and the audit gap metric counts the axis product).
  State/Inverse axes REMOVED — the 72 State=Disabled/Loading variants had zero dependent
  instances (verified by whole-file scan; all 48 deps incl. SplitButton/CodeSnippet/ContactForm
  are State=Default and follow node ids through renames); disabled/loading are boolean props,
  not contract axes; Inverse=True mapped to Surface=onDark. Tone visually collapses on
  onDark/onBrand (code truth: Button.module.css surface overrides ignore the accent) — recorded
  in the set description. Master icon slots hidden uniformly (Has Icon default false). IconButton
  built new (Atoms, node 1194-1733, own section): 135 circle variants, radius/full variable
  MINTED (DT / Dimension 9999, CORNER_RADIUS, var(--radius-full)), sizes 32/40/48 with 20/24/28
  icons, Icon INSTANCE_SWAP wired to all variants. Both sets verified Light + forced-Dark.
  Ceiling 38 → 37.
- [ ] **B2c Menu (molecule-tier leftover listed under atoms drift)** — Menu align:3 variants;
  fold into B3.
- [ ] **B3 Molecules parity** — drifted (Tabs, Modal, Card, Select, Toast, AlertBanner, Accordion,
  RadioGroup, SplitButton, EmptyState) + missing stable molecules (EnhancedProjectCard, List,
  ReadingProgress, AuthorBio, LanguageSwitcher, ValueCard, Pagination, PhoneInput, Combobox,
  MultiCombobox, ExpandableSection, FormFieldEditorial, ServiceCard, SocialShare, CategoryFilter,
  SecureCVDownload, SiteTree, FormField).
- [ ] **B4 Organisms rebind + missing** — blog/work cluster variable rebind + variants;
  ContactFormEditorial build.
- [ ] **B5 Patterns full sets** — rebuild ContactInquiryPanel; missing stable patterns (GridBlock,
  PageLayout, ProcessBlock, StoryBlock, HeroSection, WorkPreviewSection, AboutPageContent,
  TeamBlock, ContactPageContentEditorial, DesignSprintsSection, HighlightSection, HomeHero,
  PricingPageContent, ServicesSection, ContactHero, ProofBlock, ServicesBlock, WorkMagneticField)
  + drifted CTASection/NewsBulletin/SiteHeader/SiteFooter parity.
- [ ] **B6 Beta/alpha backfill** — on demand per promotion; component-tier alphas first.

## Appendix: method

Contract side: parse all *.contract.json (status, figma node regex `node-id=\d+[-:]\d+`,
variants axes). Figma side: per-page findAllWithCriteria COMPONENT/COMPONENT_SET + per-component
font scan + boundVariables sampling (60 nodes/component cap). Join on node id, fall back to name.
Scripts inline in session 2026-07-10; re-run by regenerating the two inventories and the join.
