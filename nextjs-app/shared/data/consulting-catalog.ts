/**
 * Structured consulting data for WebMCP tools, agent cards, and future API surfaces.
 * English canonical copy — UI pages may localize via i18n keys separately.
 */

import { getPseoCatalog } from "@/lib/pseo/catalog";
import { WEEKLY_HOURS } from "@/nextjs-app/shared/data/openHours";
import { projects, type Project } from "@/nextjs-app/shared/data/projects";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.digitaltableteur.com";

export interface ConsultingPackage {
  id: string;
  name: string;
  priceRangeEur: string;
  duration: string;
  description: string;
  pricingModel: "fixed_package";
}

export interface HourlyRate {
  typicalEur: number;
  rangeEur: { min: number; max: number };
  currency: "EUR";
  unit: "hour";
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

export const HOURLY_RATE: HourlyRate = {
  typicalEur: 90,
  rangeEur: { min: 90, max: 150 },
  currency: "EUR",
  unit: "hour",
  note:
    "Typical rate is €90/h. Complex or urgent engagements may be quoted up to €150/h. Fixed packages are usually preferred for defined outcomes.",
};

export const CONSULTING_PACKAGES: ConsultingPackage[] = [
  {
    id: "ux-sprint",
    name: "UX Sprint",
    priceRangeEur: "€8–14k",
    duration: "2 weeks",
    description:
      "Prototype, eval plan and handoff your team can ship.",
    pricingModel: "fixed_package",
  },
  {
    id: "ai-ready-designops",
    name: "AI-Ready Ops",
    priceRangeEur: "€11–17k",
    duration: "3 weeks",
    description:
      "Design workflow setup, component governance, AI tooling hooks and a DesignOps playbook your team can run.",
    pricingModel: "fixed_package",
  },
  {
    id: "design-system-lift-off",
    name: "Design System Lift-Off",
    priceRangeEur: "€14–20k",
    duration: "4 weeks",
    description:
      "Audit, tokens, core components, Storybook and an adoption playbook.",
    pricingModel: "fixed_package",
  },
];

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
    duration: project.duration,
    featured: project.featured,
    url: `${baseUrl}/work/${project.slug}`,
  };
}

export function getCaseStudies(options?: {
  featuredOnly?: boolean;
}): CaseStudySummary[] {
  let list = [...projects].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999),
  );
  if (options?.featuredOnly) {
    list = list.filter((p) => p.featured);
  }
  return list.map(toCaseStudySummary);
}

export function getCaseStudyBySlug(
  slug: string,
): CaseStudySummary | undefined {
  const project = projects.find((p) => p.slug === slug);
  return project ? toCaseStudySummary(project) : undefined;
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
