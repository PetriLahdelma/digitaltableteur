import type { MetadataRoute } from "next";

import { posts } from "./blog/postMetadata";
import { getPseoCatalog, getPseoLeafPages } from "@/lib/pseo/catalog";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.digitaltableteur.com";

const toUrl = (path: string) => `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date();

  // Exclude noindex pages from sitemap:
  // - /privacy-policy (noindex)
  // - /cookie-policy* pages (legal pages, typically noindex)
  const staticRoutes: MetadataRoute.Sitemap = [
    "/",
    "/about",
    "/ai-use",
    "/contact",
    "/work",
    "/studio",
    "/accessibility",
    "/blog",
  ].map((path) => ({
    url: toUrl(path),
    lastModified: today,
    changeFrequency: "monthly",
    priority: path === "/" ? 1.0 : 0.7,
  }));

  const workRoutes: MetadataRoute.Sitemap = [
    "/work/new-things-co",
    "/work/illustrations",
    "/work/garage-junction",
    "/work/helsinki-design-system",
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
    ...pseoCatalog.services.map((s) => `/pseo/services/${s.slug}`),
    ...pseoCatalog.stacks.map((s) => `/pseo/stacks/${s.slug}`),
    ...pseoCatalog.audiences.map((a) => `/pseo/audiences/${a.slug}`),
  ].map((path) => ({
    url: toUrl(path),
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  const pseoLeafRoutes: MetadataRoute.Sitemap = pseoLeafPages.map((page) => ({
    url: toUrl(`/pseo/${page.slug}`),
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.35,
  }));

  return [
    ...staticRoutes,
    ...workRoutes,
    ...blogRoutes,
    ...pseoIndexRoutes,
    ...pseoPillarRoutes,
    ...pseoLeafRoutes,
  ];
}
