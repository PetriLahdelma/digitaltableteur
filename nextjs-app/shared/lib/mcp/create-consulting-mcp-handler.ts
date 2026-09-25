import { createMcpHandler } from "mcp-handler";

import { registerConsultingMcpTools } from "@/nextjs-app/shared/lib/consulting-tools/register-mcp-tools";
import { registerDocsRegistryMcpTools } from "@/nextjs-app/shared/lib/design-system-mcp/docs-registry-tools";
import { registerPublicValidatorTool } from "@/nextjs-app/shared/lib/design-system-mcp/register-public-validator";
import { registerDesignSystemMcpResources } from "@/nextjs-app/shared/lib/design-system-mcp/register-mcp-resources";
import {
  MCP_CACHE_HINTS,
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

/**
 * One handler serves both protocol eras: 2026-07-28 natively (stateless,
 * per-request _meta envelope, server/discover, cache hints) and 2025-era
 * Streamable HTTP through the SDK's stateless fallback. Route paths are the
 * mount points themselves (mcp-handler 2 has no basePath).
 */
export function createConsultingMcpHandler() {
  const mcpHandler = createMcpHandler(
    (server) => {
      registerConsultingMcpTools(server);
      // Astryx roadmap 3.3: the public docs surface is two tools (search +
      // get) served from docs-registry.json, plus the hardened snippet-only
      // contract validator (frontier roadmap Phase 2). The other discovery
      // tools remain on the repo-internal stdio server (npm run ds:mcp).
      registerDocsRegistryMcpTools(server);
      registerPublicValidatorTool(server);
      registerDesignSystemMcpResources(server);
    },
    {
      serverInfo: {
        name: MCP_SERVER_NAME,
        version: MCP_SERVER_VERSION,
      },
      instructions: MCP_SERVER_DESCRIPTION,
      cacheHints: MCP_CACHE_HINTS,
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

  /**
   * Next.js answers HEAD with the GET handler when no HEAD export exists, and
   * the MCP handler then waits for a stream that never opens until
   * maxDuration (a 60 s 504 for uptime probes and link checkers).
   */
  function handleHeadRequest(): Response {
    return new Response(null, { status: 405, headers: { Allow: "GET, POST, DELETE" } });
  }

  return { handleMcpRequest, handleHeadRequest };
}
