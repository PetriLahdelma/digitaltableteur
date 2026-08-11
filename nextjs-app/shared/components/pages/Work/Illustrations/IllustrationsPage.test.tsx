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
    expect(
      screen.getAllByRole("button", { name: /Work/i }).length,
    ).toBeGreaterThan(0);
  });

  it("renders every work as a captioned figure", () => {
    const { container } = renderWithProviders(<IllustrationsPage />);
    const figures = container.querySelectorAll("figure");
    expect(figures.length).toBe(21);
    figures.forEach((figure) => {
      expect(figure.querySelector("img")).not.toBeNull();
      const caption = figure.querySelector("figcaption");
      expect(caption).not.toBeNull();
      expect(caption?.textContent?.trim().length).toBeGreaterThan(2);
    });
  });

  it("gives every image descriptive alt text", () => {
    const { container } = renderWithProviders(<IllustrationsPage />);
    const images = container.querySelectorAll("figure img");
    expect(images.length).toBe(21);
    images.forEach((img) => {
      const alt = img.getAttribute("alt");
      expect(alt).toBeTruthy();
      expect(alt).not.toMatch(/\.(jpg|png|webp|avif|svg)$/i);
    });
  });

  it("has no drag interaction affordances", () => {
    renderWithProviders(<IllustrationsPage />);
    expect(screen.queryByText(/Drag to move/i)).not.toBeInTheDocument();
  });
});
