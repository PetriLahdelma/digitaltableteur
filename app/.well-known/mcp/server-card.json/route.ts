import { NextResponse } from "next/server";

import { agentDiscoveryBaseUrl } from "@/app/lib/agent-discovery";
import { CONSULTING_TOOL_NAMES } from "@/nextjs-app/shared/lib/consulting-tools/executors";
import { DESIGN_SYSTEM_TOOL_NAMES } from "@/nextjs-app/shared/lib/design-system-mcp/executors";
import {
  MCP_SERVER_DESCRIPTION,
  MCP_SERVER_NAME,
  MCP_SERVER_VERSION,
} from "@/nextjs-app/shared/lib/mcp/constants";

export const dynamic = "force-static";

export async function GET() {
  const baseUrl = agentDiscoveryBaseUrl;

  const serverCard = {
    serverInfo: {
      name: MCP_SERVER_NAME,
      version: MCP_SERVER_VERSION,
    },
    description: MCP_SERVER_DESCRIPTION,
    url: `${baseUrl}/mcp`,
    transport: {
      type: "streamable-http",
    },
    capabilities: {
      tools: true,
      resources: true,
    },
    tools: [...CONSULTING_TOOL_NAMES, ...DESIGN_SYSTEM_TOOL_NAMES],
    resources: [
      "digitaltableteur://design-system/manifest/summary",
      "digitaltableteur://design-system/tokens/summary",
      "digitaltableteur://design-system/import-policy",
    ],
    authentication: {
      required: false,
      documentation: `${baseUrl}/auth.md`,
    },
  };

  return NextResponse.json(serverCard, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
