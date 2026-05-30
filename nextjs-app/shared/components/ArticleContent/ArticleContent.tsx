"use client";

import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "../Container";

export interface ArticleContentProps {
  /** Article content (MDX rendered content) */
  children: ReactNode;
  /** Maximum width variant */
  size?: "sm" | "md" | "lg";
  /** Custom className */
  className?: string;
}

/**
 * ArticleContent - Wrapper for article body with proper typography styling
 *
 * Features:
 * - Max-width prose container
 * - Typography scale for articles
 * - Proper spacing between elements
 * - Responsive padding
 */
const articleProseClassName = cn(
            // Base prose styling (MDX body only — never wrap author cards / avatars)
            "prose prose-lg dark:prose-invert max-w-none",

            // Headings
            "prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight",
            "prose-h2:text-2xl prose-h2:tablet:text-3xl prose-h2:mt-12 prose-h2:mb-6",
            "prose-h3:text-xl prose-h3:tablet:text-2xl prose-h3:mt-10 prose-h3:mb-4",
            "prose-h4:text-lg prose-h4:tablet:text-xl prose-h4:mt-8 prose-h4:mb-3",

            // Paragraphs and body text
            "prose-p:font-body prose-p:text-base prose-p:tablet:text-lg",
            "prose-p:leading-relaxed prose-p:text-foreground/90",
            "prose-p:my-6",

            // Links
            "prose-a:text-primary prose-a:font-medium prose-a:underline",
            "prose-a:underline-offset-2 hover:prose-a:text-primary/80",

            // Lists
            "prose-li:font-body prose-li:text-base prose-li:tablet:text-lg",
            "prose-li:text-foreground/90",
            "prose-ul:my-6 prose-ol:my-6",
            "prose-li:my-2",

            // Blockquotes
            "prose-blockquote:font-body prose-blockquote:italic",
            "prose-blockquote:border-l-4 prose-blockquote:border-primary",
            "prose-blockquote:pl-6 prose-blockquote:py-2",
            "prose-blockquote:text-lg prose-blockquote:tablet:text-xl",
            "prose-blockquote:text-muted-foreground",
            "prose-blockquote:my-8",

            // Code
            "prose-code:font-mono prose-code:text-sm",
            "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded",
            "prose-pre:bg-muted prose-pre:rounded-lg prose-pre:p-4",
            "prose-pre:mx-auto prose-pre:max-w-[80%] prose-pre:max-h-[35vh]",
            "prose-pre:overflow-x-hidden prose-pre:overflow-y-auto prose-pre:whitespace-pre-wrap prose-pre:break-words prose-pre:my-6",

            // Images (figure layout handled by MdxFigure + MdxImageWrapper)
            "prose-img:rounded-lg",
            "prose-figure:my-0",
            "prose-figcaption:mt-0",

            // Tables
            "prose-table:my-6",
            "prose-th:font-body prose-th:font-semibold prose-th:text-left",
            "prose-td:font-body",

            // Strong and emphasis
            "prose-strong:font-semibold prose-strong:text-foreground",
            "prose-em:italic",

            // Horizontal rule
            "prose-hr:my-12 prose-hr:border-border"
);

export interface ArticleProseProps {
  children: ReactNode;
  className?: string;
}

/** Typography wrapper for MDX article body. Use `not-prose` for anything outside MDX. */
export function ArticleProse({ children, className }: ArticleProseProps) {
  return <div className={cn(articleProseClassName, className)}>{children}</div>;
}

export const ArticleContent = forwardRef<HTMLDivElement, ArticleContentProps>(
  function ArticleContent({ children, size = "md", className }, ref) {
    return (
      <Container size={size} className={cn("py-8 tablet:py-12", className)}>
        <div ref={ref} className="min-w-0">{children}</div>
      </Container>
    );
  }
);

ArticleContent.displayName = "ArticleContent";
