# Changelog

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
