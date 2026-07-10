# Changelog

## 0.1.1 - 2026-07-10

- Ships two dark-theme accessibility fixes that landed in the token source after 0.1.0 was cut: `--link-color` now follows the primary accent instead of the info cyan `#71efff` (dark link-color drift, #1051), and dark `--color-muted` moves `#888` → `#949494` for AA contrast on tab/field surfaces and the body background (#1064).
- No token additions or removals; the sibling `@digitaltableteur/tokens` package is unchanged (these two values are CSS-only) and stays at 0.1.0.
- Verified by `check:token-packages` and the registry consumption checks after publish.

## 0.1.0 - 2026-07-08

- Initial restricted npm package for generated Digitaltableteur token CSS.
- Publishes theme-complete token CSS plus theme subpath exports.
- Verified by `check:token-packages` and `check:registry-token-install`.
