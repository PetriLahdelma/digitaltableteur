import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../../test-utils/render";
import { GarageJunctionPage } from "./GarageJunctionPage";

describe("GarageJunctionPage", () => {
  it("renders page title", () => {
    renderWithProviders(<GarageJunctionPage />);
    expect(
      screen.getByRole("heading", { name: /Garage Junction/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders back to work link", () => {
    renderWithProviders(<GarageJunctionPage />);
    expect(
      screen.getByRole("link", { name: /Back to work/i }),
    ).toBeInTheDocument();
  });
});
