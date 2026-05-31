import { describe, expect, it } from "vitest";

import { buildSiteTree } from "./siteStructure";

const labels = {
  sectionMain: "Main",
  sectionWork: "Work",
  sectionBlog: "Blog",
  sectionAuthors: "Authors",
  sectionGuides: "Guides",
  sectionServices: "Services",
  sectionStacks: "Stacks",
  sectionAudiences: "Audiences",
  sectionTopics: "Topics",
  sectionLegal: "Legal",
  home: "Home",
  about: "About",
  contact: "Contact",
  pricing: "Pricing",
  blog: "Blog",
  colophon: "Colophon",
  privacyPolicy: "Privacy",
  imprint: "Imprint",
  aiUse: "AI use",
  accessibility: "Accessibility",
  guides: "Guides",
  rssFeed: "RSS",
  xmlSitemap: "XML sitemap",
};

describe("buildSiteTree", () => {
  it("includes primary sections and work portfolio links", () => {
    const tree = buildSiteTree(labels);

    expect(tree.map((node) => node.id)).toEqual([
      "main",
      "work",
      "blog",
      "guides",
      "legal",
    ]);

    const work = tree.find((node) => node.id === "work");
    expect(work?.href).toBe("/work");
    expect(work?.children?.length).toBeGreaterThan(0);
    expect(work?.children?.some((child) => child.href === "/work/vertaaux")).toBe(
      true,
    );
  });

  it("includes visible blog posts and author pages", () => {
    const tree = buildSiteTree(labels);
    const blog = tree.find((node) => node.id === "blog");

    expect(blog?.children?.some((child) => child.href?.startsWith("/blog/"))).toBe(
      true,
    );

    const authorsBranch = blog?.children?.find((child) => child.id === "blog-authors");
    expect(authorsBranch?.children?.some((child) =>
      child.href?.startsWith("/blog/authors/"),
    )).toBe(true);
  });
});
