"use client";

import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
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
