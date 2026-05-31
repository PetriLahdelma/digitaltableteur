import {
  getConsultingPackages,
  mapProblemToService,
  type ConsultingPackage,
  type ConsultingFitResult,
} from "@/nextjs-app/shared/data/consulting-catalog";
import { projects, type Project } from "@/nextjs-app/shared/data/projects";
import { DONNY_PACKAGE_PROJECT_TYPE } from "@/nextjs-app/shared/components/DonnyActionProvider/donnyContactPrefill";

export type DonnyLeadPersona = "client" | "recruiter" | "other";

export interface DonnyLeadProjectCard {
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  category: string;
  tags: string[];
  client?: string;
  duration?: string;
  liveUrl?: string;
  url: string;
}

export interface DonnyLeadQualification {
  need?: string;
  budget?: string;
  timeline?: string;
  company?: string;
  role?: string;
}

export const LEAD_PERSONA_CASE_SLUGS: Record<DonnyLeadPersona, string[]> = {
  client: ["dsharp-design-system", "project-spine", "sap-build-apps"],
  recruiter: [
    "sap-build-apps",
    "helsinki-design-system",
    "dsharp-design-system",
    "project-spine",
  ],
  other: ["dsharp-design-system", "project-spine"],
};

const SERVICE_TO_PACKAGE: Record<string, string> = {
  "design-system-audit": "design-system-lift-off",
  "component-library-build": "ux-sprint",
  "design-tokens-setup": "design-system-lift-off",
  "ai-designops-automation": "ai-ready-designops",
};

const BUDGET_PACKAGE_HINTS: Array<{ pattern: RegExp; packageId: string }> = [
  { pattern: /\b(?:8|9|10|11|12|13|14)\s*k\b/i, packageId: "ux-sprint" },
  { pattern: /\bsmall\b|\btight\b|\bquick\b|\bsprint\b/i, packageId: "ux-sprint" },
  {
    pattern: /\b(?:15|16|17|18|19|20)\s*k\b/i,
    packageId: "design-system-lift-off",
  },
  {
    pattern: /\bai\b|\bautomation\b|\bdesignops\b|\bagent\b/i,
    packageId: "ai-ready-designops",
  },
  {
    pattern: /\baudit\b|\btokens?\b|\bsystem\b|\blift[- ]?off\b/i,
    packageId: "design-system-lift-off",
  },
];

function toProjectCard(project: Project): DonnyLeadProjectCard {
  return {
    title: project.title,
    slug: project.slug,
    description: project.description || "",
    thumbnail: project.thumbnail,
    category: project.category.replace("-", " "),
    tags: project.tags,
    client: project.client,
    duration: project.duration,
    liveUrl: project.liveUrl,
    url: `/work/${project.slug}`,
  };
}

export function resolveLeadPersona(
  value: string | undefined,
): DonnyLeadPersona {
  const normalized = (value ?? "").trim().toLowerCase();
  if (
    normalized === "recruiter" ||
    normalized.includes("recruit") ||
    normalized.includes("hiring") ||
    normalized.includes("talent")
  ) {
    return "recruiter";
  }
  if (
    normalized === "client" ||
    normalized.includes("client") ||
    normalized.includes("project") ||
    normalized.includes("buy") ||
    normalized.includes("engage")
  ) {
    return "client";
  }
  return "other";
}

export function getLeadCaseStudies(input?: {
  persona?: string;
  query?: string;
  limit?: number;
}): {
  persona: DonnyLeadPersona;
  projects: DonnyLeadProjectCard[];
  totalMatches: number;
} {
  const persona = resolveLeadPersona(input?.persona);
  const preferredSlugs = LEAD_PERSONA_CASE_SLUGS[persona];
  const limit = Math.max(1, Math.min(input?.limit ?? 3, 6));
  const query = input?.query?.trim().toLowerCase();

  let ordered: Project[] = preferredSlugs
    .map((slug) => projects.find((project) => project.slug === slug))
    .filter((project): project is Project => Boolean(project));

  if (query) {
    ordered = [...projects].filter(
      (project) =>
        project.title.toLowerCase().includes(query) ||
        (project.description?.toLowerCase().includes(query) ?? false) ||
        project.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        (project.client?.toLowerCase().includes(query) ?? false),
    );
  }

  const totalMatches = ordered.length;
  return {
    persona,
    projects: ordered.slice(0, limit).map(toProjectCard),
    totalMatches,
  };
}

export function recommendLeadPackage(input?: {
  problem?: string;
  budget?: string;
}): {
  packages: ConsultingPackage[];
  recommendedPackageId?: string;
  fit?: ConsultingFitResult;
} {
  const packages = getConsultingPackages();
  const problem = [input?.problem, input?.budget].filter(Boolean).join(" ").trim();
  let recommendedPackageId: string | undefined;

  if (problem) {
    const fit = mapProblemToService(problem);
    recommendedPackageId = SERVICE_TO_PACKAGE[fit.service.slug];

    for (const hint of BUDGET_PACKAGE_HINTS) {
      if (hint.pattern.test(problem)) {
        recommendedPackageId = hint.packageId;
        break;
      }
    }

    return {
      packages,
      recommendedPackageId,
      fit,
    };
  }

  return { packages };
}

export function buildLeadContactPrefill(input: {
  persona: DonnyLeadPersona;
  qualification: DonnyLeadQualification;
  recommendedPackageId?: string;
  summary?: string;
}): {
  projectType?: string;
  message: string;
  packageId?: string;
} {
  const lines = [
    input.summary?.trim(),
    input.qualification.need ? `Need: ${input.qualification.need}` : null,
    input.qualification.timeline
      ? `Timeline: ${input.qualification.timeline}`
      : null,
    input.qualification.budget ? `Budget: ${input.qualification.budget}` : null,
    input.qualification.company ? `Company: ${input.qualification.company}` : null,
    input.qualification.role ? `Role context: ${input.qualification.role}` : null,
    `Persona: ${input.persona}`,
  ].filter(Boolean);

  const packageId = input.recommendedPackageId;
  const projectType = packageId
    ? DONNY_PACKAGE_PROJECT_TYPE[packageId]
    : undefined;

  return {
    projectType,
    message: lines.join("\n"),
    packageId,
  };
}

export function draftLeadFollowUp(input: {
  persona: DonnyLeadPersona;
  recipientName?: string;
  need?: string;
  recommendedPackageId?: string;
  caseSlugs?: string[];
}): {
  subject: string;
  body: string;
  disclaimer: string;
  contactUrl: string;
} {
  const name = input.recipientName?.trim() || "there";
  const packages = getConsultingPackages();
  const pkg = packages.find((entry) => entry.id === input.recommendedPackageId);
  const caseTitles = (input.caseSlugs ?? [])
    .map((slug) => projects.find((project) => project.slug === slug)?.title)
    .filter(Boolean);

  if (input.persona === "recruiter") {
    return {
      subject: "Petri Lahdelma — design systems & product design",
      body: [
        `Hi ${name},`,
        "",
        "Thanks for reaching out about Petri Lahdelma.",
        "",
        input.need ? `Context you shared: ${input.need}` : null,
        caseTitles.length
          ? `Relevant proof: ${caseTitles.join(", ")}.`
          : "Relevant case studies are on digitaltableteur.com/work.",
        "",
        "I'd be happy to share a CV and curated portfolio samples. You can also request them via the site chat or contact form.",
        "",
        "Best,",
        "Digitaltableteur",
      ]
        .filter(Boolean)
        .join("\n"),
      disclaimer:
        "AI-generated draft — review and personalize before sending. Donny never sends email on your behalf.",
      contactUrl: "/contact",
    };
  }

  return {
    subject: pkg
      ? `Design systems intake — ${pkg.name}`
      : "Design systems intake — Digitaltableteur",
    body: [
      `Hi ${name},`,
      "",
      "Thanks for chatting with Donny on digitaltableteur.com.",
      "",
      input.need ? `Challenge: ${input.need}` : null,
      pkg
        ? `Suggested starting point: ${pkg.name} (${pkg.priceRangeEur}, ${pkg.duration}) — ${pkg.description}`
        : null,
      caseTitles.length ? `Proof to review: ${caseTitles.join(", ")}.` : null,
      "",
      "If this direction fits, reply with your timeline and team context and we can schedule a short intro call.",
      "",
      "Best,",
      "Petri / Digitaltableteur",
    ]
      .filter(Boolean)
      .join("\n"),
    disclaimer:
      "AI-generated draft — review and personalize before sending. Donny never sends email on your behalf.",
    contactUrl: "/contact",
  };
}
