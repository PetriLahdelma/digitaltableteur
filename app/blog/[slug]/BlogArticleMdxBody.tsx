"use client";

import { MDXProvider } from "@mdx-js/react";
import { getBlogPostBySlug } from "@/nextjs-app/shared/data/blogPosts";
import { articleProseClassName } from "@/nextjs-app/shared/components/ArticleContent/articleProseClasses";
import { articleMdxComponents } from "@/nextjs-app/shared/patterns/ArticlePageTemplate";

export function BlogArticleMdxBody({
  slug,
  showUnpublished = false,
}: {
  slug: string;
  showUnpublished?: boolean;
}) {
  const post = getBlogPostBySlug(slug, { showUnpublished });
  if (!post) return null;

  const { Component } = post;

  return (
    <div className={articleProseClassName}>
      <MDXProvider components={articleMdxComponents}>
        <Component />
      </MDXProvider>
    </div>
  );
}
