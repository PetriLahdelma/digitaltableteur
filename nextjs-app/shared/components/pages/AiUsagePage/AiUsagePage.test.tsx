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
      screen.getByText(/committed to transparency about AI usage/i),
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

  it("renders email contact link", () => {
    renderWithProviders(<AiUsagePage />);
    const emailLinks = screen.getAllByRole("link", {
      name: /mail@digitaltableteur.com/i,
    });
    expect(emailLinks.length).toBeGreaterThan(0);
  });
});
