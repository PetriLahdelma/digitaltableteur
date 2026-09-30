import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../test-utils/render";
import { ProjectHero } from "./ProjectHero";

describe("ProjectHero", () => {
  it("keeps hero video paused and wires the scroll affordance to a real target", () => {
    const { container } = renderWithProviders(
      <ProjectHero
        title="Project"
        video={{ src: "/project.webm", alt: "Project interface demonstration" }}
        showScrollIndicator
      />,
    );
    const video = container.querySelector("video");
    const scrollButton = screen.getByRole("button", {
      name: "Scroll to content",
    });

    expect(video).toHaveAttribute("controls");
    expect(video).toHaveAttribute("preload", "metadata");
    expect(video).not.toHaveAttribute("autoplay");
    expect(video).not.toHaveAttribute("loop");
    expect(scrollButton).toBeInTheDocument();
    expect(
      container.querySelector("[id^='project-content-']"),
    ).toBeInTheDocument();
  });
});
