"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Number of page buttons to show on each side of current page */
  siblingCount?: number;
  /** Custom className */
  className?: string;
}

/**
 * Generate array of page numbers with ellipsis
 */
function generatePageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | "...")[] {
  const totalPageNumbers = siblingCount * 2 + 3; // siblings + current + first + last

  // If total pages is less than what we'd show, return all pages
  if (totalPages <= totalPageNumbers + 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftDots = leftSiblingIndex > 2;
  const showRightDots = rightSiblingIndex < totalPages - 1;

  const pages: (number | "...")[] = [];

  // Always show first page
  pages.push(1);

  // Left dots
  if (showLeftDots) {
    pages.push("...");
  }

  // Middle pages
  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    if (i !== 1 && i !== totalPages) {
      pages.push(i);
    }
  }

  // Right dots
  if (showRightDots) {
    pages.push("...");
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  const { t } = useTranslation();

  const pages = useMemo(
    () => generatePageRange(currentPage, totalPages, siblingCount),
    [currentPage, totalPages, siblingCount]
  );

  // Don't render if only one page
  if (totalPages <= 1) {
    return null;
  }

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <nav
      aria-label={t("blogPageNavigation", "Page navigation")}
      className={cn("flex items-center justify-center gap-1", className)}
    >
      {/* Previous button */}
      <button
        type="button"
        onClick={() => canGoPrev && onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
        aria-label={t("blogPrevPage", "Previous page")}
        className={cn(
          "inline-flex items-center justify-center",
          "w-10 h-10 rounded-lg",
          "font-body text-sm",
          "transition-colors duration-200 motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          canGoPrev
            ? "text-foreground hover:bg-accent hover:text-accent-foreground"
            : "text-muted-foreground/50 cursor-not-allowed"
        )}
      >
        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`dots-${index}`}
                className="w-10 h-10 flex items-center justify-center text-muted-foreground"
                aria-hidden="true"
              >
                …
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-label={`${t("blogPage", "Page")} ${page}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex items-center justify-center",
                "w-10 h-10 rounded-lg",
                "font-body text-sm",
                "transition-colors duration-200 motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "bg-foreground text-background"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next button */}
      <button
        type="button"
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        aria-label={t("blogNextPage", "Next page")}
        className={cn(
          "inline-flex items-center justify-center",
          "w-10 h-10 rounded-lg",
          "font-body text-sm",
          "transition-colors duration-200 motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          canGoNext
            ? "text-foreground hover:bg-accent hover:text-accent-foreground"
            : "text-muted-foreground/50 cursor-not-allowed"
        )}
      >
        <ChevronRight className="w-5 h-5" aria-hidden="true" />
      </button>
    </nav>
  );
}

Pagination.displayName = "Pagination";
