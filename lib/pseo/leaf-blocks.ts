import {
  CONSULTING_PACKAGES,
  getCaseStudyBySlug,
} from "@/nextjs-app/shared/data/consulting-catalog";

import {
  buildLeafDescription,
  getAudienceDisplayName,
  getStackDisplayName,
} from "./display";
import type { PseoCatalogItem, PseoLeafPage, PseoPageCopy } from "./types";

export type PseoProofLink = {
  slug: string;
  title: string;
  href: string;
  reason: string;
};

export type PseoPackageFit = {
  slug: string;
  name: string;
  priceRangeEur: string;
  duration: string;
  reason: string;
};

export type PseoLeafStructuredBlocks = {
  situationMarkdown: string;
  failureModesMarkdown: string;
  deliverablesMarkdown: string;
  playbookMarkdown: string;
  proofLinks: PseoProofLink[];
  packageFit: PseoPackageFit | null;
  faqs: Array<{ question: string; answerMarkdown: string }>;
};

const defaultPlaybookSteps = [
  "Baseline the current UI surface area and ownership model.",
  "Identify the highest-friction inconsistencies blocking delivery.",
  "Define the smallest set of standards that removes rework.",
  "Implement, document, and agree on how changes get reviewed.",
];

function resolvePackageFit(service: PseoCatalogItem): PseoPackageFit | null {
  const slug = service.pricingPackageSlug;
  if (!slug) return null;

  const pkg = CONSULTING_PACKAGES.find((entry) => entry.id === slug);
  if (!pkg) return null;

  return {
    slug: pkg.id,
    name: pkg.name,
    priceRangeEur: pkg.priceRangeEur,
    duration: pkg.duration,
    reason:
      service.packageFitReason ??
      `${pkg.name} matches the scope and timeline for ${service.name.toLowerCase()}.`,
  };
}

function resolveProofLinks(service: PseoCatalogItem): PseoProofLink[] {
  const slugs = service.relatedWorkSlugs ?? [];
  return slugs
    .map((slug) => {
      const study = getCaseStudyBySlug(slug);
      if (!study) return null;
      return {
        slug,
        title: study.title,
        href: `/work/${slug}`,
        reason:
          service.proofReasons?.[slug] ??
          `Relevant case study for ${service.name.toLowerCase()}.`,
      };
    })
    .filter((entry): entry is PseoProofLink => entry !== null);
}

function buildSituation(page: PseoLeafPage): string {
  const stackName = getStackDisplayName(page.stack);
  const audienceName = getAudienceDisplayName(page.audience);
  const constraints = page.audience.constraints?.length
    ? page.audience.constraints.join(", ")
    : page.audience.shortDescription;
  const stackNotes = page.stack.implementationNotes ?? [];
  const stackPitfall = page.stack.commonPitfalls?.[0];

  const lines = [
    `**Who this is for:** ${audienceName} shipping ${page.service.name.toLowerCase()} on ${stackName}.`,
    `**Typical constraints:** ${constraints}.`,
  ];

  if (page.audience.successMetric) {
    lines.push(`**Success looks like:** ${page.audience.successMetric}.`);
  }

  if (stackNotes.length > 0) {
    lines.push(
      `**${stackName} focus areas:** ${stackNotes.slice(0, 2).join("; ")}.`,
    );
  }

  if (stackPitfall) {
    lines.push(`**Watch for:** ${stackPitfall}`);
  }

  return lines.join("\n\n");
}

function buildFailureModes(service: PseoCatalogItem, stack: PseoCatalogItem): string {
  const servicePains = service.painPoints ?? [];
  const stackPains = stack.commonPitfalls ?? [];
  const bullets = [...servicePains, ...stackPains];

  if (bullets.length === 0) {
    return "- UI patterns diverge squad by squad\n- Accessibility regressions ship under deadline pressure\n- Design tokens and code tokens drift apart";
  }

  return bullets.map((point) => `- ${point}`).join("\n");
}

function buildDeliverables(service: PseoCatalogItem): string {
  const items = service.deliverables ?? [
    "Prioritized findings and scope boundaries",
    "Accessibility and QA checklist",
    "Implementation roadmap with owners",
    "Documentation your team can maintain",
  ];

  return items.map((item) => `- ${item}`).join("\n");
}

function buildDefaultPlaybook(
  page: PseoLeafPage,
  service: PseoCatalogItem,
): string {
  const stackName = getStackDisplayName(page.stack);
  const steps = service.playbookSteps ?? defaultPlaybookSteps;
  const stackNotes = page.stack.implementationNotes ?? [];

  const numbered = steps
    .map((step, index) => `${index + 1}. ${step}`)
    .join("\n");

  const stackSection =
    stackNotes.length > 0
      ? `\n\n**${stackName} specifics:**\n${stackNotes.map((note) => `- ${note}`).join("\n")}`
      : "";

  return `${numbered}${stackSection}`;
}

function buildDefaultFaqs(page: PseoLeafPage, service: PseoCatalogItem) {
  const stackName = getStackDisplayName(page.stack);
  const audienceName = getAudienceDisplayName(page.audience);
  const timeline = service.typicalTimeline ?? "1–4 weeks depending on surface area";

  return [
    {
      question: `How long does ${service.name.toLowerCase()} take for ${audienceName} on ${stackName}?`,
      answerMarkdown: `Most engagements run **${timeline}**. We scope against your live ${stackName} codebase—not a generic template.`,
    },
    {
      question: `Can you ${service.name.toLowerCase()} without pausing ${stackName} feature work?`,
      answerMarkdown:
        "Yes. We sequence work around your release calendar and land changes incrementally so squads keep shipping.",
    },
    {
      question: `What should ${audienceName} prepare before kickoff?`,
      answerMarkdown: `Repo or Storybook access, your primary Figma library, and one decision-maker who can define done for ${stackName} UI standards.`,
    },
  ];
}

export function buildLeafStructuredBlocks(
  page: PseoLeafPage,
): PseoLeafStructuredBlocks {
  return {
    situationMarkdown: buildSituation(page),
    failureModesMarkdown: buildFailureModes(page.service, page.stack),
    deliverablesMarkdown: buildDeliverables(page.service),
    playbookMarkdown: buildDefaultPlaybook(page, page.service),
    proofLinks: resolveProofLinks(page.service),
    packageFit: resolvePackageFit(page.service),
    faqs: buildDefaultFaqs(page, page.service),
  };
}

export function mergeLeafCopy(
  page: PseoLeafPage,
  copy?: PseoPageCopy,
): {
  introMarkdown: string;
  blocks: PseoLeafStructuredBlocks;
  description: string;
} {
  const blocks = buildLeafStructuredBlocks(page);

  const introMarkdown =
    copy?.introMarkdown ??
    `${buildLeafDescription(page.service, page.stack, page.audience)}\n\nUse this playbook to scope work, align design and engineering, and avoid the failure modes we see most often on **${getStackDisplayName(page.stack)}** teams.`;

  if (copy?.sections?.length) {
    for (const section of copy.sections) {
      if (section.id === "playbook" && section.bodyMarkdown.trim()) {
        blocks.playbookMarkdown = section.bodyMarkdown;
      }
      if (section.id === "failure-modes" && section.bodyMarkdown.trim()) {
        blocks.failureModesMarkdown = section.bodyMarkdown;
      }
      if (section.id === "situation" && section.bodyMarkdown.trim()) {
        blocks.situationMarkdown = section.bodyMarkdown;
      }
      if (section.id === "deliverables" && section.bodyMarkdown.trim()) {
        blocks.deliverablesMarkdown = section.bodyMarkdown;
      }
    }
  }

  if (copy?.faqs?.length) {
    blocks.faqs = copy.faqs;
  }

  return {
    introMarkdown,
    blocks,
    description: page.description,
  };
}
