import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../../test-utils/render";
import { NewThingsCoPage } from "./NewThingsCoPage";

describe("NewThingsCoPage", () => {
  it("renders page title", () => {
    renderWithProviders(<NewThingsCoPage />);
    expect(
      screen.getByRole("heading", { name: /New Things Co/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders back to work link", () => {
    renderWithProviders(<NewThingsCoPage />);
    expect(
      screen.getByRole("link", { name: /Back to work/i }),
    ).toBeInTheDocument();
  });

  it("requires user action to play the brand guidelines video", () => {
    const { container } = renderWithProviders(<NewThingsCoPage />);
    const video = container.querySelector(
      'video[aria-label="New Things Co Brand Guidelines video walkthrough"]',
    );

    expect(video).toHaveAttribute("controls");
    expect(video).toHaveAttribute("preload", "metadata");
    expect(video).not.toHaveAttribute("autoplay");
    expect(video).not.toHaveAttribute("loop");
  });
});
