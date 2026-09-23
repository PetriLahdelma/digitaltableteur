import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils/render";
import { AiUsagePage } from "./AiUsagePage";

describe("AiUsagePage", () => {
  it("renders page title", () => {
    renderWithProviders(<AiUsagePage />);
    expect(
      screen.getByRole("heading", {
        name: /AI use & transparency statement/i,
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  it("renders introduction section", () => {
    renderWithProviders(<AiUsagePage />);
    expect(
      screen.getByText(/transparency notice, not a legal certification/i),
    ).toBeInTheDocument();
  });

  it("renders principles section", () => {
    renderWithProviders(<AiUsagePage />);
    expect(screen.getByText(/Our AI principles/i)).toBeInTheDocument();
  });

  it("renders use cases section", () => {
    renderWithProviders(<AiUsagePage />);
    expect(screen.getByText(/Where AI is used/i)).toBeInTheDocument();
  });

  it("describes the live assistant boundary and temporary browser storage", () => {
    renderWithProviders(<AiUsagePage />);

    expect(
      screen.getByRole("heading", { name: /Website AI assistant/i, level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/does not rank or profile people/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/sessionStorage/i).length).toBeGreaterThan(0);
  });

  it("renders email contact link", () => {
    renderWithProviders(<AiUsagePage />);
    const emailLinks = screen.getAllByRole("link", {
      name: /mail@digitaltableteur.com/i,
    });
    expect(emailLinks.length).toBeGreaterThan(0);
  });
});
