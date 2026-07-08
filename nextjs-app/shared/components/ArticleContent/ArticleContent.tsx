"use client";

import { forwardRef, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Container } from "../Container";
import { articleProseClassName } from "./articleProseClasses";

export interface ArticleContentProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export interface ArticleProseProps {
  children: ReactNode;
  className?: string;
}

/** Typography wrapper for MDX article body. Use `not-prose` for anything outside MDX. */
export function ArticleProse({ children, className }: ArticleProseProps) {
  return <div className={cn(articleProseClassName, className)}>{children}</div>;
}

/**
 * Reading column for blog article bodies: constrains MDX/article markup to a
 * `size` reading measure via Container and vertical rhythm. Wrap the body in
 * `ArticleProse` for the prose typography; forwards a ref to the inner content
 * wrapper for scroll/measure needs.
 */
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
