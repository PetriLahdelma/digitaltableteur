# Dependency Audit Triage

Use `npm run security:audit:triage` as the local source of truth for audit review.

Merge blockers:

- Critical production-direct vulnerabilities.
- High production-direct vulnerabilities with reachable runtime code.
- Any audit fix that changes a framework, bundler, Sanity, React, Next, or Storybook major without a local build and test pass.

Track separately:

- Development-direct vulnerabilities in visual testing, Storybook, Lighthouse, or build tooling when they do not ship to production runtime.
- Transitive vulnerabilities without a safe fix.
- Vulnerabilities whose only fix is a major upgrade that changes Node, React, Next, Sanity, or Storybook compatibility.

Current posture after the maintenance cleanup:

- Root app and embedded Studio share the Node `>=22.12.0` floor required by Sanity 6.
- Removed dead Vite and duplicate Next app package surfaces from dependency scanning.
- Audit output remains non-zero and should be reviewed by bucket rather than forced blindly.
