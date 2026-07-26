# Agent-verifiable design-system uplift

## Decision

Digitaltableteur will extend its existing contract-driven Storybook, generated
registries, MCP server, and private packages. It will not create a parallel
documentation system or deploy Storybook publicly as part of this work.

The work has three active tracks:

1. Complete the local Storybook documentation product with intent-aware catalog
   discovery and direct navigation into component docs and playgrounds.
2. Package the existing registry intelligence as a self-contained consumer CLI
   with a typed programmatic API, stable JSON envelopes, stable error codes, and
   a self-describing manifest.
3. Fill only capability gaps confirmed by repository inspection. Do not count
   existing Combobox, MultiCombobox, Menu, CommandPalette, navigation-shell, or
   chat functionality as missing.

Theme packages, application templates, and additional public evidence surfaces
are deliberately deferred.

## Existing foundation

`DtDocsPage` already renders contract-backed component usage, best practices,
anatomy, examples, live Storybook controls, theming tokens, accessibility
requirements, related components, Figma links, and React/Web Component
switching. `ComponentsGallery` already renders live contract-default previews.
The docs-registry MCP already exposes budgeted `search` and full `get` tools.

The documentation track therefore adds discovery rather than replacing the
existing page frame:

- Search over component name, dense description, full description, keywords,
  category, and lifecycle status.
- Category and lifecycle filters.
- Result count, empty state, and reset action.
- Direct links to documentation and the canonical Playground story.
- Pure filtering/ranking functions with unit tests.

The gallery remains generated from the existing Tier 1 catalog and contracts.

## Consumer CLI

Create `@digitaltableteur/cli` under `packages/cli`. It uses Node built-ins only
and bundles snapshots of the existing `docs-registry.json` and
`agent-manifest.json` during its build.

Initial commands:

- `dt search <intent>`
- `dt component <name> [--section ...]`
- `dt example <name> [--story ...]`
- `dt compose <intent>`
- `dt manifest`
- `dt doctor`

All commands support `--json`. Machine responses use discriminated envelopes;
errors use append-only codes. The programmatic API invokes the same functions
as the executable. Human formatting is a presentation layer over those typed
results.

Theme compilation, template injection, codemods, and source ejection are
excluded from the initial package. Adding empty commands would overstate
capability.

## Capability plan

Repository inspection confirms these gaps:

1. `DataTable`: sortable, selectable tabular data with explicit column
   definitions and accessible captions.
2. `TreeView`: application tree semantics and keyboard navigation, distinct
   from the navigation-oriented `SiteTree`.
3. `ResizablePanelGroup`: pointer and keyboard resizing with separator
   semantics.
4. `VirtualList`: windowed rendering for large fixed-height collections.
5. Native date/time field coverage: extend the existing `TextInput` type
   contract rather than create redundant wrappers.

Delivery is incremental. Each new component starts at alpha and receives the
complete component folder, contract, spec, stories, tests, translations where
component-owned text exists, exports, and generated registry entries. Alpha
does not claim beta/stable verification evidence.

## Error handling

- Documentation filtering treats an empty query as “all” and never fails
  rendering because of malformed optional contract fields.
- CLI lookup errors return `ERR_UNKNOWN_COMPONENT` with suggestions.
- Missing bundled data returns `ERR_DATA_UNAVAILABLE` with a build/installation
  remedy.
- Invalid flags or sections return stable argument error codes.
- Capability components prefer native HTML behavior and expose controlled
  callbacks rather than hiding application state.

## Verification

- Storybook block unit tests for search, filtering, empty state, and links.
- CLI unit tests for every command, JSON envelope, manifest drift, and error
  code.
- Component unit and accessibility tests plus Storybook stories.
- `validate:components`, generated-registry rebuild, contract-prop checks,
  typecheck, lint, targeted Vitest suites, Storybook build, and `agent:eval`.

The existing Agent Experience ratchet must be interpreted separately from this
architecture. On the current `DT-promote-kbd` branch it fails because its
baseline predates several new components and API changes: three fractional
coverage/composability regressions, five exceeded component budgets, and six
missing component budgets. That is a current branch baseline-maintenance issue,
not evidence that the Storybook health or private release infrastructure is
missing.
