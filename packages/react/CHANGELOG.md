# Changelog

## 0.1.2 - 2026-07-09

- Publishes the registry-consumption baseline through the GitHub Actions Trusted Publisher path.
- Keeps the public runtime API unchanged from 0.1.1.
- Verifies the app consumes registry packages rather than root workspace links before publishing.
- Verified by `check:package-registry-resolution`, `check:trusted-publisher`, `check:package-release-notes`, `check:package-tarballs`, `check:react-package`, `check:react-public-api`, `check:react-public-surface`, and `check:react-publish-preflight -- --strict`.

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
