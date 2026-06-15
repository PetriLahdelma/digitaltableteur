import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils/render";
import { BlogPage } from "./BlogPage";
import { BlogArticlePage } from "./BlogArticlePage";

const samplePosts = [
  {
    slug: "first-post",
    title: "First Post",
    excerpt: "Intro",
    readTime: "3 min read",
    publishedAt: "2024-01-01",
    authorName: "Author One",
    authorSlug: "author-one",
    mainImageUrl: "/hero.jpg",
    mainImageAlt: "First Post",
    mainImageCaption: "Hero caption",
    Component: () => <p data-testid="mdx-body">Body A</p>,
  },
  {
    slug: "second-post",
    title: "Second Post",
    excerpt: "More",
    readTime: "5 min read",
    publishedAt: "2023-12-12",
    Component: () => <p data-testid="mdx-body">Body B</p>,
  },
];

vi.mock("../../../data/blogPosts", () => ({
  getBlogPosts: vi.fn(() => samplePosts),
  getBlogPostBySlug: vi.fn((slug: string) =>
    samplePosts.find((p) => p.slug === slug),
  ),
}));

vi.mock("../../../data/authors", () => ({
  getAuthorBySlug: vi.fn(() => ({ imageUrl: "/author.png" })),
}));

describe("Blog pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists blog posts with cards", () => {
    renderWithProviders(<BlogPage />);

    expect(
      screen.getByRole("heading", { name: /Our thoughts/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /first post|second post/i }),
    ).toHaveLength(2);
  });

  it("renders blog article with metadata, hero and related reads", () => {
    renderWithProviders(
      <BlogArticlePage
        slug="first-post"
        nav={<div data-testid="nav-slot">NAV</div>}
        shareBaseUrl="https://example.com"
      />,
    );

    expect(screen.getByTestId("nav-slot")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /First Post/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("3 min read")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /first post/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Related Articles/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /second post/i })).toHaveLength(
      1,
    );
    expect(screen.getByTestId("mdx-body")).toBeInTheDocument();
  });
});
