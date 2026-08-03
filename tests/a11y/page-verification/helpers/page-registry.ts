/**
 * Page Registry for Page-Level Verification
 *
 * Complete inventory of all public pages organized by category.
 * Used to enumerate pages for comprehensive accessibility audits.
 *
 * Phase 7: Page-Level Verification
 * Plan: 07-01 (Infrastructure Setup)
 */

// Relative imports (not the "@/" alias): Playwright resolves this file with
// esbuild, which does not honor tsconfig path aliases.
import { allPosts } from "../../../../app/blog/postMetadata";
import { isPostVisible } from "../../../../lib/blog/postVisibility";
import { sortedProjects } from "../../../../nextjs-app/shared/data/projects";

/**
 * Page information for accessibility verification.
 */
export interface PageInfo {
  /** Human-readable page name */
  name: string;
  /** URL path (relative to base URL) */
  url: string;
  /** Page category for grouping */
  category: "core" | "work" | "blog" | "legal" | "utility" | "pseo";
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
  { name: "Pricing", url: "/pricing", category: "core" },
];

/**
 * Work project pages — DERIVED from the portfolio data, never hand-listed.
 *
 * Every project in `projects.ts` gets an audited /work/<slug> page, so new
 * case studies join the enforced audit the moment they ship. (Previously this
 * was a hand-maintained array that fell 11 → 16 behind: home-remote,
 * dsharp-design-system, project-spine, rhythmguard and llm-component-schema
 * were published but never audited.) The extras below are published routes
 * that intentionally do not appear in the /work index data.
 */
const extraWorkPages: PageInfo[] = [
  { name: "Intrum", url: "/work/intrum", category: "work" },
  { name: "Raw View", url: "/work/raw-view", category: "work" },
  { name: "Tulli", url: "/work/tulli", category: "work" },
];

export const workPages: PageInfo[] = [
  ...sortedProjects.map((project) => ({
    name: project.title,
    url: `/work/${project.slug}`,
    category: "work" as const,
  })),
  ...extraWorkPages,
];

/**
 * Blog post pages — DERIVED from generated post metadata, never hand-listed.
 *
 * Every publicly visible post (not draft, `publishedAt` in the past) is audited.
 * Deriving from the same source that drives routing/metadata means page-level
 * a11y coverage can never silently drift behind published content: adding a post
 * to `content/` regenerates `postMetadata` and this list picks it up on the next
 * run. (Previously this was a hand-maintained array that fell 12 → 17 behind.)
 */
export const blogPages: PageInfo[] = allPosts
  .filter((post) => isPostVisible(post, false))
  .map((post) => ({
    name: post.title,
    url: `/blog/${post.slug}`,
    category: "blog" as const,
  }));

/**
 * Utility pages (2 pages)
 */
export const utilityPages: PageInfo[] = [
  { name: "Colophon", url: "/colophon", category: "utility" },
];

/**
 * PSEO hub and pilot leaf pages (4 pages)
 * Pilot slugs from content/pseo/pilot-slugs.json — sample for CI, not all 12.
 */
export const pseoPages: PageInfo[] = [
  { name: "PSEO Hub", url: "/pseo", category: "pseo" },
  {
    name: "PSEO Design System Audit Next.js Startups",
    url: "/pseo/design-system-audit-nextjs-startups",
    category: "pseo",
  },
  {
    name: "PSEO Component Library Build React Scaleups",
    url: "/pseo/component-library-build-react-scaleups",
    category: "pseo",
  },
  {
    name: "PSEO Design Tokens Setup Figma Product Teams",
    url: "/pseo/design-tokens-setup-figma-product-teams",
    category: "pseo",
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
 * All public pages combined.
 * Blog and work counts are derived from their data sources, so the total is
 * dynamic: 6 core + (all portfolio projects + 3 extras) + (all visible blog)
 * + 3 legal + 1 utility + 4 pseo.
 */
export const allPages: PageInfo[] = [
  ...corePages,
  ...workPages,
  ...blogPages,
  ...legalPages,
  ...utilityPages,
  ...pseoPages,
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
  utility: utilityPages.length,
  pseo: pseoPages.length,
  total: allPages.length,
} as const;
