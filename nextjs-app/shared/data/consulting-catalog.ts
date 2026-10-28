/**
 * Structured consulting data for WebMCP tools, agent cards, and future API surfaces.
 * English canonical copy — UI pages may localize via i18n keys separately.
 */

import { getEngagementEntries } from "@/app/lib/engagementCatalog";
import { getPseoCatalog } from "@/lib/pseo/catalog";
import { WEEKLY_HOURS } from "@/nextjs-app/shared/data/openHours";
import {
  DURATION_OPTIONS,
  STANDARD_RATE,
} from "@/nextjs-app/shared/patterns/PricingCalculator/pricingMath";
import {
  isRoutableProject,
  projects,
  type Project,
  projectDuration,
} from "@/nextjs-app/shared/data/projects";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.digitaltableteur.com";

/**
 * How an offer is priced, read from its visible price: a range for a fixed
 * scope, a rate per hour or month, or a quote.
 */
export type PricingModel = "fixed_scope" | "hourly" | "monthly" | "quoted";

export interface ConsultingPackage {
  /** The package id the contact form and `?package=` links use. */
  id: string;
  name: string;
  /** The price exactly as the pricing page shows it. */
  priceRangeEur: string;
  duration: string;
  description: string;
  pricingModel: PricingModel;
  url: string;
}

export interface HourlyRate {
  standardEur: number;
  partnershipEur: number;
  partnershipConditions: string;
  currency: "EUR";
  unit: "hour";
  vat: "excluded";
  note: string;
}

export interface CaseStudySummary {
  slug: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  client?: string;
  duration?: string;
  featured?: boolean;
  url: string;
}

export interface ServiceSummary {
  slug: string;
  name: string;
  description: string;
}

export interface ConsultingFitResult {
  service: ServiceSummary;
  confidence: "high" | "medium";
  rationale: string;
}

const PARTNERSHIP_DISCOUNT =
  DURATION_OPTIONS.find((option) => option.partnership)?.discount ?? 0;

/**
 * The pricing calculator's rates (pricingMath.ts), so agents quote what the
 * pricing page shows.
 */
export const HOURLY_RATE: HourlyRate = {
  standardEur: STANDARD_RATE,
  partnershipEur: STANDARD_RATE * (1 - PARTNERSHIP_DISCOUNT),
  partnershipConditions:
    "6- or 12-month engagements at 4 or more days a week (75% or more of a week).",
  currency: "EUR",
  unit: "hour",
  vat: "excluded",
  note: "Packages are estimates for a fixed scope, workshops are quoted and every price is confirmed in a written proposal. Prices exclude Finnish VAT.",
};

function pricingModelOf(price: ReturnType<typeof getEngagementEntries>[number]["price"]): PricingModel {
  if (!price) return "quoted";
  if (price.unitCode === "HUR") return "hourly";
  if (price.unitCode === "MON") return "monthly";
  return "fixed_scope";
}

/**
 * Every offer on the pricing and engagement pages, from the same source
 * (app/lib/engagementCatalog), so agents and visitors see the same offers.
 */
export const CONSULTING_PACKAGES: ConsultingPackage[] = getEngagementEntries().map(
  (entry) => ({
    id: entry.config.packageId,
    name: entry.name,
    priceRangeEur: entry.priceLabel,
    duration: entry.durationLabel,
    description: entry.copy.metaDescription,
    pricingModel: pricingModelOf(entry.price),
    url: `${baseUrl}${entry.path}`,
  }),
);

const SERVICE_KEYWORDS: Array<{
  serviceSlug: string;
  keywords: string[];
}> = [
  {
    serviceSlug: "design-system-audit",
    keywords: [
      "audit",
      "assess",
      "inconsistent",
      "gap",
      "roadmap",
      "review",
      "health",
    ],
  },
  {
    serviceSlug: "component-library-build",
    keywords: [
      "component library",
      "storybook",
      "components",
      "library build",
      "from scratch",
    ],
  },
  {
    serviceSlug: "design-tokens-setup",
    keywords: [
      "token",
      "theming",
      "theme",
      "dark mode",
      "brand consistency",
      "variables",
    ],
  },
  {
    serviceSlug: "ai-designops-automation",
    keywords: [
      "automate",
      "ai",
      "designops",
      "scaling design",
      "design debt",
      "workflow",
      "agent",
    ],
  },
];

function toCaseStudySummary(project: Project): CaseStudySummary {
  return {
    slug: project.slug,
    title: project.title,
    description: project.description,
    category: project.category,
    tags: project.tags,
    client: project.client,
    duration: projectDuration(project),
    featured: project.featured,
    url: `${baseUrl}/work/${project.slug}`,
  };
}

export function getCaseStudies(options?: {
  featuredOnly?: boolean;
}): CaseStudySummary[] {
  // Every summary carries a /work URL, so teasers without a page stay out.
  let list = projects
    .filter(isRoutableProject)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  if (options?.featuredOnly) {
    list = list.filter((p) => p.featured);
  }
  return list.map(toCaseStudySummary);
}

export function getCaseStudyBySlug(slug: string): CaseStudySummary | undefined {
  const project = projects.find((p) => p.slug === slug);
  return isRoutableProject(project) ? toCaseStudySummary(project) : undefined;
}

export function getConsultingPackages(): ConsultingPackage[] {
  return CONSULTING_PACKAGES;
}

export function getHourlyRate(): HourlyRate {
  return HOURLY_RATE;
}

export function getServices(): ServiceSummary[] {
  return getPseoCatalog().services.map((s) => ({
    slug: s.slug,
    name: s.name,
    description: s.shortDescription,
  }));
}

export function getExpertiseStacks(): ServiceSummary[] {
  return getPseoCatalog().stacks.map((s) => ({
    slug: s.slug,
    name: s.name,
    description: s.shortDescription,
  }));
}

export function getAudiences(): ServiceSummary[] {
  return getPseoCatalog().audiences.map((s) => ({
    slug: s.slug,
    name: s.name,
    description: s.shortDescription,
  }));
}

export function getOpenHoursSummary(): {
  timezone: string;
  schedule: typeof WEEKLY_HOURS;
  summary: string;
} {
  return {
    timezone: "Europe/Helsinki",
    schedule: WEEKLY_HOURS,
    summary: "Monday–Friday 09:00–17:00 (Europe/Helsinki). Weekends closed.",
  };
}

export function mapProblemToService(problem: string): ConsultingFitResult {
  const normalized = problem.toLowerCase();
  const services = getServices();

  for (const { serviceSlug, keywords } of SERVICE_KEYWORDS) {
    if (keywords.some((kw) => normalized.includes(kw))) {
      const service = services.find((s) => s.slug === serviceSlug);
      if (service) {
        return {
          service,
          confidence: "high",
          rationale: `Matched keywords for ${service.name}.`,
        };
      }
    }
  }

  const fallback =
    services.find((s) => s.slug === "design-system-audit") ?? services[0];

  return {
    service: fallback,
    confidence: "medium",
    rationale:
      "No strong keyword match — defaulting to design system audit. Ask whether they are starting fresh or improving an existing system.",
  };
}

export function getConsultingCatalogBaseUrl(): string {
  return baseUrl;
}
