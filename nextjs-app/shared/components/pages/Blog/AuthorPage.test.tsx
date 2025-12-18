import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthorPage } from "./AuthorPage";

const mockAuthor = {
  name: "Test Author",
  slug: "test-author",
  bio: "Test bio",
  image: "/test-image.jpg",
  articles: [],
};

describe("AuthorPage", () => {
  it("renders author name", () => {
    render(<AuthorPage author={mockAuthor} />);
    expect(screen.getByText("Test Author")).toBeInTheDocument();
  });

  it("renders author bio", () => {
    render(<AuthorPage author={mockAuthor} />);
    expect(screen.getByText("Test bio")).toBeInTheDocument();
  });

  it("renders author image", () => {
    render(<AuthorPage author={mockAuthor} />);
    const img = screen.getByAltText(/Test Author/i);
    expect(img).toBeInTheDocument();
  });

  it("renders back to blog link", () => {
    render(<AuthorPage author={mockAuthor} />);
    expect(
      screen.getByRole("link", { name: /back|blog/i }),
    ).toBeInTheDocument();
  });

  it("renders articles section when author has articles", () => {
    const authorWithArticles = {
      ...mockAuthor,
      articles: [
        { title: "Article 1", slug: "article-1", excerpt: "Excerpt 1" },
      ],
    };
    render(<AuthorPage author={authorWithArticles} />);
    expect(screen.getByText("Article 1")).toBeInTheDocument();
  });
});
