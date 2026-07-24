# Changelog

## 0.10.0 - 2026-07-24

- Adds two native custom elements (fleet 85 -> 87):
  - `dt-slide-button` — pill call-to-action whose icon disc slides across on
    hover while the label shifts and the disc rolls a full turn (all motion
    reduced-motion gated). Attributes: `label`, `href`, `icon`, `icon-side`.
  - `dt-scroll-indicator` — animated hero-footer affordance that scrolls a
    named target into view, with `chevron` / `arrow` / `mouse` icons and CSS
    motion presets (`bounce` / `pulse` / `fade` / `none`) suppressed under
    `prefers-reduced-motion`. Attributes: `label`, `target-id`, `variant`,
    `position`, `motion`, `speed`, `distance`.

## 0.9.0 - 2026-07-22

- BREAKING: renames the `dt-logo` `badge` attribute/property to `background`
  (same lime-circle rendering; the name now says what it does). The shadow
  part follows: `part="badge"` is now `part="background"`. Update any
  `dt-logo[badge]` usage and `::part(badge)` selectors.
- Adds the `src` attribute to `dt-logo`: renders any custom PNG/JPEG/SVG logo
  as an `<img>` letterboxed in the square `size` box (`accessible-title`
  becomes the alt text, `decorative` maps to `alt=""` + `aria-hidden`, empty
  `src` falls back to the built-in Digitaltableteur mark). `animated` and
  `background` remain built-in-mark-only.
- Adds canonical token sizes `sm`/`md`/`lg`/`xl` (2/2.5/3/4rem) to
  `dt-avatar`, matching the React Avatar and AvatarGroup scale; tokens resolve
  to real CSS lengths before reaching `--avatar-size` and the img `sizes`
  attribute. `dt-author` inherits the tokens through its `size` passthrough.
  Raw CSS lengths remain accepted.

## 0.8.0 - 2026-07-16

- Ports the SelectableCard redesign to `dt-selectable-card`: the indicator
  glyph is removed (the whole card is the control, selection = border ring),
  hover excludes the selected state, the card/surface are flex columns with
  vertically centered content, and forced colors use a 3px `Highlight` border
  plus `GrayText` disabled mapping instead of a stripped box-shadow.
- Adds the `xs` (24px) size step to `dt-badge`, matching the React Badge.

- Adds native CodeSnippet, CodeBlockWindow, Breadcrumb, Pagination, Timestamp,
  GroupLabel, MacWindowFrame, and FileUpload elements.
- Extends the framework-neutral surface with copyable code presentation,
  location and paging navigation, semantic time formatting, compound-control
  labels, decorative showcase framing, and form-associated file selection.
- Keeps syntax highlighting, SPA routing, localization copy, and upload
  transport host-owned while preserving applicable React behavior, accessibility,
  token styling, and Storybook parity.
- Uses collision-safe `window-title`/`windowTitle` naming for
  `dt-code-block-window` rather than shadowing the platform `title` tooltip
  property, and bundles only the Prism grammars supported by CodeSnippet.
- Publishes every non-attribute-only prop as a Custom Elements Manifest member,
  with a package guard preventing attributes from pointing at undeclared
  fields.
- Hardens host-data boundaries: code comment removal preserves comment-like
  string literals, file selection enforces extension and MIME `accept` rules,
  GroupLabel maintains its hint IDREF without removing host-owned ARIA tokens,
  MacWindowFrame responds to live language changes, and Timestamp fails closed
  for invalid relative reference times.
- Separates canonical contract maturity from native `implementationStatus`.
  All current native ports are beta until they have native accessibility
  evidence and a documented production consumer; Storybook and the Custom
  Elements Manifest expose both lifecycle values.
- Restores Modal story visibility in docs, corrects stale `title` attribute
  usage, and aligns destructive confirmation chrome with its error-toned
  action.

Verified by `check:web-components:dod`, `check:package-release-notes`,
`check:package-tarballs`, and `check:npm-consumer-install`.

## 0.7.0 - 2026-07-16

- BREAKING: `dt-modal` and `dt-cookie-consent` rename their heading attribute
  from `title` to `dialog-title` (property `dialogTitle`). `title` is the
  global HTML tooltip attribute, so the old name let an ordinary host tooltip
  silently replace the dialog heading, and the `title` property shadowed
  `HTMLElement.prototype.title`. Migrate by renaming the attribute/property;
  the React `Modal` component's `title` prop is unchanged (the React adapter
  maps it to `dialog-title` automatically).
- `dt-nav-menu-list` (uncontrolled mode) now keeps its active highlight in
  sync during SPA navigation: a host-cancelled `navigate` event moves the
  highlight optimistically to the clicked item, and the element subscribes to
  the Navigation API `currententrychange` event where available (falling back
  to `popstate` elsewhere). The controlled `current-path` attribute remains
  authoritative and is unchanged.

## 0.6.0 - 2026-07-16

- Adds native CommandPalette, NavMenuList, LanguageSwitcher, Toast, ToastStack,
  PhoneInput, Combobox, MultiCombobox, and CookieConsent elements.
- Extends the framework-neutral surface with composite navigation, transient
  feedback, internationalized input, searchable selection, and consent flows
  while keeping application routing, persistence policy, and analytics
  host-owned.
- Mirrors applicable canonical React stories and publishes typed item/value
  properties, composed events, form participation, and accessible keyboard
  behavior for plain-JavaScript consumers.

Verified by `check:web-components:dod`, `check:package-release-notes`,
`check:package-tarballs`, and `check:npm-consumer-install`.

## 0.5.0 - 2026-07-16

- Adds native Modal, Tooltip, Menu, SplitButton, Tabs, SegmentedControl,
  Accordion, and ExpandableSection elements.
- Covers controlled and uncontrolled state, composed change/request events,
  focus restoration and containment, roving keyboard navigation, disabled-item
  handling, and declarative or property-based item data.
- Expands the native Storybook catalog to mirror the canonical React stories,
  including controlled, severity, placement, variant, keyboard, and
  forced-colors scenarios.

Verified by `check:web-components:dod`, `check:package-release-notes`,
`check:package-tarballs`, and `check:npm-consumer-install`.

## 0.4.0 - 2026-07-15

- Adds native Avatar, AvatarGroup, Display, FlexBox, Grid, Kbd, Skeleton, and
  VisuallyHidden elements with responsive layout, semantic, motion, and
  accessibility parity.
- Adds native Label, HelperText, FormField, Radio, RadioGroup, CheckboxGroup,
  Select, and SelectOption elements with form participation, validation
  semantics, declarative options, and canonical Storybook parity.
- Adds native, form-associated TextInput, TextArea, and Checkbox elements plus
  an immediate-action Switch.
- Adds an enforceable web-component definition-of-done gate covering React
  story parity, explicit exclusions, browser behavior, docs links, package
  integrity, and generated contract drift.
- Expands applicable native stories to match their canonical React component
  surfaces.
- Hardens reconnect, focus, form-value, disabled-option, and Shadow DOM ARIA
  behavior across the native form, navigation, content, and layout elements.
- Adds framework-independent EN/FI/SV fallback copy with host overrides for
  built-in validation, clear-control, required-marker, and external-link text.
- Renders all four required stories per native component in the browser DoD,
  rather than validating only each component's default story.

Verified by `check:web-components:dod`, `check:package-release-notes`,
`check:package-tarballs`, and `check:npm-consumer-install`.

## 0.3.0 - 2026-07-15

- Adds native Link, NavLink, SkipLink, IconButton, FilterChip, ButtonGroup, and
  EmptyState elements.
- Keeps routing host-owned through the native-only `current-path` NavLink
  attribute and preserves boundary-safe active matching.
- Adds controlled pressed-state, attached-group, secure URL, slot composition,
  and current-page accessibility conformance coverage.
- Generates the native icon catalog from official raw Phosphor SVG assets
  without invoking React or React DOM.

## 0.2.0 - 2026-07-14

- Makes the default registry fully native and synchronous, without a React
  runtime dependency.
- Adds native Button, Badge, StatusDot, Divider, Icon, and AlertBanner elements
  alongside the existing Spinner and Progress elements.
- Adds framework-neutral slots, events, form behavior, and accessibility
  semantics for the new native fleet.
- Keeps the original React adapters behind explicit `/react` compatibility
  entrypoints with optional peer dependencies.
- Expands the generated Custom Elements Manifest and native conformance suite.

## 0.1.0

- Adds generated React adapters for Button, Badge, Spinner, and Progress.
- Graduates Spinner and Progress to native Shadow DOM custom elements.
- Adds hybrid, native-only, and React-only registration entrypoints.
- Publishes a generated Custom Elements Manifest and migration metadata.

Verified by `npm run check:web-components`.
