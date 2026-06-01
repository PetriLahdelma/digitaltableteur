export type PseoCatalogItem = {
  slug: string;
  name: string;
  shortDescription: string;
  /** Preferred display label (preserves Next.js, TypeScript, etc.) */
  displayName?: string;
  /** Service-only: common client pain points */
  painPoints?: string[];
  /** Service-only: tangible outputs */
  deliverables?: string[];
  /** Service-only: typical engagement length */
  typicalTimeline?: string;
  /** Service-only: maps to CONSULTING_PACKAGES id */
  pricingPackageSlug?: string;
  /** Service-only: why this package fits */
  packageFitReason?: string;
  /** Service-only: portfolio slugs under /work */
  relatedWorkSlugs?: string[];
  /** Service-only: slug → one-line proof reason */
  proofReasons?: Record<string, string>;
  /** Service-only: ordered playbook steps */
  playbookSteps?: string[];
  /** Stack-only: stack-specific implementation notes */
  implementationNotes?: string[];
  /** Stack-only: frequent mistakes on this stack */
  commonPitfalls?: string[];
  /** Audience-only: team constraints */
  constraints?: string[];
  /** Audience-only: outcome metric */
  successMetric?: string;
};

export type PseoCatalog = {
  version: number;
  /** ISO date for stable sitemap lastModified on hub routes */
  catalogUpdatedAt?: string;
  services: PseoCatalogItem[];
  stacks: PseoCatalogItem[];
  audiences: PseoCatalogItem[];
  generation?: {
    maxLeafPages?: number;
    relatedLinksPerPage?: number;
    /** Leaf slugs approved for index (pilot / batch rollout) */
    indexedLeafSlugs?: string[];
  };
};

export type PseoLeafPageKey = {
  serviceSlug: string;
  stackSlug: string;
  audienceSlug: string;
};

export type PseoLeafPage = {
  slug: string;
  title: string;
  description: string;
  service: PseoCatalogItem;
  stack: PseoCatalogItem;
  audience: PseoCatalogItem;
  tags: string[];
};

export type PseoCopySection = {
  id: string;
  title: string;
  bodyMarkdown: string;
};

export type PseoRelatedLinkCopy = {
  slug: string;
  reasonMarkdown: string;
};

export type PseoPageCopy = {
  introMarkdown?: string;
  sections?: PseoCopySection[];
  faqs?: Array<{ question: string; answerMarkdown: string }>;
  related?: PseoRelatedLinkCopy[];
  updatedAt?: string;
};

export type PseoCopyFile = {
  version: number;
  pages: Record<string, PseoPageCopy>;
};
