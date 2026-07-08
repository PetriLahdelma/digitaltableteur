"use client";

import { type ReactNode, type RefObject } from "react";
import { cn } from "../../lib/cn";
import { ReadingProgress } from "../../components/ReadingProgress";

export interface ArticleLayoutProps {
  /** Navigation slot (back link, etc.) */
  nav?: ReactNode;
  /** Hero section */
  hero: ReactNode;
  /** Main content area */
  children: ReactNode;
  /** Sidebar content (TOC, etc.) */
  sidebar?: ReactNode;
  /** Related posts section */
  relatedPosts?: ReactNode;
  /** Show reading progress indicator */
  showReadingProgress?: boolean;
  /** Ref for reading progress tracking */
  contentRef?: RefObject<HTMLElement | null>;
  /** Custom className */
  className?: string;
  /** Document language for the article root */
  lang?: string;
}

/**
 * ArticleLayout - Layout structure for article pages
 *
 * Structure:
 * - Reading progress bar (fixed, top)
 * - Navigation (optional)
 * - Hero section
 * - Main content (with optional sidebar for TOC)
 * - Related posts section (optional)
 */
export function ArticleLayout({
  nav,
  hero,
  children,
  sidebar,
  relatedPosts,
  showReadingProgress = true,
  contentRef,
  className,
  lang,
}: ArticleLayoutProps) {
  return (
    <article lang={lang} className={cn("relative", className)}>
      {/* Reading progress */}
      {showReadingProgress && contentRef && (
        <ReadingProgress targetRef={contentRef} />
      )}

      {/* Navigation - sticky below header with yellow background */}
      {nav && (
        <div
          className="sticky top-20 z-30 flex w-full items-center border-b border-border"
          style={{
            backgroundColor: "var(--logo-background)",
            color: "var(--logo-color)",
            ["--color-primary" as string]: "var(--logo-color)",
          }}
        >
          {nav}
        </div>
      )}

      {/* Hero */}
      <header>{hero}</header>

      {/* Main content area */}
      {sidebar ? (
        /* Layout with sidebar */
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 tablet:px-6 desktop:px-8">
            <div className="grid grid-cols-1 desktop:grid-cols-12 gap-8 desktop:gap-12">
              {/* Main content */}
              <main className="desktop:col-span-8 min-w-0">{children}</main>

              {/* Sidebar */}
              <aside className="hidden desktop:block desktop:col-span-4">
                <div className="sticky top-24">{sidebar}</div>
              </aside>
            </div>
          </div>
        </div>
      ) : (
        /* Full-width content (no sidebar) */
        <main>{children}</main>
      )}

      {/* Related posts */}
      {relatedPosts && <footer>{relatedPosts}</footer>}
    </article>
  );
}

ArticleLayout.displayName = "ArticleLayout";
