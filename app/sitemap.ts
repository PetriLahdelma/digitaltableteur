import type { MetadataRoute } from "next";

import { getVisiblePosts } from "./blog/postMetadata";
import { getPseoCatalog, getPseoLeafPages } from "@/lib/pseo/catalog";
import type { PseoCatalogItem, PseoLeafPage } from "@/lib/pseo/types";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.digitaltableteur.com";

const toUrl = (path: string) =>
  `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

export const revalidate = 600;

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date();
  const posts = getVisiblePosts();

  // Exclude noindex pages from sitemap:
  // - /privacy-policy (noindex)
  // - /studio (noindex - Sanity CMS admin)
  const staticRoutes: MetadataRoute.Sitemap = [
    "/",
    "/about",
    "/ai-use",
    "/contact",
    "/work",
    "/accessibility",
    "/blog",
    "/colophon",
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

  const pseoCatalog = getPseoCatalog();
  const pseoLeafPages = getPseoLeafPages();

  const pseoIndexRoutes: MetadataRoute.Sitemap = ["/pseo"].map((path) => ({
    url: toUrl(path),
    lastModified: today,
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
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const pseoLeafRoutes: MetadataRoute.Sitemap = pseoLeafPages.map(
    (page: PseoLeafPage) => ({
      url: toUrl(`/pseo/${page.slug}`),
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.5,
    }),
  );

  const toolsRoutes: MetadataRoute.Sitemap = ["/tools/email-signature"].map(
    (path) => ({
      url: toUrl(path),
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.5,
    }),
  );

  return [
    ...staticRoutes,
    ...workRoutes,
    ...blogRoutes,
    ...toolsRoutes,
    ...pseoIndexRoutes,
    ...pseoPillarRoutes,
    ...pseoLeafRoutes,
  ];
}
