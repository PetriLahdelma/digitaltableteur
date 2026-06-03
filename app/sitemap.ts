import type { MetadataRoute } from "next";

import { getVisiblePosts } from "./blog/postMetadata";
import { getAuthors } from "@/nextjs-app/shared/data/authors";
import {
  getPseoCatalog,
  getPseoCatalogUpdatedAt,
  getPseoLeafPages,
} from "@/lib/pseo/catalog";
import { getPseoPageCopy } from "@/lib/pseo/copy";
import type { PseoCatalogItem, PseoLeafPage } from "@/lib/pseo/types";
import { toAbsoluteSiteUrl } from "./lib/siteUrl";

const toUrl = (path: string) => toAbsoluteSiteUrl(path);

export const revalidate = 600;

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date();
  const posts = getVisiblePosts();

  // Exclude noindex / internal pages from sitemap:
  // - /privacy-policy (noindex)
  // - /studio (noindex - Sanity CMS admin)
  // - /tools/email-signature (internal, noindex)
  const staticRoutes: MetadataRoute.Sitemap = [
    "/",
    "/about",
    "/ai-use",
    "/contact",
    "/pricing",
    "/work",
    "/accessibility",
    "/blog",
    "/colophon",
    "/design-system/agent",
    "/sitemap",
  ].map((path) => ({
    url: toUrl(path),
    lastModified: today,
    changeFrequency: "monthly",
    priority: path === "/" ? 1.0 : 0.7,
  }));

  const workRoutes: MetadataRoute.Sitemap = [
    "/work/dsharp-design-system",
    "/work/knobsmith-audio",
    "/work/vertaaux",
    "/work/finnish-transport-agency",
    "/work/raw-view",
    "/work/tulli",
    "/work/intrum",
    "/work/new-things-co",
    "/work/illustrations",
    "/work/garage-junction",
    "/work/helsinki-design-system",
    "/work/sap-build-apps",
    "/work/rhythmguard",
    "/work/project-spine",
    "/work/llm-component-schema",
  ].map((path) => ({
    url: toUrl(path),
    lastModified: today,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: toUrl(`/blog/${post.slug}`),
    lastModified: post.publishedAt ? new Date(post.publishedAt) : today,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const authorRoutes: MetadataRoute.Sitemap = getAuthors().map((author) => ({
    url: toUrl(`/blog/authors/${author.slug}`),
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const pseoCatalog = getPseoCatalog();
  const pseoLeafPages = getPseoLeafPages();
  const pseoCatalogUpdated = getPseoCatalogUpdatedAt();

  const pseoIndexRoutes: MetadataRoute.Sitemap = ["/pseo"].map((path) => ({
    url: toUrl(path),
    lastModified: pseoCatalogUpdated,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const pseoPillarRoutes: MetadataRoute.Sitemap = [
    ...pseoCatalog.services.map(
      (s: PseoCatalogItem) => `/pseo/services/${s.slug}`,
    ),
    ...pseoCatalog.stacks.map((s: PseoCatalogItem) => `/pseo/stacks/${s.slug}`),
    ...pseoCatalog.audiences.map(
      (a: PseoCatalogItem) => `/pseo/audiences/${a.slug}`,
    ),
  ].map((path) => ({
    url: toUrl(path),
    lastModified: pseoCatalogUpdated,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const pseoLeafRoutes: MetadataRoute.Sitemap = pseoLeafPages.map(
    (page: PseoLeafPage) => {
      const copyUpdated = getPseoPageCopy(page.slug)?.updatedAt;
      const lastModified = copyUpdated
        ? new Date(copyUpdated)
        : pseoCatalogUpdated;

      return {
        url: toUrl(`/pseo/${page.slug}`),
        lastModified: Number.isNaN(lastModified.getTime())
          ? pseoCatalogUpdated
          : lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      };
    },
  );

  return [
    ...staticRoutes,
    ...workRoutes,
    ...blogRoutes,
    ...authorRoutes,
    ...pseoIndexRoutes,
    ...pseoPillarRoutes,
    ...pseoLeafRoutes,
  ];
}
