/**
 * Project data structure for portfolio
 * This centralizes project data for the work index and detail pages.
 * Future: Can be migrated to Sanity CMS by replacing this with GROQ queries.
 */

export type ProjectCategory =
  | "design-systems"
  | "ux-design"
  | "branding"
  | "illustration"
  | "tools"
  | "all";

export interface Project {
  /** Unique identifier */
  id: string;
  /** URL slug for routing */
  slug: string;
  /** Display title */
  title: string;
  /** Short description for cards */
  description?: string;
  /** Thumbnail image path */
  thumbnail: string;
  /** Video thumbnail path (for hover autoplay) */
  thumbnailVideo?: string;
  /** Autoplay video thumbnail continuously (not just on hover) */
  autoPlayVideo?: boolean;
  /** Primary category */
  category: Exclude<ProjectCategory, "all">;
  /** Additional categories the project also appears under when filtering */
  secondaryCategories?: Exclude<ProjectCategory, "all">[];
  /** Tags for filtering and display */
  tags: string[];
  /** Featured project flag */
  featured?: boolean;
  /** Display order (lower = first) */
  order?: number;
  /** Live project URL */
  liveUrl?: string;
  /** Client or organization name */
  client?: string;
  /** Project duration (e.g. "2022-2024") */
  duration?: string;
}

export interface CategoryOption {
  /** Category value for filtering */
  value: ProjectCategory;
  /** i18n translation key for label */
  labelKey: string;
}

/**
 * Portfolio projects data
 */
export const projects: Project[] = [
  {
    id: "dsharp-design-system",
    slug: "dsharp-design-system",
    title: "DSharp Design System",
    description:
      "Fully AI-powered and guardrailed design-system architecture for enterprise data products: tokens, contracts, Storybook, MCP, CLI, and Rhythmguard enforcement.",
    thumbnail:
      "/images/portfolio/dsharp-design-system/dsharp-thumbnail-logo.svg",
    category: "design-systems",
    tags: [
      "Design Systems",
      "AI Architecture",
      "Data Science",
      "MCP",
      "React",
    ],
    featured: true,
    order: 0,
    duration: "2026–Present",
  },
  {
    id: "helsinki-design-system",
    slug: "helsinki-design-system",
    title: "Helsinki Design System",
    description:
      "Enterprise design system for the City of Helsinki, serving hundreds of digital services with accessible, consistent UI components.",
    thumbnail: "/images/portfolio/helsinki-design-system/HDS_logo.png",
    category: "design-systems",
    tags: ["Design System", "UX Design", "Accessibility", "React"],
    featured: true,
    order: 7,
    liveUrl: "https://hds.hel.fi/",
    client: "City of Helsinki",
    duration: "2020–2022",
  },
  {
    id: "new-things-co",
    slug: "new-things-co",
    title: "New Things Co",
    description:
      "Brand identity and digital presence for a digital transformation consultancy based in Helsinki.",
    thumbnail: "/images/portfolio/new_things_co/new_things_co_item.webp",
    category: "branding",
    tags: ["Branding", "Web Design", "Identity"],
    featured: true,
    order: 9,
    client: "New Things Co",
    duration: "2019",
  },
  {
    id: "garage-junction",
    slug: "garage-junction",
    title: "Garage Junction",
    description:
      "Web and social assets for a creative underground music outing.",
    thumbnail: "/images/portfolio/garage_junction/GJ_loop.mov",
    thumbnailVideo: "/images/portfolio/garage_junction/GJ_loop.mov",
    autoPlayVideo: true,
    category: "ux-design",
    secondaryCategories: ["branding"],
    tags: ["Web Design", "Animation", "Branding"],
    featured: false,
    order: 8,
    duration: "2023",
  },
  {
    id: "illustrations",
    slug: "illustrations",
    title: "Illustrations",
    description:
      "Collection of editorial illustrations, character designs, and visual storytelling for various clients.",
    thumbnail: "/images/portfolio/illustrations/ice-cream_square.webp",
    category: "illustration",
    tags: ["Illustration", "Character Design", "Editorial"],
    featured: false,
    order: 10,
    duration: "2016–Present",
  },
  {
    id: "sap-build-apps-design-system",
    slug: "sap-build-apps",
    title: "SAP Build Apps Design System",
    description:
      "Led the design system for SAP's flagship low-code platform (formerly AppGyver). Built and maintained 100+ components across Figma and ReactTS, serving 300+ developers and designers building enterprise applications worldwide.",
    thumbnail: "/images/portfolio/sap-build-apps/Build Product Icon_1000px.png",
    category: "design-systems",
    tags: ["Design Systems", "Enterprise", "Low-Code Platform", "SAP BTP"],
    featured: true,
    order: 6,
    liveUrl:
      "https://www.sap.com/products/technology-platform/low-code-app-builder.html",
    client: "SAP",
    duration: "2021–2024",
  },
  {
    id: "home-remote",
    slug: "home-remote",
    title: "Home Remote",
    description:
      "A native macOS remote for TVs, home AV, and audio equipment: local-first control with a design system for a fun clay interface.",
    thumbnail: "/images/portfolio/home-remote/thumbnail.webp",
    category: "ux-design",
    secondaryCategories: ["tools"],
    tags: ["Product Design", "macOS App", "Brand Identity", "3D Illustration"],
    featured: false,
    order: 12,
    duration: "Aug 2026",
  },
  {
    id: "knobsmith-audio",
    slug: "knobsmith-audio",
    title: "KnobSmith Audio",
    description:
      "Designing frictionless UX for audio plugins, blending analog inspiration with modern interaction patterns.",
    thumbnail: "/images/portfolio/knobsmith-audio/thumbnail.webp",
    category: "ux-design",
    tags: [
      "Product Design",
      "Audio Software",
      "UI Animation",
      "Brand Identity",
    ],
    featured: true,
    order: 2,
    liveUrl: "https://knobsmithaudio.com",
    duration: "2025–Present",
  },
  {
    id: "vertaaux",
    slug: "vertaaux",
    title: "VertaaUX",
    description:
      "UX and accessibility auditing platform for dev teams who treat accessibility as craft, not compliance.",
    thumbnail: "/images/portfolio/vertaaux/logo-on-white.svg",
    category: "ux-design",
    tags: ["AI Product", "UX Intelligence", "Accessibility", "Startup"],
    featured: false,
    order: 3,
    liveUrl: "https://vertaaux.ai",
    duration: "December 2025–Present",
  },
  {
    id: "finnish-transport-agency",
    slug: "finnish-transport-agency",
    title: "Finnish Transport Agency",
    description:
      "Identity system for the merged Finnish Transport Agency, built for multilingual public services and national infrastructure.",
    thumbnail: "/images/portfolio/finnish-transport-agency/thumbnail.webp",
    category: "branding",
    tags: ["Brand Identity", "Public Sector", "Accessibility", "Multilingual"],
    featured: false,
    order: 11,
    client: "Finnish Transport Agency",
    duration: "2018",
  },
  {
    id: "rhythmguard",
    slug: "rhythmguard",
    title: "Rhythmguard",
    description:
      "A Stylelint plugin that enforces design token usage at lint time: spacing scales, color tokens, and Tailwind class strings.",
    thumbnail: "/images/portfolio/rhythmguard/thumbnail.png",
    category: "tools",
    tags: ["Open Source", "Stylelint", "Design Tokens", "DX", "npm"],
    featured: true,
    order: 4,
    liveUrl: "https://www.npmjs.com/package/stylelint-plugin-rhythmguard",
    duration: "December 2025–Present",
  },
  {
    id: "project-spine",
    slug: "project-spine",
    title: "Project Spine",
    description:
      "An OSS CLI that compiles briefs, repos, and design tokens into agent-native operating context: CLAUDE.md, AGENTS.md, and 19 structured exports.",
    thumbnail: "/images/portfolio/project-spine/thumbnail.png",
    category: "tools",
    tags: ["Open Source", "CLI", "AI Agents", "Design Tokens", "Context"],
    featured: true,
    order: 1,
    liveUrl: "https://projectspine.dev",
    duration: "April 2026",
  },
  {
    id: "llm-component-schema",
    slug: "llm-component-schema",
    title: "LLM Component Schema",
    description:
      "A published npm schema and CLI for component contracts: structured specs that AI agents can consume, with drift detection and eval benchmarks.",
    thumbnail: "/images/portfolio/llm-component-schema/thumbnail.png",
    category: "tools",
    tags: ["Open Source", "npm", "AI", "Component Contracts", "Schema"],
    featured: false,
    order: 5,
    liveUrl: "https://petrilahdelma.gumroad.com/l/mcqoq",
    duration: "December 2025–Present",
  },
];

/**
 * Sort comparator for projects - uses order, then id as tiebreaker for stability
 */
export function compareProjects(a: Project, b: Project): number {
  const orderDiff = (a.order ?? 99) - (b.order ?? 99);
  if (orderDiff !== 0) return orderDiff;
  return a.id.localeCompare(b.id);
}

/**
 * Pre-sorted projects array - use this for consistent ordering everywhere
 */
export const sortedProjects: Project[] = [...projects].sort(compareProjects);

/**
 * Category filter options
 */
export const categories: CategoryOption[] = [
  { value: "all", labelKey: "workFilterAll" },
  { value: "design-systems", labelKey: "workFilterDesignSystems" },
  { value: "ux-design", labelKey: "workFilterUXDesign" },
  { value: "branding", labelKey: "workFilterBranding" },
  { value: "illustration", labelKey: "workFilterIllustration" },
  { value: "tools", labelKey: "workFilterTools" },
];

function projectCategories(project: Project): Exclude<ProjectCategory, "all">[] {
  return [project.category, ...(project.secondaryCategories ?? [])];
}

/**
 * Filter projects by category (primary or secondary)
 */
export function filterProjects(
  projectList: Project[],
  category: ProjectCategory,
): Project[] {
  if (category === "all") {
    return [...projectList].sort(compareProjects);
  }
  return [...projectList]
    .filter((project) => projectCategories(project).includes(category))
    .sort(compareProjects);
}

/**
 * Get project by slug
 */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/**
 * Get related projects (same category, excluding current)
 */
export function getRelatedProjects(
  currentSlug: string,
  maxItems: number = 2,
): Project[] {
  const current = getProjectBySlug(currentSlug);
  if (!current) return [];

  const currentCategories = projectCategories(current);
  const sameCategory = projects.filter(
    (project) =>
      project.slug !== currentSlug &&
      projectCategories(project).some((cat) => currentCategories.includes(cat)),
  );

  if (sameCategory.length >= maxItems) {
    return sameCategory.slice(0, maxItems);
  }

  const otherProjects = projects.filter(
    (project) =>
      project.slug !== currentSlug &&
      !projectCategories(project).some((cat) => currentCategories.includes(cat)),
  );

  return [...sameCategory, ...otherProjects].slice(0, maxItems);
}

/**
 * Get featured projects
 */
export function getFeaturedProjects(maxItems: number = 4): Project[] {
  return [...projects]
    .filter((project) => project.featured)
    .sort(compareProjects)
    .slice(0, maxItems);
}

/**
 * Get previous and next projects for navigation
 */
export function getProjectNavigation(currentSlug: string): {
  previous: Project | null;
  next: Project | null;
} {
  const currentIndex = sortedProjects.findIndex((p) => p.slug === currentSlug);

  return {
    previous: currentIndex > 0 ? sortedProjects[currentIndex - 1] : null,
    next:
      currentIndex < sortedProjects.length - 1
        ? sortedProjects[currentIndex + 1]
        : null,
  };
}

const PROJECT_NAV_ALIASES: Record<string, string> = {
  sap: "sap-build-apps",
  "sap build": "sap-build-apps",
  "sap build apps": "sap-build-apps",
  helsinki: "helsinki-design-system",
  hds: "helsinki-design-system",
  vertaa: "vertaaux",
  vertaaux: "vertaaux",
  knobsmith: "knobsmith-audio",
  dsharp: "dsharp-design-system",
  spine: "project-spine",
  "project spine": "project-spine",
  rhythmguard: "rhythmguard",
  illustrations: "illustrations",
  intrum: "intrum",
  tulli: "tulli",
};

const NAVIGATION_PHRASE_PREFIX =
  /^(?:please\s+)?(?:(?:can you|could you)\s+)?(?:navigate(?:\s+me)?\s+to|open|show\s+me|go\s+to|take\s+me\s+to|view)\s+/i;

function normalizeProjectQuery(input: string): string {
  return input.trim().replace(NAVIGATION_PHRASE_PREFIX, "").trim();
}

function slugifyProjectQuery(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-");
}

function scoreProjectMatch(project: Project, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  const title = project.title.toLowerCase();
  const slug = project.slug;
  const slugQuery = slugifyProjectQuery(query);

  if (title === q) return 100;
  if (slug === q || slug === slugQuery || project.id === slugQuery) return 90;
  if (project.client?.toLowerCase() === q) return 85;
  if (title.startsWith(q)) return 75;
  if (title.includes(q)) return 60;
  if (project.client?.toLowerCase().includes(q)) return 50;
  if (project.tags.some((tag) => tag.toLowerCase() === q)) return 45;
  if (project.description?.toLowerCase().includes(q)) return 35;
  if (project.tags.some((tag) => tag.toLowerCase().includes(q))) return 30;
  if (slug.includes(slugQuery) && slugQuery.length >= 3) return 25;

  return 0;
}

/**
 * Resolve a project slug, title, alias, or free-text query to `/work/{slug}`.
 * Returns null when no confident single match exists.
 */
export function resolveProjectNavigationPath(input: string): string | null {
  const normalized = normalizeProjectQuery(input);
  if (!normalized) return null;

  if (normalized.startsWith("/work/")) {
    const slug = normalized.split("/")[2]?.split("#")[0]?.split("?")[0];
    if (slug && getProjectBySlug(slug)) {
      return `/work/${slug}`;
    }
    return null;
  }

  if (normalized.startsWith("/")) {
    return null;
  }

  const aliasKey = normalized.toLowerCase();
  const aliasSlug = PROJECT_NAV_ALIASES[aliasKey];
  if (aliasSlug && getProjectBySlug(aliasSlug)) {
    return `/work/${aliasSlug}`;
  }

  const slugCandidate = slugifyProjectQuery(normalized);
  const bySlug = getProjectBySlug(slugCandidate);
  if (bySlug) {
    return `/work/${bySlug.slug}`;
  }

  const scored = projects
    .map((project) => ({ project, score: scoreProjectMatch(project, normalized) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return null;
  }

  const best = scored[0];
  const runnerUp = scored[1];

  if (!runnerUp || best.score >= runnerUp.score + 10) {
    return `/work/${best.project.slug}`;
  }

  return null;
}

/** Compact slug list for model-facing navigation tools. */
export function getProjectNavigationCatalog(): Array<{
  slug: string;
  title: string;
  url: string;
}> {
  return sortedProjects.map((project) => ({
    slug: project.slug,
    title: project.title,
    url: `/work/${project.slug}`,
  }));
}
