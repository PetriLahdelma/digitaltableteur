#!/usr/bin/env node
// One-shot scaffolder for Bucket 1 of the catalog-gap migration — the 25
// atoms/molecules surfaced by `npm run audit:catalog`. For each component this
// writes:
//
//   <Name>.contract.json   (schema-valid, status:alpha, real description,
//                            real variant axes, real a11y keyboard contract)
//   <Name>.stories.tsx     (Default + Playground; not gated at alpha but
//                            reviewers need to see the entry in Storybook)
//   <Name>.mdx             (In use / How to use / When to use / When not to
//                            use / Accessibility / Promotion notes; prose
//                            is real per-component, not template boilerplate)
//   <Name>.spec.md         (Intent / Interaction contract / Do/don't /
//                            Design notes — required by validate-components
//                            at every tier)
//
// Existing <Name>.tsx, <Name>.module.css, and index.ts files are not touched.
// The script refuses to overwrite any of the 4 catalog artifacts if they
// already exist; pass --force to overwrite a single component or rerun after
// deleting the stale files.
//
// The data block below is hand-curated — each entry was derived by reading
// the component's source on 2026-05-26. When a new component is added to the
// catalog gap, add an entry here rather than running the generic
// scaffold-component.mjs, which produces a template with TODO markers and
// trips the Honest-Beta debt detector if anyone promotes the contract.

import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const COMPONENTS = join(ROOT, "nextjs-app/shared/components");

// Tier-prefix mapping mirrors scripts/design-system/in-scope-components.mjs
// so Storybook sidebar grouping is consistent with existing entries.
export const TIER_PREFIX = {
  atom: "Atoms",
  molecule: "Molecules",
  organism: "Organisms",
  pattern: "Patterns",
};

export const COMPONENTS_DATA = [
  // ---------- Atoms ----------
  {
    name: "AspectRatio",
    tier: "atom",
    group: "structure",
    element: "div",
    description:
      "Layout primitive that locks its children to a fixed width/height ratio (1:1, 4:3, 16:9, …) so media-shaped containers reserve space before content loads.",
    variants: {
      ratio: {
        values: ["1:1", "4:3", "16:9", "21:9", "3:2", "2:3"],
        default: "16:9",
      },
    },
    a11y: {
      keyboard: [],
      ariaRequirements: [
        "No own ARIA — the wrapper inherits semantics from its children. Author the inside as a meaningful region (img, figure, iframe) yourself.",
      ],
      reducedMotion: true,
    },
    tokens: { colors: [], spacing: [] },
    intent:
      "Reserve layout space at a fixed aspect ratio so the page does not jump when the contained media (image, video, embed, illustration) loads. The wrapper is unopinionated about what sits inside.",
    keyboard: "None — the wrapper is non-interactive.",
    pointer: "Click events pass through to children.",
    sr: "Wrapper is silent. Announcements come from the contained element (alt text on an img, figcaption on a figure, etc.).",
    doList: [
      "Wrap a single media-shaped child (img, video, iframe, illustration).",
      "Use the canonical ratios (16:9 for video, 1:1 for square thumbs) so the catalog stays small.",
    ],
    dontList: [
      "Use this as a generic flex/grid item — pick a layout primitive instead.",
      "Add padding or margin via className — children will overlap their own padding because the wrapper is `position: relative`.",
    ],
    whenToUse: [
      "Reserving space for an image, video, or iframe that has a known aspect ratio but unknown intrinsic dimensions.",
      "Locking a card thumbnail so the card height does not change when images load.",
    ],
    whenNotToUse: [
      "Sizing a generic content block where the height should follow its children.",
      "Containing multiple children that need to be laid out next to each other — wrap them in a layout primitive (`FlexBox`, `Grid`) first, then wrap that in `AspectRatio` if it has a fixed ratio.",
    ],
  },
  {
    name: "Center",
    tier: "atom",
    group: "structure",
    element: "div",
    description:
      "Centers its children horizontally and vertically inside a relative container. Single-purpose alternative to ad-hoc `flex items-center justify-center` snippets scattered through the codebase.",
    variants: {
      axis: {
        values: ["both", "horizontal", "vertical"],
        default: "both",
      },
    },
    a11y: {
      keyboard: [],
      ariaRequirements: [
        "No own ARIA — inherits semantics from its children.",
      ],
      reducedMotion: true,
    },
    tokens: { colors: [], spacing: [] },
    intent:
      "Provide a single, named primitive for centering content so reviewers do not have to read a Tailwind class string to know what the component is doing.",
    keyboard: "None — non-interactive.",
    pointer: "Click events pass through.",
    sr: "Wrapper is silent; announcements come from the child content.",
    doList: [
      "Use as the outer wrapper of a small empty-state, loading slot, or hero-band.",
      "Pair with a height constraint on the parent so vertical centering has something to center inside.",
    ],
    dontList: [
      "Center large layout sections — use `Section` + `Container` instead.",
      "Rely on this to vertically center text inside a button or input — those already center via their own padding.",
    ],
    whenToUse: [
      "Centering an empty-state illustration + message inside a card body.",
      "Centering a single CTA inside a band of empty space.",
    ],
    whenNotToUse: [
      "Building a full page layout — that is what `Layout`, `Section`, and `Container` are for.",
      "Centering text inside a control — controls own their own internal alignment.",
    ],
  },
  {
    name: "Display",
    tier: "atom",
    group: "display",
    element: "h1",
    description:
      "Display-sized heading for marketing hero copy. Larger than the `Title` scale; used sparingly on landing/about/contact heroes where the type itself is the visual.",
    variants: {
      size: { values: ["xs", "sm", "md", "lg", "xl"], default: "lg" },
      weight: {
        values: ["regular", "medium", "semibold", "bold"],
        default: "bold",
      },
    },
    a11y: {
      keyboard: [],
      ariaRequirements: [
        "Renders an h1/h2/h3 by default — semantic heading. Override the level via `as` when nesting inside a section that already owns the page h1.",
      ],
      reducedMotion: true,
    },
    tokens: {
      colors: ["--color-text"],
      spacing: [],
      typography: [
        "--font-display",
        "--font-size-display",
        "--font-weight-bold",
        "--line-height-tight",
      ],
    },
    intent:
      "Provide a marketing-scale heading distinct from `Title`. Used for landing-page heroes where the visual hierarchy starts with a single, dominant phrase.",
    keyboard: "None — heading is non-interactive.",
    pointer: "None.",
    sr: "Announced as a heading at the level chosen via `as` (defaults to h1). Ensure `as` reflects the document outline.",
    doList: [
      "Reach for `Display` on hero bands and landing-page titles.",
      "Pair with `Text` for the supporting paragraph below.",
    ],
    dontList: [
      "Use `Display` for in-page section headings — that is `Title`.",
      "Stack two `Display` headings in the same viewport — the marketing visual collapses.",
    ],
    whenToUse: [
      "The single hero heading on landing, about, contact, services.",
      "Editorial layouts where the type itself is the design.",
    ],
    whenNotToUse: [
      "Section headings inside a page — use `Title` (level + size).",
      "Card titles, list-item titles, or anywhere a body-scale heading reads as the right size.",
    ],
  },
  {
    name: "Heading",
    tier: "atom",
    group: "display",
    element: "h2",
    description:
      "Semantic heading primitive (h1–h6) with an explicit visual size axis decoupled from the HTML level so the document outline stays honest.",
    variants: {
      level: { values: ["1", "2", "3", "4", "5", "6"], default: "2" },
      size: {
        values: ["display", "xl", "lg", "md", "sm", "xs"],
        default: "lg",
      },
    },
    a11y: {
      keyboard: [],
      ariaRequirements: [
        "Always renders an h1–h6 element matching `level`; the visual `size` axis does not change the rendered tag.",
        "Authors are responsible for keeping `level` aligned with the surrounding document outline — `Heading` does not introspect its DOM position.",
      ],
      reducedMotion: true,
    },
    tokens: {
      colors: ["--color-text"],
      spacing: [],
      typography: [
        "--font-display",
        "--font-size-display",
        "--font-size-xl",
        "--font-size-lg",
        "--font-size-md",
        "--font-size-sm",
        "--line-height-tight",
      ],
    },
    intent:
      "Decouple heading level from visual size — let pages have a sensible outline (single h1, h2 sections) without forcing every visual to inherit the level's default size.",
    keyboard: "None.",
    pointer: "None.",
    sr: "Announced as a heading at `level`. Screen-reader users navigate by headings; the document outline only works if `level` is honest.",
    doList: [
      "Pick `level` from the page outline you would expect a screen reader to navigate.",
      "Pick `size` from the visual design language — the two are independent.",
    ],
    dontList: [
      "Skip levels for visual effect (h1 → h3) — screen-reader navigation breaks.",
      "Use the same level twice for the same scope when one is a subheading of the other.",
    ],
    whenToUse: [
      "Any in-page heading where you want the visual scale independent of the HTML level.",
      "Section headings, card titles, modal titles.",
    ],
    whenNotToUse: [
      "Hero / marketing display copy — use `Display`.",
      "Inline emphasis inside body text — that is `<strong>` / `Text` with weight.",
    ],
  },
  {
    name: "TextLink",
    tier: "atom",
    group: "navigation",
    element: "a",
    description:
      "Inline text link primitive with a stable focus ring + underline contract. Distinct from `Link` (the design-system Link wrapping `next/link`) — `TextLink` is the unwrapped underline-on-hover token used inside prose.",
    variants: {
      variant: { values: ["default", "muted", "accent"], default: "default" },
    },
    a11y: {
      keyboard: [
        "Tab — focusable in document order.",
        "Enter — activates the link.",
      ],
      ariaRequirements: [
        "Renders a real `<a>` element with a real `href`; never put `role='link'` on a non-anchor.",
        "Accessible name comes from the visible link text; do not add `aria-label` unless the text is purely visual (an icon-only link).",
      ],
      reducedMotion: true,
    },
    tokens: {
      colors: ["--color-text", "--color-link", "--color-link-hover"],
      spacing: [],
      typography: ["--font-size-md"],
    },
    intent:
      "Provide an inline link primitive optimised for body copy. The visual is a colour change + underline-on-hover; the focus ring is the design system's focus token.",
    keyboard: "Tab to focus; Enter to activate. Same as a native `<a>`.",
    pointer:
      "Hover applies the hover colour token; click follows the link in the current tab unless `target` overrides.",
    sr: "Announced as 'link, {text}'. Surrounding paragraph context is preserved.",
    doList: [
      "Use inside prose where the link sits in a sentence.",
      "Let the visible text describe the destination — 'see the contact page' beats 'click here'.",
    ],
    dontList: [
      "Use as a button — opening a dialog or running a side-effect is a `Button` job.",
      "Style as an icon — wrap an icon link in `IconButton` (with `aria-label`) instead.",
    ],
    whenToUse: [
      "Inline references in body copy.",
      "Footer link rows where a button would read as too heavy.",
    ],
    whenNotToUse: [
      "Primary navigation — use `NavLink`.",
      "Buttons disguised as links — use `Button variant='link'` so the semantic role is honest.",
    ],
  },
  {
    name: "NavLink",
    tier: "atom",
    group: "navigation",
    element: "a",
    description:
      "Navigation anchor primitive used inside `SiteHeader`, `Footer`, and in-page navs. Renders an underlying `next/link` and applies the `aria-current='page'` token when the active route matches.",
    variants: {
      variant: { values: ["default", "muted", "emphasized"], default: "default" },
    },
    a11y: {
      keyboard: [
        "Tab — focusable.",
        "Enter — follows the link.",
      ],
      ariaRequirements: [
        "Sets `aria-current='page'` on the active route so the active nav item is announced.",
        "Renders a real `<a>` (via next/link) for native browser behaviour.",
      ],
      reducedMotion: true,
    },
    tokens: {
      colors: ["--color-text", "--color-link", "--color-link-hover"],
      spacing: [],
      typography: ["--font-size-md"],
    },
    intent:
      "Single primitive for site-level navigation links. Owns active-route detection so consumers do not reimplement the `aria-current` plumbing.",
    keyboard: "Tab in document order; Enter follows.",
    pointer: "Click to follow.",
    sr:
      "Announced as 'link, {text}'. The active item adds 'current page' when `aria-current='page'` resolves.",
    doList: [
      "Use in `SiteHeader`, `Footer`, and breadcrumb-style in-page nav.",
      "Pass the route's canonical href — the active-route match is exact-path.",
    ],
    dontList: [
      "Use inside body prose — that is `TextLink`.",
      "Use as a button — primary actions belong on `Button`.",
    ],
    whenToUse: [
      "Header / footer navigation.",
      "In-page section nav (table of contents).",
    ],
    whenNotToUse: [
      "Inline prose links — use `TextLink`.",
      "External destinations that need a target/rel matrix — use `Link` (the wrapper component) which handles that explicitly.",
    ],
  },
  {
    name: "IconButton",
    tier: "atom",
    group: "actions",
    element: "button",
    description:
      "Icon-only action button. Wraps the underlying shadcn `Button` with a circular shape, enforced `aria-label`, and the design-system size axis.",
    variants: {
      variant: { values: ["default", "ghost", "outline"], default: "ghost" },
      size: { values: ["sm", "md", "lg"], default: "md" },
    },
    a11y: {
      keyboard: [
        "Tab — focusable.",
        "Enter / Space — activates.",
      ],
      ariaRequirements: [
        "`label` prop is required and renders as `aria-label`; the icon glyph itself is `aria-hidden`.",
        "Disabled state forwards `aria-disabled` and removes pointer events; focus remains routable so keyboard users can discover the disabled affordance.",
      ],
      reducedMotion: true,
    },
    tokens: {
      colors: ["--color-text", "--color-surface-elevated"],
      spacing: ["--space-internal-8", "--space-internal-12"],
      radii: ["--radius-full"],
    },
    intent:
      "Stand-alone icon button for compact action surfaces (table rows, card corners, toolbars). Enforces an accessible label so the affordance is not silent to assistive tech.",
    keyboard: "Tab to focus; Enter or Space to activate.",
    pointer: "Click activates the underlying button.",
    sr:
      "Announced as '{label}, button'. The icon is decorative; the label is the announcement.",
    doList: [
      "Pass a real, action-shaped `label` ('Close', 'Edit row', 'Save draft') — not the icon name.",
      "Use the `ghost` variant by default; reserve `default`/`outline` for emphasis.",
    ],
    dontList: [
      "Omit `label` — there is no fallback announcement.",
      "Use for primary marketing CTAs — text + icon is more discoverable; use `Button` with an icon prop.",
    ],
    whenToUse: [
      "Table-row actions (delete, edit, expand).",
      "Modal close buttons, drawer dismiss buttons.",
      "Toolbar buttons where space is at a premium.",
    ],
    whenNotToUse: [
      "Primary form submits or marketing CTAs — use `Button` with text.",
      "Anywhere the affordance is unfamiliar enough that the icon alone could be ambiguous.",
    ],
  },
  {
    name: "Spacer",
    tier: "atom",
    group: "structure",
    element: "div",
    description:
      "Empty layout element that injects a fixed gap on a single axis. Used inside flex/grid containers where adding a token-sized gap as a sibling reads cleaner than the gap utility.",
    variants: {
      size: {
        values: ["xs", "sm", "md", "lg", "xl", "2xl"],
        default: "md",
      },
      axis: { values: ["block", "inline"], default: "block" },
    },
    a11y: {
      keyboard: [],
      ariaRequirements: [
        "Renders as a non-interactive `<div>`; assistive tech ignores it.",
      ],
      reducedMotion: true,
    },
    tokens: {
      colors: [],
      spacing: [
        "--space-layout-4",
        "--space-layout-8",
        "--space-layout-12",
        "--space-layout-16",
        "--space-layout-24",
        "--space-layout-32",
      ],
    },
    intent:
      "Provide a named gap element so reviewers reading JSX see 'a 16-pixel spacer' instead of an empty `<div className='h-4'/>` cargo culted across components.",
    keyboard: "None.",
    pointer: "None.",
    sr: "Silent.",
    doList: [
      "Use inside a `Stack` or vertical layout where the gap is conceptually a deliberate break, not the container's rhythm.",
      "Prefer the layout container's `gap` token over `Spacer` when every sibling is spaced uniformly.",
    ],
    dontList: [
      "Stack two Spacers — collapse them into the larger size.",
      "Use as a 'push' element to right-align content — use flex `margin-inline-start: auto` instead.",
    ],
    whenToUse: [
      "Visually breaking a sequence into groups (e.g. a 'sm' between rows, an 'xl' before a footer).",
      "Adding deliberate whitespace at the top of a hero band.",
    ],
    whenNotToUse: [
      "Sizing the gap between every sibling — `FlexBox gap='md'` is cleaner.",
      "Replacing token-sized margins on a single component — set the margin on the component instead.",
    ],
  },
  {
    name: "GroupLabel",
    tier: "atom",
    group: "form",
    element: "label",
    description:
      "Fieldset/legend-shaped label used by `CheckboxGroup`, `FormGroup`, and other multi-control groupings. Provides the group's accessible name without forcing every child input to repeat it.",
    variants: {},
    a11y: {
      keyboard: [],
      ariaRequirements: [
        "Renders a `<label>` element; pair with a fieldset or use `aria-labelledby` on the group container so the legend becomes the group's accessible name.",
      ],
      reducedMotion: true,
    },
    tokens: {
      colors: ["--color-text"],
      spacing: ["--space-internal-4"],
      typography: ["--font-size-sm"],
    },
    intent:
      "Provide a single, theme-aware label component for grouped form controls so groups have a real group-level name rather than a heading floating in the same column.",
    keyboard: "None.",
    pointer: "Clicking does not focus a specific input — the label belongs to the whole group.",
    sr:
      "Announced as the group's accessible name when the surrounding container uses `role='group'` + `aria-labelledby` or a real fieldset.",
    doList: [
      "Pair with a `<fieldset>` or `role='group'` container.",
      "Keep the text short and noun-shaped — it is read once for the whole group.",
    ],
    dontList: [
      "Use as a label for a single input — that is `Label`.",
      "Style as a heading — screen readers will navigate to it as a heading and miss the group it labels.",
    ],
    whenToUse: [
      "Inside `CheckboxGroup`, `RadioGroup`, or any multi-control form section.",
      "As the legend for a fieldset.",
    ],
    whenNotToUse: [
      "On a single input — use `Label`.",
      "As page or section headings — use `Heading`.",
    ],
  },
  // ---------- Molecules ----------
  {
    name: "FormField",
    tier: "molecule",
    group: "form",
    element: "div",
    description:
      "Wrapper that owns the label + control + helper-text triplet for a single field. Wires `htmlFor`/`id`, `aria-describedby`, and the required-/error-state slots so consumers do not reimplement them per form.",
    variants: {
      orientation: { values: ["vertical", "horizontal"], default: "vertical" },
    },
    a11y: {
      keyboard: [
        "Tab — moves focus to the wrapped control.",
      ],
      ariaRequirements: [
        "Generates a stable id and wires `htmlFor` on the label and `aria-describedby` on the control to the helper-text element.",
        "When `error` is set, the helper text renders inside `role='alert'` so the error announces on submit.",
        "When `required`, the asterisk is decorative; the control owns `aria-required`.",
      ],
      reducedMotion: true,
    },
    tokens: {
      colors: ["--color-text", "--color-text-muted"],
      spacing: ["--space-internal-4", "--space-internal-8"],
      typography: ["--font-size-sm", "--font-size-md"],
    },
    intent:
      "Eliminate the per-form boilerplate of wiring label + helper + error around an input. Owners pass children (the control), label text, and optional helper/error props.",
    keyboard: "Focus reaches the wrapped control. The wrapper is non-focusable.",
    pointer: "Clicking the label focuses the wrapped control.",
    sr:
      "Label is announced first, then the control's own announcement (input type + value), then the helper text via `aria-describedby`. Errors announce via `role='alert'` on submit.",
    doList: [
      "Wrap every field in `FormField` so the label-control-helper triplet is consistent.",
      "Use `error` for submit-time validation feedback; use `helper` for hints.",
    ],
    dontList: [
      "Render a bare `<label>` + `<input>` next to a `FormField` in the same form — the visual rhythm desyncs.",
      "Put two controls inside one `FormField` — wrap each in its own.",
    ],
    whenToUse: [
      "Every form field in `ContactForm`, `NewsletterWaitlist`, and any consumer form.",
    ],
    whenNotToUse: [
      "Multi-control groupings (checkbox set, radio set) — use `FormGroup` + `CheckboxGroup`.",
      "Inputs inside a search bar / toolbar where the label is visually hidden — use `Label` with `VisuallyHidden`.",
    ],
  },
  {
    name: "FormGroup",
    tier: "molecule",
    group: "form",
    element: "fieldset",
    description:
      "Fieldset wrapper for grouped form controls (checkbox set, radio set, named address block). Renders a real `<fieldset>` + `<legend>` so the grouping is announced.",
    variants: {},
    a11y: {
      keyboard: [
        "Tab — moves focus to the first focusable child control.",
      ],
      ariaRequirements: [
        "Renders a real `<fieldset>` element; `legend` becomes the accessible name of the whole group.",
        "Disabled state on the fieldset cascades to all enclosed controls.",
      ],
      reducedMotion: true,
    },
    tokens: {
      colors: ["--color-text", "--color-border-light"],
      spacing: ["--space-internal-8", "--space-internal-12"],
    },
    intent:
      "Provide a real, semantic group container so grouped form controls (checkbox sets, radio sets, address blocks) are announced as one logical group.",
    keyboard: "Focus enters the first child control; subsequent Tab presses move through siblings.",
    pointer: "Clicking the legend does not focus a child — legends are not interactive.",
    sr:
      "Announced as 'group, {legend text}, {n} items' followed by each control's own announcement.",
    doList: [
      "Wrap every multi-control grouping in `FormGroup`.",
      "Use `disabled` on the fieldset to disable a whole step of a multi-step form.",
    ],
    dontList: [
      "Wrap a single input — use `FormField`.",
      "Nest fieldsets more than 2 deep — screen-reader announcements collapse.",
    ],
    whenToUse: [
      "Sets of checkboxes, radios, or related inputs (e.g. 'Shipping address' block).",
      "Multi-step form sections where the whole block can be disabled together.",
    ],
    whenNotToUse: [
      "Single-control fields — use `FormField`.",
      "Visual grouping with no semantic meaning — use a `<div>` with `Stack`.",
    ],
  },
  {
    name: "CheckboxField",
    tier: "molecule",
    group: "form",
    element: "div",
    description:
      "Single checkbox wired to a label and optional helper text. Distinct from `Checkbox` (the unwrapped primitive) — `CheckboxField` is the form-row composition with `Label` + `HelperText` already attached.",
    variants: {},
    a11y: {
      keyboard: [
        "Tab — focuses the checkbox.",
        "Space — toggles the checkbox.",
      ],
      ariaRequirements: [
        "Renders a native `<input type='checkbox'>` linked to the label via `htmlFor` / `id`.",
        "`indeterminate` is set imperatively on mount when the prop is true; the visual matches.",
        "`error` exposes the helper text as `role='alert'` on form submit.",
      ],
      reducedMotion: true,
    },
    tokens: {
      colors: ["--color-text", "--color-border-default", "--color-accent"],
      spacing: ["--space-internal-4", "--space-internal-8"],
    },
    intent:
      "Wrap the `Checkbox` primitive in the label + helper-text layout used across the catalog so consumers do not reimplement the same row 7 times.",
    keyboard: "Tab to focus, Space to toggle. Same as a native checkbox.",
    pointer: "Click the checkbox or the label to toggle.",
    sr:
      "Announced as '{label}, checkbox, {checked|not checked|mixed}'. Helper text is appended via `aria-describedby`.",
    doList: [
      "Use for single boolean fields ('I agree to the terms', 'Subscribe to updates').",
      "Pair with `helper` text to clarify edge cases.",
    ],
    dontList: [
      "Use for a checkbox group — use `CheckboxGroup`.",
      "Use as a toggle for a setting that takes effect immediately — use `Switch`.",
    ],
    whenToUse: [
      "Standalone boolean controls in a form.",
      "Consent checkboxes ('I agree…').",
    ],
    whenNotToUse: [
      "Settings panels with immediate-effect toggles — use `Switch`.",
      "Multi-option selection — use `CheckboxGroup`.",
    ],
  },
  {
    name: "Pagination",
    tier: "molecule",
    group: "navigation",
    element: "nav",
    description:
      "Pagination controls for paged lists (article archive, search results). Renders a `<nav>` landmark with previous/next buttons and a numbered list; supports ellipsis truncation for long page ranges.",
    variants: {
      size: { values: ["sm", "md", "lg"], default: "md" },
    },
    a11y: {
      keyboard: [
        "Tab — moves through the page links and prev/next buttons in document order.",
        "Enter / Space — activates the focused control.",
      ],
      ariaRequirements: [
        "Renders a `<nav>` element with `aria-label='Pagination'` (overridable).",
        "Current page sets `aria-current='page'`.",
        "Previous/next buttons that are unavailable use `aria-disabled='true'` instead of being removed, so the visual structure does not jump.",
      ],
      reducedMotion: true,
    },
    tokens: {
      colors: ["--color-text", "--color-accent", "--color-surface-elevated"],
      spacing: ["--space-internal-4", "--space-internal-8"],
      typography: ["--font-size-sm", "--font-size-md"],
    },
    intent:
      "Render a familiar paged-list navigation surface with the announcements, current-page state, and edge-case behaviour (long ranges, missing pages) handled once.",
    keyboard:
      "Tab through Previous → numbered pages → Next. Enter / Space activates. Arrow keys are intentionally not bound — pagination is rare-use and Tab is the predictable path.",
    pointer: "Click on a page number, previous, or next.",
    sr:
      "The `<nav>` landmark is announced as 'Pagination, navigation'. The current page is announced with 'current page'.",
    doList: [
      "Show 5 to 7 page numbers max; truncate the middle with an ellipsis.",
      "Always include Previous and Next so keyboard users have one-step neighbour navigation.",
    ],
    dontList: [
      "Remove Previous/Next on edges — use `aria-disabled` so the visual stays stable.",
      "Render more than ~10 page numbers inline — switch to a 'Page X of Y' label with prev/next only.",
    ],
    whenToUse: [
      "Paged blog/article archive.",
      "Search-result paging.",
      "Any list that is too long to render in one chunk and where users do reach the end.",
    ],
    whenNotToUse: [
      "Infinite-scroll feeds — there is no last page to point at.",
      "Short lists (< 1 page) — hide the control entirely.",
    ],
  },
  {
    name: "CategoryFilter",
    tier: "molecule",
    group: "navigation",
    element: "nav",
    description:
      "Filter pill row for list pages (blog archive, work index). Multiple visual treatments (pills, underline, minimal) for different surface densities.",
    variants: {
      variant: { values: ["pills", "underline", "minimal"], default: "pills" },
      size: { values: ["sm", "md", "lg"], default: "md" },
    },
    a11y: {
      keyboard: [
        "Tab — moves between filter buttons.",
        "Enter / Space — activates the focused filter.",
      ],
      ariaRequirements: [
        "Renders a `<nav>` landmark with an accessible name describing the filter dimension ('Filter by category').",
        "The active filter sets `aria-pressed='true'` on a toggle button (not `aria-current`) because the filter is a UI control, not a navigation target.",
      ],
      reducedMotion: true,
    },
    tokens: {
      colors: ["--color-text", "--color-accent", "--color-border-default"],
      spacing: ["--space-internal-4", "--space-internal-8"],
      typography: ["--font-size-sm", "--font-size-md"],
    },
    intent:
      "Render the canonical filter-by-category row used on list pages. Owns the active-state announcement and the visual variants so list-page consumers do not reinvent them.",
    keyboard: "Tab between filters; Enter / Space toggles.",
    pointer: "Click a filter to activate.",
    sr:
      "Filter buttons announce as 'toggle button, {label}, pressed' for the active filter and 'not pressed' for the rest.",
    doList: [
      "Use on list pages where filtering is the primary UI affordance.",
      "Keep the filter labels short — they sit in a row.",
    ],
    dontList: [
      "Use as primary navigation — `CategoryFilter` is a UI control, not a nav surface; use `NavLink` for routes.",
      "Stack two filter rows when one composite control would do — readability collapses.",
    ],
    whenToUse: [
      "Blog index, work index, case-study archive.",
      "Any list where one categorical dimension drives the visible set.",
    ],
    whenNotToUse: [
      "Multi-axis filtering (date + category + tag) — use a dedicated `FilterPanel` (not in catalog yet).",
      "Navigation between top-level routes — use `NavLink`.",
    ],
  },
  {
    name: "ExpandableSection",
    tier: "molecule",
    group: "structure",
    element: "section",
    description:
      "Collapsible content region with a trigger header. Lighter than `Accordion` (which manages a group of expandables) — used standalone for a single 'show more' or detail-disclosure section.",
    variants: {
      defaultOpen: { values: ["true", "false"], default: "false" },
    },
    a11y: {
      keyboard: [
        "Tab — focuses the trigger header.",
        "Enter / Space — toggles the section.",
      ],
      ariaRequirements: [
        "Trigger is a `<button>` with `aria-expanded` reflecting the open state.",
        "Trigger sets `aria-controls` to the panel id; the panel uses `role='region'` and `aria-labelledby` pointing at the trigger.",
      ],
      reducedMotion: true,
      motion: true,
    },
    tokens: {
      colors: ["--color-text", "--color-surface-elevated"],
      spacing: ["--space-internal-8", "--space-internal-12"],
    },
    intent:
      "Provide a stand-alone disclosure surface for a single 'show more' affordance, without the multi-panel rhythm of `Accordion`.",
    keyboard: "Tab to trigger; Enter / Space to toggle. Arrow keys are not bound (single-panel).",
    pointer: "Click trigger to toggle.",
    sr:
      "Trigger announces as 'button, {label}, collapsed' / 'expanded'. Panel content is announced when expanded.",
    doList: [
      "Use for a single detail-disclosure block (FAQ row in isolation, optional advanced settings, 'about the author' block on an article).",
      "Default to collapsed unless the content is short and the page expects it open.",
    ],
    dontList: [
      "Use a sequence of `ExpandableSection`s instead of `Accordion` — accordion owns the focus management and single-open behaviour.",
      "Hide critical content (errors, primary CTA) behind a disclosure.",
    ],
    whenToUse: [
      "Optional 'show more' blocks on long pages.",
      "Inline FAQ-style rows on marketing surfaces.",
    ],
    whenNotToUse: [
      "Multiple disclosures in a vertical list — `Accordion` is the right primitive.",
      "Tab-style navigation between content panels — use `Tabs`.",
    ],
  },
  {
    name: "AnimatedDialog",
    tier: "molecule",
    group: "feedback",
    element: "div",
    description:
      "Dialog (modal) variant with GSAP-driven enter/exit animation. Wraps the shadcn `Dialog` primitive and adds the size axis + severity colour token + animation type axis.",
    variants: {
      size: { values: ["sm", "md", "lg", "xl", "full"], default: "md" },
      severity: {
        values: ["default", "success", "warning", "error", "info"],
        default: "default",
      },
      animationType: { values: ["scale", "slide", "fade"], default: "scale" },
    },
    a11y: {
      keyboard: [
        "Tab — cycles through focusable elements inside the dialog.",
        "Shift+Tab — reverse cycle.",
        "Esc — closes the dialog.",
      ],
      ariaRequirements: [
        "Renders a real `role='dialog'` with `aria-modal='true'` (via the shadcn primitive).",
        "Focus moves to the dialog body on open and returns to the trigger on close.",
        "When `severity` is success/warning/error/info, the icon is decorative and the visible text owns the announcement; the dialog itself does not become a live region.",
      ],
      reducedMotion: true,
      motion: true,
    },
    tokens: {
      colors: [
        "--color-text",
        "--color-surface-elevated",
        "--color-accent",
        "--color-warning",
        "--color-error",
        "--color-success",
      ],
      spacing: ["--space-internal-12", "--space-internal-16"],
      radii: ["--radius-md"],
    },
    intent:
      "Stand-alone modal with an animated entrance distinct from `Modal`. Used for moments where the motion itself is the design — confirmations, milestone celebrations, severity-coloured prompts.",
    keyboard: "Tab cycles inside the dialog. Esc dismisses. Focus is trapped until close.",
    pointer: "Click outside or on the close button to dismiss (unless `dismissible=false`).",
    sr:
      "On open: 'dialog, {title}'. On close: focus returns to the trigger. Severity colour is not announced — semantics come from the title text.",
    doList: [
      "Use `severity` for confirmations where the colour is part of the meaning (delete = error, save = success).",
      "Honour `prefers-reduced-motion` — the component already detects it and skips the animation; do not override.",
    ],
    dontList: [
      "Animate every modal — reserve `AnimatedDialog` for moments where the animation reads as deliberate.",
      "Stack two open dialogs — focus management collapses; close the first before opening the second.",
    ],
    whenToUse: [
      "Confirmation prompts with semantic colour (delete, save, archive).",
      "Onboarding milestones, celebration dialogs.",
    ],
    whenNotToUse: [
      "Default modal needs — use `Modal`.",
      "Toast-style transient announcements — use `Toast`.",
    ],
  },
  {
    name: "LocationCard",
    tier: "molecule",
    group: "display",
    element: "article",
    description:
      "Card variant for displaying a single office or service location (address, hours, map link). Visual sibling of `Card` with the location-specific slot order baked in.",
    variants: {
      variant: {
        values: ["default", "bordered", "elevated"],
        default: "default",
      },
    },
    a11y: {
      keyboard: [
        "Tab — focuses the embedded action (map link, contact CTA) in order.",
      ],
      ariaRequirements: [
        "Renders an `<article>` so the whole card is announced as a region.",
        "Address content sits inside a real `<address>` element so screen readers identify it as contact information.",
      ],
      reducedMotion: true,
    },
    tokens: {
      colors: ["--color-text", "--color-text-muted", "--color-surface-elevated"],
      spacing: ["--space-internal-8", "--space-internal-12", "--space-internal-16"],
      radii: ["--radius-md"],
    },
    intent:
      "Single, recognisable layout for the contact / locations grid. Replaces ad-hoc `Card` + `Stack` compositions where each location card drifted in spacing and rhythm.",
    keyboard: "Focus reaches embedded interactive elements (map link, phone link) in document order.",
    pointer: "Hover on the `elevated` variant raises the card. Click follows embedded links.",
    sr:
      "Announced as 'article, {location name}' followed by the contact block as 'address: {street, city}'.",
    doList: [
      "Use on the contact page locations grid.",
      "Keep the slot order: name → address → hours → action. Reviewers expect it.",
    ],
    dontList: [
      "Use as a generic 'card with an icon and label' — that is `Card`.",
      "Stack two `LocationCard`s vertically with no spacing — they need rhythm via `Grid` or `Stack`.",
    ],
    whenToUse: [
      "Locations grid on the contact page.",
      "Service-area card on a services page.",
    ],
    whenNotToUse: [
      "Generic content cards — use `Card`.",
      "Person cards — use `PersonCard`.",
    ],
  },
  {
    name: "ValueCard",
    tier: "molecule",
    group: "display",
    element: "article",
    description:
      "Card variant for values / principles grids — icon + title + short description, with the same three visual treatments as `LocationCard`.",
    variants: {
      variant: {
        values: ["default", "bordered", "elevated"],
        default: "default",
      },
    },
    a11y: {
      keyboard: [],
      ariaRequirements: [
        "Renders an `<article>` so the whole card is announced as a region.",
        "Decorative icons are `aria-hidden`; the title carries the announcement.",
      ],
      reducedMotion: true,
    },
    tokens: {
      colors: ["--color-text", "--color-text-muted", "--color-surface-elevated"],
      spacing: ["--space-internal-8", "--space-internal-12", "--space-internal-16"],
      radii: ["--radius-md"],
    },
    intent:
      "Stable visual for the 'values', 'principles', and 'what we believe' grid layouts. Slot order is icon → title → description so the grid scans visually before reading.",
    keyboard: "None — `ValueCard` is non-interactive.",
    pointer: "Hover on `elevated` raises the card; the card body has no click target.",
    sr: "Announced as 'article, {title}' followed by the body text.",
    doList: [
      "Use in 3 / 4 / 6-column grids on about / values / methodology pages.",
      "Keep titles to ≤ 4 words for a clean grid rhythm.",
    ],
    dontList: [
      "Use for content with a primary CTA — that is `ServiceCard` or `Card`.",
      "Mix `ValueCard` with `Card` in the same grid row — the rhythm desyncs.",
    ],
    whenToUse: [
      "Values / principles grids on about pages.",
      "Methodology / pillars grids on services pages.",
    ],
    whenNotToUse: [
      "Cards with CTAs — use `Card`.",
      "Person / team cards — use `PersonCard`.",
    ],
  },
  {
    name: "Gallery",
    tier: "molecule",
    group: "display",
    element: "div",
    description:
      "Image gallery grid with a click-to-expand lightbox and motion on hover. Used on work-detail and editorial pages where the imagery is the primary content.",
    variants: {
      columns: { values: ["2", "3", "4"], default: "3" },
    },
    a11y: {
      keyboard: [
        "Tab — focuses each gallery item.",
        "Enter / Space — opens the focused image in the lightbox.",
        "Esc — closes the lightbox.",
      ],
      ariaRequirements: [
        "Each gallery item is a button when click-to-expand is enabled, with an accessible name describing the image.",
        "When the lightbox is open, focus is trapped inside it and returns to the source item on close.",
      ],
      reducedMotion: true,
      motion: true,
    },
    tokens: {
      colors: ["--color-text", "--color-surface-elevated"],
      spacing: ["--space-internal-8", "--space-internal-12"],
      radii: ["--radius-md"],
    },
    intent:
      "Show a grid of images that the reader can dwell on or expand. Hover motion is decorative; the lightbox is the primary affordance.",
    keyboard: "Tab between items; Enter / Space opens; Esc closes the lightbox.",
    pointer: "Click an item to open the lightbox; click outside or on close to dismiss.",
    sr:
      "Each item announces as 'button, {alt text}, image'. Lightbox opens as a modal; the source image alt becomes the dialog name.",
    doList: [
      "Use for work-detail / case-study image rows where the image is the content.",
      "Provide real `alt` text on each image; it doubles as the lightbox's accessible name.",
    ],
    dontList: [
      "Use as a navigation surface — gallery items are not links.",
      "Auto-open the lightbox on mount — confine motion to explicit user actions.",
    ],
    whenToUse: [
      "Work-detail pages with multiple supporting images.",
      "Editorial articles with a photo series.",
    ],
    whenNotToUse: [
      "Single hero images — use `next/image` directly inside `AspectRatio`.",
      "Image carousels with auto-advance — out of scope; the gallery is dwell-driven.",
    ],
  },
  {
    name: "TextInput",
    tier: "atom",
    group: "form",
    element: "input",
    description:
      "Single-line text input primitive with optional start/end icon slots, an inline clear button, and an error state. Wraps a native `<input>` so HTML attributes pass through.",
    variants: {
      size: { values: ["sm", "md", "lg"], default: "md" },
    },
    a11y: {
      keyboard: [
        "Tab — focuses the input.",
        "Esc when `clearable` and the input has a value — clears the value (when the clear button is the active element).",
      ],
      ariaRequirements: [
        "Renders a native `<input>`; HTML autocomplete + form-association attributes pass through.",
        "`error` is a visual state — the actual error message lives in the surrounding `FormField`'s helper text.",
        "Clear button has `aria-label='Clear input'` and is hidden when the input is empty.",
      ],
      reducedMotion: true,
    },
    tokens: {
      colors: ["--color-text", "--color-border-default", "--color-accent"],
      spacing: ["--space-internal-8", "--space-internal-12"],
      radii: ["--radius-md"],
      typography: ["--font-size-sm", "--font-size-md", "--font-size-lg"],
    },
    intent:
      "Single-line input atom used inside `FormField`. Owns the focus ring, error border, and icon slots so consumers do not restyle the native `<input>` per form.",
    keyboard: "Standard text input. Clear button (when enabled) is reachable by Tab from the input.",
    pointer: "Click to focus; click the clear button to empty the value.",
    sr:
      "Announces as the surrounding `FormField` instructs (label + input role + current value). The clear button announces as 'Clear input, button'.",
    doList: [
      "Always wrap in `FormField` so the label + helper are wired correctly.",
      "Use `startIcon` for affordance hints (search glyph, currency symbol).",
    ],
    dontList: [
      "Use without a label — the input has no accessible name on its own.",
      "Use for multi-line input — use `TextArea`.",
    ],
    whenToUse: [
      "Every single-line text input on the site (search, email, name, …).",
    ],
    whenNotToUse: [
      "Phone numbers — use `PhoneInput` which owns formatting and validation.",
      "Multi-line text — use `TextArea`.",
    ],
  },
  // ---------- Patterns (judgement-tier; user explicitly asked for all 25) ----------
  {
    name: "Layout",
    tier: "pattern",
    group: "structure",
    element: "div",
    description:
      "Top-level page shell wrapping every Next.js app/* route. Renders the global header, the route's children inside the main landmark, and the global footer. Catalog entry exists so the page structure is documented; the implementation is not parameterised.",
    variants: {},
    a11y: {
      keyboard: [
        "Tab order: header → main → footer (standard document flow).",
      ],
      ariaRequirements: [
        "Provides the page's `<main>` landmark so screen-reader 'skip to main' works.",
        "Header and footer are rendered by their own pattern components (`SiteHeader`, `SiteFooter`).",
      ],
      reducedMotion: true,
    },
    tokens: { colors: [], spacing: [] },
    intent:
      "Document the single page shell every route shares. Captured as a catalog entry so the global structure is discoverable; the component itself has no public API beyond children.",
    keyboard: "Header → main → footer.",
    pointer: "N/A — the shell is not interactive itself; its children are.",
    sr: "Provides the main landmark; header and footer landmarks come from their respective patterns.",
    doList: [
      "Treat as the canonical page wrapper — every route in `app/` uses it.",
      "When changing global structure, update this contract alongside `SiteHeader` / `SiteFooter`.",
    ],
    dontList: [
      "Render `Layout` inside another `Layout` — there is one global shell per page.",
      "Use as a generic 'two-column with sidebar' wrapper — that is what a section pattern would be.",
    ],
    whenToUse: [
      "Every Next.js route — applied via `app/layout.tsx`.",
    ],
    whenNotToUse: [
      "Storybook stories — Storybook has its own decorators.",
      "Sub-layouts inside a single route — those compose with `Section` + `Container` instead.",
    ],
  },
  {
    name: "NextHeader",
    tier: "pattern",
    group: "navigation",
    element: "header",
    description:
      "Concrete Next.js implementation of the site header pattern. Renders the logo, primary nav, theme switcher, and the mobile-menu trigger. Visually documented at the catalog level via `SiteHeader`; this entry exists so the implementation file is also discoverable.",
    variants: {},
    a11y: {
      keyboard: [
        "Tab — moves through the logo, nav links, theme switcher, then to the mobile-menu trigger on narrow viewports.",
        "Enter / Space — activates the focused control.",
      ],
      ariaRequirements: [
        "Renders a real `<header>` landmark with the primary `<nav>` inside.",
        "Active route is marked via `aria-current='page'` on the matching `NavLink`.",
        "Theme switcher exposes the current theme as the button's accessible name.",
      ],
      reducedMotion: true,
    },
    tokens: {
      colors: ["--color-text", "--color-surface-elevated", "--color-accent"],
      spacing: ["--space-internal-12", "--space-internal-16"],
    },
    intent:
      "Render the site-wide header for the Next.js app. Documented as a catalog pattern so the implementation file is reachable from the catalog; the high-level pattern contract lives in `SiteHeader`.",
    keyboard: "Logo → nav links → theme switcher → mobile menu trigger.",
    pointer: "Click any element to follow its action (link / toggle / open menu).",
    sr:
      "Header landmark announces. Nav landmark announces the link count. Theme switcher announces 'Theme, {current}'.",
    doList: [
      "Pair with `NextMobileMenu` — the mobile trigger here opens that menu.",
      "Update this and `SiteHeader` together when changing navigation surface.",
    ],
    dontList: [
      "Render `NextHeader` outside `Layout` — it expects the global shell context (theme provider, router).",
      "Duplicate the header in routes — `Layout` already mounts it once.",
    ],
    whenToUse: [
      "Mounted by `Layout` — should be the only header on the page.",
    ],
    whenNotToUse: [
      "Storybook stories — the pattern story is the right place to demo it.",
      "Apps with their own navigation language (e.g., Sanity studio) — those mount their own shell.",
    ],
  },
  {
    name: "NextMobileMenu",
    tier: "pattern",
    group: "navigation",
    element: "dialog",
    description:
      "Mobile-viewport navigation drawer paired with `NextHeader`. Opens on the header's mobile-menu trigger, traps focus while open, and closes on Esc / outside click.",
    variants: {},
    a11y: {
      keyboard: [
        "Esc — closes the menu, focus returns to the trigger.",
        "Tab — cycles through focusable items inside the menu.",
        "Shift+Tab — reverse cycle.",
      ],
      ariaRequirements: [
        "Renders a `role='dialog'` with `aria-modal='true'` while open.",
        "Focus is trapped inside the drawer until close.",
        "Outside content has `aria-hidden='true'` while the menu is open.",
      ],
      reducedMotion: true,
      motion: true,
    },
    tokens: {
      colors: ["--color-text", "--color-surface-elevated"],
      spacing: ["--space-internal-16", "--space-internal-24"],
    },
    intent:
      "Provide the small-viewport navigation drawer for the Next.js app. Catalog entry exists so the implementation is reachable; the high-level pattern is also documented inside `SiteHeader`.",
    keyboard: "Esc closes; Tab cycles; focus is trapped.",
    pointer: "Click outside the drawer or on the close button to dismiss.",
    sr:
      "On open: 'dialog, navigation'. Each nav item announces as a link. On close: focus returns to the header trigger.",
    doList: [
      "Pair with `NextHeader` — the trigger lives there.",
      "Honour `prefers-reduced-motion` — the slide animation already skips when set.",
    ],
    dontList: [
      "Render outside `Layout` — depends on the theme provider and the header.",
      "Mount multiple instances simultaneously — focus management collapses.",
    ],
    whenToUse: [
      "Paired with `NextHeader` on narrow viewports.",
    ],
    whenNotToUse: [
      "Wide viewports — the desktop nav inside `NextHeader` is sufficient.",
      "Sub-route navigation drawers — those compose with `Modal` / a custom panel.",
    ],
  },
  {
    name: "SkillsGrid",
    tier: "organism",
    group: "display",
    element: "section",
    description:
      "Grid of skill / tech logos arranged in 4 / 6 / 8 columns. Used on the about page and case studies to show capabilities or tooling at a glance.",
    variants: {
      columns: { values: ["4", "6", "8"], default: "6" },
    },
    a11y: {
      keyboard: [],
      ariaRequirements: [
        "Renders a `<section>` with an `aria-labelledby` heading so the grid is a labelled region.",
        "Each logo carries an `alt` text describing the skill or tool; decorative-only logos are `aria-hidden`.",
      ],
      reducedMotion: true,
    },
    tokens: {
      colors: ["--color-text", "--color-text-muted"],
      spacing: ["--space-layout-12", "--space-layout-24"],
    },
    intent:
      "Single, repeatable visual for the 'capabilities' / 'tools we use' grid on marketing pages. Owns the column-count axis so the same data can render as a tight or sparse grid.",
    keyboard: "None — the grid is non-interactive unless logos are linkified by the caller.",
    pointer: "None unless individual logos are wrapped in links by the caller.",
    sr: "Announced as 'region, {grid label}' followed by each logo's alt text.",
    doList: [
      "Use on the about page and capability sections.",
      "Pick a column count that matches the viewport (4 mobile, 6 desktop default).",
    ],
    dontList: [
      "Use for a small set of (≤ 4) capabilities — the grid rhythm collapses; use `Card` instead.",
      "Mix logos and text in the same grid — pick one visual language.",
    ],
    whenToUse: [
      "About / capabilities sections.",
      "Case-study tech-stack sections.",
    ],
    whenNotToUse: [
      "Generic content grids with mixed media — use `Grid` directly.",
      "Logos that are CTAs — wrap each in a `Link` and lay out with `FlexBox`.",
    ],
  },
];

const cliArgs = new Set(process.argv.slice(2));
const FORCE = cliArgs.has("--force");
const DRY = cliArgs.has("--dry-run");

let written = 0;
let skipped = 0;
const componentsBuilt = [];

const isMainModule =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
for (const c of COMPONENTS_DATA) {
  const dir = join(COMPONENTS, c.name);
  if (!existsSync(dir)) {
    console.error(`✗ ${c.name}: directory ${dir} missing — skipping.`);
    skipped++;
    continue;
  }

  const targets = {
    contract: { path: join(dir, `${c.name}.contract.json`), body: buildContract(c) },
    stories: { path: join(dir, `${c.name}.stories.tsx`), body: buildStories(c) },
    mdx: { path: join(dir, `${c.name}.mdx`), body: buildMdx(c) },
    spec: { path: join(dir, `${c.name}.spec.md`), body: buildSpec(c) },
  };

  let touchedThisComponent = false;
  for (const [kind, t] of Object.entries(targets)) {
    if (existsSync(t.path) && !FORCE) {
      console.log(`· ${c.name}.${kind}: exists, skipping`);
      continue;
    }
    if (DRY) {
      console.log(`+ ${c.name}.${kind}: would write ${t.body.length} bytes`);
    } else {
      writeFileSync(t.path, t.body, "utf8");
      console.log(`+ ${c.name}.${kind}: ${t.body.length} bytes`);
    }
    written++;
    touchedThisComponent = true;
  }
  if (touchedThisComponent) componentsBuilt.push(c.name);
}

console.log("");
console.log(`Wrote ${written} files across ${componentsBuilt.length} components.`);
if (skipped) console.log(`Skipped ${skipped} components whose directories were missing.`);
}

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

function buildContract(c) {
  const contract = {
    $schema: "../../../scripts/design-system/contract.schema.json",
    name: c.name,
    tier: c.tier,
    group: c.group,
    status: "alpha",
    description: c.description,
    figma: null,
    radixPrimitive: null,
    element: c.element,
    variants: c.variants ?? {},
    slots: [],
    asChild: false,
    subParts: [],
    requiredStories: ["Default", "Playground"],
    a11y: {
      keyboard: c.a11y?.keyboard ?? [],
      ariaRequirements: c.a11y?.ariaRequirements ?? [],
      reducedMotion: c.a11y?.reducedMotion ?? true,
      reviewed: false,
      forcedColorsVerified: false,
    },
    tokens: {
      colors: c.tokens?.colors ?? [],
      spacing: c.tokens?.spacing ?? [],
      ...(c.tokens?.radii ? { radii: c.tokens.radii } : {}),
      ...(c.tokens?.shadows ? { shadows: c.tokens.shadows } : {}),
      ...(c.tokens?.typography ? { typography: c.tokens.typography } : {}),
    },
    lightDarkVerified: false,
  };

  // Motion axis only when relevant — the schema permits the field but the
  // validator only enforces reducedMotion=true when motion=true at beta+.
  if (c.a11y?.motion) contract.a11y.motion = true;

  return `${JSON.stringify(contract, null, 4)}\n`;
}

function buildStories(c) {
  const titlePrefix = TIER_PREFIX[c.tier] ?? "Components";
  // Build an argTypes block from the variants in the contract so the
  // Storybook Controls panel reflects the documented variant axes — even at
  // alpha. Keeps the stories useful to reviewers and makes promotion to beta
  // a smaller diff later.
  const argTypeEntries = Object.entries(c.variants ?? {});
  const argTypesBody = argTypeEntries
    .map(([axis, def]) => {
      const optionList = def.values
        .map((v) => JSON.stringify(v))
        .join(", ");
      return `    ${axis}: {
      control: "select",
      options: [${optionList}],
      table: { defaultValue: { summary: ${JSON.stringify(def.default)} } },
    },`;
    })
    .join("\n");

  const argsBody = argTypeEntries
    .map(([axis, def]) => `    ${axis}: ${JSON.stringify(def.default)},`)
    .join("\n");

  return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { ${c.name} } from "./${c.name}";
import contract from "./${c.name}.contract.json";

// Alpha-tier story scaffold for ${c.name}. The component lives outside the
// previous catalog (per \`npm run audit:catalog\` on 2026-05-26) and is being
// brought in as part of the Bucket-1 catalog-gap migration documented in
// nextjs-app/shared/foundations/05-Roadmap.mdx. Stories are intentionally
// minimal at alpha — Default + Playground must include required props (not just
// variant axes) or stories fail at runtime. Example compositions are added when
// porting from production (see Roadmap Phase 1).

const meta = {
  title: "${titlePrefix}/${c.name}",
  component: ${c.name},
  tags: ["alpha", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    docs: {
      description: {
        component: contract.description,
      },
    },
  },
${argTypeEntries.length ? `  argTypes: {\n${argTypesBody}\n  },\n` : ""}${
    argTypeEntries.length ? `  args: {\n${argsBody}\n  },\n` : ""
  }} satisfies Meta<typeof ${c.name}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
`;
}

function buildMdx(c) {
  const whenToUse = (c.whenToUse ?? []).map((b) => `- ${b}`).join("\n");
  const whenNotToUse = (c.whenNotToUse ?? []).map((b) => `- ${b}`).join("\n");
  const a11yProse = (c.a11y?.ariaRequirements ?? [])
    .map((b) => `- ${b}`)
    .join("\n");
  const keyboardLine = c.a11y?.keyboard?.length
    ? c.a11y.keyboard.map((k) => `- ${k}`).join("\n")
    : "- None — non-interactive primitive.";

  return `import { Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './${c.name}.stories.tsx';

<Meta of={Stories} />

# ${c.name}

**Status:** alpha · **Tier:** ${c.tier} · **Group:** ${c.group}

${c.intent}

## In use

See the **Default** and **Playground** stories. Example and ForcedColors
stories are added at the alpha → beta promotion (see Roadmap Phase 2).

## How to use

\`\`\`tsx
import { ${c.name} } from '@dt/${c.name}';

<${c.name} />
\`\`\`

## When to use

${whenToUse || "- TODO"}

## When not to use

${whenNotToUse || "- TODO"}

## Accessibility

### Keyboard

${keyboardLine}

### ARIA / semantics

${a11yProse || "- TODO"}

### Reduced motion

${
  c.a11y?.motion
    ? "- Component has visible motion. The implementation honours `prefers-reduced-motion: reduce` by skipping the entrance/exit animation."
    : "- No own motion."
}

## Promotion notes

- Bucket-1 catalog-gap migration. Status is intentionally **alpha** until the
  beta gates land: ForcedColors story, real-browser HC verification,
  light/dark theme verification, a11y review notes, and a Figma node reference.
`;
}

function buildSpec(c) {
  const doList = (c.doList ?? []).map((b) => `- Do: ${b}`).join("\n");
  const dontList = (c.dontList ?? []).map((b) => `- Don't: ${b}`).join("\n");
  const tokenLines = [];
  if (c.tokens?.colors?.length) tokenLines.push(`- Colors: ${c.tokens.colors.join(", ")}`);
  if (c.tokens?.spacing?.length) tokenLines.push(`- Spacing: ${c.tokens.spacing.join(", ")}`);
  if (c.tokens?.radii?.length) tokenLines.push(`- Radii: ${c.tokens.radii.join(", ")}`);
  if (c.tokens?.shadows?.length) tokenLines.push(`- Shadows: ${c.tokens.shadows.join(", ")}`);
  if (c.tokens?.typography?.length)
    tokenLines.push(`- Typography: ${c.tokens.typography.join(", ")}`);
  const tokenBlock = tokenLines.length ? tokenLines.join("\n") : "- No own tokens (inherits from container).";

  return `# ${c.name}

## Intent
${c.intent}

## Interaction contract
- Keyboard: ${c.keyboard || "TODO"}
- Pointer: ${c.pointer || "TODO"}
- Screen readers: ${c.sr || "TODO"}

## Do / don't
${doList || "- Do: TODO"}
${dontList || "- Don't: TODO"}

## Design notes
${tokenBlock}
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
`;
}
