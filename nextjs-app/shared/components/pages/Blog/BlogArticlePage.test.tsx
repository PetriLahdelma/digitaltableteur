import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlogArticlePage } from "./BlogArticlePage";

const mockArticle = {
  title: "Test Article",
  slug: "test-article",
  excerpt: "Test excerpt",
  content: "Test content",
  publishedAt: "2024-01-01",
  author: {
    name: "Test Author",
    slug: "test-author",
  },
};

describe("BlogArticlePage", () => {
  it("renders article title", () => {
    render(<BlogArticlePage article={mockArticle} />);
    expect(screen.getByText("Test Article")).toBeInTheDocument();
  });

  it("renders article author", () => {
    render(<BlogArticlePage article={mockArticle} />);
    expect(screen.getByText(/Test Author/i)).toBeInTheDocument();
  });

  it("renders article date", () => {
    render(<BlogArticlePage article={mockArticle} />);
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it("renders article content", () => {
    render(<BlogArticlePage article={mockArticle} />);
    expect(screen.getByText(/Test content/i)).toBeInTheDocument();
  });

  it("renders back to blog link", () => {
    render(<BlogArticlePage article={mockArticle} />);
    expect(
      screen.getByRole("link", { name: /back|blog/i }),
    ).toBeInTheDocument();
  });
});
