import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useBlogFilter } from "./useBlogFilter";
import type { BlogPostEntry } from "../data/blogPosts";

// Simulate a statically-rendered production page: the navigation adapter's
// searchParams NEVER updates after a client-side push (Next's useSearchParams
// does not re-render on soft navigations in static prerenders). This is the
// environment where the tag selection used to revert instantly
// (Codex-migration regression #6).
const staticEmptyParams = new URLSearchParams();
const push = vi.fn();
vi.mock("../lib/navigation", () => ({
  useNavigationSearchParams: () => staticEmptyParams,
  useNavigationPathname: () => "/blog",
  useNavigationRouter: () => ({ push, replace: vi.fn() }),
}));

const posts = [
  { slug: "a", title: "A", tags: ["AI"], publishedAt: "2026-01-02" },
  { slug: "b", title: "B", tags: ["Design Systems"], publishedAt: "2026-01-01" },
  { slug: "c", title: "C", tags: ["AI", "Design Systems"], publishedAt: "2026-01-03" },
] as unknown as BlogPostEntry[];

describe("useBlogFilter", () => {
  it("keeps a fresh selection even when searchParams never updates after push (static prod)", () => {
    const { result } = renderHook(() => useBlogFilter({ posts }));

    expect(result.current.selectedTag).toBeNull();
    expect(result.current.filteredPosts).toHaveLength(3);

    act(() => {
      result.current.setSelectedTag("AI");
    });

    // The old sync effect compared against selectedTag and reverted this to
    // null because searchParams still said no tag.
    expect(result.current.selectedTag).toBe("AI");
    expect(result.current.filteredPosts.map((p) => p.slug)).toEqual(["c", "a"]);
    expect(push).toHaveBeenCalledWith("/blog?tag=AI", { scroll: false });
  });

  it("clears back to all posts", () => {
    const { result } = renderHook(() => useBlogFilter({ posts }));
    act(() => {
      result.current.setSelectedTag("AI");
    });
    act(() => {
      result.current.setSelectedTag(null);
    });
    expect(result.current.selectedTag).toBeNull();
    expect(result.current.filteredPosts).toHaveLength(3);
  });

  it("derives tags and counts", () => {
    const { result } = renderHook(() => useBlogFilter({ posts }));
    expect(result.current.allTags).toEqual(["AI", "Design Systems"]);
    expect(result.current.tagCounts).toEqual({ AI: 2, "Design Systems": 2 });
  });
});
