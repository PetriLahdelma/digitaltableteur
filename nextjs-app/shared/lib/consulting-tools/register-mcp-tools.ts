import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

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
} from "./executors";

const READ_ONLY = { readOnlyHint: true } as const;

/**
 * Register read-only consulting tools on an MCP server instance.
 *
 * Tools that take arguments MUST declare real zod shapes: the SDK parses
 * arguments against the shape, and an empty shape STRIPS every argument
 * before the handler sees it (see docs-registry-tools.ts, which learned
 * this the hard way). Argument-less tools keep an empty shape.
 */
export function registerConsultingMcpTools(server: McpServer): number {
  server.tool(
    "list_case_studies",
    "List Digitaltableteur portfolio case studies with slug, title, category, tags, and URLs.",
    {
      featuredOnly: z
        .boolean()
        .optional()
        .describe("Only return featured case studies (default false)"),
    },
    READ_ONLY,
    async (args) => executeListCaseStudies(args),
  );

  server.tool(
    "get_case_study",
    "Get one case study by URL slug (e.g. dsharp-design-system, helsinki-design-system).",
    {
      slug: z
        .string()
        .describe(
          "Case study URL slug from list_case_studies, e.g. \"dsharp-design-system\"",
        ),
    },
    READ_ONLY,
    async (args) => executeGetCaseStudy(args),
  );

  server.tool(
    "list_pricing_packages",
    "List fixed consulting packages with EUR price ranges and duration (preferred over hourly for defined outcomes).",
    {},
    READ_ONLY,
    async () => executeListPricingPackages(),
  );

  server.tool(
    "get_hourly_rate",
    "Get typical and range hourly consulting rates in EUR (€90/h typical, €90–150/h depending on scope).",
    {},
    READ_ONLY,
    async () => executeGetHourlyRate(),
  );

  server.tool(
    "list_services",
    "List core consulting services (design system audit, component library, tokens, AI DesignOps).",
    {},
    READ_ONLY,
    async () => executeListServices(),
  );

  server.tool(
    "list_expertise_stacks",
    "List technology and practice areas (React, Next.js, Storybook, Figma, TypeScript, etc.).",
    {},
    READ_ONLY,
    async () => executeListExpertiseStacks(),
  );

  server.tool(
    "list_audiences",
    "List client audiences Digitaltableteur serves (startups, scaleups, enterprise, etc.).",
    {},
    READ_ONLY,
    async () => executeListAudiences(),
  );

  server.tool(
    "get_open_hours",
    "Get Digitaltableteur office hours in Europe/Helsinki timezone.",
    {},
    READ_ONLY,
    async () => executeGetOpenHours(),
  );

  server.tool(
    "get_consulting_fit",
    "Map a visitor problem statement to the best-matching consulting service.",
    {
      problem: z
        .string()
        .describe(
          "The visitor's problem statement, e.g. \"our design system has drifted from the product\"",
        ),
    },
    READ_ONLY,
    async (args) => executeGetConsultingFit(args),
  );

  return CONSULTING_TOOL_NAMES.length;
}
