import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import WorkNav from "@dt/WorkNav";

const { mockPush, mockUsePathname } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockUsePathname: vi.fn(() => "/work/new-things-co"),
}));

vi.mock("next/navigation", () => {
  return {
    usePathname: mockUsePathname,
    useRouter: () => ({ push: mockPush }),
  };
});

// Mock translations
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        workNavBackToWork: "Work",
        workNavPrev: "Prev",
        workNavNext: "Next",
        workNavNewThingsCo: "New Things Co",
        workNavIllustrations: "Illustrations",
        workNavGarageJunction: "Garage Junction",
      };
      return translations[key] || key;
    },
  }),
}));

const renderWorkNav = (initialPath = "/work/new-things-co") => {
  mockUsePathname.mockReturnValue(initialPath);
  return render(<WorkNav />);
};

describe("WorkNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all navigation buttons", () => {
    renderWorkNav();

    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Prev")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("navigates to work page when back button is clicked", () => {
    renderWorkNav();

    const backButton = screen.getByText("Work");
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith("/work");
  });

  describe("navigation state", () => {
    it("disables prev button when on first page", () => {
      renderWorkNav("/work/helsinki-design-system");

      const prevButton = screen.getByText("Prev").closest("button");
      expect(prevButton).toBeDisabled();
    });

    it("enables prev button when not on first page", () => {
      renderWorkNav("/work/illustrations");

      const prevButton = screen.getByText("Prev").closest("button");
      expect(prevButton).not.toBeDisabled();
    });

    it("disables next button when on last page", () => {
      renderWorkNav("/work/garage-junction");

      const nextButton = screen.getByText("Next").closest("button");
      expect(nextButton).toBeDisabled();
    });

    it("enables next button when not on last page", () => {
      renderWorkNav("/work/new-things-co");

      const nextButton = screen.getByText("Next").closest("button");
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe("navigation functionality", () => {
    it("navigates to previous page when prev button is clicked", () => {
      renderWorkNav("/work/illustrations");

      const prevButton = screen.getByText("Prev");
      fireEvent.click(prevButton);

      expect(mockPush).toHaveBeenCalledWith("/work/new-things-co");
    });

    it("navigates to next page when next button is clicked", () => {
      renderWorkNav("/work/new-things-co");

      const nextButton = screen.getByText("Next");
      fireEvent.click(nextButton);

      expect(mockPush).toHaveBeenCalledWith("/work/illustrations");
    });

    it("does not navigate when prev is clicked on first page", () => {
      renderWorkNav("/work/helsinki-design-system");

      const prevButton = screen.getByText("Prev");
      fireEvent.click(prevButton);

      // Should only have been called once for the back to work button test setup
      expect(mockPush).not.toHaveBeenCalledWith(
        expect.stringContaining("work/"),
      );
    });

    it("does not navigate when next is clicked on last page", () => {
      renderWorkNav("/work/garage-junction");

      const nextButton = screen.getByText("Next");
      fireEvent.click(nextButton);

      expect(mockPush).not.toHaveBeenCalledWith(
        expect.stringContaining("work/"),
      );
    });
  });

  it("handles unknown pages gracefully", () => {
    renderWorkNav("/work/unknown-page");

    const prevButton = screen.getByText("Prev").closest("button");
    const nextButton = screen.getByText("Next").closest("button");

    // When currentIndex is -1 (not found), prev should be disabled, next should be enabled
    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });
});
