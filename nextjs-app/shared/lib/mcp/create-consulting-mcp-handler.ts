import { createMcpHandler } from "mcp-handler";

import { registerConsultingMcpTools } from "@/nextjs-app/shared/lib/consulting-tools/register-mcp-tools";
import { registerDesignSystemMcpResources } from "@/nextjs-app/shared/lib/design-system-mcp/register-mcp-resources";
import { registerDesignSystemMcpTools } from "@/nextjs-app/shared/lib/design-system-mcp/register-mcp-tools";
import {
  MCP_SERVER_DESCRIPTION,
  MCP_SERVER_NAME,
  MCP_SERVER_VERSION,
} from "@/nextjs-app/shared/lib/mcp/constants";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;
const buckets = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return false;
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    return true;
  }
  bucket.count += 1;
  return false;
}

function clientKey(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function createConsultingMcpHandler(options: { basePath: string }) {
  const mcpHandler = createMcpHandler(
    (server) => {
      registerConsultingMcpTools(server);
      registerDesignSystemMcpTools(server);
      registerDesignSystemMcpResources(server);
    },
    {
      serverInfo: {
        name: MCP_SERVER_NAME,
        version: MCP_SERVER_VERSION,
      },
      instructions: MCP_SERVER_DESCRIPTION,
    },
    {
      basePath: options.basePath,
      disableSse: true,
      maxDuration: 60,
      verboseLogs: process.env.NODE_ENV === "development",
    },
  );

  async function handleMcpRequest(request: Request): Promise<Response> {
    if (isRateLimited(clientKey(request))) {
      return new Response("Too Many Requests", {
        status: 429,
        headers: { "Retry-After": "60" },
      });
    }

    return mcpHandler(request);
  }

  return { handleMcpRequest };
}
