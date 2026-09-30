import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils/render";
import { AccessibilityPage } from "./AccessibilityPage";

describe("AccessibilityPage", () => {
  it("renders page title", () => {
    renderWithProviders(<AccessibilityPage />);
    expect(
      screen.getByRole("heading", {
        name: /Accessibility Statement/i,
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  it("renders introduction section", () => {
    renderWithProviders(<AccessibilityPage />);
    expect(
      screen.getByText(/committed to ensuring digital accessibility/i),
    ).toBeInTheDocument();
  });

  it("renders WCAG compliance section", () => {
    renderWithProviders(<AccessibilityPage />);
    expect(
      screen.getByRole("heading", { name: /Conformance status/i }),
    ).toBeInTheDocument();
  });

  it("states the WCAG 2.2 AA target without claiming automated certification", () => {
    renderWithProviders(<AccessibilityPage />);
    expect(screen.getByText(/Our target is.*WCAG.*2\.2 Level AA/)).toBeInTheDocument();
    expect(screen.getByText(/Full conformance has not yet been verified/)).toBeInTheDocument();
    expect(screen.queryByText(/100% pass rate|Substantially conformant/)).not.toBeInTheDocument();
  });

  it("renders measures section", () => {
    renderWithProviders(<AccessibilityPage />);
    expect(
      screen.getByText(/Measures to support accessibility/i),
    ).toBeInTheDocument();
  });

  it("renders email contact link", () => {
    renderWithProviders(<AccessibilityPage />);
    const emailLinks = screen.getAllByRole("link", {
      name: /mail@digitaltableteur.com/i,
    });
    expect(emailLinks.length).toBeGreaterThan(0);
  });
});
