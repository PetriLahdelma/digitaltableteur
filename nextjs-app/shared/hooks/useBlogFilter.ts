"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  useNavigationPathname,
  useNavigationRouter,
  useNavigationSearchParams,
} from "../lib/navigation";
import type { BlogPostEntry } from "../data/blogPosts";

export interface UseBlogFilterOptions {
  /** Array of blog posts to filter */
  posts: BlogPostEntry[];
  /** URL query param name for tag filter */
  tagParam?: string;
}

export interface UseBlogFilterReturn {
  /** Filtered and sorted posts */
  filteredPosts: BlogPostEntry[];
  /** Currently selected tag (null = all) */
  selectedTag: string | null;
  /** Function to change selected tag */
  setSelectedTag: (tag: string | null) => void;
  /** Array of all unique tags */
  allTags: string[];
  /** Count of posts per tag */
  tagCounts: Record<string, number>;
}

/**
 * Hook for filtering blog posts by tag with URL sync
 */
export function useBlogFilter({
  posts,
  tagParam = "tag",
}: UseBlogFilterOptions): UseBlogFilterReturn {
  const searchParams = useNavigationSearchParams();
  const router = useNavigationRouter();
  const pathname = useNavigationPathname() ?? "";

  // Get initial tag from URL
  const urlTag = searchParams.get(tagParam);
  const [selectedTag, setSelectedTagState] = useState<string | null>(
    urlTag || null
  );

  // Sync state with URL on mount and URL changes
  useEffect(() => {
    const currentUrlTag = searchParams.get(tagParam);
    if (currentUrlTag !== selectedTag) {
      setSelectedTagState(currentUrlTag);
    }
  }, [searchParams, tagParam, selectedTag]);

  // Extract all unique tags from posts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((post) => {
      // Use tags array if available
      if (post.tags) {
        post.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  // Calculate tag counts
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((post) => {
      if (post.tags) {
        post.tags.forEach((tag) => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      }
    });
    return counts;
  }, [posts]);

  // Filter posts by selected tag
  const filteredPosts = useMemo(() => {
    let result = posts;

    // Filter by tag
    if (selectedTag) {
      result = result.filter(
        (post) => post.tags && post.tags.includes(selectedTag)
      );
    }

    // Sort by date (newest first)
    result = [...result].sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });

    return result;
  }, [posts, selectedTag]);

  // Update URL and state when tag changes
  const setSelectedTag = useCallback(
    (tag: string | null) => {
      setSelectedTagState(tag);

      // Update URL
      const params = new URLSearchParams(searchParams.toString());
      if (tag) {
        params.set(tagParam, tag);
      } else {
        params.delete(tagParam);
      }

      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      router.push(newUrl, { scroll: false });
    },
    [searchParams, pathname, router, tagParam]
  );

  return {
    filteredPosts,
    selectedTag,
    setSelectedTag,
    allTags,
    tagCounts,
  };
}
