/**
 * Page Registry for Page-Level Verification
 *
 * Complete inventory of all public pages organized by category.
 * Used to enumerate pages for comprehensive accessibility audits.
 *
 * Phase 7: Page-Level Verification
 * Plan: 07-01 (Infrastructure Setup)
 */

/**
 * Page information for accessibility verification.
 */
export interface PageInfo {
  /** Human-readable page name */
  name: string;
  /** URL path (relative to base URL) */
  url: string;
  /** Page category for grouping */
  category: "core" | "work" | "blog" | "legal";
}

/**
 * Core pages - Main navigation routes (5 pages)
 */
export const corePages: PageInfo[] = [
  { name: "Home", url: "/", category: "core" },
  { name: "About", url: "/about", category: "core" },
  { name: "Work", url: "/work", category: "core" },
  { name: "Blog", url: "/blog", category: "core" },
  { name: "Contact", url: "/contact", category: "core" },
];

/**
 * Work project pages - Portfolio case studies (11 pages)
 * From /work/[slug] routes
 */
export const workPages: PageInfo[] = [
  {
    name: "Finnish Transport Agency",
    url: "/work/finnish-transport-agency",
    category: "work",
  },
  {
    name: "Garage Junction",
    url: "/work/garage-junction",
    category: "work",
  },
  {
    name: "Helsinki Design System",
    url: "/work/helsinki-design-system",
    category: "work",
  },
  {
    name: "Illustrations",
    url: "/work/illustrations",
    category: "work",
  },
  {
    name: "Intrum",
    url: "/work/intrum",
    category: "work",
  },
  {
    name: "Knobsmith Audio",
    url: "/work/knobsmith-audio",
    category: "work",
  },
  {
    name: "New Things Co",
    url: "/work/new-things-co",
    category: "work",
  },
  {
    name: "Raw View",
    url: "/work/raw-view",
    category: "work",
  },
  {
    name: "SAP Build Apps",
    url: "/work/sap-build-apps",
    category: "work",
  },
  {
    name: "Tulli",
    url: "/work/tulli",
    category: "work",
  },
  {
    name: "Vertaaux",
    url: "/work/vertaaux",
    category: "work",
  },
];

/**
 * Blog post pages (12 pages)
 * From app/blog/postMetadata.ts
 */
export const blogPages: PageInfo[] = [
  {
    name: "From Tokens to Thinking Systems",
    url: "/blog/from-tokens-to-thinking-systems-making-ai-native-design-systems-actually-work",
    category: "blog",
  },
  {
    name: "Constructive vs Constrictive Criticism",
    url: "/blog/the-evolutionary-difference-between-constructive-and-constrictive-criticism",
    category: "blog",
  },
  {
    name: "Branding Design Systems",
    url: "/blog/branding-design-systems-essay",
    category: "blog",
  },
  {
    name: "Design System Meets AI Pt 2",
    url: "/blog/design-system-meets-ai-building-the-self-evolving-component-library-pt-2",
    category: "blog",
  },
  {
    name: "Design System Meets AI Pt 1",
    url: "/blog/design-system-meets-ai-building-the-self-evolving-component-library-pt-1",
    category: "blog",
  },
  {
    name: "A Biography",
    url: "/blog/petri-lahdelma-bio",
    category: "blog",
  },
  {
    name: "Digital Craftsmanship",
    url: "/blog/digital-craftsmanship",
    category: "blog",
  },
  {
    name: "MCP, Design Systems, and Generative UI",
    url: "/blog/figma-mcp-design-systems",
    category: "blog",
  },
  {
    name: "Workflow Tips",
    url: "/blog/workflow-tips",
    category: "blog",
  },
  {
    name: "In Search of Impact",
    url: "/blog/in-search-of-impact",
    category: "blog",
  },
  {
    name: "Designing in 2025",
    url: "/blog/designing-in-2025",
    category: "blog",
  },
  {
    name: "Thoughts on Future Branding",
    url: "/blog/thoughts-on-future-branding",
    category: "blog",
  },
];

/**
 * Legal/utility pages (3 pages)
 */
export const legalPages: PageInfo[] = [
  {
    name: "Privacy Policy",
    url: "/privacy-policy",
    category: "legal",
  },
  {
    name: "Accessibility Statement",
    url: "/accessibility",
    category: "legal",
  },
  {
    name: "AI Use Policy",
    url: "/ai-use",
    category: "legal",
  },
];

/**
 * All public pages combined (31 total)
 * 5 core + 11 work + 12 blog + 3 legal = 31
 */
export const allPages: PageInfo[] = [
  ...corePages,
  ...workPages,
  ...blogPages,
  ...legalPages,
];

/**
 * Get pages by category.
 *
 * @param category - Category to filter by
 * @returns Array of PageInfo for that category
 */
export function getPagesByCategory(
  category: PageInfo["category"]
): PageInfo[] {
  return allPages.filter((p) => p.category === category);
}

/**
 * Get page by URL.
 *
 * @param url - URL path to look up
 * @returns PageInfo or undefined if not found
 */
export function getPageByUrl(url: string): PageInfo | undefined {
  return allPages.find((p) => p.url === url);
}

/**
 * Page counts by category for verification.
 */
export const pageCounts = {
  core: corePages.length,
  work: workPages.length,
  blog: blogPages.length,
  legal: legalPages.length,
  total: allPages.length,
} as const;
