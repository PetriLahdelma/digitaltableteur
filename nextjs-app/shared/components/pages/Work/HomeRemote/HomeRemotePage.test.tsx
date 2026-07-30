import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../../test-utils/render";
import { HomeRemotePage } from "./HomeRemotePage";

vi.mock("../../../Mermaid", () => ({
  Mermaid: () => null,
}));

describe("HomeRemotePage", () => {
  it("renders page title", () => {
    renderWithProviders(<HomeRemotePage />);
    expect(
      screen.getByRole("heading", { name: /Home Remote/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders back to work link", () => {
    renderWithProviders(<HomeRemotePage />);
    expect(
      screen.getByRole("link", { name: /Back to work/i }),
    ).toBeInTheDocument();
  });

  it("renders the clay material story", () => {
    renderWithProviders(<HomeRemotePage />);
    expect(
      screen.getByRole("heading", { name: /Raised Means Pressable/i }),
    ).toBeInTheDocument();
  });
});
