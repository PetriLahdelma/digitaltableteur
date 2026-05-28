# Agentic Design Systems Draft Series

These drafts are intentionally outside `content/posts`, so the current blog
manifest generator will not publish them.

Publishing cadence:

1. 2026-06-03 - Agentic Design Systems Need Operating Models, Not More Components
2. 2026-06-07 - Tools, Harnesses, and Skills: The Missing Model for Design Systems
3. 2026-06-11 - Component Contracts Are Where Taste Becomes Infrastructure
4. 2026-06-15 - The Minimum Viable Agent-Ready Design System
5. 2026-06-19 - From DesignOps to AgentOps

Positioning:

This series extends the argument from:
https://www.petrilahdelma.com/writing/design-systems-for-bots

The goal is to make Digitaltableteur credible for teams that are starting to
use coding agents, UI generators, Figma MCP, Storybook, contract files, and
automated design-system QA, but do not yet have a coherent operating model.

Publishing note:

Drafts with `status: "draft"` stay unpublished. Drafts with
`status: "scheduled"` and a future `publishedAt` are bundled into the app but
hidden until that date.

To schedule one, keep it in `content/drafts`, set `status: "scheduled"`, and
set `publishedAt` to the release time. The blog pipeline includes scheduled
drafts in the build artifact, then runtime filters keep them hidden until their
date. Set `SHOW_UNPUBLISHED_POSTS=true` for generator previews or
`NEXT_PUBLIC_SHOW_UNPUBLISHED_POSTS=true` for local client previews.
