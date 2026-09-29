import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../../test-utils/render";
import { RingStatsPage } from "./RingStatsPage";

vi.mock("../../../Mermaid", () => ({
  Mermaid: () => null,
}));

describe("RingStatsPage", () => {
  it("renders page title", () => {
    renderWithProviders(<RingStatsPage />);
    expect(
      screen.getByRole("heading", { name: /Ring Stats/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders back to work link", () => {
    renderWithProviders(<RingStatsPage />);
    expect(
      screen.getByRole("link", { name: /Back to work/i }),
    ).toBeInTheDocument();
  });

  it("renders the honest freshness story", () => {
    renderWithProviders(<RingStatsPage />);
    expect(
      screen.getByRole("heading", { name: /Old Numbers Say They Are Old/i }),
    ).toBeInTheDocument();
  });

  it("states independence from the data provider", () => {
    renderWithProviders(<RingStatsPage />);
    expect(
      screen.getByText(/not affiliated with or\s+endorsed by Oura/i),
    ).toBeInTheDocument();
  });
});
