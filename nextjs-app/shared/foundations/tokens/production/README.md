# Production DTCG export

Auto-generated from `variables.css` via `npm run build:tokens`. DTCG 2025.10 format
(https://www.designtokens.org/schemas/2025.10/format.json), validated against the vendored schemas in
`scripts/design-system/schemas/`.

- `<category>.json`: base (light) tokens. 163 of 200 catalog tokens; the other 37 have no DTCG 2025.10 form and are listed with a reason under the root `$extensions["com.digitaltableteur"].nonDtcg`.
- `themes/<mode>.json`: per-theme overrides.
- `digitaltableteur.resolver.json`: DTCG Resolver document (sets + theme modifier).

**Not imported at runtime.** Source of truth remains CSS.
