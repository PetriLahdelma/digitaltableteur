import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../../test-utils/render";
import { VertaaUXPage } from "./VertaaUXPage";

describe("VertaaUXPage", () => {
  it("renders page title", () => {
    renderWithProviders(<VertaaUXPage />);
    expect(
      screen.getByRole("heading", { name: /VertaaUX/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders back to work link", () => {
    renderWithProviders(<VertaaUXPage />);
    expect(
      screen.getByRole("link", { name: /Back to work/i }),
    ).toBeInTheDocument();
  });
});
