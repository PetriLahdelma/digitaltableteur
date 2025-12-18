# Sentry MCP Server Setup Guide

Complete guide for integrating the official Sentry Model Context Protocol (MCP) server into your development workflow.

## 📋 Overview

The [Sentry MCP Server](https://mcp.sentry.dev/) provides secure, comprehensive access to Sentry's debugging and error monitoring capabilities directly through AI assistants. It's a **production-released** remote hosted service managed by Sentry.

### Key Features

- **16+ Comprehensive Tools** for issues, projects, organizations, teams, DSNs, releases, and performance
- **Seer AI Integration** - Invoke Sentry's automated root cause analysis and fix generation
- **OAuth Authentication** - Seamless, secure access without token management (recommended)
- **Remote Hosted** - Always up-to-date, no local server management
- **Streamable HTTP** with automatic SSE fallback for client compatibility
- **STDIO Mode** - Optional local mode for self-hosted Sentry installations

### Architecture

```
┌─────────────────┐
│ MCP Client      │
│ (Claude Code,   │
│  Cursor, etc.)  │
└────────┬────────┘
         │ OAuth/HTTP
         │
┌────────▼────────────────────┐
│ https://mcp.sentry.dev/mcp  │
│ (Sentry Remote MCP Server)  │
└────────┬────────────────────┘
         │ Sentry API
         │
┌────────▼────────┐
│ Sentry.io       │
│ (Your Projects) │
└─────────────────┘
```

---

## 🚀 Quick Start

### Method 1: OAuth (Recommended)

**Zero configuration** - Just add to `mcp.json`:

```json
{
  "mcpServers": {
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/mcp"
    }
  }
}
```

**Authentication Flow:**

1. Open your MCP client (Claude Code, Cursor, etc.)
2. Client prompts for Sentry OAuth authorization
3. Browser opens → Login to your Sentry organization
4. Grant necessary permissions
5. Done! Tools become available immediately

**Permissions Granted:**

- Read organizations, projects, teams
- Read and search issues
- Create projects and DSNs
- Invoke Seer AI for automated debugging

**Session Management:**

- OAuth sessions persist across client restarts
- If you join a new Sentry organization, log out and back in to refresh access

---

### Method 2: Remote MCP Wrapper (Legacy)

For clients that **don't support OAuth**, use the `mcp-remote` package:

```json
{
  "mcpServers": {
    "sentry": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest", "https://mcp.sentry.dev/mcp"]
    }
  }
}
```

**Note:** This method still requires OAuth authentication when you first connect.

---

### Method 3: STDIO Mode (Self-Hosted Sentry)

For **self-hosted Sentry installations** or **advanced local debugging**:

**Requirements:**

- User Auth Token with scopes: `org:read`, `project:read`, `project:write`, `team:read`, `team:write`, `event:write`
- Generate at: https://sentry.io/settings/account/api/auth-tokens/

**Environment Variables:**

```bash
SENTRY_ACCESS_TOKEN=sntryu_your_token_here
SENTRY_HOST=sentry.example.com  # Optional, defaults to sentry.io
```

**Launch STDIO Server:**

```bash
npx @sentry/mcp-server@latest --access-token=YOUR_TOKEN --host=sentry.example.com
```

Or with environment variables:

```bash
export SENTRY_ACCESS_TOKEN=your_token
export SENTRY_HOST=your_host
npx @sentry/mcp-server@latest
```

**MCP Configuration (STDIO):**

```json
{
  "mcpServers": {
    "sentry": {
      "command": "npx",
      "args": ["@sentry/mcp-server@latest"],
      "env": {
        "SENTRY_ACCESS_TOKEN": "your_token",
        "SENTRY_HOST": "sentry.io"
      }
    }
  }
}
```

---

## 🛠️ Available Tools (16+ Tools)

### 🏢 Organization & Project Management

| Tool                 | Description                                            | Priority |
| -------------------- | ------------------------------------------------------ | -------- |
| `list_organizations` | Query all accessible Sentry organizations              | HIGH     |
| `list_projects`      | Find and list projects (filter by org, team, or query) | HIGH     |
| `create_project`     | Create new Sentry projects with configuration          | HIGH     |
| `list_teams`         | Manage and query team information                      | MEDIUM   |

**Example Usage:**

```plaintext
"List all my Sentry projects"
"Create a new Sentry project called 'mobile-app' in the 'digitaltableteur' organization"
"Show me teams in Sentry"
```

---

### 🐛 Issue & Error Management

| Tool                    | Description                                                                   | Priority     |
| ----------------------- | ----------------------------------------------------------------------------- | ------------ |
| `get_issue_details`     | Access detailed issue information with full stack traces and context          | HIGH         |
| `search_issues`         | Find issues across projects with complex filters                              | HIGH         |
| `search_errors_in_file` | **Find errors in specific source files** (e.g., `components/UserProfile.tsx`) | **CRITICAL** |
| `list_dsns`             | List Data Source Names for project instrumentation                            | MEDIUM       |
| `create_dsn`            | Create new DSNs for adding instrumentation to apps                            | MEDIUM       |

**Example Usage:**

```plaintext
"Show me unresolved issues in the 'frontend' project"
"Search Sentry for errors in components/ChatWidget.tsx"
"Tell me about Sentry issue DT-456"
"Create a new DSN for the 'backend' project"
```

**Key Feature:** `search_errors_in_file` is unique to MCP - not available in Sentry UI!

---

### 🤖 Seer AI Integration (Automated Debugging)

| Tool                   | Description                                                         | Priority |
| ---------------------- | ------------------------------------------------------------------- | -------- |
| `invoke_seer`          | Trigger Sentry's AI agent for automated root cause analysis         | **HIGH** |
| `get_seer_fix_status`  | Monitor the progress of Seer's analysis and fix generation          | HIGH     |
| `get_seer_fix_details` | Retrieve AI-generated solutions, code snippets, and recommendations | HIGH     |

**What is Seer?**

Seer is Sentry's purpose-built AI agent for **deep issue analysis** and **automated debugging**. It goes beyond MCP's conversational AI by:

- Analyzing stack traces, breadcrumbs, and context
- Identifying root causes in your codebase
- Generating specific code fixes
- Providing step-by-step remediation plans

**Example Usage:**

```plaintext
"Use Seer to analyze Sentry issue FRONTEND-123 and propose a fix"
"Check the status of the Seer analysis for issue BACKEND-456"
"Show me the detailed fix recommendations from Seer for issue MOBILE-789"
```

**MCP + Seer Workflow:**

1. Use MCP to search and identify issues
2. Invoke Seer for deep automated analysis
3. Get AI-generated fix recommendations
4. Apply fixes with context from both systems

---

### 📊 Release & Performance Monitoring

| Tool                | Description                                                   | Priority |
| ------------------- | ------------------------------------------------------------- | -------- |
| `query_releases`    | Analyze release information, deployments, and release health  | MEDIUM   |
| `query_performance` | Access transaction data, performance metrics, and bottlenecks | MEDIUM   |
| `custom_queries`    | Execute complex searches across all Sentry data               | MEDIUM   |

**Example Usage:**

```plaintext
"Show me the most recent releases for my organization"
"Find performance issues in the latest release"
"Query Sentry for all crashes in the last 24 hours"
```

---

## 🔄 Integration with Existing Scripts

Your project already has custom REST API scripts in `scripts/`:

### Comparison: Official MCP vs Existing Scripts

| Feature            | Official Sentry MCP                        | Existing REST Scripts                        |
| ------------------ | ------------------------------------------ | -------------------------------------------- |
| **Tools**          | 16+ comprehensive tools                    | 3 commands (issues, releases, list-projects) |
| **Authentication** | OAuth (no token management)                | API token required                           |
| **Seer AI**        | ✅ Full integration                        | ❌ Not available                             |
| **Error Search**   | ✅ Search by file path                     | ❌ Basic issue list only                     |
| **Interactive**    | ✅ Natural language prompts                | ❌ CLI commands only                         |
| **Best For**       | Real-time debugging, AI-assisted workflows | CI/CD summaries, automation                  |

### When to Use Each

**Use Official Sentry MCP:**

- Interactive debugging sessions
- Exploring issues with natural language
- Root cause analysis with Seer AI
- Creating projects/DSNs on the fly
- Searching errors in specific files

**Use Existing REST Scripts:**

- CI/CD pipelines (`scripts/generate-sentry-summary.mjs`)
- Automated reporting (`scripts/sentry-mcp.js issues --unresolved`)
- Storybook dashboard data (`SentrySummaryCard` component)
- Build-time error summaries

**Recommendation:** Keep both! They serve different purposes and complement each other.

---

## 🧪 Testing Your Setup

Run the test script to validate configuration:

```bash
npm run sentry:mcp:test
```

**What It Checks:**

- ✅ Sentry MCP server accessibility (`https://mcp.sentry.dev/mcp`)
- ✅ MCP configuration in `mcp.json`
- ✅ OAuth setup readiness
- ✅ STDIO mode configuration (if using local mode)
- ✅ Environment variables (if applicable)
- ✅ Sentry API connectivity
- ✅ Lists all 16+ available tools

**Expected Output:**

```
✅ ALL CHECKS PASSED

🎉 Your Sentry MCP configuration is ready!

Next steps:
1. Open Claude Code, Cursor, or another MCP client
2. Authenticate with Sentry via OAuth
3. Try prompts like:
   - 'Show me recent issues in Sentry'
   - 'Use Seer to analyze issue PROJ-123'
```

---

## 🌐 Web Client Demo

Test the MCP server without any client installation:

**URL:** https://mcp.sentry.dev/

- Authenticate with your Sentry organization
- Access a hosted MCP server for testing
- Try all 16+ tools in a web-based interface

---

## 🔧 Client Setup Instructions

### Claude Code (CLI)

```bash
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
claude
```

When prompted, authenticate with Sentry via OAuth.

---

### Cursor

**Method 1 (UI):**

1. `Cursor` → `Settings` → `Cursor Settings` → `MCP`
2. Follow prompts to configure Sentry MCP
3. OAuth authentication handled automatically

**Method 2 (Manual `mcp.json`):**

Edit your `mcp.json` (already updated in this project).

---

### Claude Desktop

**macOS:** `CMD + ,` → `Developer` → `Edit Config`

**Edit `claude_desktop_config.json`:**

```json
{
  "mcpServers": {
    "sentry": {
      "url": "https://mcp.sentry.dev/mcp"
    }
  }
}
```

---

### Codex

```bash
codex mcp add sentry -- npx -y mcp-remote@latest https://mcp.sentry.dev/mcp
codex
```

---

### Amp (VS Code Extension)

**Settings JSON:**

```json
"amp.mcpServers": {
  "sentry": {
    "command": "npx",
    "args": ["-y", "mcp-remote@latest", "https://mcp.sentry.dev/mcp"]
  }
}
```

**Or via Amp CLI:**

```bash
amp mcp add sentry -- npx -y mcp-remote@latest https://mcp.sentry.dev/mcp
```

---

### Cline (VS Code)

`CMD+Shift+P` → `MCP: Add Server` → Add Sentry MCP URL

---

### Goose

`Settings` → `MCP Servers` → `Add MCP Server` → `Sentry` → `https://mcp.sentry.dev/mcp`

---

### Cascade

`Configure MCP` option in Cascade (CMD + L)

---

## 🐛 Troubleshooting

### OAuth Authentication Problems

**Symptoms:**

- "Authentication failed"
- No tools visible after authentication
- Client keeps prompting to re-authenticate

**Solutions:**

1. **Clear OAuth cache:** Log out of Sentry in your MCP client and log back in
2. **Check permissions:** Ensure your Sentry account has access to the organization
3. **Try legacy method:** Use Remote MCP wrapper (`npx mcp-remote@latest`) if OAuth isn't working
4. **Browser issues:** If OAuth browser window doesn't open, check popup blockers

---

### Connection Issues

**Symptoms:**

- "Failed to reach Sentry MCP server"
- Timeout errors

**Solutions:**

1. **Verify URL:** Ensure `https://mcp.sentry.dev/mcp` (not `/sse`)
2. **Check internet:** Confirm connectivity to Sentry services
3. **Firewall/proxy:** MCP requires HTTP/HTTPS access
4. **Legacy endpoint:** For older setups, legacy SSE endpoint is `https://mcp.sentry.dev/sse`

---

### Missing Tools

**Symptoms:**

- Only see 1-3 tools instead of 16+
- Specific tools (like Seer) not available

**Solutions:**

1. **Authentication incomplete:** Re-authenticate and grant all requested permissions
2. **Client compatibility:** Ensure your MCP client supports HTTP transport with OAuth
3. **Organization access:** Verify you have access to at least one Sentry organization
4. **Check console:** Look for errors in your MCP client's developer console

---

### STDIO Mode Issues

**Symptoms:**

- "Invalid token" errors
- "Permission denied" errors

**Solutions:**

1. **Check token scopes:** Token must have `org:read`, `project:read`, `project:write`, `team:read`, `team:write`, `event:write`
2. **Generate new token:** https://sentry.io/settings/account/api/auth-tokens/
3. **Environment variables:** Ensure `SENTRY_ACCESS_TOKEN` is correctly set
4. **Self-hosted URL:** Verify `SENTRY_HOST` points to your Sentry instance

---

## 🔐 Security Best Practices

### OAuth Mode (Recommended)

- ✅ **No token management** - Sentry handles authentication
- ✅ **Scoped access** - Only grants necessary permissions
- ✅ **Revocable** - Can be revoked from Sentry organization settings
- ✅ **Session-based** - Automatically refreshes

### STDIO Mode (Token-Based)

- ⚠️ **Store tokens securely** - Use `.env.local` (in `.gitignore`)
- ⚠️ **Rotate regularly** - Generate new tokens periodically
- ⚠️ **Minimum scopes** - Only grant required permissions
- ⚠️ **Never commit** - Keep tokens out of version control

**Token Storage:**

```bash
# .env.local (NEVER commit this file)
SENTRY_ACCESS_TOKEN=sntryu_your_token_here
SENTRY_HOST=sentry.io
```

---

## 📚 Usage Examples

### Basic Issue Exploration

```plaintext
"Show me the most recent unresolved issues in Sentry"
"What are the top errors in my 'frontend' project?"
"Tell me about Sentry issue DT-123"
```

### File-Specific Error Search

```plaintext
"Search Sentry for errors in components/UserProfile.tsx"
"Are there any crashes in services/AuthService.ts?"
"Find issues related to hooks/useAuth.ts"
```

### Seer AI Workflows

```plaintext
"Use Seer to analyze Sentry issue PROJ-456 and suggest a fix"
"What's the status of the Seer analysis for issue BACKEND-789?"
"Show me the detailed recommendations from Seer for this crash"
```

### Project & DSN Management

```plaintext
"Create a new Sentry project for 'mobile-app' in my organization"
"List all DSNs for the 'backend' project"
"Generate a new DSN for the 'frontend' project"
```

### Release Analysis

```plaintext
"Show me the most recent releases for my organization"
"What errors appeared after the 1.2.0 release?"
"Compare error rates between the last two releases"
```

### Custom Queries

```plaintext
"Find all unresolved crashes in my React Native app"
"Show me performance issues from the last 7 days"
"Query Sentry for all issues tagged with 'payment-flow'"
```

---

## 🔄 Migration from Legacy Setup

If you were using `scripts/sentry-mcp.js` (command-based REST wrapper):

### Before (Legacy)

```json
{
  "sentry-mcp": {
    "type": "command",
    "command": "node",
    "args": ["scripts/sentry-mcp.js", "issues"]
  }
}
```

**Limitations:**

- Only 3 commands (issues, releases, list-projects)
- No Seer AI integration
- No file-specific error search
- Token management required

---

### After (Official MCP)

```json
{
  "sentry": {
    "type": "http",
    "url": "https://mcp.sentry.dev/mcp"
  }
}
```

**Benefits:**

- 16+ comprehensive tools
- Seer AI integration
- OAuth authentication (no tokens)
- File-specific error search
- Natural language interface

---

### Keep Legacy Scripts For

- CI/CD pipelines: `npm run generate:sentry-summary`
- Automated reporting: `node scripts/sentry-mcp.js issues --unresolved`
- Storybook dashboard: `SentrySummaryCard` component

**Renamed to `sentry-rest-api` in `mcp.json` for clarity.**

---

## 📖 Additional Resources

- **Official Documentation:** https://docs.sentry.io/product/sentry-mcp/
- **Web Client Demo:** https://mcp.sentry.dev/
- **GitHub Repository:** https://github.com/getsentry/sentry-mcp
- **Seer Documentation:** https://docs.sentry.io/product/ai-in-sentry/seer/
- **MCP Protocol:** https://modelcontextprotocol.io/introduction
- **Support:** https://sentry.zendesk.com/hc/en-us/

---

## 🎯 Summary

The official Sentry MCP Server provides:

✅ **16+ comprehensive tools** (vs 3 in legacy scripts)  
✅ **OAuth authentication** (no token management)  
✅ **Seer AI integration** (automated debugging)  
✅ **File-specific error search** (unique to MCP)  
✅ **Natural language interface** (via AI assistants)  
✅ **Remote hosted** (always up-to-date)  
✅ **Production-ready** (officially supported by Sentry)

**Next Step:** Run `npm run sentry:mcp:test` to validate your setup, then open your MCP client and start debugging with AI!

---

**Last Updated:** December 5, 2025  
**Sentry MCP Server Version:** Production Release (1.0+)  
**Status:** ✅ Stable and recommended for all users
