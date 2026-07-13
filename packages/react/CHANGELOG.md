# Changelog

## 0.1.14 - 2026-07-14

- Adds the `useStreamingText(targetText, isStreaming, options)` hook (runtime public API 115 → 116): smooths bursty accumulated stream text into an adaptive, grapheme-safe reveal. `natural`/`fast`/`instant` speeds, reduced-motion bypass, completion snap when streaming ends, and clean reset when the accumulated target is replaced. RAF loop polls a ref for the latest target so new chunks are absorbed without re-subscribing. Exports `StreamingTextSpeed` and `UseStreamingTextOptions` types (#1191).
- Pass the complete accumulated string on every update, not individual chunks; the hook controls display cadence only. Donny applies it to the currently streaming assistant reply, with the message log `aria-busy` during streaming so assistive tech does not announce partial chunks.
- Verified by the full local gate (typecheck, lint, 2320 tests, build) plus check:react-package, check:react-public-api (116 exports), check:react-public-surface (0 alpha), and check:generated.

## 0.1.13 - 2026-07-13

- `Link` now classifies protocol-relative cross-origin URLs (`//host/path`) as external: they receive the external indicator and `rel="noopener noreferrer"` instead of being mistaken for internal paths. Previously any href starting with `/` — including protocol-relative `//` — short-circuited as internal, so cross-origin `//evil.example/path` rendered without the external safeguards. Protocol-relative same-origin links stay internal; `mailto:`/`tel:` and disallowed protocols (neutralized to `#`) are unchanged; SSR (no `window`) still treats all http(s) absolutes as external. The two normalize + classify passes are consolidated into a single `analyzeHref` (#1187).
- Runtime public API unchanged (115 exports); no contract change (public `LinkProps` is identical).
- Verified by the full local gate (typecheck, lint, 2306 tests, build) plus check:react-package, check:react-public-api, check:react-public-surface (0 alpha), and the publish preflight (i18n/navigation matrix 27/27, site package dogfood 27/27).

## 0.1.12 - 2026-07-13

- `Grid` becomes the master responsive grid: additive per-breakpoint props `tabletColumns`/`desktopColumns`/`wideColumns`/`ultraColumns` and `tabletGap`/`desktopGap`/`wideGap`/`ultraGap` resolve at the token breakpoints (768/1024/1440/1920px) via CSS custom properties and module media queries, each falling back through the previous rung (#1141, #1143). Numeric responsive counts render as `repeat(n, minmax(0, 1fr))` so cells can shrink below content width. Without responsive props the legacy scalar path renders byte-identical to 0.1.11, so existing consumers are unaffected.
- Adds the `GridItemProps` type export and registers `GridItem` as a contract subpart; contract and spec guidance rewritten around the responsive vs legacy-scalar contracts (#1160). Runtime public API unchanged (115 exports).
- Executable PostCSS coverage locks all four responsive media-query rungs and the sparse column/gap fallback chains (#1160).
- Verified by the full local gate (typecheck, lint, 2291 tests, build) plus check:react-package, check:react-public-api, and check:react-public-surface (0 alpha).

## 0.1.11 - 2026-07-13

- Re-establishes the pattern rung: `PageLayout` and `ProcessBlock` are the first composite patterns exported from the package (runtime public API 113 → 115, both stable contracts, zero-alpha surface ceiling holds). ProcessBlock's own imports move off the published barrel onto package-internal source per the same-module-instance rule.
- Type-only export alignment accumulated since 0.1.10: `TextProps`, `LinkProps`, `ListProps`, `GridProps`, `FlexBoxProps`, `CodeBlockWindowProps`, `GroupLabelProps` now ship in the d.ts.
- Accessibility regression coverage added across Divider (semantic `aria-orientation`), ImagePlaceholder (decorative icon hidden), CodeBlockWindow (copy feedback as `role=status` live region), Select (merged `aria-describedby` with external ids), MarkdownMessage (fallback announcement), and ChatWidget dialog modality (DS-internal).
- Verified by the full local gate (typecheck, lint, 2295 tests, build) plus check:react-package, check:react-public-api, check:react-public-surface (0 alpha), and check:astryx-roadmap (no next/* imports in package source).

## 0.1.10 - 2026-07-12

- `NavLink`: the active same-path current-page indicator (rendered as `<span aria-current="page">` since 0.1.9) now uses `cursor: default` instead of the browser's text/I-beam default over its label. It is a non-interactive location marker, so the arrow cursor is correct — not `pointer` (nothing to follow) or `not-allowed` (which would overstate a current location as a blocked action). The real `<a>` (inactive/other links) keeps its native pointer. No API change; runtime public API unchanged (113 exports).
- Verified by the full local gate (typecheck, lint, 2292 tests, build) plus check:react-package, check:react-public-api, and check:react-public-surface (0 alpha).

## 0.1.9 - 2026-07-12

- Fixes the `CodeSnippet` expand control's `aria-controls`: it previously read `codeRef.current?.id`, which is `undefined` on first render (the ref is not attached yet) and empty thereafter (the `<code>` had no `id`), so the "Show more"/"Show less" toggle referenced nothing. The `<code>` element now carries a stable `useId()`-based `id` and the control points at it (SSR/hydration-safe). Regression-tested.
- `NavLink` now suppresses redundant navigation when an already-active link points at the current path: an unmodified primary-button click on a same-path `exact`/active link calls `preventDefault()`. Prefix-active links to a parent route, modified clicks (cmd/ctrl/shift/alt), non-primary buttons, and `target` other than `_self` still navigate normally. Regression-tested.
- Adds the `MacWindowFrameProps` type export. Runtime public API unchanged (113 exports).
- Interaction/ARIA test coverage added around Combobox, MultiCombobox, CommandPalette, CodeSnippet, and DonnyAvatar proximity callbacks (no API change).
- Verified by the full local gate (typecheck, lint, 2290 tests, build) plus check:react-package, check:react-public-api, and check:react-public-surface (0 alpha).

## 0.1.8 - 2026-07-12

- Batch publish of the alpha-wave promotions merged since 0.1.7. Seven new runtime exports enter the package surface: `CommandPalette`, `FilterChip`, `SegmentedControl`, `SelectableCard`, `SelectableCardGroup`, `SplitButton`, `ToastStack` (with their prop types). Runtime public API now lists 113 exports (was 106).
- Type-only export alignment across the curated surface: `Avatar` (incl. `AvatarMenuItem`/`AvatarSize`), `AvatarGroup`, `Badge` (`BadgeSize`/`BadgeTone`/`BadgeVariant`), `Card` (`CardProps`/`CardVariant`/`CardPadding`/`CardTitleProps`/`CardDescriptionProps`), `Checkbox`, `Gallery`, `HelperText` (adds `HelperTextState`), `Icon`, `Kbd` (`KbdSize`), `Label`, `Switch`, `Title`, and `Button` (`ButtonSize`/`ButtonTone`/`ButtonVariant`). Mixed `export { X, type Y }` statements split into separate `export type { … }` blocks so the public-surface guard classifies them correctly. No runtime behavior change from these.
- `ArticleLayout` is intentionally not exported in this release: it is `status: alpha` and the public surface enforces a zero-alpha ceiling. It returns at beta once its full promotion surface (stories, verified forced-colors/light-dark, a11y review, docs) lands.
- Verified by the full local gate (typecheck, lint, 2284 tests, build) plus check:react-package, check:react-public-api, and check:react-public-surface (0 alpha).

## 0.1.7 - 2026-07-11

- Forms semantics unification (#1094, owner ruling): `helperText` is always-on across all field components — TextInput, TextArea, Select, PhoneInput, Combobox, MultiCombobox, Checkbox, Switch, FileUpload now render `error` above the helper instead of replacing it, with `aria-describedby` referencing both ids. Consecutive HelperText lines stack 4px apart as one block.
- Disabled styling unification (#1096): one recipe on every text-value control — `--color-disabled-bg-light` surface, `--color-primary-disabled` border, `--color-disabled-placeholder` value/placeholder/chip text, dimmed label, `cursor: not-allowed`. PhoneInput previously shipped no disabled styling; Select's label never dimmed. Pair with `@digitaltableteur/tokens-css@0.1.2` for the legible disabled greys (#1099).
- Combobox/MultiCombobox no longer emit a dangling `aria-describedby` IDREF when `error` is set alongside `helperText` (#1093).
- Type-only export alignment (#1093, #1095, #1097): prop types for CheckboxGroup, FileUpload, PhoneInput, TextInput, Button (incl. AsButton/AsLink/Surface), ButtonGroup, Menu (6 types), Modal, Toast, Accordion, Tooltip, Breadcrumb, NavMenuList, SocialShare. Runtime public API unchanged: 106 exports.
- Verified by the full local gate plus check:react-package and check:react-public-api.

## 0.1.6 - 2026-07-10

- Exports `CodeSnippet` (stable since #1067) with its prop types; public-api manifest now lists 106 exports.
- Fixes a hydration mismatch in `CodeBlockWindow` when its children cross a server→client component boundary (#1074): React Flight delivers such children as lazy nodes during hydration, which fail `React.isValidElement`, so the component skipped its `pre`/`code` class enhancement and disabled the copy button on the client only. Fulfilled lazy nodes are now unwrapped before any children introspection; unresolved nodes degrade identically on server and client. Reproduced and verified in-browser plus a unit regression with a synthetic Flight-lazy child.
- No other public runtime API changes from 0.1.5.
- Verified by the full local gate plus `check:react-package` and `check:react-public-api`.

## 0.1.5 - 2026-07-10

- TextInput gains three additive props (#1054): `clearable` renders a labelled ×-button inside the field chrome while the field has a value (never while disabled); activating it empties the field, clears built-in validation errors, fires `onValueChange("")` then `onClear()`, and returns focus to the input. `hideLabel` visually hides the label while keeping it in the accessibility tree (sr-only). The clear button's accessible name interpolates the field label via the new `inputClearField` i18n key (EN/FI/SV).
- Non-clearable usage keeps the exact previous DOM (no wrapper element is added unless `clearable` is set); no breaking changes, public runtime API otherwise unchanged from 0.1.4.
- Verified by the full stable-change evidence bundle: contract + required story with play, unit tests incl. jest-axe and focus behavior, 4-mode accessibility-tree snapshots, controls audit (10/10 operable, 0 inert), forced-colors treatment, and real-browser verification (consumed by EmailSignatureGenerator in #1055).

## 0.1.4 - 2026-07-09

- Stops shipping a publish-time snapshot of the design-token sheet inside `dist/style.css`: Title, Text, Link, and List no longer side-effect-import `variables.css`, so tokens ship once, via `@digitaltableteur/tokens-css/tokens.css` as the install docs already instruct. Consumers who skipped `tokens-css` and relied on the embedded snapshot must add it now.
- Adds a `check:react-package` tripwire: any non-vendor `:root` custom-property definitions in `dist/style.css` fail the package check, so the snapshot cannot creep back.
- style.css 108.9 kB → 94.3 kB; public runtime API unchanged from 0.1.3.
- Verified by `check:react-package`, `check:react-public-api`, and the full local gate.

## 0.1.3 - 2026-07-09

- Stops the package from bundling a stale copy of itself: shared source no longer imports `@digitaltableteur/react` internally (NavLink, NavMenuList, PseoLeafPage now use local modules), which had compounded tarball growth each publish and tripped the 3.5 MB ceiling.
- Externalizes `framer-motion` (new peer dependency, `>=12.0.0`) and the declared runtime dependencies (`@phosphor-icons/react`, `class-variance-authority`, `clsx`, `react-phone-number-input`) instead of inlining them, so consumers get single module instances and the dependency map is honest.
- Removes the unused `zod` dependency.
- Keeps the public runtime API unchanged from 0.1.1/0.1.2.
- Verified by `check:react-package`, `check:package-tarballs`, `check:react-public-api`, `check:react-public-surface`, `check:npm-consumer-install`, and the full local gate.

## 0.1.2 - 2026-07-09

- Prepares the React package for publication through the GitHub Actions Trusted Publisher path.
- Keeps the public runtime API unchanged from 0.1.1.
- Adds workflow diagnostics for npm OIDC token exchange failures before the real publish step.
- Hardens npm pack parsing for current npm JSON output shapes.
- Verified by `check:trusted-publisher`, `check:package-release-notes`, `check:package-tarballs`, `check:react-package`, `check:react-public-api`, `check:react-public-surface`, and `check:react-publish-preflight -- --strict`.

## 0.1.1 - 2026-07-08

- Adds the package README used by the private npm package page.
- Keeps the public runtime API unchanged from 0.1.0.
- Tightens package metadata and tarball checks so future React publishes require README evidence.
- Verified by `check:package-release-notes`, `check:package-tarballs`, `check:react-package`, `check:react-public-api`, `check:react-public-surface`, and `check:react-publish-ready`.

## 0.1.0 - 2026-07-08

- Published the first restricted npm package for the Digitaltableteur React design system.
- Exposes the package stylesheet through `@digitaltableteur/react/style.css`.
- Exposes host adapters for link, image, navigation, translation, toast, animation, and cookie-consent runtime integration.
- Exposes `LayerProvider` / `useLayer` and `useOverflow` / `useScrollOverflow` as the adopted utility closure for overlays and scroll affordances.
- Exposes every `stable` component and pattern contract in the public React package surface (`58/58` stable contract exports).
- Freezes the public runtime API in `public-api.manifest.json`.
- Keeps alpha catalog components out of the public package surface.
- Verified by `check:react-package`, `check:react-public-api`, `check:react-public-surface`, `check:npm-consumer-install`, `check:site-package-dogfood`, and `check:react-publish-preflight`.
