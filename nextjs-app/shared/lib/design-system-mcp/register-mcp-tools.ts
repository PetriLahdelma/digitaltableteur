import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import {
  executeFindComponentForIntent,
  executeGetComponentContract,
  executeGetTokens,
  executeListComponents,
  executeSuggestPatternForLayout,
  executeValidateComponentUsage,
} from "./executors";

const READ_ONLY = { readOnlyHint: true } as const;

type UntypedToolServer = {
  tool: (
    name: string,
    description: string,
    schema: Record<string, never>,
    annotations: typeof READ_ONLY,
    handler: (args: Record<string, unknown>) => {
      content: [{ type: "text"; text: string }];
      isError?: boolean;
    },
  ) => void;
};

function bindToolServer(server: McpServer): UntypedToolServer {
  return server as unknown as UntypedToolServer;
}

/** Register design-system discovery tools on an MCP server instance. */
export function registerDesignSystemMcpTools(server: McpServer): number {
  const tools = bindToolServer(server);
  const emptySchema = {} as Record<string, never>;

  tools.tool(
    "list_components",
    "List cataloged @dt components with status, import path, usage counts, and composesWith neighbors. Filter by status (stable|beta|alpha|all).",
    emptySchema,
    READ_ONLY,
    (args) =>
      executeListComponents({
        status: args.status != null ? String(args.status) : undefined,
        limit: args.limit != null ? Number(args.limit) : undefined,
      }),
  );

  tools.tool(
    "find_component_for_intent",
    "Rank @dt components for a free-text UI task (e.g. dismissible warning banner with action). Returns import, variants, composesWith, and validation commands.",
    emptySchema,
    READ_ONLY,
    (args) =>
      executeFindComponentForIntent({
        query: String(args.query ?? ""),
        limit: args.limit != null ? Number(args.limit) : undefined,
      }),
  );

  tools.tool(
    "suggest_pattern_for_layout",
    "Rank @dt layout patterns (CTASection, Header, HeroSection, …) for a page-level intent. Returns useWhen, avoidWhen, composesWith, and variantNotes — not a license to replace pattern chrome.",
    emptySchema,
    READ_ONLY,
    (args) =>
      executeSuggestPatternForLayout({
        query: String(args.query ?? ""),
        limit: args.limit != null ? Number(args.limit) : undefined,
      }),
  );

  tools.tool(
    "get_component_contract",
    "Get full contract + agent block + usage evidence for one cataloged component by name.",
    emptySchema,
    READ_ONLY,
    (args) => executeGetComponentContract({ name: String(args.name ?? "") }),
  );

  tools.tool(
    "get_tokens",
    "Get design token catalog summary and manifest token metadata (source: variables.css via build:tokens).",
    emptySchema,
    READ_ONLY,
    () => executeGetTokens(),
  );

  tools.tool(
    "validate_component_usage",
    "Check a repo-relative file path or code snippet for raw <button>, headings, or shadcn-ui imports that should be @dt/*.",
    emptySchema,
    READ_ONLY,
    (args) =>
      executeValidateComponentUsage({
        filePath: args.filePath != null ? String(args.filePath) : undefined,
        snippet: args.snippet != null ? String(args.snippet) : undefined,
      }),
  );

  return 6;
}
