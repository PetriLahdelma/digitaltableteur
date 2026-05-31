import { describe, expect, it } from "vitest";

import { buildBlogRssFeed } from "./rss";

describe("buildBlogRssFeed", () => {
  it("renders RSS items for visible posts", () => {
    const xml = buildBlogRssFeed([
      {
        slug: "figma-mcp-design-systems",
        title: "MCP, Design Systems, and Generative UI",
        excerpt: "How Figma's MCP server speeds up design-to-code workflows.",
        publishedAt: "2025-06-05T00:00:00.000Z",
        authorName: "Petri Lahdelma",
      },
    ]);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<title>MCP, Design Systems, and Generative UI</title>");
    expect(xml).toContain("/blog/figma-mcp-design-systems");
    expect(xml).toContain("Petri Lahdelma");
  });
});
