# @digitaltableteur/contract-spec

**Design System Contract 1.0**: an open specification, JSON Schema and
conformance checker for machine-readable design-system component contracts.

A contract is one JSON file per component that says what the component
accepts, which usages are wrong (as rules a machine can evaluate), and which
accessibility claims are proven, by what, at which commit, and when. It is
written for coding agents, linters and reviewers at the same time.

Read the specification: [SPEC.md](./SPEC.md).

## Check a design system

```bash
npx @digitaltableteur/contract-spec path/to/contracts
```

```
  L3  Button (stable)
  L1  Card (stable): 1 finding(s) block L2
        - governance (owner, lastReviewed) is missing

Design System Contract 1.0: 2 contract(s), 2 stable
  levels   L3 1  L2 0  L1 1  none 0
  a11y     3 automated, 1 manual, 1 unverified (declared gaps)
  system   L1 Described (lowest stable contract)
  result   PASS: required L1 Described
```

| Level | Name | Meaning |
|---|---|---|
| 1 | Described | Every contract validates against the schema. |
| 2 | Checkable | Ownership, accessibility criteria and deprecation paths are structured data. |
| 3 | Evidenced | Every automated accessibility claim has a fresh, passing, resolvable record. |

The system level is the lowest level of any `stable` contract: stable is a
promise, so the weakest stable component sets the score.

### Options

| Option | Default | |
|---|---|---|
| `--level <1\|2\|3>` | `1` | Exit 1 unless the system meets this level. Use it as a CI gate. |
| `--max-age-days <n>` | `180` | Freshness window for evidence and manual reviews. |
| `--root <dir>` | contract's directory | Base for relative evidence paths. |
| `--git-freshness` | off | Also treat evidence as stale when the contract's `source` files changed after the evidence commit. |
| `--suffix <s>` | `.contract.json` | Contract file suffix. |
| `--strict-extensions` | off | Also exit 1 when a known draft extension (`x-temporal`, `x-consequence`) has findings. |
| `--test-root <dir>` | cwd | Base for `test` paths in extension claims. |
| `--json` | off | Full report on stdout. |

## Draft extensions: time and consequence

[RFC 0001](./rfcs/0001-temporal-and-consequence.md) proposes two optional
blocks, shipped as `x-` extensions so every 1.0 contract stays valid:

- **`x-temporal`**: what a component does on its own over time (after 10 s
  with no reply, say so), how long a state stays valid (Undo lasts 10 s), and
  what survives an interruption (a failed send keeps the draft).
- **`x-consequence`**: what an action does to the world (`reversible`,
  `irreversible`, `external`, `financial`, `privacy`, `identity`) and the
  confirmation, recovery and authentication that class needs.

Every entry is a claim with a verification mode. An `automated` claim names a
test file, and the checker fails it when the file is missing or no longer
mentions the claim id. Extension findings never change the 1.0 level; use
`--strict-extensions` to gate on them. Schemas: `schema/extensions/`.

## Evaluate usage rules

Rules are data, so any tool can enforce them: a linter, a code-review bot, or
a design-system MCP server checking an agent's code before it is written.

```bash
npx @digitaltableteur/contract-spec rules Button.contract.json '{"icon":"search"}'
```

```js
import { evaluateRules } from "@digitaltableteur/contract-spec";

evaluateRules(contract, { icon: "search" });
// [{ rule: "icon-only-needs-name", kind: "requireAnyOf", severity: "error", ... }]
```

## Use the schema

```json
{
  "$schema": "https://www.digitaltableteur.com/schemas/contract-spec/1.0/contract.schema.json",
  "specVersion": "1.0",
  "name": "Button",
  "status": "stable",
  "description": "Triggers an action. Use a link for navigation.",
  "props": {}
}
```

The schema also ships in the package: `@digitaltableteur/contract-spec/schema`.
A complete Level 3 example is in [`examples/`](./examples).

## Programmatic API

```js
import { checkContract, checkSystem, evaluateRules, findContractFiles } from "@digitaltableteur/contract-spec";

const report = checkSystem(findContractFiles(["./contracts"]), { maxAgeDays: 90 });
report.systemLevel; // 0 to 3
```

## Who uses it

The [Digitaltableteur](https://www.digitaltableteur.com) design system
exports its 182 component contracts in this format and checks them with this
tool on every push. It publishes the levels it does not yet meet, too.

## License

Code, schema, examples: [Apache-2.0](./LICENSE). Specification text:
[CC BY 4.0](./LICENSE-SPEC.md).
