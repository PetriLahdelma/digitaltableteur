"use client";

import { useState, useEffect, useCallback, type RefObject } from "react";
import type { TOCItem } from "../components/TableOfContents";

export interface UseTableOfContentsOptions {
  /** Ref to the container element with headings */
  containerRef: RefObject<HTMLElement | null>;
  /** CSS selector for headings to extract */
  headingSelector?: string;
  /** Offset from top of viewport for active detection */
  rootMargin?: string;
}

export interface UseTableOfContentsReturn {
  /** Extracted heading items */
  items: TOCItem[];
  /** Currently active heading ID */
  activeId: string | null;
  /** Scroll to a heading by ID */
  scrollTo: (id: string) => void;
}

/**
 * Hook for Table of Contents functionality
 *
 * Features:
 * - Extracts headings from container
 * - Tracks scroll position for active heading
 * - Provides smooth scroll navigation
 */
export function useTableOfContents({
  containerRef,
  headingSelector = "h2, h3",
  rootMargin = "-20% 0px -60% 0px",
}: UseTableOfContentsOptions): UseTableOfContentsReturn {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Extract headings from container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const headings = container.querySelectorAll(headingSelector);
    const extractedItems: TOCItem[] = [];

    headings.forEach((heading, index) => {
      const element = heading as HTMLElement;

      // Generate ID if not present
      if (!element.id) {
        const text = element.textContent || "";
        const slug = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        element.id = slug || `heading-${index}`;
      }

      const level = heading.tagName === "H2" ? 2 : 3;

      extractedItems.push({
        id: element.id,
        text: element.textContent || "",
        level: level as 2 | 3,
      });
    });

    setItems(extractedItems);

    // Set initial active to first item
    if (extractedItems.length > 0 && !activeId) {
      setActiveId(extractedItems[0].id);
    }
  }, [containerRef, headingSelector, activeId]);

  // Track scroll position with IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first intersecting entry
        const intersecting = entries.filter((entry) => entry.isIntersecting);

        if (intersecting.length > 0) {
          // Get the one closest to the top of the viewport
          const sorted = intersecting.sort((a, b) => {
            return a.boundingClientRect.top - b.boundingClientRect.top;
          });
          setActiveId(sorted[0].target.id);
        }
      },
      {
        root: null,
        rootMargin,
        threshold: 0,
      }
    );

    // Observe all headings
    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [containerRef, items, rootMargin]);

  // Scroll to heading
  const scrollTo = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Calculate offset for fixed header
      const offset = 100; // Adjust based on header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setActiveId(id);
    }
  }, []);

  return {
    items,
    activeId,
    scrollTo,
  };
}
