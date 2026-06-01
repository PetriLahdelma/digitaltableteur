"use client";

import { useRef, type ReactNode } from "react";

import { LanguageNotice } from "@/app/components/LanguageNotice";
import { ArticleContent } from "@/nextjs-app/shared/components/ArticleContent";
import { ArticleLayout } from "@/nextjs-app/shared/patterns/ArticleLayout";
import { NextBlogNav } from "../NextBlogNav";

export interface ClientArticleShellProps {
  /** Server-rendered hero (metadata + image in initial HTML). */
  hero: ReactNode;
  /** Server-rendered article body shell + client MDX boundary. */
  children: ReactNode;
  /** Server-rendered related posts footer. */
  relatedPosts?: ReactNode;
}

/**
 * Client chrome for blog articles: yellow sticky nav, reading progress,
 * and layout slots. Keeps MDX on the server graph via children from RSC.
 */
export default function ClientArticleShell({
  hero,
  children,
  relatedPosts,
}: ClientArticleShellProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <LanguageNotice contentLanguage="en" />
      <ArticleLayout
        lang="en"
        nav={<NextBlogNav />}
        hero={hero}
        relatedPosts={relatedPosts}
        contentRef={contentRef}
        showReadingProgress
      >
        <ArticleContent ref={contentRef}>{children}</ArticleContent>
      </ArticleLayout>
    </>
  );
}
