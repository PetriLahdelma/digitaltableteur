# Changelog

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
