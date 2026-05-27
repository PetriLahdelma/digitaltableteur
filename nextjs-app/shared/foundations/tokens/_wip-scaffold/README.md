# Quarantined — not production

These JSON files were scaffolded for DSharp parity planning. **Do not treat as brand truth.**

Known issues vs production `variables.css`:
- `color.accent` (#e85d04) — **does not exist** in production (accents are `--accent-pink`, `--accent-purple`, etc.)
- `color.surface` / `semantic.*` — invented or unresolved references
- `theme.dark.json` bg (#23272a) — production dark uses `--main-body-background-color: #181a1b`
- `space.json` — incomplete subset of `--space-layout-*` / `--space-internal-*`

Delete or replace this folder only after a scripted export from production.
