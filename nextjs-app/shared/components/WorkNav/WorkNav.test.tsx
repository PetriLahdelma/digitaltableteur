import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import WorkNav from "@dt/WorkNav";

expect.extend(toHaveNoViolations);

const { mockPush, mockUsePathname } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockUsePathname: vi.fn(() => "/work/new-things-co"),
}));

vi.mock("../../lib/navigation", () => {
  return {
    useNavigationPathname: mockUsePathname,
    useNavigationRouter: () => ({ push: mockPush, replace: vi.fn() }),
  };
});

// Mock translations through the package adapter.
vi.mock("../../lib/translation", () => {
  const t = (key: string) => {
    const translations: Record<string, string> = {
      workNavLabel: "Work project navigation",
      workNavBackToWork: "Work",
      workNavPrev: "Prev",
      workNavNext: "Next",
      workNavNewThingsCo: "New Things Co",
      workNavIllustrations: "Illustrations",
      workNavGarageJunction: "Garage Junction",
    };
    return translations[key] || key;
  };
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

  it("exposes a labelled navigation landmark", () => {
    renderWorkNav();

    expect(
      screen.getByRole("navigation", { name: "Work project navigation" }),
    ).toBeInTheDocument();
  });

  it("prefers the currentPath prop over the router pathname", () => {
    // Router is on the last page, but the prop points at the first page.
    mockUsePathname.mockReturnValue("/work/garage-junction");
    render(<WorkNav currentPath="/work/helsinki-design-system" />);

    expect(screen.getByText("Prev").closest("button")).toBeDisabled();
    expect(screen.getByText("Next").closest("button")).not.toBeDisabled();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <WorkNav currentPath="/work/new-things-co" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
