# Figma MCP Server Setup Guide

## Overview

The Figma MCP (Model Context Protocol) Server provides AI tools with direct access to Figma's design platform. This integration allows you to interact with Figma files, extract design tokens, download assets, and analyze design data through natural language commands.

## Configuration

The Figma MCP server is configured in `mcp.json` as a Server-Sent Events (SSE) server running on localhost:3333 using the `figma-developer-mcp` package.

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

## Setup Steps

### 1. Install Dependencies

The `figma-developer-mcp` package is already installed in your project. If you need to reinstall:

```bash
npm install figma-developer-mcp
```

### 2. Create a Figma Personal Access Token

You need to create a Personal Access Token to authenticate with the Figma API:

1. Go to [Figma Account Settings](https://www.figma.com/settings)
2. Scroll down to **"Personal access tokens"**
3. Click **"Create new token"**
4. Give it a descriptive name (e.g., "Digitaltableteur MCP")
5. Set an expiration date (recommended: 90 days)
6. **Copy the token immediately** (you won't be able to see it again)

### 3. Configure Environment Variables

Add the Figma token to your `.env.local` file:

```bash
# Add this to your .env.local file
FIGMA_TOKEN=figd_your_personal_access_token_here

# Optional: Specify a specific Figma file to work with
FIGMA_FILE_KEY=your_figma_file_key_here
```

**Note**: Your current default file key is `d8nFs8A5KcjbFr6KkwZV4H5K` (configured in `scripts/fetch-figma.js`).

### 4. Set Up Vercel Environment Variables

For production deployment, add the environment variable in Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `digitaltableteur` project
3. Navigate to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `FIGMA_TOKEN`
   - **Value**: Your Figma personal access token
   - **Environment**: Select `Production`, `Preview`, and `Development`

### 5. Start the Figma MCP Server

The `figma-developer-mcp` runs as a standalone server that your MCP host connects to:

```bash
# Start the Figma MCP server (in a separate terminal)
npx figma-developer-mcp

# The server will start on http://localhost:3333/sse
```

### 6. Test the Configuration

Test your Figma MCP setup:

```bash
npm run figma:mcp:test
```

This will verify:

- MCP configuration
- Package installation
- Environment variables
- Figma API connectivity
- File access permissions

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
- "Extract spacing values from the design tokens"

### Development Workflow

- "Convert this component design to React code"
- "Generate CSS custom properties from design tokens"
- "Create a component spec from the Figma design"
- "Compare this design with the implemented version"

## Integration with Your Current Workflow

### Existing Figma Integration

Your project already has a `fetch-figma` script (`scripts/fetch-figma.js`) that:

- Fetches basic file data from Figma API
- Saves design data to `figma.json`
- Uses the same `FIGMA_TOKEN` environment variable

### MCP Enhancement

The Figma MCP adds:

- **Interactive Queries**: Ask questions about your designs in natural language
- **Real-time Access**: Direct API calls without pre-fetching
- **AI Integration**: Design analysis and code generation capabilities
- **Component Extraction**: Automated design-to-code workflows

### Design System Integration

Perfect for your digitaltableteur design system:

- Extract design tokens automatically
- Validate component implementations against designs
- Generate Storybook stories from Figma components
- Maintain design-code consistency

## Troubleshooting

### Common Issues

1. **Server Connection Failed**
   - Ensure the Figma MCP server is running: `npx figma-developer-mcp`
   - Check that port 3333 is available
   - Verify the server URL in `mcp.json` is correct

2. **Authentication Failed**
   - Verify your `FIGMA_TOKEN` is correct and hasn't expired
   - Check that the token has the necessary permissions
   - Ensure the token is for the correct Figma account

3. **File Access Denied**
   - Verify you have access to the Figma file
   - Check that the `FIGMA_FILE_KEY` is correct
   - Ensure your token has permission to read the specific file

4. **MCP Host Connection Issues**
   - Restart your MCP host (VS Code, Claude Desktop, etc.) after configuration
   - Verify the MCP configuration syntax in `mcp.json`
   - Check that environment variables are loaded correctly

### Debug Mode

To enable debug logging:

```bash
# Set environment variable for detailed logging
DEBUG=figma-mcp npx figma-developer-mcp
```

### Server Management

```bash
# Start the server
npx figma-developer-mcp

# Start with specific port
npx figma-developer-mcp --port 3333

# Start with debug logging
DEBUG=* npx figma-developer-mcp
```

## Security Best Practices

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

## Configuration Files

- **Primary Config**: `mcp.json` - MCP server configuration
- **Environment**: `.env.local` - Local development tokens
- **Legacy Script**: `scripts/fetch-figma.js` - Existing Figma integration
- **Test Script**: `scripts/test-figma-mcp.mjs` - Connection validation

## Related Documentation

- [Figma Developer API Documentation](https://www.figma.com/developers/api)
- [figma-developer-mcp Package](https://www.npmjs.com/package/figma-developer-mcp)
- [Figma Personal Access Tokens Guide](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens)

## Support

For issues with the Figma MCP server:

- Check the [figma-developer-mcp GitHub issues](https://github.com/figma-developer-mcp/issues)
- Review the [Figma API documentation](https://www.figma.com/developers/api)
- Test your connection with `npm run figma:mcp:test`
