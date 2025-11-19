import type { ComponentType } from "react";

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
};

type BlogModule = {
  default: ComponentType;
  frontmatter?: BlogFrontmatter;
};

const modules = import.meta.glob<BlogModule>("../../content/posts/*.mdx", {
  eager: true,
});

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
