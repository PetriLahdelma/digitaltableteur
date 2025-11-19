import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BlogNav from "./BlogNav";
import { vi, beforeEach, describe, it, expect } from "vitest";

// Mock react-i18next
const mockT = vi.fn((key: string) => {
  const translations: { [key: string]: string } = {
    blogNavBackToArticles: "Back to Articles",
    blogNavPrev: "Previous",
    blogNavNext: "Next",
  };
  return translations[key] || key;
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockT }),
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock window.location
const mockLocation = vi.fn();
Object.defineProperty(window, "location", {
  value: { pathname: "/blog/petri-lahdelma-bio" },
  writable: true,
});

describe("BlogNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.pathname = "/blog/petri-lahdelma-bio";
  });

  const renderWithRouter = () => {
    return render(
      <MemoryRouter>
        <BlogNav />
      </MemoryRouter>,
    );
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
    expect(mockNavigate).toHaveBeenCalledWith("/blog");
  });

  it("disables previous button when on first article", () => {
    window.location.pathname = "/blog/petri-lahdelma-bio"; // First article
    renderWithRouter();
    const prevButton = screen.getByRole("button", { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it("disables next button when on last article", () => {
    window.location.pathname = "/blog/workflow-tips"; // Last article
    renderWithRouter();
    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it("enables both navigation buttons when on middle article", () => {
    window.location.pathname = "/blog/digital-craftsmanship"; // Middle article
    renderWithRouter();
    const prevButton = screen.getByRole("button", { name: /previous/i });
    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it("navigates to previous article when previous button clicked", () => {
    window.location.pathname = "/blog/digital-craftsmanship"; // Second article
    renderWithRouter();
    const prevButton = screen.getByRole("button", { name: /previous/i });
    fireEvent.click(prevButton);
    expect(mockNavigate).toHaveBeenCalledWith("/blog/petri-lahdelma-bio");
  });

  it("navigates to next article when next button clicked", () => {
    window.location.pathname = "/blog/petri-lahdelma-bio"; // First article
    renderWithRouter();
    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);
    expect(mockNavigate).toHaveBeenCalledWith("/blog/digital-craftsmanship");
  });

  it("handles unknown path gracefully", () => {
    window.location.pathname = "/blog/unknown-article";
    renderWithRouter();
    const prevButton = screen.getByRole("button", { name: /previous/i });
    const nextButton = screen.getByRole("button", { name: /next/i });
    // Should handle gracefully without errors
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });
});
