import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../../test-utils/render";
import { KnobSmithAudioPage } from "./KnobSmithAudioPage";

vi.mock("../../../LogoConstruction/LogoConstruction", () => ({
  LogoConstruction: () => null,
}));

describe("KnobSmithAudioPage", () => {
  it("renders page title", () => {
    renderWithProviders(<KnobSmithAudioPage />);
    expect(
      screen.getByRole("heading", { name: /KnobSmith Audio/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders back to work link", () => {
    renderWithProviders(<KnobSmithAudioPage />);
    expect(
      screen.getByRole("link", { name: /Back to work/i }),
    ).toBeInTheDocument();
  });
});
