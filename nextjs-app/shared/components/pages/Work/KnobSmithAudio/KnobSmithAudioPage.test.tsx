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

  it("requires user action to play its interface demonstrations", () => {
    const { container } = renderWithProviders(<KnobSmithAudioPage />);
    const videos = Array.from(container.querySelectorAll("video"));
    const controlledVideos = Array.from(
      container.querySelectorAll("video[controls]"),
    );

    expect(controlledVideos).toHaveLength(3);
    for (const video of videos) {
      expect(video).toHaveAttribute("preload", "metadata");
      expect(video).not.toHaveAttribute("autoplay");
      expect(video).not.toHaveAttribute("loop");
    }
  });
});
