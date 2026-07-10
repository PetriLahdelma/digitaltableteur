# Component Deprecation Policy

> Status: ACTIVE since 2026-07-10. First application: the generic `Hero`
> pattern (#1043). Sized for a one-person team whose main "other consumers"
> are AI agents and the published `@digitaltableteur/react` package.

## What the big systems do (sources)

- **Carbon**: assets deprecated in one major version remain through the next
  and are removed the one after (deprecated in v9→v10, removed in v11), with
  a public deprecations index page.
- **Primer**: a deprecated component requires deprecation documentation
  naming the alternatives, and a warning shown to consumers using it.
- **Polaris**: legacy components are deprecated and replaced at the next
  major; migration paths are documented at least a month before deprecation.
- **Spectrum Web Components**: JSDoc `@deprecated since x.y.z` + runtime
  dev-mode warnings, deprecation notices in release notes/docs/package.json
  with a migration link; removal at the next major or "2 releases or six
  months, whichever is smaller".

Common thread: mark loudly in every surface a consumer touches, name the
successor, hold a predictable window, remove only at a version boundary,
keep a public record.

## The solo-team adaptation

Multi-team grace periods exist to protect strangers on unknown timelines. We
have no strangers: consumers are this repo (verified mechanically), AI agents
(reading the catalog registries), and hypothetically npm consumers of
`@digitaltableteur/react`. So the policy optimizes for two things instead:
**agents must never be steered toward a deprecated component**, and **the
"why" must survive deletion** — the solo failure mode is future-you (or
future-agent) rebuilding the same thing and re-hitting the same trap.

## Rules

### R1. Eligibility

A component or pattern may be deprecated only when **both** hold:

1. Zero production consumers, verified with
   `computeConsumersForComponent(name)` (barrel re-exports do not count), or
   all consumers are migrated to the successor **in the same or an earlier
   PR**. Never deprecate something still shipped.
2. A successor exists or the capability is intentionally dropped, and
   `deprecatedReason` says which.

### R2. Marking (one PR)

- `contract.status = "deprecated"` and a **required** `deprecatedReason`
  naming successor(s) and any defect/anti-pattern the component carried
  (this is the tombstone text; write it for a reader who can no longer see
  the code).
- Story meta tag flips to `"deprecated"` (sidebar dot + WipBadge render the
  deprecated treatment).
- If the symbol is exported by `@digitaltableteur/react`: add JSDoc
  `/** @deprecated <reason + successor> */` on the export (IDE
  strikethrough) and a CHANGELOG entry in the next publish.
- Enforced by `validate:components`: deprecated status without a
  `deprecatedReason` fails.

### R3. Freeze

From the deprecation PR onward: no feature work, no promotion sweeps, no
snapshot/controls investment. Only fixes that keep the build green. The
component is excluded from `find-component` results by default (agents pass
`--include-deprecated` only when investigating history).

### R4. Removal window

- **Catalog-only (not package-exported)**: removable after **30 days**, or
  immediately if it was zero-consumer at deprecation time and the month has
  no publish planned — whichever comes first in a natural cleanup PR. The
  window is a regret buffer, not a migration period; nobody external is
  waiting.
- **Package-exported**: the export survives at least **one published
  version** carrying the JSDoc `@deprecated` + CHANGELOG notice, and is
  removed in the next version after that (pre-1.0 semver: a minor bump with
  a BREAKING note; post-1.0: a major bump). Carbon's two-major window shrinks
  to one published version because the package has no known external
  consumers yet; revisit if that changes.

### R5. Removal PR checklist

1. Delete the component directory (source, stories, tests, snapshots,
   contract, spec/MDX) and its barrel exports.
2. Sweep translations/assets only it referenced.
3. Move its row in the Deprecation log below from "deprecated" to "removed",
   with the PR link. The `deprecatedReason` text is preserved in the log.
4. Full local gate + `validate:agent-docs`; CHANGELOG entry if packaged.

### R6. Record

Every deprecation and removal is a row in the log below. The log is the
institutional memory that outlives the code.

## Deprecation log

| Component | Tier | Deprecated | Reason (tombstone) | Removable after | Removed |
|---|---|---|---|---|---|
| Hero | pattern | 2026-07-10 (#1043) | Zero production consumers; superseded by HeroSection + the six specialized heroes (HomeHero, ProjectHero, ContactHero, AboutHero, ArticleHero, BlogHero). Carried a nested-interactive defect (raw `<a>` wrapping `<Button>`); successors must use `<Button href>`. | 2026-08-09 | — |
