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

  it("loops its muted interface demonstrations, which visitors can pause", () => {
    const { container } = renderWithProviders(<KnobSmithAudioPage />);
    const videos = Array.from(container.querySelectorAll("video[controls]"));

    expect(videos).toHaveLength(3);
    for (const video of videos) {
      expect(video).toHaveAttribute("loop");
      expect((video as HTMLVideoElement).muted).toBe(true);
      // Playback starts from script so reduced motion is respected.
      expect(video).not.toHaveAttribute("autoplay");
    }
  });
});
