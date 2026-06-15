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

  it("renders manifesto section", () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByText(/Digitaltableteur is/i)).toBeInTheDocument();
  });

  it("renders manifesto phrases", () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByText(/No-Fluff Thinking/i)).toBeInTheDocument();
  });

  it("renders values section", () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByText(/What we bring/i)).toBeInTheDocument();
  });
});
