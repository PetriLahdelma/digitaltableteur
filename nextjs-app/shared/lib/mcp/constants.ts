export const MCP_SERVER_NAME = "digitaltableteur-consulting";
export const MCP_SERVER_VERSION = "2.0.0";

export const MCP_SERVER_DESCRIPTION =
  "Read-only Digitaltableteur discovery: consulting (case studies, pricing, services) and design system (@dt components, tokens, intent search, usage validation). Regenerate agent artifacts with npm run build:tokens.";

/**
 * 2026-07-28 cache hints. Tool lists, discovery and resources change only on
 * deploy (they are built from committed contracts), so shared caches may keep
 * them for an hour. Without hints the SDK emits ttlMs 0 / private.
 */
export const MCP_CACHE_HINTS = {
  "tools/list": { ttlMs: 3_600_000, cacheScope: "public" },
  "resources/list": { ttlMs: 3_600_000, cacheScope: "public" },
  "resources/read": { ttlMs: 3_600_000, cacheScope: "public" },
  "server/discover": { ttlMs: 3_600_000, cacheScope: "public" },
} as const;
