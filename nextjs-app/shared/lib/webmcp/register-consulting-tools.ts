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
} from "@/nextjs-app/shared/lib/consulting-tools/executors";

import type {
  WebMcpModelContext,
  WebMcpToolDefinition,
} from "./types";

const READ_ONLY = { readOnlyHint: true } as const;

export const CONSULTING_WEBMCP_TOOL_NAMES = CONSULTING_TOOL_NAMES;

export type ConsultingWebMcpToolName = (typeof CONSULTING_WEBMCP_TOOL_NAMES)[number];

export function buildConsultingWebMcpTools(): WebMcpToolDefinition[] {
  return [
    {
      name: "list_case_studies",
      description:
        "List Digitaltableteur portfolio case studies with slug, title, category, tags, and URLs.",
      inputSchema: {
        type: "object",
        properties: {
          featuredOnly: {
            type: "boolean",
            description: "If true, return only featured case studies.",
          },
        },
      },
      annotations: READ_ONLY,
      execute: (args) =>
        executeListCaseStudies({
          featuredOnly: Boolean(args?.featuredOnly),
        }),
    },
    {
      name: "get_case_study",
      description:
        "Get one case study by URL slug (e.g. dsharp-design-system, helsinki-design-system).",
      inputSchema: {
        type: "object",
        properties: {
          slug: { type: "string", description: "Case study slug from /work/{slug}" },
        },
        required: ["slug"],
      },
      annotations: READ_ONLY,
      execute: (args) => executeGetCaseStudy({ slug: String(args?.slug ?? "") }),
    },
    {
      name: "list_pricing_packages",
      description:
        "List fixed consulting packages with EUR price ranges and duration (preferred over hourly for defined outcomes).",
      inputSchema: { type: "object", properties: {} },
      annotations: READ_ONLY,
      execute: () => executeListPricingPackages(),
    },
    {
      name: "get_hourly_rate",
      description:
        "Get typical and range hourly consulting rates in EUR (€90/h typical, €90–150/h depending on scope).",
      inputSchema: { type: "object", properties: {} },
      annotations: READ_ONLY,
      execute: () => executeGetHourlyRate(),
    },
    {
      name: "list_services",
      description:
        "List core consulting services (design system audit, component library, tokens, AI DesignOps).",
      inputSchema: { type: "object", properties: {} },
      annotations: READ_ONLY,
      execute: () => executeListServices(),
    },
    {
      name: "list_expertise_stacks",
      description:
        "List technology and practice areas (React, Next.js, Storybook, Figma, TypeScript, etc.).",
      inputSchema: { type: "object", properties: {} },
      annotations: READ_ONLY,
      execute: () => executeListExpertiseStacks(),
    },
    {
      name: "list_audiences",
      description:
        "List client audiences Digitaltableteur serves (startups, scaleups, enterprise, etc.).",
      inputSchema: { type: "object", properties: {} },
      annotations: READ_ONLY,
      execute: () => executeListAudiences(),
    },
    {
      name: "get_open_hours",
      description:
        "Get Digitaltableteur office hours in Europe/Helsinki timezone.",
      inputSchema: { type: "object", properties: {} },
      annotations: READ_ONLY,
      execute: () => executeGetOpenHours(),
    },
    {
      name: "get_consulting_fit",
      description:
        "Map a visitor problem statement to the best-matching consulting service.",
      inputSchema: {
        type: "object",
        properties: {
          problem: {
            type: "string",
            description: "Short description of the visitor need or pain point.",
          },
        },
        required: ["problem"],
      },
      annotations: READ_ONLY,
      execute: (args) =>
        executeGetConsultingFit({ problem: String(args?.problem ?? "") }),
    },
  ];
}

/** Register all consulting WebMCP tools; returns count registered. */
export function registerConsultingWebMcpTools(
  modelContext: WebMcpModelContext,
  signal?: AbortSignal,
): number {
  const tools = buildConsultingWebMcpTools();
  for (const tool of tools) {
    modelContext.registerTool(tool, signal ? { signal } : undefined);
  }
  return tools.length;
}
