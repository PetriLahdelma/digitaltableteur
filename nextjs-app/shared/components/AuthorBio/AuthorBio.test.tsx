/// <reference types="../../../vitest-axe" />
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { axe } from "jest-axe";
import "@testing-library/jest-dom/vitest";
import AuthorBio from "@dt/AuthorBio";
import * as authorsData from "../../data/authors";

// Mock the authors data module
vi.mock("../../data/authors", () => ({
  getAuthorBySlug: vi.fn(),
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (key === "authorBio.ariaLabel" && params?.name) {
        return `About ${params.name}`;
      }
      return key;
    },
  }),
}));

const mockAuthor = {
  name: "John Doe",
  slug: "john-doe",
  imageUrl: "https://example.com/avatar.jpg",
  bio: "First paragraph with introduction.\n\nSecond paragraph with more details.\n\nThird paragraph conclusion.",
};

const mockAuthorWithoutImage = {
  name: "Jane Smith",
  slug: "jane-smith",
  bio: "Simple bio without paragraphs.",
};

const mockAuthorMinimal = {
  name: "Test Author",
  slug: "test-author",
};

describe("AuthorBio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    test("renders without crashing with valid author", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthor);
      render(<AuthorBio slug="john-doe" />);
      expect(screen.getByRole("region")).toBeInTheDocument();
    });

    test("returns null when author not found", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(undefined);
      const { container } = render(<AuthorBio slug="nonexistent" />);
      expect(container.firstChild).toBeNull();
    });

    test("renders author name as heading", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthor);
      render(<AuthorBio slug="john-doe" />);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    test("renders custom heading when provided", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthor);
      render(<AuthorBio slug="john-doe" heading="Meet the Author" />);
      expect(screen.getByText("Meet the Author")).toBeInTheDocument();
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });

    test("renders avatar when imageUrl is provided", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthor);
      render(<AuthorBio slug="john-doe" />);
      const avatar = screen.getByAltText("John Doe");
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute("src", mockAuthor.imageUrl);
    });

    test("does not render avatar when imageUrl is missing", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(
        mockAuthorWithoutImage,
      );
      render(<AuthorBio slug="jane-smith" />);
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    test("renders role under the name when provided", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue({
        ...mockAuthor,
        role: "Founder, CEO",
      });
      render(<AuthorBio slug="john-doe" />);
      expect(screen.getByText("Founder, CEO")).toBeInTheDocument();
    });

    test("does not render role when absent", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthor);
      const { container } = render(<AuthorBio slug="john-doe" />);
      expect(container.querySelector("[class*='role']")).not.toBeInTheDocument();
    });

    test("renders lead paragraph as tagline", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthor);
      render(<AuthorBio slug="john-doe" />);
      expect(
        screen.getByText("First paragraph with introduction."),
      ).toBeInTheDocument();
    });

    test("renders remaining bio content as markdown", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthor);
      render(<AuthorBio slug="john-doe" />);
      expect(
        screen.getByText("Second paragraph with more details."),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Third paragraph conclusion."),
      ).toBeInTheDocument();
    });

    test("renders single paragraph bio without splitting", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(
        mockAuthorWithoutImage,
      );
      render(<AuthorBio slug="jane-smith" />);
      expect(
        screen.getByText("Simple bio without paragraphs."),
      ).toBeInTheDocument();
    });

    test("handles empty bio gracefully", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthorMinimal);
      render(<AuthorBio slug="test-author" />);
      expect(screen.getByText("Test Author")).toBeInTheDocument();
      // Should still render the section even without bio content
      expect(screen.getByRole("region")).toBeInTheDocument();
    });

    test("handles null bio gracefully", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue({
        ...mockAuthorMinimal,
        bio: undefined,
      });
      render(<AuthorBio slug="test-author" />);
      expect(screen.getByRole("region")).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    test("applies custom className", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthor);
      const { container } = render(
        <AuthorBio slug="john-doe" className="custom-class" />,
      );
      const section = container.querySelector("section");
      expect(section).toHaveClass("custom-class");
    });

    test("preserves default className when custom className added", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthor);
      const { container } = render(
        <AuthorBio slug="john-doe" className="custom-class" />,
      );
      const section = container.querySelector("section");
      expect(section?.className).toContain("authorBio");
      expect(section?.className).toContain("custom-class");
    });

    test("fetches author by slug prop", () => {
      const getAuthorBySlugSpy = vi.mocked(authorsData.getAuthorBySlug);
      getAuthorBySlugSpy.mockReturnValue(mockAuthor);
      render(<AuthorBio slug="john-doe" />);
      expect(getAuthorBySlugSpy).toHaveBeenCalledWith("john-doe");
    });
  });

  describe("Accessibility", () => {
    test("has no accessibility violations with full content", async () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthor);
      const { container } = render(<AuthorBio slug="john-doe" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("has no accessibility violations without image", async () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(
        mockAuthorWithoutImage,
      );
      const { container } = render(<AuthorBio slug="jane-smith" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("has no accessibility violations with minimal content", async () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthorMinimal);
      const { container } = render(<AuthorBio slug="test-author" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("uses semantic section element", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthor);
      render(<AuthorBio slug="john-doe" />);
      expect(screen.getByRole("region")).toBeInTheDocument();
    });

    test("provides aria-label with author name", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthor);
      render(<AuthorBio slug="john-doe" />);
      const section = screen.getByRole("region");
      expect(section).toHaveAttribute("aria-label", "About John Doe");
    });

    test("uses proper heading level (h3)", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthor);
      render(<AuthorBio slug="john-doe" />);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("John Doe");
    });

    test("avatar has proper alt text", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthor);
      render(<AuthorBio slug="john-doe" />);
      const avatar = screen.getByAltText("John Doe");
      expect(avatar).toBeInTheDocument();
    });
  });

  describe("Content Splitting", () => {
    test("splits bio on double newlines", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthor);
      const { container } = render(<AuthorBio slug="john-doe" />);

      // Lead paragraph should be in tagline class
      const tagline = container.querySelector("[class*='tagline']");
      expect(tagline).toHaveTextContent("First paragraph with introduction.");

      // Remaining paragraphs should be in bioContent class
      const bioContent = container.querySelector("[class*='bioContent']");
      expect(bioContent).toHaveTextContent(
        "Second paragraph with more details.",
      );
      expect(bioContent).toHaveTextContent("Third paragraph conclusion.");
    });

    test("trims whitespace from split content", () => {
      const authorWithWhitespace = {
        ...mockAuthor,
        bio: "  First paragraph  \n\n  Second paragraph  ",
      };
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(
        authorWithWhitespace,
      );
      render(<AuthorBio slug="john-doe" />);

      expect(screen.getByText("First paragraph")).toBeInTheDocument();
      expect(screen.getByText("Second paragraph")).toBeInTheDocument();
    });

    test("handles bio with only lead paragraph", () => {
      const authorSingleParagraph = {
        ...mockAuthor,
        bio: "Only one paragraph here.",
      };
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(
        authorSingleParagraph,
      );
      const { container } = render(<AuthorBio slug="john-doe" />);

      expect(screen.getByText("Only one paragraph here.")).toBeInTheDocument();
      // bioContent should not render when no remainder
      const bioContent = container.querySelector("[class*='bioContent']");
      expect(bioContent).not.toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    test("uses Avatar component with correct props", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthor);
      render(<AuthorBio slug="john-doe" />);

      const avatar = screen.getByAltText("John Doe");
      expect(avatar).toHaveAttribute("src", mockAuthor.imageUrl);
      // Avatar size is passed as "4rem" in the component
    });

    test("uses Title component for heading", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthor);
      render(<AuthorBio slug="john-doe" />);

      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading.className).toMatch(/name/);
    });

    test("uses Text component for tagline", () => {
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(mockAuthor);
      const { container } = render(<AuthorBio slug="john-doe" />);

      const tagline = container.querySelector("[class*='tagline']");
      expect(tagline).toBeInTheDocument();
    });

    test("uses ReactMarkdown for bio content", () => {
      const authorWithMarkdown = {
        ...mockAuthor,
        bio: "Lead paragraph.\n\n**Bold text** and *italic text*.",
      };
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(
        authorWithMarkdown,
      );
      render(<AuthorBio slug="john-doe" />);

      // ReactMarkdown should render bold and italic tags
      expect(screen.getByText("Bold text")).toBeInTheDocument();
      expect(screen.getByText("italic text")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    test("handles very long bio text", () => {
      const longBio = Array(10)
        .fill("This is a paragraph of text.")
        .join("\n\n");
      const authorLongBio = {
        ...mockAuthor,
        bio: longBio,
      };
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(authorLongBio);

      const { container } = render(<AuthorBio slug="john-doe" />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });

    test("handles special characters in bio", () => {
      const authorSpecialChars = {
        ...mockAuthor,
        bio: "Bio with special chars: <>&\"'\n\nSecond paragraph.",
      };
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(
        authorSpecialChars,
      );
      render(<AuthorBio slug="john-doe" />);

      expect(screen.getByText(/Bio with special chars/)).toBeInTheDocument();
    });

    test("handles author name with special characters", () => {
      const authorSpecialName = {
        ...mockAuthor,
        name: "Jöhn Döe & Co.",
      };
      vi.mocked(authorsData.getAuthorBySlug).mockReturnValue(authorSpecialName);
      render(<AuthorBio slug="john-doe" />);

      expect(screen.getByText("Jöhn Döe & Co.")).toBeInTheDocument();
      const section = screen.getByRole("region");
      expect(section).toHaveAttribute("aria-label", "About Jöhn Döe & Co.");
    });
  });
});
