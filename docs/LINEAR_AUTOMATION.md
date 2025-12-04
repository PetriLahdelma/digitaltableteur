# Linear Automation & AI Issue Intake

Digitaltableteur includes a comprehensive Linear workflow combining scripted automation, VS Code extension integration, and future MCP server capabilities. This document covers the CLI scripts and automation architecture.

> **💡 For VS Code Extension Integration:** See [LINEAR_VSCODE_INTEGRATION.md](./LINEAR_VSCODE_INTEGRATION.md) for hybrid workflow patterns, keyboard shortcuts, and extension-script integration strategies.

## 1. Architecture Overview

| Concern             | Implementation                                                                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API layer           | `lib/linear/createIssue.ts` — GraphQL client with env validation, label/assignee lookups, and rate-limit handling                                              |
| Smart metadata      | `lib/linear/classify.ts` (domain + auto labels), `lib/linear/componentDetection.ts` (component heuristics), `lib/linear/textImprover.ts` (description rewrite) |
| CLI Triggers        | `scripts/linear/*.ts` executed via `npm run linear:*` commands                                                                                                 |
| VS Code Integration | Official Linear extension (see LINEAR_VSCODE_INTEGRATION.md)                                                                                                   |
| MCP Server          | Planned Linear GraphQL MCP server for AI assistant integration                                                                                                 |
| Documentation       | This file + LINEAR_VSCODE_INTEGRATION.md + LINEAR_LABELS.md                                                                                                    |

Key automation stages:

1. **Q&A intake** — prompt for type, title, description, priority, component, labels, assignee.
2. **Classification** — heuristics decide between `design-system` vs `app` and attach labels (`design-system`, `ds-triage`, `ui-app-bug`, etc.). Uncertain calls require confirmation.
3. **Component detection** — scans `/src/components/**` for referenced component names and proposes labels like `comp:Button`. If multiple matches exist the CLI asks which ones apply.
4. **Text rewrite** — description is reorganized into _Problem / Actual / Expected / Steps / Acceptance Criteria_ plus the reporter’s raw content.
5. **Confirmation & submission** — user must confirm `Confirm issue creation with: title=X priority=Y labels=Z?` before the script calls Linear’s `issueCreate` mutation.

## 2. Environment Setup

Add these keys to `.env.local` (values managed via 1Password/Linear settings):

```dotenv
LINEAR_API_KEY="lin_api_xxx"
LINEAR_TEAM_ID="team_xxx"
LINEAR_PROJECT_ID="proj_xxx"          # optional default project
LINEAR_WEBHOOK_SECRET=""              # reserved for future inbound sync
```

`LINEAR_API_KEY` needs the `read` + `write` scopes (personal API key is sufficient). `LINEAR_TEAM_ID` is required so tickets land inside DT’s team. `LINEAR_PROJECT_ID` is optional—omit it if the automation should not auto-assign a project. `LINEAR_WEBHOOK_SECRET` is included for parity with upcoming webhook listeners.

## 3. CLI Usage

```bash
npm run linear:new
```

Flow:

1. Answer the prompted questions (title capped at 80 chars, description ≥ 3 sentences).
2. Optionally specify labels/assignee; the tool supports either a Linear user ID or email.
3. Review the summary with derived domain + labels; confirm when the prompt repeats `Confirm issue creation...`.
4. On success the script prints the new issue identifier + URL.

The CLI loads `.env.local`, validates config, and exits with helpful errors if anything is missing. Failures returned by Linear (validation, rate limits, missing labels) are surfaced clearly.

### Updating existing issues

Use the companion helper to adjust an issue without leaving the terminal:

```bash
npm run linear:update -- --issue DIG-123 \
  --state "In Review" \
  --add-label "design-system,comp:Button" \
  --remove-label "needs-triage" \
  --comment "PR opened, ready for stakeholder QA."
```

- `--state` accepts any state available to the issue's team (case-insensitive).
- `--add-label` / `--remove-label` accept comma-separated names or repeated flags; labels must already exist in Linear (the script validates them).
- `--comment` posts a new Linear comment alongside the state/label change.

### Automated ticket creation (MCP + GitHub integrated)

Use the smart automation that analyzes your git state and creates appropriately labeled tickets:

```bash
npm run linear:auto "Your task description here"
```

This command will:

1. **Auto-increment issue number** - Finds the latest DIG-XX issue and creates DIG-XX+1
2. **Analyze git diff** - Detects changed files and determines appropriate labels
3. **Detect git status** - Determines initial state:
   - No changes = `Todo`
   - Local changes (staged/unstaged) = `In Progress`
   - Pushed with PR = `Done`
4. **Auto-assign to Petri Lahdelma** - Uses configured assignee email
5. **Link to GitHub PR** - Automatically detects and links PR if pushed
6. **Smart labeling** - Uses component detection and domain classification
7. **Track from start** - Follows git status throughout the lifecycle

**Example workflow:**

```bash
# Start new feature
git checkout -b DT-136-feat-new-component

# Make changes, then create ticket
npm run linear:auto "Add new Button component with accessibility support"
# Creates DIG-15 in "In Progress" state (has local changes)

# Push changes
git push origin DT-136-feat-new-component

# Create PR
gh pr create --title "Feat: New Button component" --body "Implements DIG-15"

# Update ticket with PR link (automatic if using GitHub CLI)
npm run linear:auto --issue=DIG-15 --update
# Updates DIG-15 to "Done" state and links PR
```

**Options:**

- `--update` - Update existing issue instead of creating new one
- `--issue=DIG-XX` - Specify issue to update (required with --update)

The automation script integrates with:

- **Git** - Analyzes branch, diff, and remote status
- **GitHub CLI** - Detects PRs automatically via `gh pr view`
- **Linear API** - Creates and updates issues with proper metadata
- **MCP** - Future: Will integrate with local context for smarter labeling

## 4. Helper Responsibilities

- `lib/linear/createIssue.ts`
  - Validates env keys up front (`validateLinearEnv`).
  - Converts friendly data into GraphQL `IssueCreateInput`.
  - Looks up label IDs and assignee IDs/emails via secondary queries.
  - Surfaces rate limit errors with retry guidance.
- `lib/linear/classify.ts`
  - Keyword heuristics assign domain and record confidence; low-confidence paths ask the user.
  - `deriveLabels` merges manual + auto labels and returns what was added implicitly.
- `lib/linear/componentDetection.ts`
  - Recursively indexes `/src/components/**` directories/files.
  - Matches CamelCase/kebab tokens found in the user’s answers.
  - Produces labels shaped as `comp:<ComponentName>`.
- `lib/linear/textImprover.ts`
  - Splits reporter text into sentences, categorizes them (problem/expected/actual/steps).
  - Generates deterministic acceptance criteria per issue type.
  - Appends the “User’s Raw Input” block to preserve original wording.

## 5. Trigger Expansion & Future Hooks

The CLI is intentionally stateless and modular:

- Wrap `createIssue` + helper exports in a Slack bot, voice interface, or `/linear` dev panel route by calling the same functions.
- `LINEAR_WEBHOOK_SECRET` is reserved so inbound automation can be wired without reshuffling env names.
- Helpers avoid UI dependencies and only rely on Node stdlib.

## 6. Example Interaction

```
→ Starting Linear ticket flow
Issue type (Bug/Enhancement/Task/Research)? Bug
Short title? Home hero CTA renders wrong gradient
Provide description...
Priority (P1-P4)? P2
Page or component? Home hero CTA block
Labels? accessibility, needs-review
Assignee? alex@digitaltableteur.com
...
Confirm issue creation with: title="Home hero CTA renders wrong gradient" priority="P2" labels="accessibility, needs-review, ui-app-bug, comp:HeroCTA"?
✅ Linear issue created:
• Identifier: DT-512
• URL: https://linear.app/digitaltableteur/issue/DT-512
```

This transcript shows the auto-added labels (`ui-app-bug`, `comp:HeroCTA`) alongside user labels and the final confirmation step.

## 7. MCP Server Integration (Planned)

### Linear MCP Server Configuration

Future MCP integration will enable AI assistants (GitHub Copilot, Claude, etc.) to interact with Linear issues via natural language commands.

**Proposed `mcp.json` Configuration:**

```jsonc
{
  "mcpServers": {
    "linear": {
      "type": "http",
      "url": "https://api.linear.app/graphql",
      "headers": {
        "Authorization": "Bearer {{LINEAR_API_KEY}}",
        "Content-Type": "application/json",
      },
      "env": {
        "LINEAR_API_KEY": "<YOUR_LINEAR_API_KEY>",
        "LINEAR_TEAM_ID": "team_xxx",
      },
      "tools": [
        "create_issue",
        "update_issue",
        "list_my_issues",
        "search_issues",
        "add_comment",
        "get_issue_by_id",
        "set_issue_status",
      ],
      "description": "Linear issue management with AI-enhanced labeling",
    },
  },
}
```

### MCP Tool Definitions

**Available MCP Tools:**

| Tool               | Input                                       | Output                       | Example                      |
| ------------------ | ------------------------------------------- | ---------------------------- | ---------------------------- |
| `create_issue`     | `{ title, description, priority, labels? }` | `{ id, identifier, url }`    | AI creates issue from chat   |
| `update_issue`     | `{ id, state?, labels?, comment? }`         | `{ success, updatedFields }` | AI updates status/labels     |
| `list_my_issues`   | `{ state?, limit? }`                        | `Issue[]`                    | AI shows your open issues    |
| `search_issues`    | `{ query, labels?, limit? }`                | `Issue[]`                    | AI finds related issues      |
| `add_comment`      | `{ id, body }`                              | `{ commentId, url }`         | AI adds implementation notes |
| `get_issue_by_id`  | `{ identifier }`                            | `Issue`                      | AI retrieves full details    |
| `set_issue_status` | `{ id, status }`                            | `{ success, previousState }` | AI changes workflow state    |

### AI Assistant Workflow Examples

**Example 1: Natural Language Issue Creation**

```
User in Copilot Chat:
"Create a ticket to add keyboard navigation to the Modal component"

AI with MCP:
1. Calls: create_issue({
     title: "Add keyboard navigation to Modal component",
     description: "Implement accessible keyboard controls...",
     priority: 2,
     labels: ["a11y", "design-system", "comp:Modal"]
   })
2. Receives: { id: "...", identifier: "DIG-44", url: "..." }
3. Responds: "✅ Created DIG-44. Would you like me to create a branch?"
```

**Example 2: Contextual Issue Search**

```
User in Copilot Chat:
"Show me all open accessibility issues related to buttons"

AI with MCP:
1. Calls: search_issues({
     query: "button accessibility",
     labels: ["a11y", "comp:Button"],
     state: "In Progress,Todo"
   })
2. Receives: [DIG-30, DIG-35, DIG-40]
3. Responds: "Found 3 issues: [formatted list with links]"
```

**Example 3: Auto-Update from Code Changes**

```
User in Copilot Chat:
"I just finished implementing the dark mode toggle"

AI with MCP:
1. Analyzes context (branch name: DT-143-feat-dark-mode)
2. Calls: search_issues({ query: "DIG-43" })
3. Calls: update_issue({
     id: "DIG-43",
     state: "Done",
     comment: "Implementation complete per user confirmation"
   })
4. Responds: "✅ Updated DIG-43 to Done. Would you like me to create a PR?"
```

### Integration with Existing Scripts

MCP server will complement (not replace) existing scripts:

| Use Case            | Best Tool                       | Reason                          |
| ------------------- | ------------------------------- | ------------------------------- |
| AI chat requests    | MCP                             | Natural language, context-aware |
| Batch operations    | Scripts                         | Faster, programmable, testable  |
| Manual creation     | VS Code Extension               | Interactive, visual feedback    |
| Git-driven workflow | Scripts (`npm run linear:auto`) | Branch detection, PR linking    |
| Quick updates       | VS Code Extension               | Keyboard shortcuts, status bar  |

### Three-Way Sync Architecture

```
┌─────────────────┐
│  VS Code Ext    │ ← Visual, interactive, status bar
│  (UI Layer)     │
└────────┬────────┘
         │
         ├─── Shared LINEAR_API_KEY ───┐
         │                              │
┌────────▼────────┐           ┌────────▼────────┐
│  CLI Scripts    │           │   MCP Server    │
│  (Automation)   │           │   (AI Layer)    │
└────────┬────────┘           └────────┬────────┘
         │                              │
         └──────────┬───────────────────┘
                    │
         ┌──────────▼──────────┐
         │  Linear GraphQL API │
         └─────────────────────┘
```

**Benefits:**

- Single API key configuration
- Consistent labeling across all tools
- Context issue synced everywhere
- No tool lock-in (use what fits the task)

### Security Considerations

**API Key Management:**

- Store in `.env.local` (gitignored)
- Share same key across tools
- Use `read` + `write` scopes only
- Rotate periodically (see `docs/EMERGENCY_SECRET_ROTATION.md`)

**MCP-Specific Security:**

- Validate AI-generated labels against allowed list
- Require confirmation for destructive operations
- Rate limit MCP tool calls (prevent AI loops)
- Log all MCP mutations for audit trail

### Future Enhancements

- [ ] Implement Linear MCP server
- [ ] Add AI-powered component detection via codebase analysis
- [ ] Auto-link related issues from AI conversation context
- [ ] Generate acceptance criteria from natural language descriptions
- [ ] Integrate with GitHub MCP for cross-tool workflows
- [ ] Voice-triggered issue creation via MCP + Whisper

---

Need updates or want to experiment? Extend the helpers under `lib/linear/*`, keep heuristics deterministic, and refresh this doc with behavioral changes.

**Related Documentation:**

- [LINEAR_VSCODE_INTEGRATION.md](./LINEAR_VSCODE_INTEGRATION.md) - VS Code extension patterns and shortcuts
- [LINEAR_LABELS.md](./LINEAR_LABELS.md) - Available labels and usage guidelines
- [RD_LABS_GUIDE.md](./RD_LABS_GUIDE.md) - R&D team workflow

- Workspace Labels:
  - Content: `ai-app`, `browser-extension`, `mcp`, `figma-plugin`, `design-tool`, `automation`
  - Value: `R&D`, `Experiment`, `Adoption-candidate`
