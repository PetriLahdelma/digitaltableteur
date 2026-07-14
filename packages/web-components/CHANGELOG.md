# Changelog

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
