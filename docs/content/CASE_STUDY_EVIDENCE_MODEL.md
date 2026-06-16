# Case Study Evidence Model

Premium case studies should read like decision evidence, not a gallery caption.

Every flagship case study should make these fields explicit:

- Problem: what was broken, unclear, expensive, risky or newly possible.
- Buyer context: who had to trust the work and what mattered to them.
- Role: what Digitaltableteur owned, influenced or delivered.
- Timeline: when and for how long the work happened.
- Team: who else was involved and how responsibility was split.
- Deliverables: concrete artifacts, systems, decisions, components or workflows.
- Constraints: technical, organisational, accessibility, compliance, brand or schedule constraints.
- Outcome: what changed, shipped, improved, scaled or became easier to operate.

Use `npm run content:case-studies:check` to measure current coverage. Use `npm run content:case-studies:check -- --strict` when a page is promoted to flagship status.

Maturity levels:

- Level 0: Visual archive. The page shows work but does not explain why it mattered.
- Level 1: Project record. Problem, role and timeline are clear.
- Level 2: Buyer-ready case. Context, constraints and deliverables are explicit.
- Level 3: Procurement-ready proof. Outcomes, artifacts, team model and constraints are credible enough for a buyer to compare risk.

The site should promote only Level 2 or Level 3 cases in high-intent surfaces.
