# Changelog

## 0.1.0 - 2026-07-08

- Prepared the first restricted npm package for the Digitaltableteur React design system.
- Exposes the package stylesheet through `@digitaltableteur/react/style.css`.
- Exposes host adapters for link, image, navigation, translation, toast, animation, and cookie-consent runtime integration.
- Exposes `LayerProvider` / `useLayer` and `useOverflow` / `useScrollOverflow` as the adopted utility closure for overlays and scroll affordances.
- Exposes every `stable` component and pattern contract in the public React package surface (`58/58` stable contract exports).
- Freezes the public runtime API in `public-api.manifest.json`.
- Keeps alpha catalog components out of the public package surface.
- Verified by `check:react-package`, `check:react-public-api`, `check:react-public-surface`, `check:npm-consumer-install`, `check:site-package-dogfood`, and `check:react-publish-preflight`.
- Not published yet; publishing remains blocked on the 1.5 i18n review, 1.6 navigation review, and explicit `@digitaltableteur/react` publish clearance.
