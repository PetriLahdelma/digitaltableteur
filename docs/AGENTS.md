# Documentation - Quick Reference

## Package Identity

**Purpose**: Critical reference documentation for development  
**Location**: Project root `/docs/`

---

## Key Documents

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
  - Figma MCP server setup
  - Design file access, token generation

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
