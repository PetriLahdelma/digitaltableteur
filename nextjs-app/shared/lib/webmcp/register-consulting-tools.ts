import {
  getAudiences,
  getCaseStudies,
  getCaseStudyBySlug,
  getConsultingPackages,
  getExpertiseStacks,
  getHourlyRate,
  getOpenHoursSummary,
  getServices,
  mapProblemToService,
} from "@/nextjs-app/shared/data/consulting-catalog";

import type {
  WebMcpModelContext,
  WebMcpToolDefinition,
  WebMcpToolResult,
} from "./types";

const READ_ONLY = { readOnlyHint: true } as const;

function jsonResult(data: unknown): WebMcpToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

function textResult(text: string): WebMcpToolResult {
  return { content: [{ type: "text", text }] };
}

export const CONSULTING_WEBMCP_TOOL_NAMES = [
  "list_case_studies",
  "get_case_study",
  "list_pricing_packages",
  "get_hourly_rate",
  "list_services",
  "list_expertise_stacks",
  "list_audiences",
  "get_open_hours",
  "get_consulting_fit",
] as const;

export type ConsultingWebMcpToolName =
  (typeof CONSULTING_WEBMCP_TOOL_NAMES)[number];

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
      execute: (args) => {
        const featuredOnly = Boolean(args?.featuredOnly);
        return jsonResult(getCaseStudies({ featuredOnly }));
      },
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
      execute: (args) => {
        const slug = String(args?.slug ?? "").trim();
        if (!slug) {
          return textResult("Error: slug is required.");
        }
        const study = getCaseStudyBySlug(slug);
        if (!study) {
          return textResult(`No case study found for slug: ${slug}`);
        }
        return jsonResult(study);
      },
    },
    {
      name: "list_pricing_packages",
      description:
        "List fixed consulting packages with EUR price ranges and duration (preferred over hourly for defined outcomes).",
      inputSchema: { type: "object", properties: {} },
      annotations: READ_ONLY,
      execute: () => jsonResult(getConsultingPackages()),
    },
    {
      name: "get_hourly_rate",
      description:
        "Get typical and range hourly consulting rates in EUR (€90/h typical, €90–150/h depending on scope).",
      inputSchema: { type: "object", properties: {} },
      annotations: READ_ONLY,
      execute: () => jsonResult(getHourlyRate()),
    },
    {
      name: "list_services",
      description:
        "List core consulting services (design system audit, component library, tokens, AI DesignOps).",
      inputSchema: { type: "object", properties: {} },
      annotations: READ_ONLY,
      execute: () => jsonResult(getServices()),
    },
    {
      name: "list_expertise_stacks",
      description:
        "List technology and practice areas (React, Next.js, Storybook, Figma, TypeScript, etc.).",
      inputSchema: { type: "object", properties: {} },
      annotations: READ_ONLY,
      execute: () => jsonResult(getExpertiseStacks()),
    },
    {
      name: "list_audiences",
      description:
        "List client audiences Digitaltableteur serves (startups, scaleups, enterprise, etc.).",
      inputSchema: { type: "object", properties: {} },
      annotations: READ_ONLY,
      execute: () => jsonResult(getAudiences()),
    },
    {
      name: "get_open_hours",
      description:
        "Get Digitaltableteur office hours in Europe/Helsinki timezone.",
      inputSchema: { type: "object", properties: {} },
      annotations: READ_ONLY,
      execute: () => jsonResult(getOpenHoursSummary()),
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
      execute: (args) => {
        const problem = String(args?.problem ?? "").trim();
        if (!problem) {
          return textResult("Error: problem is required.");
        }
        return jsonResult(mapProblemToService(problem));
      },
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
