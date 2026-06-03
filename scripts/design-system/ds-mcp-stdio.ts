#!/usr/bin/env tsx
/**
 * Local stdio MCP server for @dt design-system discovery (Cursor / Claude Desktop).
 *
 *   npm run ds:mcp
 *
 * Set DT_REPO_ROOT if cwd is not the repo root.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerDesignSystemMcpResources } from "../../nextjs-app/shared/lib/design-system-mcp/register-mcp-resources";
import { registerDesignSystemMcpTools } from "../../nextjs-app/shared/lib/design-system-mcp/register-mcp-tools";

const server = new McpServer(
  {
    name: "digitaltableteur-design-system",
    version: "1.0.0",
  },
  {
    instructions:
      "Design-system MCP for Digitaltableteur @dt/* components. Run npm run build:tokens before tools if manifest is missing.",
  },
);

registerDesignSystemMcpTools(server);
registerDesignSystemMcpResources(server);

const transport = new StdioServerTransport();
await server.connect(transport);
