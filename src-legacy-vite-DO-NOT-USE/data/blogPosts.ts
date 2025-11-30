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

import * as postBrandingDesignSystemsEssay from "../../content/posts/branding-design-systems-essay.mdx";
import * as postDesigningIn2025 from "../../content/posts/designing-in-2025.mdx";
import * as postDesignSystemAI from "../../content/posts/design-system-meets-ai-building-the-self-evolving-component-library-pt-1.mdx";
import * as postDesignSystemAI2 from "../../content/posts/design-system-meets-ai-building-the-self-evolving-component-library-pt-2.mdx";
import * as postDigitalCraftsmanship from "../../content/posts/digital-craftsmanship.mdx";
import * as postFigmaMcp from "../../content/posts/figma-mcp-design-systems.mdx";
import * as postInSearchOfImpact from "../../content/posts/in-search-of-impact.mdx";
import * as postPetriBio from "../../content/posts/petri-lahdelma-bio.mdx";
import * as postFutureBranding from "../../content/posts/thoughts-on-future-branding.mdx";
import * as postWorkflowTips from "../../content/posts/workflow-tips.mdx";

const globFn =
  typeof import.meta !== "undefined" && (import.meta as any).glob
    ? ((import.meta as any).glob as <T>(
        pattern: string,
        opts: any,
      ) => Record<string, T>)
    : undefined;

const modules = globFn?.<BlogModule>("../../content/posts/*.mdx", {
  eager: true,
}) || {
  "../../content/posts/branding-design-systems-essay.mdx":
    postBrandingDesignSystemsEssay as BlogModule,
  "../../content/posts/designing-in-2025.mdx":
    postDesigningIn2025 as BlogModule,
  "../../content/posts/design-system-meets-ai-building-the-self-evolving-component-library-pt-1.mdx":
    postDesignSystemAI as BlogModule,
  "../../content/posts/design-system-meets-ai-building-the-self-evolving-component-library-pt-2.mdx":
    postDesignSystemAI2 as BlogModule,
  "../../content/posts/digital-craftsmanship.mdx":
    postDigitalCraftsmanship as BlogModule,
  "../../content/posts/figma-mcp-design-systems.mdx":
    postFigmaMcp as BlogModule,
  "../../content/posts/in-search-of-impact.mdx":
    postInSearchOfImpact as BlogModule,
  "../../content/posts/petri-lahdelma-bio.mdx": postPetriBio as BlogModule,
  "../../content/posts/thoughts-on-future-branding.mdx":
    postFutureBranding as BlogModule,
  "../../content/posts/workflow-tips.mdx": postWorkflowTips as BlogModule,
};

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
