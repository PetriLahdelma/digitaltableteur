# Branch Naming Guidelines (Digitaltableteur)

We prefix every branch with the Linear ticket identifier (`DT-####`) to keep automation, deploy previews, and release notes consistent.

```
DT-0123-type-short-description
```

## Branch Types & Examples

| Type | Purpose | Example |
| --- | --- | --- |
| `feat/` | New features or enhancements | `DT-1234-feat-nextjs-ssr-migration` |
| `fix/` | Bug or regression fixes | `DT-0456-fix-open-hours-typo` |
| `hotfix/` | Urgent production fix | `DT-0789-hotfix-build-break` |
| `chore/` | Maintenance, refactors, dependency bumps | `DT-0567-chore-update-deps` |
| `release/` | Preparing a tagged release or handoff | `DT-0890-release-q1-drop` |
| `experiment/` | Spikes, R&D work, prototypes | `DT-0678-experiment-ai-demo` |

## Rules of Thumb

- Use lowercase + hyphens; no spaces or underscores.
- Always start with the Linear ticket (e.g., `DT-1234`).
- Keep the description concise but descriptive (`feat-nextjs-ssr`, not `feat-do-stuff`).
- One branch per ticket. If work spans multiple tickets, break it down or coordinate via parent epics.
- For Labs/R&D items, still use the `DT-####` key so automation and documentation stay in sync.
