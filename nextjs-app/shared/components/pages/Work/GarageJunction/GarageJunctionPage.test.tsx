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

  it("provides the visible promotional card information without playing the video", () => {
    const { container } = renderWithProviders(<GarageJunctionPage />);
    const video = container.querySelector("video");
    expect(video).toHaveAttribute("controls");
    const description = document.getElementById(
      video?.getAttribute("aria-describedby") ?? "",
    );
    expect(description).toHaveTextContent("October 13th");
    expect(description).toHaveTextContent("white G");
    expect(description).toHaveTextContent("blue band");
    expect(description?.closest("[lang]")).toHaveAttribute("lang", "en");
  });
});
