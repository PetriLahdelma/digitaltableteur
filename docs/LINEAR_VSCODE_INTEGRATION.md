# Linear VS Code Extension Integration Guide

**Last Updated:** December 3, 2025

This guide explains how to integrate the official Linear VS Code extension with Digitaltableteur's existing Linear automation scripts and MCP tooling for a seamless issue management workflow.

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Extension Commands](#extension-commands)
3. [Hybrid Workflow Patterns](#hybrid-workflow-patterns)
4. [Script Integration Strategies](#script-integration-strategies)
5. [MCP Server Integration (Future)](#mcp-server-integration-future)
6. [Keyboard Shortcuts & Productivity](#keyboard-shortcuts--productivity)
7. [Troubleshooting](#troubleshooting)

---

## Installation & Setup

### Prerequisites

- Linear API key with `read` + `write` scopes
- VS Code 1.70 or higher
- Node.js 18+ (for script integration)

### Step-by-Step Installation

1. **Generate Linear API Key**
   - Visit: https://linear.app/digitaltableteur/settings/api
   - Click "Create new personal API key"
   - Name it: "VS Code Extension"
   - Save the key securely (1Password recommended)

2. **Install Extension**
   - Open VS Code Extensions (`Cmd/Ctrl+Shift+X`)
   - Search for "Linear"
   - Click "Install" on the official Linear extension
   - Reload VS Code if prompted

3. **Connect Extension**

   ```
   Cmd/Ctrl+Shift+P → Linear: Connect
   ```

   - Paste your API key
   - Press Enter
   - Verify connection in status bar (shows Linear icon)

4. **Share API Key with Scripts** (Optional but Recommended)

   Add to `.env.local`:

   ```bash
   LINEAR_API_KEY="lin_api_xxx"  # Same key for scripts and extension
   LINEAR_TEAM_ID="team_xxx"
   ```

---

## Extension Commands

### Core Commands

| Command ID                       | Title                                  | Keyboard Shortcut | Description                    |
| -------------------------------- | -------------------------------------- | ----------------- | ------------------------------ |
| `linear.connect`                 | **Linear: Connect**                    | -                 | Authenticate with Linear API   |
| `linear.getMyIssues`             | **Linear: Get all my issues**          | -                 | List your assigned issues      |
| `linear.setContextIssue`         | **Linear: Set context issue**          | -                 | Pin an issue as active context |
| `linear.setContextIssueStatus`   | **Linear: Set context issue status**   | -                 | Quick status changes           |
| `linear.addContextIssueComment`  | **Linear: Comment context issue**      | -                 | Add comments without browser   |
| `linear.createIssue`             | **Linear: Create issue**               | -                 | Basic issue creation           |
| `linear.showContextIssueActions` | **Linear: Show context issue actions** | -                 | Quick action menu              |

### Context Issue Concept

The **context issue** is a single issue you're actively working on. It:

- Persists across VS Code sessions
- Displays in the status bar
- Enables quick actions without searching
- Integrates with branch naming conventions

**Status Bar Display:**

```
[Linear: DIG-42] Button accessibility
```

---

## Hybrid Workflow Patterns

### Pattern 1: Extension for Reading, Scripts for AI-Enhanced Creation

**Use Case:** Leverage AI classification and component detection during issue creation

```bash
# 1. Create issue with intelligent labeling
npm run linear:auto "Add dark mode support to Button component"

Output:
✅ Created DIG-42
📍 https://linear.app/digitaltableteur/issue/DIG-42
🏷️  Labels: design-system, comp:Button, Enhancement
👤 Assigned: Petri Lahdelma
📊 State: In Progress (local changes detected)

# 2. Set as context issue in VS Code
Cmd/Ctrl+Shift+P → Linear: Set context issue → DIG-42

# 3. Work on code

# 4. Quick status update via extension
Cmd/Ctrl+Shift+P → Linear: Show context issue actions
→ Change status → In Review
```

**Why This Works:**

- Scripts provide AI-enhanced metadata (auto-labels, component detection, git integration)
- Extension provides fast in-editor updates without terminal switching
- No duplication - each tool used for its strength

---

### Pattern 2: Branch-Driven Development with Extension Status Sync

**Use Case:** Git branch names drive issue creation, extension provides status visibility

```bash
# 1. Create feature branch with DT-XXX prefix
git checkout -b DT-143-feat-dark-mode-theme

# 2. Auto-create issue from git state
npm run linear:auto "Implement dark mode theme system with CSS variables"

Output:
✅ Created DIG-43
🌿 Branch: DT-143-feat-dark-mode-theme
📊 State: In Progress (detected local changes)
🔗 Will link PR when pushed

# 3. Set as VS Code context
Linear: Set context issue → DIG-43

# 4. See status in bottom bar while coding
[Linear: DIG-43 • In Progress] Dark mode theme

# 5. Push and create PR
git push origin DT-143-feat-dark-mode-theme
gh pr create --title "Feat: Dark mode theme system" --body "Closes DIG-43"

# 6. Update issue with PR link
npm run linear:auto --issue=DIG-43 --update

Output:
✅ Updated DIG-43
🔗 Linked PR: https://github.com/PetriLahdelma/digitaltableteur/pull/85
📊 State: Done (PR created)

# 7. Extension automatically reflects new state
[Linear: DIG-43 • Done] Dark mode theme
```

**Benefits:**

- Single source of truth: git branch name
- Automatic state transitions based on git status
- PR linking without manual copy-paste
- Real-time status visibility in editor

---

### Pattern 3: Batch Script Operations with Extension Focus

**Use Case:** Update multiple issues programmatically, use extension for deep focus on current work

```bash
# Morning standup: Update all in-review issues
npm run linear:update --issue DIG-40 --state "In Review" --add-label "needs-qa"
npm run linear:update --issue DIG-41 --state "Done" --comment "Merged to main"
npm run linear:update --issue DIG-42 --state "Blocked" --comment "Waiting on design assets"

# Focus on today's priority
Linear: Set context issue → DIG-43

# Work with extension quick actions
Linear: Show context issue actions
→ Add comment: "Implemented CSS variable system"
→ Change status: In Progress
→ View in Linear (opens browser with full details)
```

**Use Cases:**

- Batch updates during standup/retrospectives
- Closing old issues programmatically
- Updating multiple related issues with same label
- Extension keeps you focused on "the one thing"

---

### Pattern 4: Extension for Discovery, Scripts for Complex Updates

**Use Case:** Browse issues in extension, perform complex operations via scripts

```bash
# 1. Discover assigned issues
Linear: Get all my issues

Results:
- DIG-40 (In Progress): Button accessibility
- DIG-41 (Todo): Dark mode icons
- DIG-42 (Blocked): Theme system refactor

# 2. Set context to investigate
Linear: Set context issue → DIG-42

# 3. Realize multiple labels and state change needed
npm run linear:update \
  --issue DIG-42 \
  --state "In Progress" \
  --add-label "design-system,comp:ThemeProvider,comp:Button" \
  --remove-label "Blocked" \
  --comment "Unblocked: Design assets received. Starting refactor."

# 4. Extension immediately reflects changes
[Linear: DIG-42 • In Progress] Theme system refactor
```

**Why This Works:**

- Extension UI better for browsing/searching
- Scripts better for complex multi-field updates
- Scripts support advanced features (component detection, git integration)
- Extension provides visual feedback

---

## Script Integration Strategies

### Shared API Key Configuration

**Recommended Setup:**

```bash
# .env.local (shared by scripts and extension)
LINEAR_API_KEY="lin_api_xxx"
LINEAR_TEAM_ID="team_xxx"
LINEAR_PROJECT_ID="proj_xxx"
```

**Extension Configuration:**

- Uses same API key
- Reads from VS Code secure storage
- No additional environment setup needed

### Command Equivalency Table

| Extension Command                  | Script Equivalent                 | Best Use Case                                                   |
| ---------------------------------- | --------------------------------- | --------------------------------------------------------------- |
| `Linear: Create issue`             | `npm run linear:new`              | **Scripts:** AI-enhanced with component detection               |
| `Linear: Set context issue status` | `npm run linear:update --state`   | **Extension:** Quick single-field updates                       |
| `Linear: Comment context issue`    | `npm run linear:update --comment` | **Extension:** Short notes; **Scripts:** Long technical details |
| `Linear: Get all my issues`        | (no direct script)                | **Extension:** Interactive browsing                             |
| `linear.createIssue` (basic)       | `npm run linear:auto`             | **Scripts:** Git-aware, auto-labeling, PR linking               |

### When to Use Scripts vs Extension

**Use Scripts When:**

- Creating issues with component detection (`comp:Button` labels)
- Git state should determine issue state (local changes = "In Progress")
- Need to update multiple labels/fields atomically
- Want AI-enhanced description formatting
- Batch processing multiple issues
- Integrating with CI/CD or webhooks

**Use Extension When:**

- Quick status changes while coding
- Adding short comments without terminal
- Browsing assigned issues
- Viewing issue details without browser
- Rapid context switching between issues
- Need visual confirmation of current issue

**Use Both When:**

- Starting new features: Scripts create, extension manages
- PR workflow: Scripts link PR, extension shows status
- Code review: Scripts batch-update, extension focus on one

---

## MCP Server Integration (Future)

### Planned Linear MCP Server

**Capabilities:**

- AI assistants can create/update issues via natural language
- Automatic issue creation from chat conversations
- Context-aware labeling using codebase analysis
- Integration with GitHub Copilot Chat

**Example Future Workflow:**

```
User in Copilot Chat:
"Create a ticket to add keyboard navigation to the Modal component"

AI Response:
✅ Created Linear issue DIG-44
🏷️  Auto-labels: design-system, a11y, comp:Modal
📝 Description: [AI-generated acceptance criteria]
🔗 https://linear.app/digitaltableteur/issue/DIG-44

Would you like me to create a branch and start implementation?
```

### MCP Configuration (mcp.json)

**Proposed Configuration:**

```jsonc
{
  "mcpServers": {
    "linear": {
      "type": "http",
      "url": "https://api.linear.app/graphql",
      "headers": {
        "Authorization": "Bearer {{LINEAR_API_KEY}}",
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
      ],
    },
  },
}
```

### Integration Benefits

1. **Three-Way Sync:**
   - VS Code Extension (UI)
   - Scripts (automation)
   - MCP (AI assistants)

2. **Unified State:**
   - All three use same API key
   - Context issue visible everywhere
   - Changes propagate immediately

3. **Workflow Continuity:**
   - Start in chat (MCP creates issue)
   - Continue in editor (extension manages)
   - Finish with automation (scripts link PR)

---

## Keyboard Shortcuts & Productivity

### Recommended Custom Keybindings

Add to `keybindings.json` (Cmd/Ctrl+K Cmd/Ctrl+S):

```jsonc
[
  {
    "key": "cmd+shift+l cmd+shift+i",
    "command": "linear.setContextIssue",
    "when": "editorTextFocus",
  },
  {
    "key": "cmd+shift+l cmd+shift+s",
    "command": "linear.setContextIssueStatus",
    "when": "editorTextFocus",
  },
  {
    "key": "cmd+shift+l cmd+shift+c",
    "command": "linear.addContextIssueComment",
    "when": "editorTextFocus",
  },
  {
    "key": "cmd+shift+l cmd+shift+a",
    "command": "linear.showContextIssueActions",
    "when": "editorTextFocus",
  },
]
```

**Mnemonic:**

- `Cmd+Shift+L` = Linear namespace
- `Cmd+Shift+I` = set **I**ssue
- `Cmd+Shift+S` = change **S**tatus
- `Cmd+Shift+C` = add **C**omment
- `Cmd+Shift+A` = show **A**ctions

### Status Bar Quick Actions

Click the Linear status bar item for instant menu:

- Change status
- Add comment
- View in browser
- Copy issue URL
- Clear context

---

## Troubleshooting

### Extension Not Connecting

**Symptom:** "Failed to connect" error

**Solutions:**

1. Verify API key has `read` + `write` scopes
2. Check key is not expired: https://linear.app/digitaltableteur/settings/api
3. Ensure Linear workspace is accessible
4. Try disconnecting and reconnecting:
   ```
   Linear: Connect (enter new key)
   ```

### Context Issue Not Persisting

**Symptom:** Context issue resets after VS Code restart

**Solutions:**

1. Check VS Code workspace settings saved
2. Verify Linear extension is enabled in workspace
3. Try setting context issue again after full restart

### Script and Extension Out of Sync

**Symptom:** Script updates issue but extension shows old state

**Solutions:**

1. Refresh extension view:
   ```
   Linear: Get all my issues (force refresh)
   ```
2. Clear context and reset:
   ```
   Linear: Set context issue → (select same issue again)
   ```
3. Restart VS Code to clear cache

### Scripts Can't Find LINEAR_API_KEY

**Symptom:** `Error: LINEAR_API_KEY is not defined`

**Solutions:**

1. Ensure `.env.local` exists in project root
2. Verify key format: `LINEAR_API_KEY="lin_api_xxx"` (with quotes)
3. Source the file manually:
   ```bash
   source .env.local
   npm run linear:auto "test issue"
   ```

### Extension Commands Not Available

**Symptom:** Linear commands missing from Command Palette

**Solutions:**

1. Verify extension installed and enabled:
   ```
   Extensions → Linear → Enabled
   ```
2. Check activation events triggered:
   ```
   Developer: Show Running Extensions
   ```
3. Reload window: `Cmd/Ctrl+R`

---

## Advanced Tips

### Git Hook Integration

Auto-update issue when pushing:

**`.git/hooks/post-push`:**

```bash
#!/bin/bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
ISSUE=$(echo $BRANCH | grep -oE 'DIG-[0-9]+' | sed 's/DIG-//')

if [ -n "$ISSUE" ]; then
  npm run linear:auto --issue="DIG-$ISSUE" --update
fi
```

Make executable: `chmod +x .git/hooks/post-push`

### Task Runner Integration

Add to `.vscode/tasks.json`:

```jsonc
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Linear: Create Issue from Selection",
      "type": "shell",
      "command": "npm run linear:auto '${selectedText}'",
      "problemMatcher": [],
    },
  ],
}
```

Usage: Select text → `Tasks: Run Task` → "Linear: Create Issue from Selection"

### Snippet Integration

Add to user snippets (`Preferences: Configure User Snippets`):

```jsonc
{
  "Linear Issue Link": {
    "prefix": "dig",
    "body": "[DIG-$1](https://linear.app/digitaltableteur/issue/DIG-$1)",
    "description": "Insert Linear issue link",
  },
}
```

Type `dig` → Tab → Enter issue number → Creates markdown link

---

## Related Documentation

- **[LINEAR_AUTOMATION.md](./LINEAR_AUTOMATION.md)** - Script commands and CLI usage
- **[LINEAR_LABELS.md](./LINEAR_LABELS.md)** - Available labels and their meanings
- **[RD_LABS_GUIDE.md](./RD_LABS_GUIDE.md)** - R&D team workflow with Linear

---

**Questions or Issues?**

- Scripts: Check `scripts/linear/*.ts`
- Extension: https://marketplace.visualstudio.com/items?itemName=Linear.linear
- API Docs: https://developers.linear.app/docs/graphql/working-with-the-graphql-api
