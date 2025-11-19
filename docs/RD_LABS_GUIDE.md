# R&D / Labs Tracking in Linear

## Purpose

Labs tracks discovery work (interesting tools, MCPs, experiments) outside the main delivery backlog. Only move items into Product once they impact the roadmap within ~3–6 months and have an owner.

## Team Setup

- **Team**: `R&D` (`LAB`) – separate lifecycle from Delivery.
- **Workflow statuses**:
  1. `Idea` – newly logged, unfiltered.
  2. `Review` – deciding whether to invest time.
  3. `Experiment` – active hands-on testing.
  4. `Useful` – proven and ready to apply.
  5. `Dead` – archived; no further action.

## Labels

Use two label dimensions:

### Content Type Labels
- `ai-app`
- `browser-extension`
- `mcp`
- `figma-plugin`
- `design-tool`
- `automation`

### Value / Intent Labels
- `R&D` *(primary label on every Labs issue)*
- `Experiment`
- `Adoption-candidate`

Filter examples:
- `R&D` + `mcp` + status `Idea` → MCPs discovered but not reviewed.
- `Experiment` + `design-tool` → active design tool tests.
- `Adoption-candidate` → ready to graduate into delivery.

## Issue Template

Copy/paste (or have automation generate) the following:

```
**Why it’s interesting**
<problem / opportunity>

**What to test**
1. ...
2. ...

**Expected value**
<how this helps DS / automation work>

**Links**
Homepage:
Docs:
Demo:
```

## Graduation Rules

Move an item to the Product team when:
1. It supports core priorities (DS maturity, AI workflows, DX) within 3–6 months.
2. Someone commits to owning the outcome.
3. Scope is defined enough for roadmap planning.

Otherwise keep it in Labs; update status to `Useful` or `Dead` as experiments conclude.
