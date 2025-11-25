import type { MetadataRoute } from "next";

import { posts } from "./blog/postMetadata";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.digitaltableteur.com";

const toUrl = (path: string) => `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "/",
    "/about",
    "/ai-use",
    "/contact",
    "/work",
    "/studio",
    "/cookie-policy",
    "/cookie-policy-full-en",
    "/cookie-policy-full-fi",
    "/cookie-policy-full-sv",
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

  return [...staticRoutes, ...workRoutes, ...blogRoutes];
}
