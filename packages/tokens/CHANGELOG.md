# Changelog

## 0.1.3 - 2026-07-22

- Adds seven semantic tokens from the high-contrast legibility round:
  `code.toolbar.text`, the `color.info.bg`/`color.info.text` pair,
  `color.placeholder.dark` and `color.placeholder.dark.fg`,
  `color.primary.dark`, and `switch.handle.ring.color` — phantom CSS
  variables promoted to real per-theme tokens.
- Increases the generated token catalog from 185 to 192 entries and updates
  the ESM, DTCG, Tailwind, type, and manifest exports together.
- Verified by `check:token-packages`, `check:package-release-notes`, and
  `check:npm-consumer-install`.

## 0.1.2 - 2026-07-15

- Adds the theme-aware `color.switch.track.off` semantic token introduced for
  visibly distinct off-state switch tracks.
- Increases the generated token catalog from 184 to 185 entries and updates the
  ESM, DTCG, Tailwind, type, and manifest exports together.
- Verified by `check:token-packages`, `check:package-release-notes`, and
  `check:npm-consumer-install`.

## 0.1.1 - 2026-07-11

- Disabled-state contrast fix (#1099): `color.disabled.bg` `#e0e0e0` → `#e8e8e8`, `color.disabled.bg.light` `#d8d8d8` → `#efefef` in the DTCG export (theme-level placeholder/surface changes for dark and high-contrast themes ship via `@digitaltableteur/tokens-css@0.1.2`).
- Catches the package up with token-source changes since 0.1.0 (link-color and muted dark-theme values were CSS-only; this release re-syncs `tokens.dtcg.json` and `index.js` generated output).

## 0.1.0 - 2026-07-08

- Initial restricted npm package for generated Digitaltableteur production tokens.
- Publishes ESM, DTCG JSON, Tailwind token exports, and the generated token manifest.
- Verified by `check:token-packages` and `check:registry-token-install`.
