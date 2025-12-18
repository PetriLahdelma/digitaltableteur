# AI Documentation System - Migration Guide

## Overview

This project has been restructured with a **hierarchical AI documentation system** optimized for both Claude Code and generic AI agents. This guide explains the new structure and how to use it effectively.

---

## What Changed?

### Before (Old Structure)

- Single monolithic `.github/copilot-instructions.md` (983 lines)
- Single `CLAUDE.md` (724 lines, mixed content)
- No directory-specific guidance
- High token usage for agents reading entire files

### After (New Structure)

**Root Level (Universal Rules)**

- `CLAUDE.md` (380 lines) → Comprehensive authority for Claude Code
- `AGENTS.md` (150 lines) → Lightweight quick reference for generic agents
- `.github/copilot-instructions.md` (updated) → GitHub Copilot specific

**Directory Level (Detailed Context)**

- `app/CLAUDE.md` + `app/AGENTS.md` → Next.js patterns
- `shared/components/CLAUDE.md` + `shared/components/AGENTS.md` → Component library rules
- `api-legacy-vercel-functions/AGENTS.md` → Serverless patterns
- `docs/AGENTS.md` → Documentation navigation
- `scripts/AGENTS.md` → Automation scripts

**Claude Code Specific**

- `.claude/settings.json` → Hooks configuration (auto-format, safety checks)
- `.claude/commands/` → Custom slash commands (review, fix-issue, create-component, create-linear-issue)

---

## Why This Structure?

### Problem: Token Inefficiency

Old system required agents to read 700+ line files for every query, wasting tokens on irrelevant context.

### Solution: Hierarchical "Nearest-Wins"

Agents read:

1. **Root file** (universal rules)
2. **Nearest subdirectory file** (specific context)

This provides **exactly the right context** with **minimal token usage**.

---

## File Types Explained

### CLAUDE.md (Claude Code Authority)

**Purpose**: Comprehensive system instructions for Claude Code  
**Size**: 200-400 lines per file  
**Characteristics**:

- Treated as **immutable system rules** (strict priority over user prompts)
- Read hierarchically (up from CWD + discovers subdirectories)
- Front-loads critical context (larger files = better adherence)

**When to Use**: Claude Code reads these automatically based on current working directory

### AGENTS.md (Generic AI Quick Reference)

**Purpose**: Lightweight guide for generic AI agents (ChatGPT, Copilot, etc.)  
**Size**: 100-200 lines per file  
**Characteristics**:

- JIT (Just-In-Time) indexing (provides paths/commands, not full content)
- Minimal duplication
- Quick search patterns

**When to Use**: Generic agents reference these for fast lookups and commands

### .github/copilot-instructions.md (GitHub Copilot)

**Purpose**: GitHub Copilot specific instructions  
**Size**: ~1000 lines (kept as-is for Copilot compatibility)  
**Characteristics**:

- Comprehensive workflow guidance
- Integration patterns
- Project-specific conventions

**When to Use**: GitHub Copilot reads this automatically in VS Code

---

## How to Use the New System

### As a Developer

**No action required!** AI assistants will automatically use the correct files based on context.

### As Claude Code

**Automatic**: Claude Code reads CLAUDE.md files hierarchically:

1. Starts from current working directory
2. Reads up to root
3. Discovers subdirectory files

**Manual**: Reference specific files:

- `/` → Root CLAUDE.md (universal rules)
- `/app` → Next.js patterns
- `/shared/components` → Component library rules

**Custom Commands**: Use slash commands:

- `/review` → Comprehensive code review
- `/fix-issue <number>` → Analyze and fix GitHub issue
- `/create-component <name>` → Generate new component with all required files
- `/create-linear-issue <description>` → Create Linear issue

### As a Generic AI Agent

**Reference AGENTS.md** for quick lookups:

```bash
# Read root for universal rules
cat AGENTS.md

# Read subdirectory for specific context
cat app/AGENTS.md
cat shared/components/AGENTS.md
```

**Use JIT search commands** provided in each AGENTS.md:

```bash
# Find component
rg -n "export.*ComponentName" shared/components/

# Find tests
./check_missing_tests.sh

# Find API routes
find app/api -name "route.ts"
```

### As GitHub Copilot

**Automatic**: Copilot reads `.github/copilot-instructions.md`

**Reference**: Check root AGENTS.md or subdirectory files for quick patterns

---

## Directory Mapping

### Root Documentation

| File                              | Purpose                 | Size      | Audience       |
| --------------------------------- | ----------------------- | --------- | -------------- |
| `CLAUDE.md`                       | Comprehensive authority | 380 lines | Claude Code    |
| `AGENTS.md`                       | Quick reference         | 150 lines | Generic agents |
| `.github/copilot-instructions.md` | Copilot specific        | 983 lines | GitHub Copilot |

### Subdirectory Documentation

| Directory                      | Files                                              | Purpose                                                  |
| ------------------------------ | -------------------------------------------------- | -------------------------------------------------------- |
| `app/`                         | `CLAUDE.md` (380 lines)<br>`AGENTS.md` (120 lines) | Next.js App Router patterns, metadata, server components |
| `shared/components/`           | `CLAUDE.md` (450 lines)<br>`AGENTS.md` (180 lines) | Design system, component library rules, testing          |
| `api-legacy-vercel-functions/` | `AGENTS.md` (120 lines)                            | Serverless function patterns, CORS, env vars             |
| `docs/`                        | `AGENTS.md` (80 lines)                             | Documentation navigation, search commands                |
| `scripts/`                     | `AGENTS.md` (150 lines)                            | Automation patterns (Linear, Sentry, visual regression)  |

---

## Claude Code Hooks System

### Settings (`.claude/settings.json`)

**PreToolUse Hooks:**

- **Edit Detection**: Logs files being edited
- **Safety Check**: Blocks dangerous commands (`rm -rf`, `--force`)

**PostToolUse Hooks:**

- **Auto-Format**: Runs Prettier on `.ts`, `.tsx`, `.js`, `.jsx`, `.css` files after edits

### Custom Commands (`.claude/commands/`)

| Command                | Purpose                          | Usage                              |
| ---------------------- | -------------------------------- | ---------------------------------- |
| `/review`              | Comprehensive code review        | `/review`                          |
| `/fix-issue`           | Analyze and fix GitHub issue     | `/fix-issue 123`                   |
| `/create-component`    | Generate new component (5 files) | `/create-component Button`         |
| `/create-linear-issue` | Create Linear issue              | `/create-linear-issue Implement X` |

---

## Best Practices

### When to Read CLAUDE.md

- **Creating components**: Read `shared/components/CLAUDE.md`
- **Next.js work**: Read `app/CLAUDE.md`
- **API development**: Read `api-legacy-vercel-functions/AGENTS.md`
- **Universal rules**: Read root `CLAUDE.md`

### When to Read AGENTS.md

- **Quick lookups**: Fast access to commands and patterns
- **JIT searches**: Find files, tests, or components quickly
- **Generic agents**: ChatGPT, Copilot, etc. use these for efficiency

### When to Update Documentation

**Update ALL relevant files together:**

1. Make code change
2. Update subdirectory CLAUDE.md/AGENTS.md (if context-specific)
3. Update root CLAUDE.md/AGENTS.md (if universal rule)
4. Update `.github/copilot-instructions.md` (if Copilot-relevant)
5. Update `README.md` (if user-facing)
6. Commit all changes together

**Example Commit:**

```bash
git add CLAUDE.md app/CLAUDE.md shared/components/CLAUDE.md
git add AGENTS.md app/AGENTS.md shared/components/AGENTS.md
git add .github/copilot-instructions.md README.md
git commit -m "docs: update component creation rules across hierarchy"
```

---

## Common Scenarios

### Scenario 1: Creating a New Component

**Claude Code**:

1. Use `/create-component Button`
2. Automatically reads `shared/components/CLAUDE.md`
3. Follows 10-section checklist from `docs/LLM_COMPONENT_GENERATION_RULES.md`
4. Generates 5 files (tsx, css, stories, test, index)
5. Runs post-edit hooks (Prettier auto-format)

**Generic Agent**:

1. Read `shared/components/AGENTS.md`
2. Follow patterns (Button.tsx example)
3. Use JIT search commands to find similar components
4. Manually run quality checks

### Scenario 2: Next.js Route Work

**Claude Code**:

1. Navigate to `app/` directory
2. Automatically reads `app/CLAUDE.md`
3. Follows Next.js patterns (generateMetadata, server components)

**Generic Agent**:

1. Read `app/AGENTS.md`
2. Reference key files (layout.tsx, page.tsx)
3. Use quick search commands for routes

### Scenario 3: Automation Script

**Claude Code**:

1. Navigate to `scripts/` directory
2. Reads `scripts/AGENTS.md` (no CLAUDE.md needed for small scope)
3. Follows Linear or Sentry MCP patterns

**Generic Agent**:

1. Read `scripts/AGENTS.md`
2. Copy patterns from examples
3. Run test commands locally

---

## Troubleshooting

### "I don't see the new documentation"

**Solution**: Pull latest from repository:

```bash
git pull origin main
```

### "Which file should I read?"

**Rule of thumb**:

- **Claude Code**: Reads automatically (CLAUDE.md)
- **Generic Agent**: Read AGENTS.md for quick reference
- **GitHub Copilot**: Reads `.github/copilot-instructions.md` automatically

### "Documentation is out of sync"

**Solution**: Update all relevant files together:

1. Identify affected directories
2. Update CLAUDE.md + AGENTS.md + copilot-instructions.md
3. Commit together with descriptive message

### "Claude Code not following rules"

**Check**:

1. CLAUDE.md exists in current or parent directory
2. File size is substantial (200+ lines for better adherence)
3. Critical rules use **MUST**, **SHOULD**, **MUST NOT** (RFC-2119 language)

---

## Migration Checklist

- [x] Root CLAUDE.md created (380 lines)
- [x] Root AGENTS.md created (150 lines)
- [x] app/CLAUDE.md + AGENTS.md created
- [x] shared/components/CLAUDE.md + AGENTS.md created
- [x] api-legacy-vercel-functions/AGENTS.md created
- [x] docs/AGENTS.md created
- [x] scripts/AGENTS.md created
- [x] .claude/settings.json (hooks) created
- [x] .claude/commands/ (4 commands) created
- [x] .github/copilot-instructions.md updated
- [x] Migration guide created

---

## Next Steps

### For Developers

1. **Read this guide** (you're doing it!)
2. **Try Claude Code commands**: `/review`, `/create-component`
3. **Reference subdirectory docs** when working in specific areas
4. **Keep documentation updated** when making architectural changes

### For AI Assistants

1. **Read CLAUDE.md/AGENTS.md** in current working directory
2. **Use JIT search commands** for efficient lookups
3. **Follow hierarchical patterns**: Root rules → Subdirectory specifics
4. **Reference critical docs**: `docs/LLM_COMPONENT_GENERATION_RULES.md`, `docs/LLM-CRITICAL-REASONING-AND-PLANNING-INSTRUCTIONS.md`

---

## Questions?

**Documentation Issues**: Open an issue with `docs` label  
**Enhancement Requests**: Suggest improvements to CLAUDE.md/AGENTS.md structure  
**Claude Code Support**: See official Claude Code documentation for hooks/commands

---

**Generated**: 2025-11-29  
**Author**: AI Documentation System Migration  
**Version**: 1.0.0
