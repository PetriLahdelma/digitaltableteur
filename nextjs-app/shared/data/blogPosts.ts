import type { ComponentType } from "react";
import { blogManifest, type BlogManifestEntry } from "./blogManifest";

type BlogFrontmatter = {
  title?: string;
  slug?: string;
  excerpt?: string;
  readTime?: string;
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  legacyUrl?: string;
  authorName?: string;
  authorSlug?: string;
  mainImageUrl?: string;
  mainImageAlt?: string;
  mainImageCaption?: string;
  tags?: string[];
  modifiedAt?: string;
};

type BlogModule = {
  default: ComponentType;
  frontmatter?: BlogFrontmatter;
};

// Automatically import all MDX files from content/posts/
// Vite supports import.meta.glob; Next.js does not. Guard for runtime compatibility.
let modules: Record<string, BlogModule> = {};
// Narrow import.meta typing without using any
// Prefer generated manifest for Next.js compatibility.
if (blogManifest.length > 0) {
  modules = Object.fromEntries(
    (blogManifest as BlogManifestEntry[]).map((entry) => [
      entry.slug,
      {
        default: entry.Component,
        frontmatter: entry.frontmatter,
      } as BlogModule,
    ]),
  );
}

const normalizeSlug = (frontmatter: BlogFrontmatter, filePath: string) => {
  if (frontmatter.slug) return frontmatter.slug;
  const fileName = filePath.split("/").pop() ?? "";
  return fileName.replace(/\.mdx?$/, "");
};

const toDate = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export type BlogPostEntry = {
  slug: string;
  title: string;
  excerpt?: string;
  readTime?: string;
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  legacyUrl?: string;
  authorName?: string;
  authorSlug?: string;
  mainImageUrl?: string;
  mainImageAlt?: string;
  mainImageCaption?: string;
  tags?: string[];
  modifiedAt?: string;
  Component: ComponentType;
};

const entries: BlogPostEntry[] = Object.entries(modules)
  .map(([filePath, mod]) => {
    const frontmatter = mod.frontmatter ?? {};
    const slug = normalizeSlug(frontmatter, filePath);
    return {
      slug,
      title: frontmatter.title ?? slug,
      excerpt: frontmatter.excerpt,
      readTime: frontmatter.readTime,
      publishedAt: frontmatter.publishedAt,
      seoTitle: frontmatter.seoTitle,
      seoDescription: frontmatter.seoDescription,
      legacyUrl: frontmatter.legacyUrl,
      authorName: frontmatter.authorName,
      authorSlug: frontmatter.authorSlug,
      mainImageUrl: frontmatter.mainImageUrl,
      mainImageAlt: frontmatter.mainImageAlt,
      mainImageCaption: frontmatter.mainImageCaption,
      tags: frontmatter.tags,
      modifiedAt: frontmatter.modifiedAt,
      Component: mod.default,
    };
  })
  .sort((a, b) => {
    const dateA = toDate(a.publishedAt)?.getTime() ?? 0;
    const dateB = toDate(b.publishedAt)?.getTime() ?? 0;
    return dateB - dateA;
  });

const entryMap = new Map(entries.map((entry) => [entry.slug, entry]));

export const getBlogPosts = () => entries;

export const getBlogPostBySlug = (slug: string | undefined | null) => {
  if (!slug) return undefined;
  return entryMap.get(slug);
};
