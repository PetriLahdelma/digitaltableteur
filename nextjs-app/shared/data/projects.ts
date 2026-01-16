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
  /** Tags for filtering and display */
  tags: string[];
  /** Featured project flag */
  featured?: boolean;
  /** Display order (lower = first) */
  order?: number;
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
    id: "helsinki-design-system",
    slug: "helsinki-design-system",
    title: "Helsinki Design System",
    description: "Enterprise design system for the City of Helsinki, serving hundreds of digital services with accessible, consistent UI components.",
    thumbnail: "/images/portfolio/helsinki-design-system/HDS_logo.png",
    category: "design-systems",
    tags: ["Design System", "UX Design", "Accessibility", "React"],
    featured: true,
    order: 1,
  },
  {
    id: "new-things-co",
    slug: "new-things-co",
    title: "New Things Co",
    description: "Brand identity and digital presence for a digital transformation consultancy based in Helsinki.",
    thumbnail: "/images/portfolio/new_things_co/new_things_co_item.webp",
    category: "branding",
    tags: ["Branding", "Web Design", "Identity"],
    featured: true,
    order: 2,
  },
  {
    id: "garage-junction",
    slug: "garage-junction",
    title: "Garage Junction",
    description: "Web and social assets for a creative underground music outing.",
    thumbnail: "/images/portfolio/garage_junction/GJ_loop.mov",
    thumbnailVideo: "/images/portfolio/garage_junction/GJ_loop.mov",
    autoPlayVideo: true,
    category: "ux-design",
    tags: ["Web Design", "Animation", "Branding"],
    featured: false,
    order: 3,
  },
  {
    id: "illustrations",
    slug: "illustrations",
    title: "Illustrations",
    description: "Collection of editorial illustrations, character designs, and visual storytelling for various clients.",
    thumbnail: "/images/portfolio/illustrations/ice-cream_square.webp",
    category: "illustration",
    tags: ["Illustration", "Character Design", "Editorial"],
    featured: false,
    order: 4,
  },
  {
    id: "sap-build-apps-design-system",
    slug: "sap-build-apps",
    title: "SAP Build Apps Design System",
    description: "Led the design system for SAP's flagship low-code platform (formerly AppGyver). Built and maintained 100+ components across Figma and ReactTS, serving 300+ developers and designers building enterprise applications worldwide.",
    thumbnail: "/images/portfolio/sap-build-apps/Build Product Icon_1000px.png",
    category: "design-systems",
    tags: ["Design Systems", "Enterprise", "Low-Code Platform", "SAP BTP"],
    featured: true,
    order: 1,
  },
];

/**
 * Category filter options
 */
export const categories: CategoryOption[] = [
  { value: "all", labelKey: "workFilterAll" },
  { value: "design-systems", labelKey: "workFilterDesignSystems" },
  { value: "ux-design", labelKey: "workFilterUXDesign" },
  { value: "branding", labelKey: "workFilterBranding" },
  { value: "illustration", labelKey: "workFilterIllustration" },
];

/**
 * Filter projects by category
 */
export function filterProjects(
  projectList: Project[],
  category: ProjectCategory
): Project[] {
  if (category === "all") {
    return projectList.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }
  return projectList
    .filter((project) => project.category === category)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
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
  maxItems: number = 3
): Project[] {
  const current = getProjectBySlug(currentSlug);
  if (!current) return [];

  return projects
    .filter(
      (project) =>
        project.slug !== currentSlug && project.category === current.category
    )
    .slice(0, maxItems);
}

/**
 * Get featured projects
 */
export function getFeaturedProjects(maxItems: number = 4): Project[] {
  return projects
    .filter((project) => project.featured)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    .slice(0, maxItems);
}

/**
 * Get previous and next projects for navigation
 */
export function getProjectNavigation(currentSlug: string): {
  previous: Project | null;
  next: Project | null;
} {
  const sortedProjects = projects.sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99)
  );
  const currentIndex = sortedProjects.findIndex((p) => p.slug === currentSlug);

  return {
    previous: currentIndex > 0 ? sortedProjects[currentIndex - 1] : null,
    next:
      currentIndex < sortedProjects.length - 1
        ? sortedProjects[currentIndex + 1]
        : null,
  };
}
