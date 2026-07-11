import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import SiteTree, { type SiteTreeNode } from "./SiteTree";

const nodes: SiteTreeNode[] = [
  {
    id: "main",
    label: "Main",
    defaultExpanded: true,
    children: [
      { id: "home", label: "Home", href: "/" },
      { id: "about", label: "About", href: "/about" },
    ],
  },
  {
    id: "external",
    label: "Feeds",
    children: [
      {
        id: "rss",
        label: "RSS feed",
        href: "/blog/feed.xml",
        external: true,
      },
    ],
  },
];

describe("SiteTree", () => {
  it("renders nothing when nodes array is empty", () => {
    const { container } = render(<SiteTree nodes={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a navigation landmark with default aria-label", () => {
    render(<SiteTree nodes={nodes} />);
    expect(screen.getByRole("navigation", { name: "Sitemap" })).toBeInTheDocument();
  });

  it("supports a custom aria-label", () => {
    render(<SiteTree nodes={nodes} aria-label="All pages" />);
    expect(screen.getByRole("navigation", { name: "All pages" })).toBeInTheDocument();
  });

  it("renders leaf links with href", () => {
    render(<SiteTree nodes={nodes} />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  });

  it("marks external links with target blank", () => {
    render(<SiteTree nodes={nodes} />);
    const rssLink = screen.getByRole("link", { name: /RSS feed/i });
    expect(rssLink).toHaveAttribute("target", "_blank");
    expect(rssLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("expands defaultExpanded branches", () => {
    render(<SiteTree nodes={nodes} />);
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink.closest("details")?.open).toBe(true);
  });

  it("keeps branch index links outside summary to avoid nested-interactive markup", () => {
    render(
      <SiteTree
        nodes={[
          {
            id: "docs",
            label: "Docs",
            href: "/docs",
            indexLabel: "Docs overview",
            defaultExpanded: true,
            children: [{ id: "api", label: "API", href: "/docs/api" }],
          },
        ]}
      />,
    );

    const summary = screen.getByText("Docs").closest("summary");
    expect(summary?.querySelector("a")).toBeNull();

    const branchIndexLink = screen.getByRole("link", { name: "Docs overview" });
    expect(branchIndexLink).toHaveAttribute("href", "/docs");
    expect(branchIndexLink.closest("summary")).toBeNull();
  });
});
