import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../../test-utils/render";
import { WorkIndexPage } from "./WorkIndexPage";

describe("WorkIndexPage", () => {
  it("renders page title", () => {
    renderWithProviders(<WorkIndexPage />);
    expect(
      screen.getByRole("heading", { name: /Selected projects/i }),
    ).toBeInTheDocument();
  });

  it("renders work examples", () => {
    renderWithProviders(<WorkIndexPage />);
    expect(screen.getByText(/Helsinki Design System/i)).toBeInTheDocument();
  });

  it("renders project links", () => {
    renderWithProviders(<WorkIndexPage />);
    const projectLinks = screen.getAllByRole("link", {
      name: /design system|knobsmith|vertaaux/i,
    });
    expect(projectLinks.length).toBeGreaterThan(0);
  });
});
