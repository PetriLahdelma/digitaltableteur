# Figma MCP Server Setup Guide

## Overview

The Figma MCP (Model Context Protocol) Server provides AI tools with direct access to Figma's design platform. This integration allows you to interact with Figma files, extract design tokens, download assets, and analyze design data through natural language commands.

**Official Documentation**: https://developers.figma.com/docs/figma-mcp-server

---

## Connection Methods (3 Options)

Figma offers **three ways** to connect to their MCP server. Choose based on your workflow:

### 1. 🌐 Remote MCP Server (Recommended)

**Best for**: Teams, remote work, CI/CD, no desktop app required

- **URL**: `https://mcp.figma.com/mcp`
- **Auth**: OAuth (browser-based login)
- **Access**: Link-based (copy Figma URL → paste in prompt)
- **Pros**: Works anywhere, no local setup, secure OAuth
- **Cons**: Requires internet connection

```json
{
  "figma": {
    "type": "http",
    "url": "https://mcp.figma.com/mcp"
  }
}
```

### 2. 🖥️ Desktop MCP Server

**Best for**: Local development, selection-based workflows, offline work

- **URL**: `http://127.0.0.1:3845/mcp`
- **Auth**: Automatic (uses Figma desktop app login)
- **Access**: Selection-based (select frame in Figma → prompt)
- **Pros**: Real-time selection, offline capable, fast
- **Cons**: Requires Figma desktop app, Dev/Full seat on paid plans

**Setup**:

1. Open Figma desktop app (latest version)
2. Open a Design file
3. Toggle to Dev Mode (Shift+D)
4. Click "Enable desktop MCP server" in inspect panel

```json
{
  "figma-desktop": {
    "type": "http",
    "url": "http://127.0.0.1:3845/mcp"
  }
}
```

### 3. 📦 Developer MCP (npm package)

**Best for**: Custom integrations, programmatic access, legacy workflows

- **URL**: `http://localhost:3333/sse` (SSE server)
- **Auth**: Personal Access Token (`FIGMA_TOKEN`)
- **Access**: API-based (requires running `npx figma-developer-mcp`)
- **Pros**: Full API control, scriptable
- **Cons**: Requires server management, token rotation

```json
{
  "figma-developer-mcp": {
    "type": "sse",
    "url": "http://localhost:3333/sse",
    "env": {
      "FIGMA_TOKEN": "<YOUR_FIGMA_TOKEN>"
    }
  }
}
```

---

## Configuration in mcp.json

Your project supports **all three methods** in `mcp.json`:

```json
{
  "mcpServers": {
    "figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp",
      "description": "Remote MCP - OAuth, link-based"
    },
    "figma-desktop": {
      "type": "http",
      "url": "http://127.0.0.1:3845/mcp",
      "description": "Desktop MCP - Selection-based"
    },
    "figma-developer-mcp": {
      "type": "sse",
      "url": "http://localhost:3333/sse",
      "description": "Developer MCP - Token-based",
      "env": {
        "FIGMA_TOKEN": "<YOUR_FIGMA_TOKEN>"
      }
    }
  }
}
```

**Choose your preferred method** based on your workflow needs.

---

## Quick Start (Remote MCP - Recommended)

The **remote MCP server** is the easiest to set up and works everywhere:

### 1. Configure MCP Client

The remote server is already configured in your `mcp.json` as `"figma"`.

### 2. Authenticate

When you first use the Figma MCP in Claude Code, Cursor, or VS Code:

1. Your MCP client will prompt you to authenticate
2. Click "Allow Access" to authorize via OAuth
3. You're ready to use Figma MCP!

**No tokens, no desktop app, no server management required!**

### 3. Use Link-Based Prompts

```
"Implement the button design from https://www.figma.com/design/abc123/MyFile?node-id=1-2"
"Generate React code for this Figma link: [paste URL]"
"Extract design tokens from https://www.figma.com/design/..."
```

The MCP server extracts the `node-id` from the URL automatically.

---

## Desktop MCP Setup (Selection-Based)

For **real-time selection** workflows:

### 1. Enable in Figma Desktop

1. Open Figma desktop app (update to latest version)
2. Open a Design file
3. Press **Shift+D** (enter Dev Mode)
4. Click **"Enable desktop MCP server"** in the inspect panel
5. Server starts at `http://127.0.0.1:3845/mcp`

### 2. Use Selection-Based Prompts

1. Select a frame/layer in Figma desktop
2. Prompt your AI client:
   ```
   "Implement my current Figma selection"
   "Convert this selected frame to React"
   "Generate CSS from my selected component"
   ```

**The MCP automatically accesses your current selection!**

---

## Developer MCP Setup (Token-Based)

For **programmatic access** and **legacy workflows**:

For **programmatic access** and **legacy workflows**:

### 1. Create a Figma Personal Access Token

1. Go to [Figma Account Settings](https://www.figma.com/settings)
2. Scroll to **"Personal access tokens"**
3. Click **"Create new token"**
4. Name it (e.g., "Digitaltableteur MCP")
5. Set expiration (recommended: 90 days)
6. **Copy the token immediately** (you won't see it again)

### 2. Configure Environment Variables

Add to `.env.local`:

```bash
FIGMA_TOKEN=figd_your_personal_access_token_here
FIGMA_FILE_KEY=your_figma_file_key_here  # Optional
```

### 3. Start the Developer MCP Server

```bash
# Start the SSE server (separate terminal)
npx figma-developer-mcp

# Server runs at http://localhost:3333/sse
```

### 4. Set Up Vercel Environment Variables

For production:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select `digitaltableteur` project
3. **Settings** → **Environment Variables**
4. Add:
   - **Name**: `FIGMA_TOKEN`
   - **Value**: Your token
   - **Environment**: Production, Preview, Development

---

## Comparison: Which Method to Use?

| Feature          | Remote MCP           | Desktop MCP          | Developer MCP            |
| ---------------- | -------------------- | -------------------- | ------------------------ |
| **Setup**        | Easiest (OAuth)      | Medium (desktop app) | Complex (token + server) |
| **Access**       | Link-based           | Selection-based      | API-based                |
| **Auth**         | OAuth (secure)       | Desktop app login    | Personal token           |
| **Offline**      | ❌ Requires internet | ✅ Works offline     | ⚠️ Server needed         |
| **Installation** | None                 | Figma desktop app    | npm package              |
| **Best For**     | Teams, CI/CD         | Real-time design     | Custom scripts           |
| **Rate Limits**  | Tier 1 API limits    | Same as REST API     | Token-based limits       |

**Recommendation**: Start with **Remote MCP** (easiest), use **Desktop MCP** for selection workflows, **Developer MCP** only for advanced automation.

---

## Test Your Setup

Test all configured servers:

```bash
npm run figma:mcp:test
```

This validates:

- ✅ MCP configuration in `mcp.json`
- ✅ Figma API connectivity
- ✅ Environment variables (for Developer MCP)
- ✅ Token validity (for Developer MCP)
- 📊 Lists available connection methods

---

## Available Capabilities (All Methods)

### Design Data Access

- **File Information**: Metadata, version history, collaboration details
- **Page Navigation**: Access pages within a file
- **Component Analysis**: Extract components, variants, design system elements
- **Frame Inspection**: Analyze frames, artboards, nested structures

### Asset Management

- **Image Exports**: Download images (various resolutions/formats)
- **Icon Extraction**: Extract SVG icons and vector graphics
- **Asset Inventory**: List all assets in a file
- **Design Token Extraction**: Extract colors, typography, spacing

### Design System Operations

- **Component Libraries**: Access shared components
- **Style Analysis**: Extract text styles, color styles, effects
- **Design Consistency**: Check pattern adherence
- **Documentation**: Generate docs from Figma comments

### Code Generation (With Code Connect)

- **Component Mapping**: Map Figma components to codebase components
- **Consistent Output**: Use your actual React/Vue/etc. components
- **Design-Code Sync**: Keep implementations aligned with designs

### Make Resources (Prototypes)

- **Code Resources**: Gather code from Make prototype files
- **Prototype Context**: Bring early-stage prototypes into development
- **Production Transition**: Move from prototype to production app

**Learn more**: [Bringing Make context to your agent](https://developers.figma.com/docs/figma-mcp-server/bringing-make-context-to-your-agent/)

---

## Usage Examples

### Remote MCP (Link-Based)

```
"Implement the button design from https://www.figma.com/design/abc123/MyFile?node-id=1-2"
"Generate React component for [Figma URL]"
"Extract all design tokens from this file: [Figma URL]"
"Convert this Figma frame to Tailwind CSS: [URL]"
```

### Desktop MCP (Selection-Based)

```
"Convert my current Figma selection to React"
"Generate CSS for the selected component"
"Extract variables from this selected frame"
"Create a Storybook story for my selection"
```

### Developer MCP (API-Based)

```
"Show me file d8nFs8A5KcjbFr6KkwZV4H5K information"
"List all components in the design system"
"Export all icons from the icon library page"
"Generate design token JSON from variables"
```

## Available Capabilities

### Design Data Access

- **File Information**: Get file metadata, version history, and collaboration details
- **Page Navigation**: Access different pages within a Figma file
- **Component Analysis**: Extract components, variants, and design system elements
- **Frame Inspection**: Analyze frames, artboards, and their nested structures

### Asset Management

- **Image Exports**: Download images at various resolutions and formats
- **Icon Extraction**: Extract SVG icons and vector graphics
- **Asset Inventory**: List all assets used in a design file
- **Design Token Extraction**: Extract colors, typography, spacing values

### Design System Operations

- **Component Libraries**: Access shared components and design systems
- **Style Analysis**: Extract text styles, color styles, and effects
- **Design Consistency**: Check for design pattern adherence
- **Documentation**: Generate design documentation from Figma comments

### Collaboration Features

- **Comment Access**: Read and analyze designer comments and feedback
- **Version Tracking**: Track design changes and version history
- **Team Insights**: Understand collaboration patterns and workflow

## Usage Examples

Once configured, you can interact with Figma through natural language:

### File Operations

- "Show me the main file information and recent changes"
- "List all pages in the current Figma file"
- "Get the component library from our design system"
- "Export the homepage design as PNG at 2x resolution"

### Design Analysis

- "Extract all color tokens from the design system"
- "List all typography styles used in this file"
- "Find all instances of the Button component"
- "Generate a report of design inconsistencies"

### Asset Extraction

- "Download all icons from the icon library page"
- "Export the logo in SVG format"
- "Get all images used in the mobile designs"
- "Extract spacing values from the design tokens"---

## Integration with Your Current Workflow

### Existing Figma Integration

Your project already has a `fetch-figma` script (`scripts/fetch-figma.js`) that:

- Fetches basic file data from Figma REST API
- Saves design data to `figma.json`
- Uses the same `FIGMA_TOKEN` environment variable (for Developer MCP)

### MCP Enhancement

The Figma MCP servers add:

- **Interactive Queries**: Ask questions in natural language (all methods)
- **Real-time Access**: Direct API calls without pre-fetching (all methods)
- **AI Integration**: Design analysis and code generation (all methods)
- **Component Extraction**: Automated design-to-code workflows (all methods)
- **Selection-Based**: Work directly from Figma desktop selections (Desktop MCP only)
- **Link-Based**: Share and work with Figma URLs (Remote MCP)
- **OAuth Security**: No token management (Remote MCP + Desktop MCP)

### Design System Integration

Perfect for your digitaltableteur design system:

- Extract design tokens automatically
- Validate component implementations against designs
- Generate Storybook stories from Figma components
- Maintain design-code consistency
- Use Code Connect to map Figma components to your actual React components

**Learn more**: [Code Connect documentation](https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect)

---

## Troubleshooting

### Remote MCP Issues

1. **Authentication Failed**
   - Clear OAuth sessions and re-authenticate
   - Check your Figma account has access to the files
   - Verify you're using a supported MCP client

2. **Node ID Not Found**
   - Ensure the Figma URL includes `?node-id=` parameter
   - Check file permissions (must have at least view access)
   - Verify the node hasn't been deleted

### Desktop MCP Issues

1. **Server Not Starting**
   - Update Figma desktop app to latest version
   - Ensure you're in Dev Mode (Shift+D)
   - Check port 3845 isn't blocked by firewall
   - Verify you have a Dev or Full seat on a paid plan

2. **Selection Not Recognized**
   - Make sure you've selected a frame/layer in Figma
   - Verify the desktop MCP server is running (green indicator)
   - Try restarting the Figma desktop app

### Developer MCP Issues

1. **Server Connection Failed**
   - Ensure the server is running: `npx figma-developer-mcp`
   - Check that port 3333 is available
   - Verify the server URL in `mcp.json` is correct (`http://localhost:3333/sse`)

2. **Authentication Failed**
   - Verify your `FIGMA_TOKEN` is correct and hasn't expired
   - Check the token has necessary permissions
   - Ensure the token is for the correct Figma account
   - Create new token at https://www.figma.com/settings

3. **File Access Denied**
   - Verify you have access to the Figma file
   - Check that the `FIGMA_FILE_KEY` is correct
   - Ensure your token has read permission for the file

4. **MCP Host Connection Issues**
   - Restart your MCP host (VS Code, Claude Code, etc.) after configuration
   - Verify the MCP configuration syntax in `mcp.json`
   - Check environment variables are loaded correctly

### Rate Limiting

All MCP methods follow Figma's REST API rate limits:

- **Starter/View/Collab seats**: 6 tool calls per month
- **Dev/Full seats (paid plans)**: Tier 1 API rate limits (per minute)

If rate limited:

- Use Remote MCP (generally higher limits)
- Upgrade to a Dev or Full seat
- Space out your requests

---

## Security Best Practices

### For Remote MCP (OAuth)

- ✅ OAuth is more secure than tokens
- ✅ Sessions expire automatically (revocable)
- ✅ No token storage needed
- ⚠️ Re-authenticate periodically

### For Desktop MCP

- ✅ Uses desktop app authentication (secure)
- ✅ No token management
- ⚠️ Ensure desktop app is up-to-date

### For Developer MCP (Token-Based)

1. **Token Management**
   - Set reasonable expiration dates (30-90 days)
   - Only grant necessary permissions
   - Rotate tokens regularly

2. **Environment Variables**
   - Never commit tokens to your repository
   - Use different tokens for different environments
   - Store tokens securely in Vercel/deployment platform

3. **Access Control**
   - Only share file access with necessary team members
   - Use organization accounts for better permission management
   - Monitor token usage in Figma settings

---

## Configuration Files

- **Primary Config**: `mcp.json` - MCP server configuration (3 methods)
- **Environment**: `.env.local` - Local development tokens (Developer MCP only)
- **Legacy Script**: `scripts/fetch-figma.js` - Existing Figma REST API integration
- **Test Script**: `scripts/test-figma-mcp.mjs` - Connection validation

## Related Documentation

- **Official Figma MCP Docs**: https://developers.figma.com/docs/figma-mcp-server
- **Remote MCP Setup**: https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
- **Desktop MCP Setup**: https://developers.figma.com/docs/figma-mcp-server/local-server-installation/
- **Figma REST API**: https://www.figma.com/developers/api
- **Code Connect**: https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect
- **Make Resources**: https://developers.figma.com/docs/figma-mcp-server/bringing-make-context-to-your-agent/
- **Personal Access Tokens**: https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens
- **figma-developer-mcp Package**: https://www.npmjs.com/package/figma-developer-mcp (Developer MCP only)

## Support

For issues with the Figma MCP servers:

- **Remote/Desktop MCP**: Use the [feedback form](https://form.asana.com/?k=jMdFq_1SBUOyh8_k3q76QA&d=10497086658021)
- **Developer MCP**: Check [figma-developer-mcp GitHub issues](https://github.com/figma-developer-mcp/issues)
- **General**: Review [Figma API documentation](https://www.figma.com/developers/api)
- **Test connection**: `npm run figma:mcp:test`

---

**Last Updated**: December 5, 2025  
**MCP Methods**: Remote (OAuth), Desktop (selection-based), Developer (token-based)  
**Recommended**: Start with Remote MCP for easiest setup
