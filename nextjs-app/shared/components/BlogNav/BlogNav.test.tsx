import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import BlogNav from "@dt/BlogNav";
import { vi, beforeEach, describe, it, expect } from "vitest";

expect.extend(toHaveNoViolations);

// Mock react-i18next
const mockT = vi.fn((key: string) => {
  const translations: { [key: string]: string } = {
    blogNavLabel: "Blog article navigation",
    blogNavBackToArticles: "Back to Articles",
    blogNavPrev: "Previous",
    blogNavNext: "Next",
  };
  return translations[key] || key;
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockT }),
}));

const { mockPush, mockUsePathname } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockUsePathname: vi.fn(() => "/blog/petri-lahdelma-bio"),
}));

vi.mock("next/navigation", () => {
  return {
    usePathname: mockUsePathname,
    useRouter: () => ({ push: mockPush }),
  };
});

describe("BlogNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/blog/petri-lahdelma-bio");
  });

  const renderWithRouter = () => {
    return render(<BlogNav />);
  };

  it("renders back to articles button", () => {
    renderWithRouter();
    expect(
      screen.getByRole("button", { name: /back to articles/i }),
    ).toBeInTheDocument();
  });

  it("renders previous and next buttons", () => {
    renderWithRouter();
    expect(
      screen.getByRole("button", { name: /previous/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  it("navigates to blog index when back to articles clicked", () => {
    renderWithRouter();
    const backButton = screen.getByRole("button", {
      name: /back to articles/i,
    });
    fireEvent.click(backButton);
    expect(mockPush).toHaveBeenCalledWith("/blog");
  });

  it("disables previous button when on first article", () => {
    mockUsePathname.mockReturnValue("/blog/petri-lahdelma-bio");
    renderWithRouter();
    const prevButton = screen.getByRole("button", { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it("disables next button when on last article", () => {
    mockUsePathname.mockReturnValue(
      "/blog/design-system-meets-ai-building-the-self-evolving-component-library-pt-2",
    );
    renderWithRouter();
    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it("enables both navigation buttons when on middle article", () => {
    mockUsePathname.mockReturnValue("/blog/digital-craftsmanship");
    renderWithRouter();
    const prevButton = screen.getByRole("button", { name: /previous/i });
    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it("navigates to previous article when previous button clicked", () => {
    mockUsePathname.mockReturnValue("/blog/digital-craftsmanship");
    renderWithRouter();
    const prevButton = screen.getByRole("button", { name: /previous/i });
    fireEvent.click(prevButton);
    expect(mockPush).toHaveBeenCalledWith("/blog/petri-lahdelma-bio");
  });

  it("navigates to next article when next button clicked", () => {
    mockUsePathname.mockReturnValue("/blog/petri-lahdelma-bio");
    renderWithRouter();
    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);
    expect(mockPush).toHaveBeenCalledWith("/blog/digital-craftsmanship");
  });

  it("handles unknown path gracefully", () => {
    mockUsePathname.mockReturnValue("/blog/unknown-article");
    renderWithRouter();
    const prevButton = screen.getByRole("button", { name: /previous/i });
    const nextButton = screen.getByRole("button", { name: /next/i });
    // Should handle gracefully without errors
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it("exposes a labelled navigation landmark", () => {
    renderWithRouter();
    expect(
      screen.getByRole("navigation", { name: "Blog article navigation" }),
    ).toBeInTheDocument();
  });

  it("prefers the currentPath prop over the router pathname", () => {
    // Router is on the first article; the prop points at a middle article.
    mockUsePathname.mockReturnValue("/blog/petri-lahdelma-bio");
    render(<BlogNav currentPath="/blog/digital-craftsmanship" />);
    expect(
      screen.getByRole("button", { name: /previous/i }),
    ).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /next/i })).not.toBeDisabled();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <BlogNav currentPath="/blog/digital-craftsmanship" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
