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

export const CONSULTING_TOOL_NAMES = [
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

export type ConsultingToolName = (typeof CONSULTING_TOOL_NAMES)[number];

export interface ConsultingToolTextResult {
  // Index signature required by the MCP SDK's CallToolResult shape.
  [key: string]: unknown;
  content: [{ type: "text"; text: string }];
  isError?: boolean;
}

export function consultingJsonResult(data: unknown): ConsultingToolTextResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

export function consultingTextResult(
  text: string,
  isError = false,
): ConsultingToolTextResult {
  return {
    content: [{ type: "text", text }],
    ...(isError ? { isError: true } : {}),
  };
}

export function executeListCaseStudies(args?: {
  featuredOnly?: boolean;
}): ConsultingToolTextResult {
  return consultingJsonResult(
    getCaseStudies({ featuredOnly: Boolean(args?.featuredOnly) }),
  );
}

export function executeGetCaseStudy(args?: {
  slug?: string;
}): ConsultingToolTextResult {
  const slug = String(args?.slug ?? "").trim();
  if (!slug) {
    return consultingTextResult("Error: slug is required.", true);
  }
  const study = getCaseStudyBySlug(slug);
  if (!study) {
    return consultingTextResult(`No case study found for slug: ${slug}`, true);
  }
  return consultingJsonResult(study);
}

export function executeListPricingPackages(): ConsultingToolTextResult {
  return consultingJsonResult(getConsultingPackages());
}

export function executeGetHourlyRate(): ConsultingToolTextResult {
  return consultingJsonResult(getHourlyRate());
}

export function executeListServices(): ConsultingToolTextResult {
  return consultingJsonResult(getServices());
}

export function executeListExpertiseStacks(): ConsultingToolTextResult {
  return consultingJsonResult(getExpertiseStacks());
}

export function executeListAudiences(): ConsultingToolTextResult {
  return consultingJsonResult(getAudiences());
}

export function executeGetOpenHours(): ConsultingToolTextResult {
  return consultingJsonResult(getOpenHoursSummary());
}

export function executeGetConsultingFit(args?: {
  problem?: string;
}): ConsultingToolTextResult {
  const problem = String(args?.problem ?? "").trim();
  if (!problem) {
    return consultingTextResult("Error: problem is required.", true);
  }
  return consultingJsonResult(mapProblemToService(problem));
}
