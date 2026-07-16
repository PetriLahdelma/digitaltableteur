# Changelog

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
