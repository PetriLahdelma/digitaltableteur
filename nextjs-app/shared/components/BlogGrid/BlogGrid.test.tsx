import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { BlogGrid } from "./BlogGrid";
import type { EnhancedArticleCardProps } from "../EnhancedArticleCard";

expect.extend(toHaveNoViolations);

vi.mock("../../lib/translation", () => {
  const t = (key: string, fallback?: string) => fallback ?? key;
  return {
    useTranslate: () => t,
    useLocalization: () => ({
      translate: t,
      language: "en",
      resolvedLanguage: "en",
      changeLanguage: vi.fn(),
      getResourceBundle: vi.fn(),
    }),
  };
});

const articles: EnhancedArticleCardProps[] = [
  {
    slug: "designing-in-2025",
    title: "Designing in 2025",
    excerpt: "Where craft meets systems.",
    author: { name: "Petri Lahdelma" },
    publishedAt: "2025-01-15",
    readTime: "5 min read",
    tags: ["Design"],
  },
  {
    slug: "figma-mcp-design-systems",
    title: "Figma MCP and design systems",
    excerpt: "Bridging design and code.",
    author: { name: "Petri Lahdelma" },
    publishedAt: "2025-02-10",
    readTime: "8 min read",
    tags: ["Tooling"],
  },
  {
    slug: "workflow-tips",
    title: "Workflow tips",
    excerpt: "Small habits, big output.",
    author: { name: "Petri Lahdelma" },
    publishedAt: "2025-03-01",
    readTime: "4 min read",
    tags: ["Process"],
  },
];

describe("BlogGrid", () => {
  it("renders a card per article", () => {
    render(<BlogGrid articles={articles} />);
    articles.forEach((a) => {
      expect(
        screen.getByRole("heading", { name: a.title }),
      ).toBeInTheDocument();
    });
  });

  it("promotes the chosen article in the featured-first layout", () => {
    render(
      <BlogGrid
        articles={articles}
        layout="featured-first"
        featuredSlug="workflow-tips"
      />,
    );
    // Every article still renders exactly once (featured + remaining).
    articles.forEach((a) => {
      expect(screen.getAllByRole("heading", { name: a.title })).toHaveLength(1);
    });
  });

  it("shows an empty state when there are no articles", () => {
    render(<BlogGrid articles={[]} />);
    expect(screen.getByText("No articles found")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<BlogGrid articles={articles} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations in the empty state", async () => {
    const { container } = render(<BlogGrid articles={[]} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
