"use client";

import React from "react";
import { getBlogPostBySlug } from "../../../data/blogPosts";
import { ArticlePageTemplate } from "../../../patterns/ArticlePageTemplate";

export interface BlogArticlePageProps {
  /** Article slug */
  slug: string;
  /** Navigation slot */
  nav?: React.ReactNode;
  /** Base URL for share links */
  shareBaseUrl?: string;
}

export function BlogArticlePage({
  slug,
  nav,
  shareBaseUrl,
}: BlogArticlePageProps) {
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return null;
  }

  return (
    <ArticlePageTemplate
      post={post}
      nav={nav}
      shareBaseUrl={shareBaseUrl}
      showTOC={false}
      showRelated
      showReadingProgress
    />
  );
}
