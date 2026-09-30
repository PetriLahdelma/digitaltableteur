import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../test-utils/render";
import Blog from "./page";

describe("blog index page", () => {
  it("renders one interactive link per article in the primary card collection", () => {
    const { container } = renderWithProviders(<Blog />);
    const articleHrefs = Array.from(
      container.querySelectorAll<HTMLAnchorElement>('a[href^="/blog/"]'),
      (link) => link.getAttribute("href"),
    );

    expect(articleHrefs.length).toBeGreaterThan(0);
    expect(new Set(articleHrefs).size).toBe(articleHrefs.length);
    expect(container.querySelector(".sr-only a[href^='/blog/']")).toBeNull();
  });
});
