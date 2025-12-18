import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AccessibilityPage } from "./AccessibilityPage";

describe("AccessibilityPage", () => {
  it("renders page title", () => {
    render(<AccessibilityPage />);
    expect(screen.getByText(/accessibilityTitle/i)).toBeInTheDocument();
  });

  it("renders introduction section", () => {
    render(<AccessibilityPage />);
    expect(screen.getByText(/accessibilityIntro/i)).toBeInTheDocument();
  });

  it("renders WCAG compliance section", () => {
    render(<AccessibilityPage />);
    expect(screen.getByText(/WCAG/i)).toBeInTheDocument();
  });

  it("renders features section", () => {
    render(<AccessibilityPage />);
    expect(screen.getByText(/features/i)).toBeInTheDocument();
  });

  it("renders email contact link", () => {
    render(<AccessibilityPage />);
    const emailLinks = screen.getAllByRole("link", {
      name: /mail@digitaltableteur.com/i,
    });
    expect(emailLinks.length).toBeGreaterThan(0);
  });

  it("renders back button", () => {
    render(<AccessibilityPage />);
    expect(screen.getByRole("link", { name: /back/i })).toBeInTheDocument();
  });

  it("renders commitment statement", () => {
    render(<AccessibilityPage />);
    expect(screen.getByText(/commitment/i)).toBeInTheDocument();
  });
});
