# Changelog

## 0.1.2 - 2026-07-11

- Disabled-state contrast fix across all four themes (#1099): light `--color-disabled-bg` `#e0e0e0` → `#e8e8e8` and `--color-disabled-bg-light` `#d8d8d8` → `#efefef` (3.0:1 / 3.2:1 with the unchanged `#858585` placeholder); dark `--color-disabled-placeholder` `#555` → `#767676` (3.3:1); high-contrast black `#9e9e9e` on `#313131` (4.9:1, removing the `#7b7b7b` midtone field); high-contrast white moves to `#e8e8e8`/`#efefef` surfaces with `#6b6b6b` text (4.4–4.6:1, replacing near-black fields on the light theme).
- Disabled pairs are now gated in the source repo (`check:contrast`, #1100) at a DS-defined dim-but-legible bar, so these values ratchet.
- Sibling `@digitaltableteur/tokens` bumps to 0.1.1 in the same release (the DTCG color values changed too).

## 0.1.1 - 2026-07-10

- Ships two dark-theme accessibility fixes that landed in the token source after 0.1.0 was cut: `--link-color` now follows the primary accent instead of the info cyan `#71efff` (dark link-color drift, #1051), and dark `--color-muted` moves `#888` → `#949494` for AA contrast on tab/field surfaces and the body background (#1064).
- No token additions or removals; the sibling `@digitaltableteur/tokens` package is unchanged (these two values are CSS-only) and stays at 0.1.0.
- Verified by `check:token-packages` and the registry consumption checks after publish.

## 0.1.0 - 2026-07-08

- Initial restricted npm package for generated Digitaltableteur token CSS.
- Publishes theme-complete token CSS plus theme subpath exports.
- Verified by `check:token-packages` and `check:registry-token-install`.
