import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils/render";
import { AboutPage } from "./AboutPage";

describe("AboutPage", () => {
  it("renders operating model", () => {
    renderWithProviders(<AboutPage />);
    expect(
      screen.getByRole("heading", { name: "Strategy to scale" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Diagnose" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Shape" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Build" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Scale" })).toBeInTheDocument();
  });

  // The manifesto splits its words into boxes for the scroll reveal, so
  // match the paragraph's whole text rather than a single text node.
  const manifestoText = () =>
    screen.getByText(
      (_, el) =>
        el?.tagName === "P" && /Digitaltableteur is/i.test(el.textContent ?? ""),
    ).textContent;

  it("renders manifesto section", () => {
    renderWithProviders(<AboutPage />);
    expect(manifestoText()).toMatch(/^Digitaltableteur is /);
  });

  it("renders manifesto phrases", () => {
    renderWithProviders(<AboutPage />);
    expect(manifestoText()).toMatch(/No-Fluff Thinking\u00a0× AI-Powered Craft/);
  });

  it("renders values section", () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByText(/The promise/i)).toBeInTheDocument();
  });
});
