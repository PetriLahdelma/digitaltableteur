import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RelatedProjects } from "./RelatedProjects";

// t(key, fallback) -> return the fallback so labels are readable.
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

vi.mock("../../data/projects", () => ({
  getRelatedProjects: () => [
    {
      id: "shipped-project",
      slug: "shipped-project",
      title: "Shipped Project",
      description: "A released case study.",
      thumbnail: "/images/portfolio/shipped/thumbnail.webp",
      category: "ux-design",
      tags: ["Product Design"],
    },
    {
      id: "teaser-project",
      slug: "teaser-project",
      title: "Teaser Project",
      description: "A case study that is not out yet.",
      thumbnail: "/images/portfolio/teaser/thumbnail.webp",
      category: "tools",
      tags: ["Product Design"],
      comingSoon: true,
    },
  ],
}));

describe("RelatedProjects", () => {
  it("links released projects to their case studies", () => {
    render(<RelatedProjects currentSlug="anything" />);

    expect(
      screen.getByRole("link", { name: /shipped project/i }),
    ).toHaveAttribute("href", "/work/shipped-project");
  });

  it("renders coming-soon projects as non-interactive teasers", () => {
    render(<RelatedProjects currentSlug="anything" />);

    expect(
      screen.queryByRole("link", { name: /teaser project/i }),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector('a[href="/work/teaser-project"]'),
    ).toBeNull();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });
});
