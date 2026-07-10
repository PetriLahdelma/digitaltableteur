# Raw-HTML → Design-System Migration Audit

> Generated 2026-07-09 by an agent sweep of `app/`, `nextjs-app/shared/patterns/`,
> and `nextjs-app/shared/components/` (excl. tests, stories, dev harnesses).
> Companion data: Storybook **Docs/ComponentUsage** (`npm run report:component-usage`).

## Context

Tailwind 4 is wired in production (`app/globals.css` imports `app/tailwind.css`),
so utility classes render correctly — the contamination is architecture drift
against the CSS-Modules-only rule, not broken styling. That also means new
AI-generated code keeps compounding it because it works.

## Priority order

1. **Hero nested-interactive bug** (`patterns/Hero/Hero.tsx:126-135, 222-236`):
   raw `<a>` wrapping `<Button>` → nested interactive controls, a live a11y
   defect. Pass `href` to Button directly (it has a link form).
2. Quick-win sweep (A-list below).
3. MobileDrawer language buttons (`patterns/SiteHeader/MobileDrawer.tsx:200-213`,
   Tailwind `cn()` strings) + filter chips (`CategoryFilter` + `BlogCategoryFilter`,
   6 near-duplicate `aria-pressed` buttons) — consider one `FilterChip` primitive.
4. Work-page raw `<img>` (VertaaUX ×14 + others) → DS `Image`; real LCP win.
5. `EmailSignatureGenerator` (9× input+copy rows, 22 swaps) — consider a
   `CopyField` molecule first.
6. Tailwind burn-down per file cohort, starting with
   `app/design-system/agent/page.tsx` (34 utility lines on the DS's own docs page).

## A. Quick wins (trivial swaps)

| Location | Raw | Replace with |
|---|---|---|
| `app/global-error.tsx:26-42` | inline styles, hardcoded `#dfff00`/`#666` | mirror `app/error.tsx` (Button + tokens); must stay provider-free |
| `patterns/Footer/Footer.tsx:26-69` | 6 internal `<a>` + `<h2>` | `RouterLink`, `Title` |
| `patterns/DesignSprintsSection:26-37` | pill-styled `<a href="/contact...">` | `Button href` |
| `patterns/RelatedProjects:36-60` | `<a href="/work">` + 2 `<h2>` | `RouterLink`, `Title` |
| `patterns/StatsSection:65`, `ContentSection:91` | `<h2>` Tailwind display classes | `Title` |
| `patterns/PricingPageContent:456-458` | hand-rolled NEW! badge | `Badge` |
| `EnhancedProjectCard:187` | hand-rolled tag span | `Tag` |
| `patterns/NewsBulletin:162-206` | 2 icon-only `<button>` | `IconButton` |
| `ProjectCard:109,136`, `ServiceCard:70-73`, `LocationCard:48` | `<h3>`/`<p>` Tailwind typography | `Title`/`Text` |
| `AskAI:154`, `CookieConsent:136` | raw headings | `Title` |
| `app/blog/[slug]/ServerRelatedPosts:42-44`, `ServerArticleHero:69` | raw `<h1>/<h2>` | `Title` (server-safe) |
| `Modal:257` | hand-rolled spinner div | `Spinner` |

Intentionally raw (do not migrate): honeypot fields in ContactForm/ContactFormEditorial,
EmailSignatureGenerator's template-string email HTML, `sr-only` SEO block in
`app/blog/page.tsx`, markdown element mapping in MarkdownMessage, dev harness
`TailwindTest` / `app/dev/tailwind-test`.

## B. Needs mapping (adaptation required)

- **B1 Hero nested interactive** — see priority 1.
- **B2 MobileDrawer language buttons** — Button variants or reuse LanguageSwitcher; whole file is Tailwind-styled (17 lines), migrate together.
- **B3 PricingPageContent disclosure** (`:433-460`) → `ExpandableSection`; keep `data-donny-target` hooks.
- **B4/B5 Footer + SiteFooter social anchors** (8 + mapped) → DS `Link`/icon-link; see C SocialIconLink.
- **B6 ProjectHero "Visit Live Site"** (2×, inline `<svg>` arrow) → DS `Link` + `Icon`.
- **B7 Lightbox** — 3 raw buttons + raw `<img>` → `IconButton` ×3, DS `Image`; mind focus trap.
- **B8 Filter chips** — `CategoryFilter` + `BlogCategoryFilter` (6 buttons, 3 variants, duplicated components) → `SegmentedControl`/`Button` or new `FilterChip`.
- **B9 EmailSignatureGenerator** — 9 labeled inputs + copy buttons, 2 action buttons, preview img, link → `TextInput`, `IconButton`, `Button`, DS `Image`; see C CopyField.
- **B10 CookieConsent toggle** (`:151-160`) — hand-rolled checkbox switch → `Switch` (supports disabled-checked since the disabled unification).
- **B11 TableOfContents** — collapse/nav buttons, `<h2>`, `<ul>` → `IconButton`/`Button`, `Title`, `List`; mind scroll-spy.
- **B12 AskAI dropdown** (`:159,185-190`) — hand-rolled listbox → `Menu` (Radix) or `Select`.
- **B13 Work-page images** — VertaaUX ×14, KnobSmithAudio ×2, Illustrations ×1 raw `<img loading=lazy>` → DS `Image`.
- **B14 Card images** — PersonCard, LinkedInQuoteCard, Testimonial, Gallery raw `<img>` → DS `Image` (Avatar/MdxImage/BlogMediaImage/ClientLogoMarquee are deliberate wrappers, skip).
- **B15 Assorted raw buttons** — LanguageSwitcher internals, ScrollIndicator, Designerman, ChatMessageBubble, ChatComposer, ChunkErrorBoundary (worst: inline styles + `#007bff`).
- **B16 ContactPageContentEditorial anchors** — mailto + scroll anchor → DS `Link`, keep handler.
- **B17 `app/design-system/agent/page.tsx`** — whole page raw + 34 Tailwind lines → Title/Text/List/RouterLink/Container; dogfooding argument.
- **B18 Blog server shell** (ServerArticleHero/Main/RelatedPosts/Content) — raw typography + ~24 Tailwind lines → server-safe DS components.
- **B19 FormFieldEditorial** — hand-rolled input/textarea chrome re-rolls the shared `field.module.css` chrome (#978 decision violation) → compose `TextInput`/`TextArea`.

## C. New-component candidates

| Proposed | Evidence |
|---|---|
| `SocialIconLink` (icon-only anchor, external-safe) | ~13 occurrences: Footer (8), SiteFooter, ArticleShareSection (3), SocialShare — most repeated raw pattern in the repo |
| `FilterChip` (+ group) | 6 `aria-pressed` chip buttons across two near-duplicate filter components |
| `CopyField` (TextInput + copy IconButton) | 9× repeated molecule in EmailSignatureGenerator |
| `HoneypotField` | intentionally raw but duplicated verbatim in 2 forms; centralize |
| `Table` | only OpenHours has a real table; build only when a data-table consumer appears |

## D. Tailwind contamination (~55 files, ~350 utility lines)

Top: `app/design-system/agent/page.tsx` (34), `ProjectMetaSection` (25),
`ProjectHero` (18), `EnhancedAuthorCard` (18), `MobileDrawer` (17),
`SiteFooter` (15), `ContentSection` (15), `ProjectNav` (14),
`WorkPreviewSection` (12), `SiteHeader` (11), `BlogIndexContent` (11).
Cohort pattern: SiteHeader/SiteFooter/Project*/Article*/Enhanced*Card/blog
Server* form one Tailwind-styled generation cohort; older patterns are
CSS-Modules-clean but hand-roll elements instead.

## Scale summary

~33 raw `<button>`, ~30 raw internal/social `<a>`, ~22 raw `<img>`, 12 raw
inputs, ~60 raw headings/paragraphs with custom classes, 1 `<table>`,
~12 styled lists, 3 hand-rolled badges, 2 hand-rolled spinners.
