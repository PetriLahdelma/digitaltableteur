# Documentation - Quick Reference

## Package Identity

**Purpose**: Critical reference documentation for development  
**Location**: Project root `/docs/`

---

## Key Documents

### Agent instructions

- **`AGENT_WORKFLOW.md`**
  - Three-layer architecture: router → area AGENTS.md → skills
  - How to write and maintain agent context

- **`SKILL_AUTHORING.md`**
  - How to write Claude/Cursor skills: frontmatter, triggers, references/, validation checklist

- **`AGENT_READINESS.md`**
  - isitagentready.com checks, discovery endpoints, re-scan commands

- **`AGENTIC_DS_OPERATING_MODEL.md`**
  - Agent + human workflow for `@dt/*`, MCP, evals, enforcement guardrails

- **`DESIGN_SYSTEM_MCP.md`**
  - Design system MCP tools, resources, local stdio setup

- **`PUBLIC_API.md`**
  - `@dt/*` import policy and verification commands

- **[`../AGENT_INDEX.md`](../AGENT_INDEX.md)**
  - Master index of areas, skills, and deep references

### Writing (blog & long-form)

- **`WRITING_STYLE.md`** (project-local only — tone, banned words, structure for `content/` MDX; not for UI i18n)
  - Read BEFORE drafting or editing articles, case studies, or draft series
  - Cursor rule: `.cursor/rules/writing-style.mdc` auto-applies on `content/**`

### Component Development (CRITICAL)

- **`LLM_COMPONENT_GENERATION_RULES.md`** (12,000+ words, authoritative)
  - 10 sections covering architecture, styling, testing, accessibility, i18n
  - Read BEFORE creating any component

- **`LLM-CRITICAL-REASONING-AND-PLANNING-INSTRUCTIONS.md`**
  - Strategic planning and decision-making guidance

### Architecture & Migration

- **`NEXTJS_MIGRATION_PLAN.md`**
  - Vite → Next.js migration strategy (parallel hybrid approach)
  - Phase-by-phase execution plan
  - Critical gotchas and solutions

- **`NEXTJS_16_UPGRADE_PLAN.md`**
  - Next.js 15.5 → 16 upgrade (**done**, #634): Turbopack, proxy, async APIs
  - Phased checklist, verification matrix, rollback — **historical; production is on 16.2.x**

- **`2026_PRD.md`**
  - Product requirements document
  - Feature roadmap

- **`2026_ROADMAP.txt`**
  - Long-term planning and progress tracking

### MCP Integration

- **`GITHUB_MCP_SETUP.md`**
  - GitHub MCP server configuration
  - Authentication, available capabilities

- **`FIGMA_MCP_SETUP.md`**
  - Figma MCP server setup (3 methods: Remote, Desktop, Developer)
  - Design file access, token generation

- **`SENTRY_MCP_SETUP.md`**
  - Sentry MCP server configuration
  - Error monitoring, Seer AI integration, 16+ tools

- **`VERCEL_MCP_SETUP.md`**
  - Vercel MCP server setup (general + project-specific)
  - Deployment management, build logs, 10+ tools

- **`SANITY_MCP_SETUP.md`**
  - Sanity MCP server configuration
  - Content management, GROQ, semantic search, 40+ tools

- **`DOCKER_MCP_SETUP.md`**
  - Docker MCP server setup (local command-based)
  - Container management, logs, compose, 30+ tools
  - Akaunting-specific examples

- **`CONTEXT7_MCP_SETUP.md`** (Planned)
  - Context7 MCP server configuration
  - Library documentation lookup, 2 tools (resolve-library-id, get-library-docs)
  - External framework/library documentation

- **`STORYBOOK_MCP_ADDON.md`** (Planned)
  - Storybook MCP addon configuration
  - Dev tools (story URLs, UI instructions) + Docs tools (component manifest, documentation)
  - Internal component documentation and visual verification

- **`AKAUNTING_MCP_SETUP.md`**
  - Akaunting MCP server configuration
  - Accounting API tools and workflows

### Automation

- **`LINEAR_AUTOMATION.md`**
  - Issue creation/update patterns
  - API reference

- **`LINEAR_LABELS.md`**
  - Available labels for issue categorization

### Observability

- **`AI_PROCESSING_STATE_COMPONENT.md`**
  - Cognitive processing indicator patterns

- **`BADGE_ENHANCEMENT_IMPLEMENTATION.md`**
  - Badge system architecture

### AI Agent Tools

- **`AGENT_BROWSER_GUIDE.md`** (IMPORTANT)
  - Headless browser automation for AI agents
  - Visual verification during development
  - **Use instead of Playwright for non-testing visual checks**
  - Screenshots, accessibility snapshots, viewport testing

### Infrastructure

- **`CACHE_BUSTING.md`**
  - Deployment cache strategy

- **`EMAILJS_SETUP.md`**
  - Contact form integration guide

- **`STORYBOOK_DEPLOYMENT.md`**
  - Visual regression deployment

- **`BRANCH_NAMING.md`**
  - Git branch conventions

---

## Quick Find Commands

### Search Documentation

```bash
# Find document by topic
rg -n "keyword" docs/

# List all markdown files
find docs -name "*.md"

# Search for specific guidance
rg -n "component creation|testing|accessibility" docs/
```

### Most Referenced Docs

```bash
# Find references to component rules
rg -n "LLM_COMPONENT_GENERATION_RULES" .

# Find migration plan references
rg -n "NEXTJS_MIGRATION_PLAN" .
```

---

## Common Use Cases

### Creating a Component

1. Read `LLM_COMPONENT_GENERATION_RULES.md` (all 10 sections)
2. Read `LLM-CRITICAL-REASONING-AND-PLANNING-INSTRUCTIONS.md`
3. Follow checklist at end of component rules doc

### Visual Verification (AI Agents)

**IMPORTANT:** Use `agent-browser` instead of Playwright for visual checks during development.

```bash
# Quick visual check
npx agent-browser open http://localhost:3000
npx agent-browser screenshot ./check.png

# Mobile viewport
npx agent-browser set device "iPhone 14"
npx agent-browser screenshot ./mobile.png

# Get accessibility tree
npx agent-browser snapshot -i -c
```

See `AGENT_BROWSER_GUIDE.md` for full documentation.

### Migration Work

1. Read `NEXTJS_MIGRATION_PLAN.md`
2. Identify current phase
3. Follow step-by-step instructions

### MCP Setup

1. **GitHub**: Read `GITHUB_MCP_SETUP.md`, set `GITHUB_MCP_PAT`
2. **Figma**: Read `FIGMA_MCP_SETUP.md`, set `FIGMA_TOKEN`
3. Test with `npm run github:mcp:test` or `npm run figma:mcp:test`

### Linear Issue Management

1. Read `LINEAR_AUTOMATION.md` for API patterns
2. Read `LINEAR_LABELS.md` for available labels
3. Use `npx tsx scripts/linear/create-issue.ts`

---

## Documentation Maintenance

When updating development practices:

1. Update relevant doc in `docs/`
2. Update `CLAUDE.md` (root or subdirectory)
3. Update `AGENTS.md` (root or subdirectory)
4. Update `.github/copilot-instructions.md`
5. Update `README.md` if user-facing
6. Commit all changes together

---

**End of docs/AGENTS.md**
