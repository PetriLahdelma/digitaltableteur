import type { McpServer } from "@modelcontextprotocol/server";
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
 * Tools that take arguments MUST declare a real zod object: the SDK parses
 * arguments against it, and an empty shape STRIPS every argument before the
 * handler sees it (see docs-registry-tools.ts, which learned this the hard
 * way). Argument-less tools declare no input schema.
 */
export function registerConsultingMcpTools(server: McpServer): number {
  server.registerTool(
    "list_case_studies",
    {
      description: "List Digitaltableteur portfolio case studies with slug, title, category, tags, and URLs.",
      inputSchema: z.object({
        featuredOnly: z
          .boolean()
          .optional()
          .describe("Only return featured case studies (default false)"),
      }),
      annotations: READ_ONLY,
    },
    async (args) => executeListCaseStudies(args),
  );

  server.registerTool(
    "get_case_study",
    {
      description: "Get one case study by URL slug (e.g. dsharp-design-system, helsinki-design-system).",
      inputSchema: z.object({
        slug: z
          .string()
          .describe(
            "Case study URL slug from list_case_studies, e.g. \"dsharp-design-system\"",
          ),
      }),
      annotations: READ_ONLY,
    },
    async (args) => executeGetCaseStudy(args),
  );

  server.registerTool(
    "list_pricing_packages",
    {
      description: "List fixed consulting packages with EUR price ranges and duration (preferred over hourly for defined outcomes).",
      annotations: READ_ONLY,
    },
    async () => executeListPricingPackages(),
  );

  server.registerTool(
    "get_hourly_rate",
    {
      description: "Get typical and range hourly consulting rates in EUR (€90/h typical, €90–150/h depending on scope).",
      annotations: READ_ONLY,
    },
    async () => executeGetHourlyRate(),
  );

  server.registerTool(
    "list_services",
    {
      description: "List core consulting services (design system audit, component library, tokens, AI DesignOps).",
      annotations: READ_ONLY,
    },
    async () => executeListServices(),
  );

  server.registerTool(
    "list_expertise_stacks",
    {
      description: "List technology and practice areas (React, Next.js, Storybook, Figma, TypeScript, etc.).",
      annotations: READ_ONLY,
    },
    async () => executeListExpertiseStacks(),
  );

  server.registerTool(
    "list_audiences",
    {
      description: "List client audiences Digitaltableteur serves (startups, scaleups, enterprise, etc.).",
      annotations: READ_ONLY,
    },
    async () => executeListAudiences(),
  );

  server.registerTool(
    "get_open_hours",
    {
      description: "Get Digitaltableteur office hours in Europe/Helsinki timezone.",
      annotations: READ_ONLY,
    },
    async () => executeGetOpenHours(),
  );

  server.registerTool(
    "get_consulting_fit",
    {
      description: "Map a visitor problem statement to the best-matching consulting service.",
      inputSchema: z.object({
        problem: z
          .string()
          .describe(
            "The visitor's problem statement, e.g. \"our design system has drifted from the product\"",
          ),
      }),
      annotations: READ_ONLY,
    },
    async (args) => executeGetConsultingFit(args),
  );

  return CONSULTING_TOOL_NAMES.length;
}
