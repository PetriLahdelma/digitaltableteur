import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import {
  CONSULTING_TOOL_NAMES,
  executeGetCaseStudy,
  executeGetConsultingFit,
  executeGetHourlyRate,
  executeGetOpenHours,
  executeListAudiences,
  executeListCaseStudies,
  executeListExpertiseStacks,
  executeListPricingPackages,
  executeListServices,
  type ConsultingToolTextResult,
} from "./executors";

const READ_ONLY = { readOnlyHint: true } as const;

type UntypedToolServer = {
  tool: (
    name: string,
    description: string,
    schema: Record<string, never>,
    annotations: typeof READ_ONLY,
    handler: (args: Record<string, unknown>) => ConsultingToolTextResult,
  ) => void;
};

function bindToolServer(server: McpServer): UntypedToolServer {
  return server as unknown as UntypedToolServer;
}

/** Register read-only consulting tools on an MCP server instance. */
export function registerConsultingMcpTools(server: McpServer): number {
  const tools = bindToolServer(server);
  const emptySchema = {} as Record<string, never>;

  tools.tool(
    "list_case_studies",
    "List Digitaltableteur portfolio case studies with slug, title, category, tags, and URLs.",
    emptySchema,
    READ_ONLY,
    (args) =>
      executeListCaseStudies({
        featuredOnly: Boolean(args.featuredOnly),
      }),
  );

  tools.tool(
    "get_case_study",
    "Get one case study by URL slug (e.g. dsharp-design-system, helsinki-design-system).",
    emptySchema,
    READ_ONLY,
    (args) => executeGetCaseStudy({ slug: String(args.slug ?? "") }),
  );

  tools.tool(
    "list_pricing_packages",
    "List fixed consulting packages with EUR price ranges and duration (preferred over hourly for defined outcomes).",
    emptySchema,
    READ_ONLY,
    () => executeListPricingPackages(),
  );

  tools.tool(
    "get_hourly_rate",
    "Get typical and range hourly consulting rates in EUR (€90/h typical, €90–150/h depending on scope).",
    emptySchema,
    READ_ONLY,
    () => executeGetHourlyRate(),
  );

  tools.tool(
    "list_services",
    "List core consulting services (design system audit, component library, tokens, AI DesignOps).",
    emptySchema,
    READ_ONLY,
    () => executeListServices(),
  );

  tools.tool(
    "list_expertise_stacks",
    "List technology and practice areas (React, Next.js, Storybook, Figma, TypeScript, etc.).",
    emptySchema,
    READ_ONLY,
    () => executeListExpertiseStacks(),
  );

  tools.tool(
    "list_audiences",
    "List client audiences Digitaltableteur serves (startups, scaleups, enterprise, etc.).",
    emptySchema,
    READ_ONLY,
    () => executeListAudiences(),
  );

  tools.tool(
    "get_open_hours",
    "Get Digitaltableteur office hours in Europe/Helsinki timezone.",
    emptySchema,
    READ_ONLY,
    () => executeGetOpenHours(),
  );

  tools.tool(
    "get_consulting_fit",
    "Map a visitor problem statement to the best-matching consulting service.",
    emptySchema,
    READ_ONLY,
    (args) => executeGetConsultingFit({ problem: String(args.problem ?? "") }),
  );

  return CONSULTING_TOOL_NAMES.length;
}
