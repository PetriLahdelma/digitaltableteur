import { describe, expect, it } from "vitest";

import {
  MCP_SERVER_DESCRIPTION,
  MCP_SERVER_NAME,
  MCP_SERVER_VERSION,
} from "@/nextjs-app/shared/lib/mcp/constants";
import { CONSULTING_TOOL_NAMES } from "@/nextjs-app/shared/lib/consulting-tools/executors";
import { DESIGN_SYSTEM_TOOL_NAMES } from "@/nextjs-app/shared/lib/design-system-mcp/executors";

describe("MCP server card shape", () => {
  it("matches isitagentready discovery fields", () => {
    const baseUrl = "https://www.digitaltableteur.com";
    const card = {
      serverInfo: {
        name: MCP_SERVER_NAME,
        version: MCP_SERVER_VERSION,
      },
      description: MCP_SERVER_DESCRIPTION,
      url: `${baseUrl}/mcp`,
      transport: { type: "streamable-http" },
      capabilities: { tools: true, resources: true },
      tools: [...CONSULTING_TOOL_NAMES, ...DESIGN_SYSTEM_TOOL_NAMES],
      authentication: {
        required: false,
        documentation: `${baseUrl}/auth.md`,
      },
    };

    expect(card.serverInfo.name).toBeTruthy();
    expect(card.serverInfo.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(card.url).toContain("/mcp");
    expect(card.capabilities.tools).toBe(true);
    expect(card.tools).toEqual([
      ...CONSULTING_TOOL_NAMES,
      ...DESIGN_SYSTEM_TOOL_NAMES,
    ]);
  });
});
