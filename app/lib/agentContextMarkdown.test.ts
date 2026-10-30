import { describe, expect, it } from "vitest";

import {
  AGENT_CONTEXT_HEADERS,
  buildChangelogMarkdown,
  buildTimelineMarkdown,
  buildTimelineSections,
} from "./agentContextMarkdown";

const base = "https://example.test";

describe("agent context Markdown", () => {
  const timeline = [
    { date: "2026-11-12", text: "Keynote in Tallinn", upcoming: true },
    { date: "2026-10-15", text: "Publishes an article", href: "/blog/post" },
    { date: "2002", text: "Starts designing for the web" },
  ];

  it("groups the timeline by year, newest first, with absolute proof links", () => {
    const md = buildTimelineMarkdown(base, timeline);
    expect(md).toContain("# Digitaltableteur timeline");
    expect(md).toContain("since 2002");
    expect(md.indexOf("## 2026")).toBeLessThan(md.indexOf("## 2002"));
    expect(md).toContain("- 2026-11-12: Keynote in Tallinn (upcoming)");
    expect(md).toContain("- 2026-10-15: Publishes an article ([source](https://example.test/blog/post))");
    expect(md).toContain("- 2002: Starts designing for the web\n");
  });

  it("can nest the timeline under a deeper heading for llms-full.txt", () => {
    expect(buildTimelineSections(base, timeline, 3)).toMatch(/^### 2026/);
  });

  it("groups the changelog by month without linking the source repository", () => {
    const md = buildChangelogMarkdown(base, [
      { date: "2026-10-29", sha: "abc1234", area: "Site", text: "Ships a thing" },
      { date: "2026-09-02", sha: "def5678", area: "Design system", text: "Adds a token" },
    ]);
    expect(md).toContain("(2 entries, latest 2026-10-29)");
    expect(md.indexOf("## 2026-10")).toBeLessThan(md.indexOf("## 2026-09"));
    expect(md).toContain("- 2026-10-29 (Site): Ships a thing\n");
    expect(md).not.toContain("github.com");
  });

  it("serves Markdown that search engines do not index", () => {
    expect(AGENT_CONTEXT_HEADERS["Content-Type"]).toBe("text/markdown; charset=utf-8");
    expect(AGENT_CONTEXT_HEADERS["X-Robots-Tag"]).toBe("noindex");
  });

  it("uses no em dashes or middle dots in the generated prose", () => {
    const md = buildTimelineMarkdown(base, timeline) + buildChangelogMarkdown(base, []);
    expect(md).not.toMatch(/[—·]/);
  });
});
