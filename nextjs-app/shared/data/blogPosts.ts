import type { ComponentType } from "react";
import {
  isPostVisible,
  shouldShowUnpublishedPosts,
} from "@/lib/blog/postVisibility";
import { blogManifest, type BlogManifestEntry } from "./blogManifest";

type BlogFrontmatter = {
  title?: string;
  slug?: string;
  excerpt?: string;
  readTime?: string;
  publishedAt?: string;
  intendedPublishedAt?: string;
  draft?: boolean;
  status?: string;
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
  intendedPublishedAt?: string;
  draft?: boolean;
  status?: string;
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

const allEntries: BlogPostEntry[] = Object.entries(modules)
  .map(([filePath, mod]) => {
    const frontmatter = mod.frontmatter ?? {};
    const slug = normalizeSlug(frontmatter, filePath);
    return {
      slug,
      title: frontmatter.title ?? slug,
      excerpt: frontmatter.excerpt,
      readTime: frontmatter.readTime,
      publishedAt: frontmatter.publishedAt,
      intendedPublishedAt: frontmatter.intendedPublishedAt,
      draft: frontmatter.draft,
      status: frontmatter.status,
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

const filterVisible = (showUnpublished?: boolean) =>
  allEntries.filter((entry) =>
    isPostVisible(entry, showUnpublished ?? shouldShowUnpublishedPosts()),
  );

export const getBlogPosts = (options?: { showUnpublished?: boolean }) =>
  filterVisible(options?.showUnpublished);

export const getBlogPostBySlug = (
  slug: string | undefined | null,
  options?: { showUnpublished?: boolean },
) => {
  if (!slug) return undefined;
  return filterVisible(options?.showUnpublished).find(
    (entry) => entry.slug === slug,
  );
};
