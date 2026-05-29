import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../../test-utils/render";
import { IllustrationsPage } from "./IllustrationsPage";

describe("IllustrationsPage", () => {
  it("renders page title", () => {
    renderWithProviders(<IllustrationsPage />);
    expect(
      screen.getByRole("heading", { name: /Illustrations/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders work nav back control", () => {
    renderWithProviders(<IllustrationsPage />);
    expect(screen.getAllByRole("button", { name: /Work/i }).length).toBeGreaterThan(0);
  });
});
