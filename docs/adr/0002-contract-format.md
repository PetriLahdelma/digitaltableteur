# ADR 0002: Dual component contracts

## Status
Accepted

## Decision
Each in-scope component ships:
- `<Name>.contract.json` — machine-readable (AJV + `validate:components`)
- `<Name>.spec.md` — human intent (Intent, Interaction, Do/Don't)

Lifecycle: alpha → beta → stable → deprecated. CI enforces beta+ gates.
