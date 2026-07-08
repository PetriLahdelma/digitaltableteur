"use client";

import { useState } from "react";
import { useTranslate } from "../../lib/translation";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

export interface TOCItem {
  /** Heading element ID */
  id: string;
  /** Heading text */
  text: string;
  /** Heading level (2 or 3) */
  level: 2 | 3;
}

export interface TableOfContentsProps {
  /** Array of headings to display */
  items: TOCItem[];
  /** Currently active heading ID */
  activeId?: string | null;
  /** Make TOC sticky on scroll */
  sticky?: boolean;
  /** Callback when item is clicked */
  onItemClick?: (id: string) => void;
  /** Custom className */
  className?: string;
}

/**
 * TableOfContents - Navigation for article headings
 *
 * Features:
 * - Active section highlighting
 * - Smooth scroll to section
 * - Collapsible on mobile
 * - Sticky positioning option
 */
export function TableOfContents({
  items,
  activeId,
  sticky = false,
  onItemClick,
  className,
}: TableOfContentsProps) {
  const t = useTranslate();
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't render if no items
  if (!items || items.length === 0) {
    return null;
  }

  const handleClick = (id: string) => {
    onItemClick?.(id);
    // Also handle scroll if no callback provided
    if (!onItemClick) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    // Collapse on mobile after click
    setIsExpanded(false);
  };

  return (
    <nav
      aria-label={t("articleTOCTitle", "Table of Contents")}
      className={cn(
        "w-full",
        sticky && "tablet:sticky tablet:top-24",
        className
      )}
    >
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center justify-between w-full",
          "tablet:hidden",
          "p-4 bg-muted rounded-lg",
          "text-sm font-body font-medium text-foreground"
        )}
        aria-expanded={isExpanded}
      >
        <span>{t("articleTOCTitle", "Table of Contents")}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* TOC list */}
      <div
        className={cn(
          // Mobile: collapsible
          "tablet:block",
          isExpanded ? "block" : "hidden",
          "mt-2 tablet:mt-0"
        )}
      >
        {/* Title (desktop only) */}
        <h2 className="hidden tablet:block text-sm font-body font-semibold text-foreground mb-4 uppercase tracking-wider">
          {t("articleTOCTitle", "Table of Contents")}
        </h2>

        {/* Items */}
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = activeId === item.id;
            const isH3 = item.level === 3;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleClick(item.id)}
                  className={cn(
                    "block w-full text-left",
                    "py-2 px-3 tablet:px-0 rounded tablet:rounded-none",
                    "font-body text-sm transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    // Indentation for h3
                    isH3 && "tablet:pl-4",
                    // Active state
                    isActive
                      ? "text-foreground font-medium bg-muted/50 tablet:bg-transparent tablet:border-l-2 tablet:border-primary tablet:pl-3"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.text}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

TableOfContents.displayName = "TableOfContents";
