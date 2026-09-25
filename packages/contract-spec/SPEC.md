# Design System Contract Specification 1.0

- **Status:** 1.0, published 2026-09-25
- **Editor:** Petri Lahdelma, [Digitaltableteur](https://www.digitaltableteur.com)
- **Schema:** `https://www.digitaltableteur.com/schemas/contract-spec/1.0/contract.schema.json`
- **Reference implementation:** `@digitaltableteur/contract-spec` (`contract-check`)
- **License:** this text CC BY 4.0; schema and code Apache-2.0

## 1. Why this exists

Design systems describe their components in documentation written for people.
Coding agents now read that documentation too, and so do linters, migration
tools and procurement reviews. Three problems follow:

1. **Prose cannot be checked.** "Don't use an icon-only button without a
   label" is advice. Nothing can reject code that ignores it.
2. **Claims cannot be told apart.** "Accessible" proven by a browser on every
   commit and "accessible" asserted once in a review last spring are the same
   sentence on the page.
3. **Nothing expires.** A component changes; its documentation, test results
   and review notes silently stop describing it.

A **contract** is one JSON document per component that fixes all three: the
public API, the usage rules as data a machine can evaluate, and every
accessibility claim labelled with how it is verified, backed by records that
say when and against which commit the verification ran.

The principle is simple: **nothing an agent or a reviewer reads about a
component is hand-asserted without saying so.** A claim is either proven by a
record anyone can re-check, dated by the person who made it, or declared as
a gap.

## 2. Conventions

The key words MUST, MUST NOT, SHOULD, SHOULD NOT and MAY are to be
interpreted as described in RFC 2119 and RFC 8174 when, and only when, they
appear in all capitals.

A **contract** is a JSON document conforming to the schema. A **system** is a
set of contracts published together. A **checker** is software that
evaluates contracts against this specification; `contract-check` is the
reference checker.

## 3. The contract document

A contract MUST be a JSON object that validates against the 1.0 schema. The
schema is normative for structure; this section states intent.

| Field | Required | Meaning |
|---|---|---|
| `specVersion` | yes | Always `"1.0"` for this version. |
| `name` | yes | The name consumers import. Dotted names (`Tabs.Trigger`) address compound parts. |
| `status` | yes | `experimental`, `alpha`, `beta`, `stable` or `deprecated`. |
| `description` | yes | What the component is for, in one or two sentences. |
| `props` | yes | The public props API. May be empty. |
| `package` | no | The package name and the exact import statement to write. |
| `rules` | no | Machine-checkable usage rules (section 4). |
| `accessibility` | no | Accessibility criteria (section 5). Required in practice for Level 2. |
| `governance` | no | Who owns the contract and when a person last read it end to end. |
| `deprecation` | when deprecated | Why, and the migration path. |
| `source` | no | Repository paths of the implementation, for commit-based freshness. |

Fields beginning with `x-` are extensions. Checkers MUST ignore extensions
they do not understand. Any other unknown field is a schema error, so that a
misspelt field fails loudly instead of being silently ignored.

### 3.1 Props

Each prop MUST declare a `type`. A prop whose `type` is `union` MUST list its
allowed literal `values`; a union without values tells an agent nothing it can
check. A prop MAY declare `optional`, `default` and `description`.

A deprecated prop MUST carry a `deprecated` object with a `reason`. To reach
Level 2 it MUST also name a `replacement` (a prop a codemod can target) or a
`removeIn` version (a date a release gate can hold). A deprecation without a
migration path is prose.

### 3.2 Status

`stable` is a promise to consumers. A system's conformance level is computed
over its stable contracts (section 7), so a system cannot claim a level by
keeping its weakest components out of `stable`, and cannot reach one while a
stable component falls short.

## 4. Usage rules

A rule states a condition on one usage of the component and what must or must
not be present when it holds.

```json
{
  "id": "icon-only-needs-name",
  "when": { "icon": { "present": true }, "children": { "absent": true } },
  "requireAnyOf": ["accessibleName", "aria-label"],
  "reason": "An icon-only button has no accessible name.",
  "severity": "error"
}
```

- `when` maps prop names to exactly one matcher: `present`, `absent`,
  `equals` (a literal) or `oneOf` (a list of literals). The rule fires when
  every matcher holds.
- `children` is a pseudo-prop for element children.
- When a rule fires, a checker MUST report each `forbid` prop that is present,
  MUST report `requireAnyOf` when none of its props is present, and MUST
  report each `requireAllOf` prop that is absent.
- `equals` and `oneOf` MUST NOT match a value the checker cannot state as a
  literal (for example an expression it does not evaluate). A rule must never
  fire on something the checker cannot prove.
- `severity` is `error` or `warning`. `evidence` MAY say where the rule comes
  from, for example a runtime warning in the component source.

Rules that cannot be expressed this way stay in documentation. The grammar is
deliberately small: it covers the rules that break builds and accessibility
most often (missing names, mutually exclusive props, props that only make
sense together) and nothing a checker would have to guess about.

## 5. Accessibility criteria

`accessibility.criteria` is a list of statements about the component, each
with a verification mode:

| `verification` | Meaning | Required fields |
|---|---|---|
| `automated` | A machine re-proves it; records are attached. | `check`, `evidence` |
| `manual` | A person checked it on a known date. | `reviewedAt` |
| `unverified` | A declared gap. Not a claim. | none |

- `check` is the command that re-proves an automated criterion.
- `wcag` MAY list the WCAG 2.x success criteria the check exercises. Listing
  a success criterion is not a claim that it is met: automated checks can
  test part of a criterion, never prove conformance on their own.
- Publishers SHOULD list known gaps as `unverified` rather than omit them. An
  absent criterion reads as "not applicable"; an `unverified` one reads as
  what it is.

## 6. Evidence

An evidence reference points at a machine-written record of one run:

```json
{
  "artifact": "evidence/button-default.axe.json",
  "sourceCommit": "4f2a9c1e7b3d5a6c8e0f1a2b3c4d5e6f7a8b9c0d",
  "capturedAt": "2026-09-20T08:30:00.000Z",
  "passed": true,
  "runner": "ci"
}
```

- `artifact` is a path or an `https` URL. Relative paths resolve against the
  **evidence root**, which a checker MUST let the user set and SHOULD default
  to the directory containing the contract.
- `sourceCommit` is the commit the run checked. `capturedAt` is when it ran.
- A checker MUST treat evidence as invalid when: `passed` is not `true`;
  `capturedAt` is older than the freshness window or in the future; a local
  artifact does not exist; or a JSON artifact records a commit
  (`sourceCommit` or `sourceSHA`) or time (`capturedAt` or `generatedAt`)
  that disagrees with the reference. A contract cannot claim a fresher run
  than its record shows.
- The default freshness window is 180 days. A checker MUST let the user
  change it.
- A checker MAY also offer commit-based freshness: when the contract lists
  `source` paths, evidence is stale if any of those paths changed after
  `sourceCommit`. This is the stronger test; time windows are the portable
  floor.

## 7. Conformance levels

A contract meets the highest level whose requirements it and every lower
level satisfy.

| Level | Name | Requirements |
|---|---|---|
| 1 | Described | Validates against the schema. |
| 2 | Checkable | Level 1, plus `governance` with an owner and a review date, at least one accessibility criterion, and every deprecation carries a migration path. |
| 3 | Evidenced | Level 2, plus at least one `automated` criterion; every automated criterion has valid, fresh evidence (section 6); every `manual` criterion was reviewed within the freshness window. |

A **system's level** is the lowest level met by any of its `stable`
contracts. A system with no stable contracts is measured over its
non-deprecated contracts. A checker SHOULD report the distribution of levels
and the count of automated, manual and unverified criteria next to the system
level, because a single number hides where the gaps are.

A publisher claiming conformance SHOULD state the level, the specification
version, the checker and its version, the freshness window, and the date of
the check, for example: "Design System Contract 1.0, Level 3, contract-check
1.0.0, 180-day window, checked 2026-09-25."

## 8. Relationship to other standards

- **W3C Design Tokens (DTCG).** Tokens describe values; contracts describe
  components. A contract MAY reference token names in extensions; this
  specification does not define token formats.
- **WCAG 2.2 and EN 301 549.** Criteria map to WCAG success criteria for
  orientation only (section 5). EN 301 549 v4 adopts WCAG 2.2 and numbers web
  requirements as clause 9 plus the WCAG number, so the mapping carries over.
- **Model Context Protocol.** A design-system MCP server can serve contracts
  and evaluate section 4 rules for an agent before its code is written. This
  specification defines the data; it does not define tools.

## 9. Versioning

This specification follows semantic versioning. A minor version MAY add
optional fields and reporting detail; it MUST NOT make a valid 1.0
contract invalid or lower its level. Anything else is a major version.

## 10. Reference implementation

```bash
npx @digitaltableteur/contract-spec path/to/contracts --level 2
```

The Digitaltableteur design system publishes its own contracts in this format
at `public/contracts/v1/` in its repository and checks them with the same
tool on every push, including the levels it does not yet meet.
