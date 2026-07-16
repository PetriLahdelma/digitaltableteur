# Agent Experience (AX)

Digitaltableteur treats the design system as an API for humans and coding
agents. The AX gate measures whether an agent can select, configure, compose,
and recover from misuse of that API using source-backed evidence.

## What is executable

- Prop descriptions are extracted from TypeScript JSDoc into the generated
  component agent blocks.
- Discriminated-union APIs produce machine-readable `propRelationships`.
  For example, Button declares `href` and `submits` as mutually exclusive and
  declares that `target` requires `href`.
- MCP `validate_component_usage` accepts `{ component, props }` and rejects
  combinations that violate those relationships.
- Golden intent and pattern corpora exercise the same rankers used by MCP.
- Every active component has a no-growth complexity budget for prop count,
  finite-choice state-space bits, and slots.

## Scorecard

`npm run audit:agent-experience` writes
`public/ds-health/agent-experience.json` and checks five dimensions:

| Dimension | Evidence |
| --- | --- |
| API entropy | Raw prop, slot, finite-choice, and relationship counts |
| Promptability | Golden intent retrieval through the production ranker |
| Recoverability | Negative/replacement guidance and executable relationships |
| Composability | Relationship-graph coverage and golden pattern retrieval |
| Contract clarity | Prop docs plus intent, guidance, a11y, examples, and rationale |

There is deliberately no weighted aggregate score. The previous evolution
experiments showed that a model-authored rubric can reward prose without
improving an API. This gate reports observable evidence and compares it with a
checked-in ratchet.

## Complexity changes

The baseline does not claim that the current APIs are ideal. It prevents each
component from becoming more complex without an explicit review. API
reductions pass automatically. An intentional increase requires:

```bash
npm run audit:agent-experience -- --update-baseline
```

Review the baseline diff as an API decision. Do not update it merely to make CI
green.

## Remaining work

The scorecard makes the next improvements concrete: close undocumented prop
debt, add explicit relationships where runtime APIs allow invalid states, and
connect unlinked components to canonical patterns. CSS layers, reverse token
extraction, and hosted change-aware visual review remain separate migrations;
they are not represented as completed by this AX gate.
